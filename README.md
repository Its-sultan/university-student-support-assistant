# 🎓 University Student Support Assistant

A complete **self-hosted LLM application** built for IS 365 — Full-Stack Pipeline for
Deploying a Self-Hosted LLM Application.

Students can ask questions about university services (course registration, examination
rules, library, ICT support, hostel application, fee payment, academic calendar, and
student conduct) and get instant answers from a **locally hosted Large Language Model**.

```
User  →  React Frontend  →  FastAPI Backend  →  Local LLM (Ollama)  →  Answer  →  Frontend
```

---

## ✨ Features

| Feature | Status |
|--------|--------|
| FastAPI backend with `/health` and `/ask` | ✅ |
| React (Vite) frontend chat interface | ✅ |
| Local LLM via Ollama (`llama3.2:1b`) | ✅ |
| Configuration file (`config.py` + `.env`) | ✅ |
| Logging (questions, answers, errors, timestamps) | ✅ |
| Error handling (backend down, model down, empty input, slow response) | ✅ |
| API test script (`tests/test_api.py`) | ✅ |
| Prompt improvement (original vs improved) | ✅ |
| Simple RAG over a university FAQ | ✅ |
| Answer rating (Good / Average / Poor) | ✅ |
| Docker container for the backend | ✅ |

---

## 📁 Project Structure

```
University Support Assistant/
├── backend/
│   ├── main.py             # FastAPI app: /health, /ask, /feedback
│   ├── llm_client.py       # Talks to the Ollama LLM
│   ├── rag.py              # Simple keyword RAG 
│   ├── prompts.py          # Original + improved prompts
│   ├── config.py           # Settings from env / .env
│   ├── logging_config.py   # Logging setup
│   ├── data/faq.md         # University FAQ used by RAG
│   ├── logs/app.log        # Generated at runtime
│   └── Dockerfile          # 
├── frontend/               # Vite + React
│   ├── src/App.jsx
│   ├── src/api.js
│   └── src/components/FeedbackButtons.jsx
├── tests/test_api.py       # API test script
├── docs/
│   ├── report.md           # Technical report
│   ├── reflection.md       # Reflection answers
│   └── screenshots/        
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛠️ Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for the React frontend)
- **Ollama** — download from https://ollama.com/download

---

## 🚀 Setup & Running

### 1. Install and run the local LLM (Ollama)

```bash
# After installing Ollama, pull the model:
ollama pull llama3.2:1b

# Ollama runs as a background service automatically.
# Verify it is serving:
ollama list
```

### 2. Backend (FastAPI)

```bash
# From the project root, create and activate a virtual environment:
python -m venv venv

# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (Git Bash):  source venv/Scripts/activate
# macOS / Linux:       source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Start the backend (from inside the backend folder):
cd backend
uvicorn main:app --reload --port 8000
```

- API root: http://localhost:8000
- **Swagger docs:** http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 3. Frontend (React)

```bash
# In a NEW terminal:
cd frontend
npm install
npm run dev
```

Open the URL shown (default **http://localhost:5173**).

---

## 🧪 Testing

With the backend running:

```bash
# From the project root:
python tests/test_api.py
# or, for nicer output:
pytest tests/test_api.py -v
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Liveness message |
| GET | `/health` | Backend + Ollama + model status |
| POST | `/ask` | Ask a question → get an answer |
| POST | `/feedback` | Save Good/Average/Poor rating (Bonus E) |

**Example `/ask` request:**
```json
{ "question": "How do I register for courses?" }
```
**Example response:**
```json
{
  "answer": "To register for courses, log in to the SIS portal...",
  "model": "llama3.2:1b",
  "used_rag": true,
  "response_time_seconds": 3.4
}
```

---

## 🧯 Error Handling (Task 7)

| Situation | Behaviour |
|-----------|-----------|
| Backend not running | Frontend shows a connection-error banner |
| Model not running | Backend returns a clear `503` message, shown in the UI |
| Empty question | Frontend blocks and asks for input; backend also returns `400` |
| Slow response | Frontend shows a spinner / "Thinking…" message |

---

## 🐳 Docker (Bonus C)

```bash
# Ollama must be running on the host.
docker compose up --build
# Backend available at http://localhost:8000/docs
```

---

## 📝 Notes

- The model runs **entirely locally** — no data leaves your machine.
- Edit `backend/data/faq.md`the match your university's real policies.
