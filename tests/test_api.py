"""
API test script (Task 5).

Tests the FastAPI backend endpoints using the `requests` library.
The backend must be running before you run these tests:

    cd backend
    uvicorn main:app --port 8000

Then, in another terminal:

    pytest tests/test_api.py -v
    # or just run it directly:
    python tests/test_api.py

Some tests need the LLM (Ollama) running too; they are skipped automatically
if the model is not available, so the suite still demonstrates the API layer.
"""
import requests

BASE_URL = "http://localhost:8000"


def _model_ready() -> bool:
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        return r.json().get("model_available", False)
    except Exception:
        return False


def test_root():
    """Root endpoint should be alive."""
    r = requests.get(f"{BASE_URL}/", timeout=5)
    assert r.status_code == 200
    assert "running" in r.json()["message"].lower()
    print("PASS: GET /")


def test_health():
    """Health endpoint returns status + model info."""
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    assert r.status_code == 200
    body = r.json()
    assert body["backend"] == "running"
    assert "model" in body
    print(f"PASS: GET /health -> status={body['status']}, model_available={body['model_available']}")


def test_ask_empty_question():
    """Empty question must be rejected with 400 (Task 7)."""
    r = requests.post(f"{BASE_URL}/ask", json={"question": "   "}, timeout=10)
    assert r.status_code == 400
    assert "enter a question" in r.json()["detail"].lower()
    print("PASS: POST /ask rejects empty question (400)")


def test_ask_valid_question():
    """A real question returns an answer when the model is available."""
    if not _model_ready():
        print("SKIP: POST /ask (model not available - start Ollama and pull the model)")
        return
    payload = {"question": "How do I register for courses?"}
    r = requests.post(f"{BASE_URL}/ask", json=payload, timeout=120)
    assert r.status_code == 200
    body = r.json()
    assert len(body["answer"]) > 0
    assert body["model"]
    print(f"PASS: POST /ask -> {len(body['answer'])} chars in {body['response_time_seconds']}s")


def test_feedback():
    """Feedback endpoint accepts a valid rating (Bonus E)."""
    payload = {"question": "test q", "answer": "test a", "rating": "Good"}
    r = requests.post(f"{BASE_URL}/feedback", json=payload, timeout=10)
    assert r.status_code == 200
    assert r.json()["rating"] == "Good"
    print("PASS: POST /feedback saved rating")


def test_feedback_invalid_rating():
    """Invalid rating is rejected (400)."""
    payload = {"question": "q", "answer": "a", "rating": "Excellent"}
    r = requests.post(f"{BASE_URL}/feedback", json=payload, timeout=10)
    assert r.status_code == 400
    print("PASS: POST /feedback rejects invalid rating (400)")


if __name__ == "__main__":
    print("=" * 60)
    print("Running API tests against", BASE_URL)
    print("=" * 60)
    failures = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
            except AssertionError as e:
                failures += 1
                print(f"FAIL: {name} -> {e}")
            except requests.exceptions.ConnectionError:
                failures += 1
                print(f"FAIL: {name} -> backend not running at {BASE_URL}")
    print("=" * 60)
    print("All tests passed!" if failures == 0 else f"{failures} test(s) failed.")
