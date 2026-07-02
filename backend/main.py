"""
FastAPI backend.

Endpoints:
  GET  /                       - welcome / liveness
  GET  /health                 - backend + Ollama + model status

  POST /auth/signup            - create an account (Bonus D)
  POST /auth/login             - log in, returns a bearer token
  GET  /auth/me                - current user info

  GET    /chats                - list the user's saved chats
  POST   /chats                - create a new chat
  GET    /chats/{id}           - get a chat with its messages
  DELETE /chats/{id}           - delete a chat
  POST   /chats/{id}/ask       - ask a question in a chat (saves Q&A)
  POST   /chats/{id}/ask/stream- streaming version (token-by-token)

  POST /ask                    - stateless Q&A (kept for tests/compatibility)
  POST /feedback               - save Good/Average/Poor rating (Bonus E)

Run with (from inside backend/):
  uvicorn main:app --reload --port 8000
"""
import json
import time
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import database as db
from auth import create_token, get_current_user, hash_password, verify_password
from config import settings
from llm_client import LLMError, check_health, generate_answer, stream_answer
from logging_config import logger
from rag import retrieve_context

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A self-hosted LLM assistant that answers student questions about university services.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    db.init_db()
    logger.info("Database initialised at %s", db.DB_PATH)


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #
class AuthRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=40)
    password: str = Field(..., min_length=4, max_length=128)


class AskRequest(BaseModel):
    question: str = Field(..., description="The student's question.")
    use_improved_prompt: bool = True


class AskResponse(BaseModel):
    answer: str
    model: str
    used_rag: bool
    response_time_seconds: float


class ChatAskRequest(BaseModel):
    question: str = Field(...)


class ChatRenameRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=80)


class FeedbackRequest(BaseModel):
    question: str
    answer: str
    rating: str


# --------------------------------------------------------------------------- #
# Basic / health
# --------------------------------------------------------------------------- #
@app.get("/")
def root():
    return {"message": f"{settings.app_name} is running.", "docs": "/docs"}


@app.get("/health")
async def health():
    llm_status = await check_health()
    healthy = llm_status["ollama_reachable"] and llm_status["model_available"]
    return {
        "status": "ok" if healthy else "degraded",
        "backend": "running",
        "model": settings.model_name,
        **llm_status,
        "timestamp": datetime.now().isoformat(),
    }


# --------------------------------------------------------------------------- #
# Auth (Bonus D)
# --------------------------------------------------------------------------- #
@app.post("/auth/signup")
def signup(req: AuthRequest):
    username = req.username.strip().lower()
    if db.get_user_by_username(username):
        raise HTTPException(status_code=409, detail="Username already taken.")
    pw_hash, salt = hash_password(req.password)
    user_id = db.create_user(username, pw_hash, salt)
    token = create_token(user_id)
    logger.info("New account created: %s", username)
    return {"token": token, "username": username}


@app.post("/auth/login")
def login(req: AuthRequest):
    username = req.username.strip().lower()
    user = db.get_user_by_username(username)
    if not user or not verify_password(req.password, user["password_hash"], user["salt"]):
        logger.warning("Failed login attempt for: %s", username)
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = create_token(user["id"])
    logger.info("User logged in: %s", username)
    return {"token": token, "username": username}


@app.get("/auth/me")
def me(user=Depends(get_current_user)):
    return user


# --------------------------------------------------------------------------- #
# Chats (saved conversations)
# --------------------------------------------------------------------------- #
@app.get("/chats")
def get_chats(user=Depends(get_current_user)):
    return db.list_chats(user["id"])


@app.post("/chats")
def new_chat(user=Depends(get_current_user)):
    return db.create_chat(user["id"])


@app.get("/chats/{chat_id}")
def get_chat_detail(chat_id: int, user=Depends(get_current_user)):
    chat = db.get_chat(chat_id, user["id"])
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")
    return {**dict(chat), "messages": db.list_messages(chat_id)}


@app.patch("/chats/{chat_id}")
def rename_chat_endpoint(chat_id: int, req: ChatRenameRequest, user=Depends(get_current_user)):
    if not db.get_chat(chat_id, user["id"]):
        raise HTTPException(status_code=404, detail="Chat not found.")
    title = req.title.strip()
    db.rename_chat(chat_id, title)
    logger.info("[chat %s] Renamed to: %s", chat_id, title)
    return {"id": chat_id, "title": title}


