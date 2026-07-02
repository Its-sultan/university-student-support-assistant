"""
LLM client (Task 3 + Task 7 error handling).

Talks to the locally hosted Ollama server over its HTTP API. All network
errors are caught and re-raised as a clear `LLMError` so the API layer can
return a clean message instead of a raw stack trace.
"""
import json
from typing import AsyncIterator

import httpx

from config import settings
from logging_config import logger
from prompts import build_prompt


class LLMError(Exception):
    """Raised when the local LLM cannot be reached or fails to respond."""


async def check_health() -> dict:
    """
    Check whether Ollama is reachable and whether the configured model is
    available. Used by the /health endpoint.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.ollama_host}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            model_ready = any(settings.model_name in m for m in models)
            return {
                "ollama_reachable": True,
                "model_available": model_ready,
                "available_models": models,
            }
    except Exception as exc:  # noqa: BLE001 - we want any failure reported cleanly
        logger.warning("Ollama health check failed: %s", exc)
        return {
            "ollama_reachable": False,
            "model_available": False,
            "available_models": [],
        }


async def generate_answer(question: str, context: str | None = None, improved: bool = True) -> str:
    """
    Send the question to the local LLM and return the generated answer text.

    Raises LLMError on any connection / timeout / model failure so the caller
    can translate it into an HTTP 503 with a friendly message.
    """
    system_prompt, user_prompt = build_prompt(question, context=context, improved=improved)

    payload = {
        "model": settings.model_name,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": False,
        # keep_alive keeps the model loaded in memory between requests so
        # follow-up questions are much faster (no cold-start reload).
        "keep_alive": "10m",
        "options": {"temperature": settings.temperature},
    }

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
            resp = await client.post(f"{settings.ollama_host}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            answer = (data.get("response") or "").strip()
            if not answer:
                raise LLMError("The model returned an empty response.")
            return answer

    except httpx.ConnectError as exc:
        raise LLMError(
            "Cannot reach the local LLM. Is Ollama running? "
            f"Tried: {settings.ollama_host}"
        ) from exc
    except httpx.ReadTimeout as exc:
        raise LLMError(
            "The model took too long to respond (timeout). "
            "Try a shorter question or a smaller model."
        ) from exc
    except httpx.HTTPStatusError as exc:
        # 404 here usually means the model name is not pulled.
        detail = exc.response.text[:200]
        raise LLMError(
            f"The model '{settings.model_name}' may not be installed. "
            f"Run: ollama pull {settings.model_name}. Detail: {detail}"
        ) from exc
    except LLMError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise LLMError(f"Unexpected LLM error: {exc}") from exc


async def stream_answer(
    question: str, context: str | None = None, improved: bool = True
) -> AsyncIterator[str]:
    """
    Stream the answer token-by-token from the local LLM.

    Yields plain text chunks as they are generated. This makes the UI feel far
    more responsive: the user starts reading immediately instead of waiting for
    the whole answer. Errors are yielded as a readable message so the stream
    never crashes the frontend.
    """
    system_prompt, user_prompt = build_prompt(question, context=context, improved=improved)

    payload = {
        "model": settings.model_name,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": True,
        "keep_alive": "10m",
        "options": {"temperature": settings.temperature},
    }

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
            async with client.stream(
                "POST", f"{settings.ollama_host}/api/generate", json=payload
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        data = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    chunk = data.get("response", "")
                    if chunk:
                        yield chunk
                    if data.get("done"):
                        break
    except httpx.ConnectError:
        yield "\n[Error] Cannot reach the local LLM. Is Ollama running?"
    except httpx.ReadTimeout:
        yield "\n[Error] The model took too long to respond (timeout)."
    except httpx.HTTPStatusError:
        yield (
            f"\n[Error] The model '{settings.model_name}' may not be installed. "
            f"Run: ollama pull {settings.model_name}"
        )
    except Exception as exc:  # noqa: BLE001
        yield f"\n[Error] Unexpected LLM error: {exc}"
