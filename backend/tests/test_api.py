import copy
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.deps import get_current_user
from app.services.llm import clean_field, valid_quiz
from app.services.storage import save_quiz, save_result, in_memory_quizzes, in_memory_results

client = TestClient(app)

MOCK_USER_A = {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "student_a@raah.edu",
    "user_metadata": {"full_name": "Student Alpha"}
}

MOCK_USER_B = {
    "id": "22222222-2222-2222-2222-222222222222",
    "email": "student_b@raah.edu",
    "user_metadata": {"name": "Student Beta"}
}

SAMPLE_GOOD_QUIZ = {
    "questions": [
        {
            "q": f"Question {i} scenario in the field",
            "options": [
                {"text": f"Option A for Q{i}", "trait": "A"},
                {"text": f"Option C for Q{i}", "trait": "C"},
                {"text": f"Option S for Q{i}", "trait": "S"},
                {"text": f"Option L for Q{i}", "trait": "L"},
            ]
        }
        for i in range(1, 11)
    ]
}

SAMPLE_AI_RECOMMENDATION = {
    "summary": "You demonstrate strong analytical and creative inclinations.",
    "careers": [
        {
            "title": "Data Scientist",
            "why": "Fits your strong analytical focus.",
            "first_steps": ["Learn Python", "Build a project", "Join Kaggle"],
            "exams_or_courses": ["GATE CS", "Coursera ML Specialization"]
        },
        {
            "title": "Computational Physicist",
            "why": "Combines physics knowledge with modeling.",
            "first_steps": ["Learn SciPy", "Work on simulation", "Read research papers"],
            "exams_or_courses": ["JAM Physics", "CSIR NET"]
        },
        {
            "title": "Quantitative Analyst",
            "why": "Systematic mathematical modeling in finance.",
            "first_steps": ["Study probability", "Practice algorithms", "Backtest models"],
            "exams_or_courses": ["CFA Level 1", "FRM"]
        },
        {
            "title": "Machine Learning Engineer",
            "why": "Engineering systems around algorithms.",
            "first_steps": ["Master Git", "Deploy Docker apps", "Train neural nets"],
            "exams_or_courses": ["TensorFlow Developer", "AWS Machine Learning"]
        }
    ],
    "watch_out": "Requires consistent problem-solving practice and portfolio building."
}

from app.services.rate_limiter import reset_rate_limits

@pytest.fixture(autouse=True)
def clean_test_storage():
    """Clear in-memory database and rate limiter before and after each test."""
    in_memory_quizzes.clear()
    in_memory_results.clear()
    reset_rate_limits()
    app.dependency_overrides.clear()
    yield
    in_memory_quizzes.clear()
    in_memory_results.clear()
    reset_rate_limits()
    app.dependency_overrides.clear()

# --- 1. Basic Health & Root Tests ---
def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "docs_url" in response.json()

# --- 2. clean_field unit tests ---
def test_clean_field_strips_unsafe_characters():
    # Strips scripts, brackets, quotes, exclamation marks, etc.
    raw = "<script>alert('xss')</script> BSc Physics! @ # $ %"
    cleaned = clean_field(raw)
    assert "<" not in cleaned
    assert ">" not in cleaned
    assert "!" not in cleaned
    assert "@" not in cleaned
    assert "$" not in cleaned
    assert "%" not in cleaned
    assert "BSc Physics" in cleaned

def test_clean_field_preserves_allowed_characters():
    allowed = "B.Tech CSE & AI / ML + Data-Science 2026"
    cleaned = clean_field(allowed)
    assert cleaned == "B.Tech CSE & AI / ML + Data-Science 2026"

def test_clean_field_max_60_chars():
    long_input = "a" * 100
    cleaned = clean_field(long_input)
    assert len(cleaned) == 60

def test_clean_field_empty_input():
    assert clean_field("") == ""
    assert clean_field(None) == ""
    assert clean_field("   ") == ""

# --- 3. valid_quiz unit tests ---
def test_valid_quiz_accepts_good_quiz():
    assert valid_quiz(SAMPLE_GOOD_QUIZ) is True

def test_valid_quiz_rejects_wrong_question_count():
    # 9 questions instead of 10
    bad_9 = {"questions": SAMPLE_GOOD_QUIZ["questions"][:9]}
    assert valid_quiz(bad_9) is False

    # 11 questions
    bad_11 = {"questions": SAMPLE_GOOD_QUIZ["questions"] + [SAMPLE_GOOD_QUIZ["questions"][0]]}
    assert valid_quiz(bad_11) is False