@app.delete("/chats/{chat_id}")
def remove_chat(chat_id: int, user=Depends(get_current_user)):
    if not db.get_chat(chat_id, user["id"]):
        raise HTTPException(status_code=404, detail="Chat not found.")
    db.delete_chat(chat_id, user["id"])
    return {"message": "Chat deleted."}


def _maybe_title(chat_id: int, chat, question: str):
    """Use the first question as the chat title."""
    if chat["title"] == "New chat":
        title = question.strip()[:48] + ("…" if len(question.strip()) > 48 else "")
        db.rename_chat(chat_id, title or "New chat")


@app.post("/chats/{chat_id}/ask", response_model=AskResponse)
async def chat_ask(chat_id: int, req: ChatAskRequest, user=Depends(get_current_user)):
    """Non-streaming ask inside a chat (saves both messages)."""
    chat = db.get_chat(chat_id, user["id"])
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")

    question = (req.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Please enter a question.")

    logger.info("[chat %s] Question: %s", chat_id, question)
    db.add_message(chat_id, "user", question)
    _maybe_title(chat_id, chat, question)

    start = time.perf_counter()
    context = retrieve_context(question)
    try:
        answer = await generate_answer(question, context=context)
    except LLMError as exc:
        logger.error("[chat %s] LLM error: %s", chat_id, exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    elapsed = round(time.perf_counter() - start, 2)
    db.add_message(chat_id, "assistant", answer)
    logger.info("[chat %s] Answer (%.2fs): %s", chat_id, elapsed, answer[:200])
    return AskResponse(
        answer=answer, model=settings.model_name,
        used_rag=context is not None, response_time_seconds=elapsed,
    )


@app.post("/chats/{chat_id}/ask/stream")
async def chat_ask_stream(chat_id: int, req: ChatAskRequest, user=Depends(get_current_user)):
    """Streaming ask: yields tokens as they are generated, then saves the answer."""
    chat = db.get_chat(chat_id, user["id"])
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")

    question = (req.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Please enter a question.")

    logger.info("[chat %s] (stream) Question: %s", chat_id, question)
    db.add_message(chat_id, "user", question)
    _maybe_title(chat_id, chat, question)
    context = retrieve_context(question)

    async def event_stream():
        collected: list[str] = []
        start = time.perf_counter()
        async for chunk in stream_answer(question, context=context):
            collected.append(chunk)
            yield chunk
        full = "".join(collected).strip()
        elapsed = time.perf_counter() - start
        if full:
            db.add_message(chat_id, "assistant", full)
        logger.info("[chat %s] (stream) Answer (%.2fs): %s", chat_id, elapsed, full[:200])

    return StreamingResponse(event_stream(), media_type="text/plain; charset=utf-8")


# --------------------------------------------------------------------------- #
# Stateless ask + feedback (kept for tests / compatibility)
# --------------------------------------------------------------------------- #
@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    question = (request.question or "").strip()
    if not question:
        logger.warning("Rejected empty question.")
        raise HTTPException(status_code=400, detail="Please enter a question.")

    logger.info("Received question: %s", question)
    start = time.perf_counter()
    context = retrieve_context(question) if request.use_improved_prompt else None

    try:
        answer = await generate_answer(
            question, context=context, improved=request.use_improved_prompt
        )
    except LLMError as exc:
        logger.error("LLM error for question '%s': %s", question, exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    elapsed = round(time.perf_counter() - start, 2)
    logger.info("Generated answer (%.2fs): %s", elapsed, answer[:300])
    return AskResponse(
        answer=answer, model=settings.model_name,
        used_rag=context is not None, response_time_seconds=elapsed,
    )


@app.post("/feedback")
def feedback(request: FeedbackRequest):
    if request.rating not in {"Good", "Average", "Poor"}:
        raise HTTPException(status_code=400, detail="Rating must be Good, Average, or Poor.")
    record = {
        "timestamp": datetime.now().isoformat(),
        "question": request.question,
        "answer": request.answer,
        "rating": request.rating,
    }
    with open(settings.feedback_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    logger.info("Saved feedback: %s", request.rating)
    return {"message": "Thank you for your feedback!", "rating": request.rating}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
