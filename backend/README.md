# Raah — Career Guidance API 🧭⚡

High-performance **FastAPI** backend for **Raah**, an intelligent career guidance web app. Raah dynamically generates custom career-interest psychometric quizzes tailored to ANY field or stream (e.g., "BSc Physics", "BCom", "BCA", "B.Tech CSE", "interior design", "12th pass") using the **Google Gemini API** (`google-genai` SDK) and persists student profiles and guidance in **Supabase**.

---

## 🌟 Product Flow

1. **Student Input**: The student types any academic course, stream, or vocational interest as free text.
2. **Dynamic Quiz Generation**: The backend uses Gemini to generate a field-specific 10-question multiple-choice quiz (4 options per question). Trait tags (`A`, `C`, `S`, `L`, `B`, `O`) are retained on the backend and stripped before sending to the client.
3. **Scoring & Trait Synthesis**: The student submits answers (0-3 for each of the 10 questions). The server tallies trait points across the 6 core traits:
   - **A**: Analytical (Data, research, logic, systematic problem-solving)
   - **C**: Creative (Design, expression, conceptual thinking, innovation)
   - **S**: Social (Mentorship, teamwork, communication, human impact)
   - **L**: Leadership (Strategy, decision-making, initiative, management)
   - **B**: Hands-on building (Prototyping, engineering, technical execution)
   - **O**: Organized (Planning, operations, precision, quality assurance)
4. **AI Recommendation & Persistence**: Gemini analyzes the field and trait distribution to generate 4 realistic career pathways (with immediate next steps and exams/courses) without false job/salary promises, persists the result in Supabase, and returns the guidance.

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI entrypoint, CORS configuration, /api/me, /api/dashboard
│   ├── config.py           # Settings loader (.env: Supabase, Gemini, CORS_ORIGINS)
│   ├── supa.py             # Supabase clients: anon() and admin() (service role)
│   ├── deps.py             # Auth dependency: verifies Bearer JWT with anon().auth.get_user
│   ├── schemas.py          # Pydantic schemas (QuizStart, QuizSubmit, Dashboard, Profile)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── quiz.py         # POST /api/quiz/start, POST /api/quiz/submit
│   │   ├── results.py      # GET /api/results, GET /api/results/{id}, DELETE /api/results/{id}
│   │   └── auth.py         # Deprecated signup/login endpoints (handled by frontend Supabase JS)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm.py          # clean_field, valid_quiz, generate_quiz, recommend_for_field (google-genai)
│   │   ├── rate_limiter.py # In-memory sliding-window per-user LLM rate limiter
│   │   ├── storage.py      # Supabase quizzes and results persistence with user_id isolation
│   │   └── scoring.py      # Legacy RIASEC assessment utilities
│   └── data/
│       ├── __init__.py
│       ├── questions.py    # Production question bank (dynamic quizzes generated on-demand)
│       └── careers.py      # Production catalog
├── supabase/
│   └── schema.sql          # Tables: quizzes, results, profiles, RLS policies, and indexes
├── tests/
│   ├── test_api.py         # Comprehensive FastAPI endpoint tests (mocked LLM, security, auth)
│   └── test_scoring.py     # Math and algorithmic verification
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Requirements
- Python 3.10+ (Tested on Python 3.12)
- Supabase project
- Google Gemini API key

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
GEMINI_API_KEY=your-gemini-api-key
PORT=8000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

### 4. Database Setup
Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor to create `quizzes` and `results` tables with Row Level Security (RLS) enabled.

### 5. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check, Supabase and Gemini connectivity |
| `GET` | `/api/me` | Bearer Token | Authenticated student profile (`{id, email, name}`) |
| `GET` | `/api/dashboard` | Bearer Token | User dashboard analytics (`{attempts, latest, top_trait}`) |
| `POST` | `/api/quiz/start` | Bearer Token | Generates dynamic 10-Q quiz for a field; strips trait tags |
| `POST` | `/api/quiz/submit` | Bearer Token | Submits 10 answers (0-3), calculates traits, requests AI guidance, saves result |
| `GET` | `/api/results` | Bearer Token | Lists all assessment results for the current user |
| `GET` | `/api/results/{id}` | Bearer Token | Retrieves a single result (filtered by caller's user_id) |
| `DELETE` | `/api/results/{id}` | Bearer Token | Deletes a result (only the caller's own row) |

---

## 🔒 Security Best Practices

1. **Key Isolation**: Gemini API and Supabase Service keys are kept solely in the backend `.env` file, never sent to clients.
2. **User Data Isolation**: Every database read, insert, and delete on user data strictly filters by the authenticated `user_id`.
3. **Data Sanitization**: User-entered field names are sanitized with `clean_field`, limited to 60 characters, and treated strictly as data in LLM prompts.
4. **Rate Limiting**: In-memory sliding-window rate limiting prevents abuse of LLM-backed quiz generation and recommendation endpoints.
5. **No Leaked Trait Tags**: Trait codes are never sent to the client in `/api/quiz/start`.

---

## 🧪 Testing

Run automated tests using pytest:
```bash
python -m pytest tests -v
```
All tests use mocked LLM responses with zero live network calls.
