from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserSignUp(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = "Student Explorer"

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

# Quiz & Assessment Schemas
class QuestionItem(BaseModel):
    id: int
    text: str
    trait: str  # R, I, A, S, E, C
    dimension_name: str
    scenario: Optional[str] = None

class QuizSubmission(BaseModel):
    # Mapping of question_id -> rating (1 to 5)
    answers: Dict[int, int]

class TraitScore(BaseModel):
    trait: str
    dimension_name: str
    score: float
    percentage: float
    description: str

class CareerRecommendation(BaseModel):
    id: str
    title: str
    category: str
    riasec_code: str
    match_score: int
    median_salary: str
    growth_rate: str
    required_education: str
    key_skills: List[str]
    description: str

class RecommendResponse(BaseModel):
    success: bool
    holland_code: str
    trait_scores: List[TraitScore]
    ranked_careers: List[CareerRecommendation]
    llm_insights: Optional[str] = None
    evaluated_at: str

class ResultItem(BaseModel):
    id: str
    user_id: str
    holland_code: Optional[str] = None
    top_careers: Optional[List[Dict[str, Any]]] = None
    trait_scores: Optional[List[Dict[str, Any]]] = None
    field: Optional[str] = None
    quiz_id: Optional[str] = None
    scores: Optional[List[Dict[str, Any]]] = None
    matches: Optional[List[Dict[str, Any]]] = None
    ai: Optional[Dict[str, Any]] = None
    created_at: str

# Dynamic Quiz Flow Schemas
class QuizStartRequest(BaseModel):
    field: str

class QuizQuestionClient(BaseModel):
    q: str
    options: List[str]

class QuizStartResponse(BaseModel):
    quiz_id: str
    field: str
    questions: List[QuizQuestionClient]

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[int]

class TraitScoreItem(BaseModel):
    trait: str
    score: float

class QuizSubmitResponse(BaseModel):
    id: str
    field: str
    profile: List[TraitScoreItem]
    ai: Optional[Dict[str, Any]] = None

class DashboardResponse(BaseModel):
    attempts: int
    latest: Optional[Dict[str, Any]] = None
    top_trait: Optional[str] = None

class UserMeResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: str