def test_valid_quiz_rejects_wrong_option_count():
    bad = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    bad["questions"][0]["options"] = bad["questions"][0]["options"][:3]  # 3 options
    assert valid_quiz(bad) is False

def test_valid_quiz_rejects_missing_or_empty_trait():
    bad = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    del bad["questions"][0]["options"][0]["trait"]
    assert valid_quiz(bad) is False

    bad2 = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    bad2["questions"][0]["options"][0]["trait"] = ""
    assert valid_quiz(bad2) is False

def test_valid_quiz_rejects_bad_trait():
    bad = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    bad["questions"][0]["options"][0]["trait"] = "Z"  # Not in {A, C, S, L, B, O}
    assert valid_quiz(bad) is False

def test_valid_quiz_rejects_empty_q_or_text():
    bad_q = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    bad_q["questions"][0]["q"] = "   "
    assert valid_quiz(bad_q) is False

    bad_opt = copy.deepcopy(SAMPLE_GOOD_QUIZ)
    bad_opt["questions"][0]["options"][0]["text"] = ""
    assert valid_quiz(bad_opt) is False

# --- 4. Unauthenticated Endpoints Return 401 ---
@pytest.mark.parametrize("method,path,payload", [
    ("post", "/api/quiz/start", {"field": "BSc Physics"}),
    ("post", "/api/quiz/submit", {"quiz_id": "test", "answers": [0] * 10}),
    ("get", "/api/me", None),
    ("get", "/api/dashboard", None),
    ("get", "/api/results", None),
    ("get", "/api/results/some-id", None),
    ("delete", "/api/results/some-id", None),
])
def test_endpoints_return_401_without_token(method, path, payload):
    if method == "post":
        res = client.post(path, json=payload)
    elif method == "get":
        res = client.get(path)
    elif method == "delete":
        res = client.delete(path)
    assert res.status_code == 401

# --- 5. /api/quiz/start Tests ---
def test_quiz_start_never_returns_trait_tags(monkeypatch):
    """Verify POST /api/quiz/start NEVER exposes trait tags to the client."""
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    monkeypatch.setattr("app.routers.quiz.generate_quiz", lambda field: SAMPLE_GOOD_QUIZ)

    response = client.post("/api/quiz/start", json={"field": "BSc Physics"})
    assert response.status_code == 200
    data = response.json()

    assert "quiz_id" in data
    assert data["field"] == "BSc Physics"
    assert len(data["questions"]) == 10

    # Ensure no trait keys anywhere in the returned payload
    for q in data["questions"]:
        assert "q" in q
        assert "options" in q
        assert "trait" not in q
        assert len(q["options"]) == 4
        for opt in q["options"]:
            # Options must be raw strings, not objects containing trait
            assert isinstance(opt, str)
            assert "trait" not in opt.lower()

    # Verify JSON text does not have "trait" key
    raw_text = response.text
    assert '"trait"' not in raw_text

def test_quiz_start_invalid_field_returns_422():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    # Empty after cleaning
    response = client.post("/api/quiz/start", json={"field": "  !@#$$%  "})
    assert response.status_code == 422

