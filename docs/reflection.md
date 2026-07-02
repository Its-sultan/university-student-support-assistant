# Task 9: Industry Production Reflection

> These are draft answers based on the implemented system.


### 1. What are the main components of your deployed LLM system?
- **Frontend (React + Vite):** the user interface where students type questions and read answers.
- **Backend (FastAPI + Uvicorn):** receives requests, validates input, applies prompt logic and RAG, calls the model, logs interactions, and returns answers.
- **Local LLM (Ollama running `llama3.2:1b`):** generates the actual answers on the local machine.
- **Supporting layers:** a configuration file, a logging system, an error-handling layer, a simple RAG retriever over a university FAQ, and a feedback store.

### 2. Why is FastAPI useful in this pipeline?
FastAPI sits between the frontend and the model. It is fast (built on ASGI/async), so it can wait on the LLM without blocking other requests. It gives **automatic interactive documentation** (Swagger UI at `/docs`), **request validation** through Pydantic models, and clean **typed JSON** responses. This makes the API easy to test, easy to integrate with the React frontend, and close to what is used in real production services.

### 3. What role does your chosen LLM model play?
`llama3.2:1b` is the "brain" of the system. It takes the prompt (the student's question plus any retrieved FAQ context and our system instructions) and generates a natural-language answer. We chose a small 1-billion-parameter model because it runs quickly on a normal laptop while still producing useful answers appropriate for a prototype.

### 4. What role does the frontend play?
The frontend is the part the student actually interacts with. It collects the question, shows a loading spinner while waiting, displays the answer, handles errors gracefully (e.g. "cannot connect to server"), and lets the user rate the answer. It never talks to the model directly — only to the backend API.

### 5. What is the difference between running the model locally and using an external API?
- **Local (our approach):** the model runs on our own hardware via Ollama. Data never leaves the machine (privacy), there are no per-request costs, and it works offline. The trade-off is limited model size/quality and dependence on local compute.
- **External API (e.g. a cloud LLM provider):** access to much larger, more capable models with no local hardware needed, but every request sends data to a third party (privacy/compliance risk), costs money per token, and requires internet connectivity.

### 6. What security risks may exist if this system is deployed in an organisation?
- **Prompt injection** — malicious input trying to manipulate the model's behaviour.
- **No authentication** — anyone who can reach the API can use it.
- **Sensitive data exposure** — students might paste personal information into questions, which then lands in the logs.
- **Open CORS / network exposure** — if the API is exposed publicly without protection.
- **Denial of service** — long or repeated requests overloading the local model.
- **Hallucinations** — the model giving confidently wrong official information.

### 7. What improvements would be needed before deploying this system in production?
- Add **authentication and authorization** (e.g. university SSO / API keys).
- Use a production server setup (Gunicorn/Uvicorn workers behind **HTTPS** and a reverse proxy like Nginx).
- Add **rate limiting**, input sanitisation, and request size limits.
- Use a larger/fine-tuned model and a proper **vector-database RAG** over verified university documents.
- Add **monitoring, alerting, and centralised logging**.
- Add automated tests, CI/CD, and containerised, reproducible deployment.
- Handle PII responsibly (redaction, retention policies, encryption).

### 8. How would you monitor the system in real-world use?
- **Application logs** (already implemented) shipped to a central system (e.g. ELK/Grafana Loki).
- **Metrics:** request rate, error rate, response latency, model timeouts (e.g. Prometheus + Grafana).
- **Health checks / uptime monitoring** on the `/health` endpoint.
- **Feedback analytics** from the Good/Average/Poor ratings to track answer quality over time.
- **Alerts** when error rates or latency cross thresholds.

### 9. How would you protect sensitive student information?
- Keep the model **local** so data is not sent to third parties.
- **Authenticate** users and apply least-privilege access.
- **Encrypt** data in transit (HTTPS) and at rest.
- **Redact/avoid logging** personal data; set log-retention and deletion policies.
- Comply with **data-protection regulations** and the university's privacy policy.
- Restrict who can read the logs and feedback files.

### 10. What challenges did you face during implementation?
- Handling **CORS** between the React dev server and FastAPI.
- Managing **slow model responses** and timeouts on modest hardware.
- Designing clear **error handling** for the different failure cases.
- Coordinating the frontend, backend, and model so the full pipeline worked end-to-end.
