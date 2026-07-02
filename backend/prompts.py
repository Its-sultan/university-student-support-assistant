"""
System prompts for the assistant (Task 6: Prompt Improvement).

We keep BOTH the original naive prompt and the improved prompt here so the
report can show a side-by-side comparison of how prompt engineering changes
the quality of the answers.
"""

# ---------------------------------------------------------------------------
# ORIGINAL PROMPT (version 1)
# Naive: vague, no role, no scope, no formatting guidance.
# Tends to produce rambling, generic, sometimes off-topic answers.
# ---------------------------------------------------------------------------
ORIGINAL_SYSTEM_PROMPT = "You are a helpful assistant. Answer the student's question."


# ---------------------------------------------------------------------------
# IMPROVED PROMPT (version 2)
# Gives the model a clear role, scope, tone, formatting rules, and an explicit
# instruction to admit when it does not know (reduces hallucination).
# ---------------------------------------------------------------------------
IMPROVED_SYSTEM_PROMPT = """You are the University Student Support Assistant, a friendly and accurate help desk for university students.

Your job is to answer questions about university services, specifically:
- course registration
- examination rules
- library services
- ICT support
- hostel application
- fee payment
- academic calendar
- student conduct

Rules:
1. Answer clearly and concisely. Use short paragraphs or bullet points.
2. Use a polite, supportive, professional tone.
3. If reference information is provided below, base your answer on it.
4. If you do not know the answer or it is outside university services, say so honestly and suggest the student contact the relevant university office. Do NOT invent specific dates, fees, or policies.
5. Keep answers focused on the student's question. Do not add unrelated information.
"""


def build_prompt(question: str, context: str | None = None, improved: bool = True) -> tuple[str, str]:
    """
    Return a (system_prompt, user_prompt) pair.

    If `context` is provided (from RAG), it is injected so the model grounds
    its answer in the university FAQ instead of guessing.
    """
    system = IMPROVED_SYSTEM_PROMPT if improved else ORIGINAL_SYSTEM_PROMPT

    if context and improved:
        user = (
            "Reference information from the university FAQ:\n"
            "----------------------------------------\n"
            f"{context}\n"
            "----------------------------------------\n\n"
            f"Student question: {question}\n\n"
            "Answer using the reference information above where relevant."
        )
    else:
        user = question

    return system, user
