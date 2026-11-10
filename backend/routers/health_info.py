"""
Health information router.

Provides static/curated health content endpoints:
- Topic categories
- Suggested questions (multilingual)
- Emergency warning signs
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

router = APIRouter(tags=["Health Info"])

# ---------------------------------------------------------------------------
# Static data
# ---------------------------------------------------------------------------

_TOPICS = [
    {"id": "diabetes", "label": "Diabetes", "icon": "💉"},
    {"id": "hypertension", "label": "Hypertension / High Blood Pressure", "icon": "❤️"},
    {"id": "cold_flu", "label": "Cold & Flu", "icon": "🤧"},
    {"id": "fever", "label": "Fever", "icon": "🌡️"},
    {"id": "headache", "label": "Headache & Migraine", "icon": "🧠"},
    {"id": "first_aid", "label": "First Aid", "icon": "🩹"},
    {"id": "nutrition", "label": "Nutrition & Diet", "icon": "🥗"},
    {"id": "mental_health", "label": "Mental Health", "icon": "🧘"},
    {"id": "heart", "label": "Heart Health", "icon": "🫀"},
    {"id": "exercise", "label": "Exercise & Fitness", "icon": "🏃"},
    {"id": "sleep", "label": "Sleep Health", "icon": "😴"},
    {"id": "medications", "label": "Medications & Dosage", "icon": "💊"},
]

_SUGGESTED_QUESTIONS_EN = [
    "What are the early symptoms of diabetes?",
    "How can I lower my blood pressure naturally?",
    "What should I eat when I have a cold?",
    "When should I see a doctor for a fever?",
    "What are common triggers for migraines?",
    "How do I perform the Heimlich manoeuvre?",
    "What foods help lower cholesterol?",
    "How many hours of sleep do adults need?",
    "What are the warning signs of a heart attack?",
    "How can I manage stress and anxiety naturally?",
]

_SUGGESTED_QUESTIONS_HI = [
    "मधुमेह के शुरुआती लक्षण क्या हैं?",
    "मैं अपना रक्तचाप स्वाभाविक रूप से कैसे कम कर सकता हूँ?",
    "सर्दी-जुकाम होने पर मुझे क्या खाना चाहिए?",
    "बुखार के लिए मुझे डॉक्टर से कब मिलना चाहिए?",
    "माइग्रेन के सामान्य कारण क्या हैं?",
    "हेम्लिक मैनूवर कैसे करें?",
    "कौन से खाद्य पदार्थ कोलेस्ट्रॉल कम करने में मदद करते हैं?",
    "वयस्कों को कितने घंटे की नींद की जरूरत होती है?",
    "दिल के दौरे के चेतावनी संकेत क्या हैं?",
    "मैं तनाव और चिंता को स्वाभाविक रूप से कैसे प्रबंधित कर सकता हूँ?",
]

_EMERGENCY_SYMPTOMS = [
    {
        "symptom": "Chest pain or pressure",
        "description": "Sudden, severe chest pain, tightness, or pressure—especially radiating to the arm, jaw, or back.",
        "action": "Call emergency services (911 / 112) immediately. Chew aspirin 325 mg if not allergic.",
        "severity": "critical",
    },
    {
        "symptom": "Difficulty breathing",
        "description": "Sudden shortness of breath, inability to complete sentences, or blue-tinged lips/fingertips.",
        "action": "Call emergency services immediately. Sit upright and stay calm.",
        "severity": "critical",
    },
    {
        "symptom": "Stroke signs (FAST)",
        "description": "Face drooping, Arm weakness, Speech difficulty, Time to call for help.",
        "action": "Call emergency services immediately. Note the time symptoms started.",
        "severity": "critical",
    },
    {
        "symptom": "Severe allergic reaction (anaphylaxis)",
        "description": "Throat swelling, hives, severe breathing difficulty after exposure to an allergen.",
        "action": "Use EpiPen if available. Call emergency services immediately.",
        "severity": "critical",
    },
    {
        "symptom": "Loss of consciousness / unresponsiveness",
        "description": "Person is unresponsive, not breathing normally.",
        "action": "Call emergency services. Begin CPR if trained.",
        "severity": "critical",
    },
    {
        "symptom": "Severe bleeding",
        "description": "Blood that cannot be stopped with direct pressure after 10 minutes.",
        "action": "Apply firm continuous pressure. Call emergency services.",
        "severity": "critical",
    },
    {
        "symptom": "High fever with stiff neck and rash",
        "description": "Fever above 39 °C with neck stiffness, severe headache, and/or a non-blanching rash.",
        "action": "Seek emergency care immediately — may indicate meningitis.",
        "severity": "critical",
    },
    {
        "symptom": "Severe headache ('thunderclap')",
        "description": "The worst headache of your life, coming on suddenly.",
        "action": "Seek emergency care immediately.",
        "severity": "urgent",
    },
    {
        "symptom": "Choking",
        "description": "Person cannot speak, cough effectively, or breathe.",
        "action": "Deliver 5 back blows then 5 abdominal thrusts (Heimlich manoeuvre). Call 911 if unsuccessful.",
        "severity": "critical",
    },
    {
        "symptom": "Diabetic emergency (very low blood sugar)",
        "description": "Confusion, shakiness, sweating, pale skin, loss of consciousness in a diabetic.",
        "action": "Give sugar (juice, glucose tablets) if conscious. Call 911 if unconscious.",
        "severity": "urgent",
    },
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/topics")
async def get_health_topics():
    """
    Return a list of health topic categories with icons.

    Used by the frontend to populate topic quick-access buttons.
    """
    return {"topics": _TOPICS, "total": len(_TOPICS)}


@router.get("/suggested-questions")
async def get_suggested_questions(
    language: str = Query(default="en", pattern="^(en|hi)$"),
):
    """
    Return 10 suggested health questions in the specified language.

    Parameters
    ----------
    language:
        ``"en"`` for English (default) or ``"hi"`` for Hindi.
    """
    questions = _SUGGESTED_QUESTIONS_HI if language == "hi" else _SUGGESTED_QUESTIONS_EN
    return {"questions": questions, "language": language}


@router.get("/emergency-symptoms")
async def get_emergency_symptoms():
    """
    Return a list of emergency warning signs with recommended actions.

    Sorted by severity (critical first).
    """
    sorted_symptoms = sorted(
        _EMERGENCY_SYMPTOMS,
        key=lambda s: 0 if s["severity"] == "critical" else 1,
    )
    return {
        "emergency_symptoms": sorted_symptoms,
        "total": len(sorted_symptoms),
        "disclaimer": (
            "This list is for general informational purposes only. "
            "Always call your local emergency number in a life-threatening situation."
        ),
    }
