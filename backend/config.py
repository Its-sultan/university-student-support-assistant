"""
Central configuration for the University Student Support Assistant backend.

All values can be overridden via environment variables or a `.env` file
(see `.env.example`). This keeps secrets and machine-specific settings out
of the source code.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Application ---
    app_name: str = "University Student Support Assistant"
    app_version: str = "1.0.0"

    # --- Ollama / Local LLM ---
    ollama_host: str = "http://localhost:11434"
    model_name: str = "llama3.2:1b"
    request_timeout: float = 120.0          # seconds to wait for the model
    temperature: float = 0.3                # low = more factual, less creative

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000

    # --- CORS (the React dev server) ---
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # --- Logging ---
    log_file: str = "logs/app.log"
    log_level: str = "INFO"

    # --- RAG (Bonus B) ---
    enable_rag: bool = True
    faq_file: str = "data/faq.md"
    rag_top_k: int = 3                       # number of FAQ chunks to inject

    # --- Feedback (Bonus E) ---
    feedback_file: str = "data/feedback.jsonl"


settings = Settings()
