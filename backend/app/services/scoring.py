import math
from typing import Dict, List, Tuple
from app.data.questions import QUESTIONS_BANK
from app.data.careers import CAREERS_DATABASE

TRAIT_METADATA = {
    "R": {
        "name": "Realistic",
        "description": "Practical, hands-on, mechanical, physical environments, and tangible engineering results."
    },
    "I": {
        "name": "Investigative",
        "description": "Analytical, intellectual, research-driven, scientific observation, and mathematical logic."
    },
    "A": {
        "name": "Artistic",
        "description": "Creative, expressive, visual composition, design systems, and original conceptualization."
    },
    "S": {
        "name": "Social",
        "description": "Empathetic, collaborative, teaching, human-centric solutions, and peer mentorship."
    },
    "E": {
        "name": "Enterprising",
        "description": "Leadership, strategic vision, calculated risk-taking, product advocacy, and commercial initiative."
    },
    "C": {
        "name": "Conventional",
        "description": "Organized, systematic, detail-oriented, structured guidelines, and operational precision."
    }
}

def calculate_trait_scores(answers: Dict[int, int]) -> Dict[str, float]:
    """
    Computes normalized 0.0 - 1.0 trait scores from submitted ratings (1 to 5).
    """
    # Map questions to traits
    q_map = {q["id"]: q["trait"] for q in QUESTIONS_BANK}

    trait_sums = {t: 0 for t in TRAIT_METADATA}
    trait_counts = {t: 0 for t in TRAIT_METADATA}

    for q_id, rating in answers.items():
        # Ensure q_id is int and rating within 1-5
        int_id = int(q_id)
        if int_id in q_map:
            trait = q_map[int_id]
            clean_rating = max(1, min(5, int(rating)))
            trait_sums[trait] += clean_rating
            trait_counts[trait] += 1

    # Normalize each trait between 0.0 and 1.0
    normalized_traits = {}
    for t in TRAIT_METADATA:
        count = trait_counts[t]
        if count > 0:
            avg = trait_sums[t] / count  # Scale 1.0 to 5.0
            norm = (avg - 1.0) / 4.0     # 0.0 to 1.0
        else:
            norm = 0.5  # Neutral fallback
        normalized_traits[t] = round(norm, 3)

    return normalized_traits

def match_careers(student_traits: Dict[str, float]) -> List[dict]:
    """
    Calculates weighted vector similarity between student traits and career requirements.
    Returns ranked careers descending by match_score (0-100%).
    """
    ranked = []

    # Calculate magnitude of student vector
    student_mag = math.sqrt(sum(v ** 2 for v in student_traits.values())) or 1.0

    for career in CAREERS_DATABASE:
        weights = career["trait_weights"]
        
        # Dot product
        dot_product = sum(student_traits.get(t, 0.0) * weights.get(t, 0.0) for t in TRAIT_METADATA)
        career_mag = math.sqrt(sum(v ** 2 for v in weights.values())) or 1.0

        # Cosine similarity
        cosine = dot_product / (student_mag * career_mag)
        
        # Scale to realistic high-fidelity percentage (60% to 98%)
        match_score = int(round(min(98, max(50, cosine * 100))))

        ranked.append({
            "id": career["id"],
            "title": career["title"],
            "category": career["category"],
            "riasec_code": career["riasec_code"],
            "match_score": match_score,
            "median_salary": career["median_salary"],
            "growth_rate": career["growth_rate"],
            "required_education": career["required_education"],
            "key_skills": career["key_skills"],
            "description": career["description"]
        })

    # Sort descending by match score
    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked

def evaluate_assessment(answers: Dict[int, int]) -> Tuple[str, List[dict], List[dict]]:
    """
    Main pipeline:
    Returns (holland_code, formatted_trait_scores, ranked_careers)
    """
    scores = calculate_trait_scores(answers)

    # Determine 3-letter Holland RIASEC code
    sorted_traits = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    holland_code = "".join([t[0] for t in sorted_traits[:3]])

    formatted_scores = []
    for trait, norm_score in scores.items():
        meta = TRAIT_METADATA[trait]
        pct = round(norm_score * 100, 1)
        formatted_scores.append({
            "trait": trait,
            "dimension_name": meta["name"],
            "score": norm_score,
            "percentage": pct,
            "description": meta["description"]
        })

    # Sort formatted scores by percentage descending
    formatted_scores.sort(key=lambda x: x["percentage"], reverse=True)

    ranked_careers = match_careers(scores)

    return holland_code, formatted_scores, ranked_careers
