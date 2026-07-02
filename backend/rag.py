"""
Simple RAG retrieval (Bonus Option B).

This is a lightweight, dependency-free retriever. It splits the FAQ markdown
file into sections (by `##` headings), then scores each section against the
user's question using keyword overlap (a bag-of-words Jaccard-style score).
The top-k sections are returned and injected into the prompt.

We deliberately avoid heavy vector databases here: for a small FAQ this keyword
approach is fast, transparent, and easy to explain in the report.
"""
import os
import re

from config import settings
from logging_config import logger

_STOPWORDS = {
    "the", "a", "an", "is", "are", "do", "i", "to", "how", "what", "where",
    "can", "of", "for", "and", "in", "on", "my", "me", "you", "your", "it",
    "this", "that", "with", "at", "as", "be", "or", "if", "about", "from",
}


def _tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 1}


def _load_sections() -> list[tuple[str, str]]:
    """Return a list of (heading, body) sections from the FAQ file."""
    path = settings.faq_file
    if not os.path.exists(path):
        logger.warning("RAG enabled but FAQ file not found at %s", path)
        return []

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    sections: list[tuple[str, str]] = []
    # Split on level-2 markdown headings.
    parts = re.split(r"\n##\s+", content)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        lines = part.split("\n", 1)
        heading = lines[0].lstrip("# ").strip()
        body = lines[1].strip() if len(lines) > 1 else ""
        sections.append((heading, body))
    return sections


# Load once at import time (small file, rarely changes).
_SECTIONS = _load_sections()


def retrieve_context(question: str, top_k: int | None = None) -> str | None:
    """
    Return the most relevant FAQ sections for a question as a single string,
    or None if RAG is disabled / nothing relevant is found.
    """
    if not settings.enable_rag or not _SECTIONS:
        return None

    top_k = top_k or settings.rag_top_k
    q_tokens = _tokenize(question)
    if not q_tokens:
        return None

    scored: list[tuple[float, str, str]] = []
    for heading, body in _SECTIONS:
        section_tokens = _tokenize(heading + " " + body)
        if not section_tokens:
            continue
        overlap = len(q_tokens & section_tokens)
        if overlap == 0:
            continue
        score = overlap / len(q_tokens)
        scored.append((score, heading, body))

    if not scored:
        return None

    scored.sort(key=lambda x: x[0], reverse=True)
    chosen = scored[:top_k]
    logger.info("RAG matched sections: %s", [h for _, h, _ in chosen])

    return "\n\n".join(f"### {h}\n{b}" for _, h, b in chosen)