def test_quiz_start_llm_reports_invalid_field_returns_422(monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    monkeypatch.setattr("app.routers.quiz.generate_quiz", lambda field: {"error": "Please enter a valid course or field"})

    response = client.post("/api/quiz/start", json={"field": "gibberish12345"})
    assert response.status_code == 422
    assert "valid course" in response.json()["detail"]

def test_quiz_start_generation_failure_returns_502(monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    monkeypatch.setattr("app.routers.quiz.generate_quiz", lambda field: None)

    response = client.post("/api/quiz/start", json={"field": "BSc Physics"})
    assert response.status_code == 502

# --- 6. /api/quiz/submit Tests ---
def test_quiz_submit_rejects_wrong_answer_count():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    # 5 answers instead of 10
    response = client.post("/api/quiz/submit", json={"quiz_id": "any-id", "answers": [0, 1, 2, 3, 0]})
    assert response.status_code == 422

    # 11 answers
    response2 = client.post("/api/quiz/submit", json={"quiz_id": "any-id", "answers": [0] * 11})
    assert response2.status_code == 422

def test_quiz_submit_rejects_out_of_range_answers():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    # answer 4 is out of range 0-3
    bad_answers = [0, 1, 2, 3, 0, 1, 2, 4, 0, 1]
    response = client.post("/api/quiz/submit", json={"quiz_id": "any-id", "answers": bad_answers})
    assert response.status_code == 422

    # negative answer -1
    bad_answers_neg = [0, 1, 2, 3, -1, 1, 2, 0, 0, 1]
    response_neg = client.post("/api/quiz/submit", json={"quiz_id": "any-id", "answers": bad_answers_neg})
    assert response_neg.status_code == 422

def test_quiz_submit_quiz_not_found_or_wrong_user():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    # Non existent quiz
    response = client.post("/api/quiz/submit", json={"quiz_id": "non-existent-uuid", "answers": [0] * 10})
    assert response.status_code == 404

    # Quiz belonging to USER_B, attempted by USER_A
    quiz_b_id = save_quiz(user_id=MOCK_USER_B["id"], field="BCom", questions=SAMPLE_GOOD_QUIZ["questions"])
    response_b = client.post("/api/quiz/submit", json={"quiz_id": quiz_b_id, "answers": [0] * 10})
    assert response_b.status_code == 404

def test_quiz_submit_success_flow(monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    monkeypatch.setattr("app.routers.quiz.recommend_for_field", lambda field, profile, qa: SAMPLE_AI_RECOMMENDATION)

    # 1. Create a quiz for USER_A
    quiz_id = save_quiz(user_id=MOCK_USER_A["id"], field="BSc Physics", questions=SAMPLE_GOOD_QUIZ["questions"])

    # 2. Submit answers: all 0s (in our mock, option 0 corresponds to trait 'A')
    answers = [0] * 10
    response = client.post("/api/quiz/submit", json={"quiz_id": quiz_id, "answers": answers})
    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["field"] == "BSc Physics"
    assert "profile" in data
    assert "ai" in data

    # Verify profile scoring: trait 'A' had 10 answers -> 10/10*100 = 100%
    profile = data["profile"]
    assert len(profile) == 6
    assert profile[0]["trait"] == "A"
    assert profile[0]["score"] == 100.0

    # Verify descending sort order
    scores = [item["score"] for item in profile]
    assert scores == sorted(scores, reverse=True)

    # Verify AI recommendation populated
    assert data["ai"]["summary"] == SAMPLE_AI_RECOMMENDATION["summary"]
    assert len(data["ai"]["careers"]) == 4

# --- 7. /api/me and /api/dashboard Tests ---
def test_me_endpoint_returns_user_info():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A
    response = client.get("/api/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == MOCK_USER_A["id"]
    assert data["email"] == MOCK_USER_A["email"]
    assert data["name"] == "Student Alpha"

def test_dashboard_endpoint_analytics():
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A

    # Empty initially
    res_empty = client.get("/api/dashboard")
    assert res_empty.status_code == 200
    assert res_empty.json()["attempts"] == 0
    assert res_empty.json()["latest"] is None
    assert res_empty.json()["top_trait"] is None

    # Save a result for USER_A
    save_result(
        user_id=MOCK_USER_A["id"],
        field="BSc Physics",
        quiz_id="quiz-123",
        scores=[{"trait": "A", "score": 80.0}, {"trait": "C", "score": 20.0}],
        matches=[],
        ai=SAMPLE_AI_RECOMMENDATION
    )

    res_with_data = client.get("/api/dashboard")
    assert res_with_data.status_code == 200
    data = res_with_data.json()
    assert data["attempts"] == 1
    assert data["top_trait"] == "A"
    assert data["latest"]["field"] == "BSc Physics"

# --- 8. DELETE /api/results/{id} Security Test ---
def test_delete_result_only_caller_own_row():
    # Save a result for USER_A and a result for USER_B
    res_a = save_result(
        user_id=MOCK_USER_A["id"],
        field="BSc Physics",
        scores=[{"trait": "A", "score": 90.0}]
    )
    res_b = save_result(
        user_id=MOCK_USER_B["id"],
        field="BCom",
        scores=[{"trait": "O", "score": 70.0}]
    )

    # Logged in as USER_A
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER_A

    # Attempting to delete USER_B's result returns 404
    del_unauthorized = client.delete(f"/api/results/{res_b['id']}")
    assert del_unauthorized.status_code == 404

    # Deleting USER_A's own result succeeds
    del_own = client.delete(f"/api/results/{res_a['id']}")
    assert del_own.status_code == 200

    # Subsequent fetch returns 404
    get_after_del = client.get(f"/api/results/{res_a['id']}")
    assert get_after_del.status_code == 404

# --- 9. Deprecated Auth Routes Return 410 ---
def test_legacy_auth_routes_disabled():
    res_signup = client.post("/auth/signup")
    assert res_signup.status_code == 410

    res_login = client.post("/auth/login")
    assert res_login.status_code == 410
