# Bonus Option C: Containerize the FastAPI backend.
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (better layer caching).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source.
COPY backend/ ./

# The container talks to Ollama on the host machine.
# On Docker Desktop (Windows/Mac), host.docker.internal resolves to the host.
ENV OLLAMA_HOST=http://host.docker.internal:11434
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
