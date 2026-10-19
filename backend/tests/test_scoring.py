import pytest
from app.services.scoring import (
    calculate_trait_scores,
    match_careers,
    evaluate_assessment,
    TRAIT_METADATA
)
from app.data.questions import QUESTIONS_BANK
from app.data.careers import CAREERS_DATABASE

# Test fixtures for unit testing scoring logic
MOCK_TEST_QUESTIONS = [
    {"id": 1, "text": "Test question R", "trait": "R"},
    {"id": 2, "text": "Test question I", "trait": "I"},
    {"id": 3, "text": "Test question A", "trait": "A"},
    {"id": 4, "text": "Test question S", "trait": "S"},
    {"id": 5, "text": "Test question E", "trait": "E"},
    {"id": 6, "text": "Test question C", "trait": "C"},
]

MOCK_TEST_CAREERS = [
    {
        "id": "c1",
        "title": "Data Scientist",
        "category": "Tech & AI",
        "riasec_code": "IRC",
        "trait_weights": {"R": 0.4, "I": 0.9, "A": 0.3, "S": 0.2, "E": 0.4, "C": 0.7},
        "description": "Analyzes complex datasets",
        "median_salary": "$136,000",
        "growth_rate": "+35%",
        "required_education": "Bachelor's / Master's",
        "key_skills": ["Python", "SQL", "Machine Learning"]
    },
    {
        "id": "c2",
        "title": "Creative Technologist",
        "category": "Design & Tech",
        "riasec_code": "AIR",
        "trait_weights": {"R": 0.6, "I": 0.7, "A": 0.9, "S": 0.3, "E": 0.4, "C": 0.2},
        "description": "Blends design and software",
        "median_salary": "$124,000",
        "growth_rate": "+24%",
        "required_education": "Bachelor's Degree",
        "key_skills": ["WebGL", "Three.js", "Design Systems"]
    }
]

def test_production_banks_are_cleared():
    """Verify production questions bank and careers catalog are empty per user request."""
    assert len(QUESTIONS_BANK) == 0
    assert len(CAREERS_DATABASE) == 0

def test_calculate_trait_scores_empty_fallback():
    """Empty answers or empty question bank fallback to neutral 0.5 score."""
    scores = calculate_trait_scores({})
    assert len(scores) == 6
    for trait in scores:
        assert scores[trait] == 0.5

def test_calculate_trait_scores_with_fixtures(monkeypatch):
    """Answers rated 5 with questions fixture produce normalized score of 1.0."""
    monkeypatch.setattr("app.services.scoring.QUESTIONS_BANK", MOCK_TEST_QUESTIONS)
    all_fives = {q["id"]: 5 for q in MOCK_TEST_QUESTIONS}
    scores = calculate_trait_scores(all_fives)
    
    assert len(scores) == 6
    for trait in ["R", "I", "A", "S", "E", "C"]:
        assert trait in scores
        assert scores[trait] == pytest.approx(1.0, 0.01)

def test_calculate_trait_scores_min_with_fixtures(monkeypatch):
    """Answers rated 1 with questions fixture produce normalized score of 0.0."""
    monkeypatch.setattr("app.services.scoring.QUESTIONS_BANK", MOCK_TEST_QUESTIONS)
    all_ones = {q["id"]: 1 for q in MOCK_TEST_QUESTIONS}
    scores = calculate_trait_scores(all_ones)
    
    assert len(scores) == 6
    for trait in ["R", "I", "A", "S", "E", "C"]:
        assert trait in scores
        assert scores[trait] == pytest.approx(0.0, 0.01)

def test_match_careers_with_fixtures(monkeypatch):
    """match_careers returns ranked careers in descending match_score order."""
    monkeypatch.setattr("app.services.scoring.CAREERS_DATABASE", MOCK_TEST_CAREERS)
    sample_traits = {
        "R": 0.85,
        "I": 0.95,
        "A": 0.30,
        "S": 0.40,
        "E": 0.60,
        "C": 0.70
    }
    careers = match_careers(sample_traits)
    assert len(careers) > 0
    scores = [c["match_score"] for c in careers]
    assert scores == sorted(scores, reverse=True)
    top = careers[0]
    assert "title" in top
    assert "match_score" in top
    assert 50 <= top["match_score"] <= 100

def test_evaluate_assessment_with_fixtures(monkeypatch):
    """evaluate_assessment returns Holland code, formatted scores, and ranked careers."""
    monkeypatch.setattr("app.services.scoring.QUESTIONS_BANK", MOCK_TEST_QUESTIONS)
    monkeypatch.setattr("app.services.scoring.CAREERS_DATABASE", MOCK_TEST_CAREERS)
    
    answers = {1: 5, 2: 5, 3: 5, 4: 1, 5: 1, 6: 1} # R, I, A high
    holland_code, formatted_scores, ranked_careers = evaluate_assessment(answers)

    assert len(holland_code) == 3
    for ch in ["R", "I", "A"]:
        assert ch in holland_code
    assert len(formatted_scores) == 6
    assert len(ranked_careers) > 0
