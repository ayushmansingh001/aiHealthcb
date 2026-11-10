"""
Core RAG (Retrieval-Augmented Generation) service.

Responsible for:
1. Retrieving relevant context chunks from the vector store.
2. Building a structured prompt that combines retrieved context,
   conversation history, and safety disclaimers.

The module also defines BASE_MEDICAL_KNOWLEDGE, a curated body of
general health information that is seeded into the vector store at
application startup so the assistant can answer basic questions even
without any uploaded documents.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from database.vector_store import vector_store

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Base medical knowledge corpus
# ---------------------------------------------------------------------------

BASE_MEDICAL_KNOWLEDGE: str = """
DIABETES MELLITUS
Diabetes is a chronic condition where the body cannot properly regulate blood sugar (glucose).
Type 1 diabetes occurs when the immune system attacks insulin-producing cells in the pancreas.
Type 2 diabetes develops when cells become resistant to insulin or the pancreas produces
insufficient insulin. Common symptoms include frequent urination, excessive thirst, unexplained
weight loss, blurred vision, slow-healing wounds, and fatigue. Management involves regular blood
glucose monitoring, a balanced diet low in refined carbohydrates and sugars, regular physical
activity (at least 150 minutes of moderate exercise per week), and medications such as metformin
or insulin as prescribed by a physician. Complications of poorly controlled diabetes include
cardiovascular disease, kidney damage (nephropathy), nerve damage (neuropathy), and vision
impairment (retinopathy). Annual eye exams, kidney function tests, and foot examinations are
strongly recommended.

HYPERTENSION (HIGH BLOOD PRESSURE)
Hypertension is persistently elevated blood pressure in the arteries, defined as readings
consistently at or above 130/80 mmHg. Most patients have no symptoms; some experience headaches,
shortness of breath, or nosebleeds in severe cases. Risk factors include obesity, high sodium
intake, physical inactivity, smoking, excessive alcohol, stress, and family history.
Lifestyle modifications are the first line of management: reducing sodium intake to less than
2,300 mg per day, following the DASH diet (rich in fruits, vegetables, and low-fat dairy),
exercising regularly, limiting alcohol, and quitting smoking. When lifestyle changes are
insufficient, antihypertensive medications such as ACE inhibitors, ARBs, calcium channel
blockers, or diuretics may be prescribed. Untreated hypertension significantly raises the risk
of stroke, heart attack, heart failure, and chronic kidney disease.

COMMON COLD AND INFLUENZA (FLU)
The common cold is a viral upper respiratory tract infection, most often caused by rhinoviruses.
Symptoms include runny nose, nasal congestion, sore throat, cough, sneezing, and mild fever.
Influenza (flu) causes more severe symptoms: sudden-onset high fever, chills, severe muscle
aches, headache, fatigue, and dry cough. Both illnesses are spread by respiratory droplets and
contact with contaminated surfaces. Treatment is largely supportive: rest, adequate hydration
(8–10 glasses of water per day), over-the-counter decongestants, pain relievers (ibuprofen or
acetaminophen), and throat lozenges. Antibiotics are NOT effective against viral infections.
The annual flu vaccine is the most effective preventive measure against influenza. Wash hands
frequently and avoid close contact with infected individuals. Seek medical care if symptoms
worsen after 7 days, breathing becomes difficult, or fever exceeds 39.4 °C (103 °F).

FEVER
Fever is a temporary rise in body temperature above the normal range (37 °C / 98.6 °F), usually
indicating an immune response to infection. Low-grade fever (37.5–38.3 °C) often requires only
monitoring. For discomfort, take acetaminophen or ibuprofen at the recommended dose, stay well
hydrated, rest, and use light clothing and blankets. Seek immediate medical attention if fever
exceeds 39.4 °C (103 °F) in adults, if it persists for more than 3 days, or if accompanied by
stiff neck, severe headache, rash, difficulty breathing, confusion, or chest pain.

HEADACHE
Tension headaches—the most common type—produce a dull, aching pressure around the forehead or
the back of the head and neck. Migraine headaches are characterised by moderate-to-severe
throbbing pain (often one-sided), nausea, vomiting, and sensitivity to light and sound.
General management: rest in a quiet, dark room; apply a cold or warm compress; drink sufficient
water; take over-the-counter analgesics (ibuprofen, acetaminophen, aspirin) as directed.
Identify and avoid personal triggers such as stress, poor sleep, dehydration, caffeine, and
certain foods. See a doctor if headaches are sudden and severe ("thunderclap"), occur with fever
or stiff neck, follow head trauma, or are worsening progressively over days.

FIRST AID ESSENTIALS
Cuts and wounds: Apply gentle pressure with a clean cloth to stop bleeding; clean the wound
thoroughly with clean water; apply an antiseptic and cover with a sterile bandage; seek medical
care for deep, gaping, or heavily contaminated wounds.
Burns: Cool minor burns under cool (not ice-cold) running water for 10–20 minutes; do not apply
butter, toothpaste, or ice; cover loosely with a sterile non-fluffy dressing; for severe burns
(large area, hands, face, joints, or electrical burns), call emergency services immediately.
Choking (adult/child): Encourage forceful coughing; if unable to cough, speak, or breathe,
deliver 5 back blows between the shoulder blades then 5 abdominal thrusts (Heimlich manoeuvre).
Heart attack warning signs: Chest pain or pressure, pain radiating to the arm, neck, or jaw,
shortness of breath, nausea, cold sweat—call emergency services (911 / 112) immediately and
chew an aspirin (325 mg) if not allergic while waiting for help.
Allergic reaction / Anaphylaxis: Use an epinephrine auto-injector (EpiPen) if available; call
emergency services; lay the person flat with legs elevated unless breathing is difficult.

GENERAL WELLNESS
Maintain a balanced diet rich in whole grains, vegetables, fruits, lean proteins, and healthy fats.
Aim for 7–9 hours of sleep per night. Exercise for at least 150 minutes of moderate-intensity
aerobic activity per week. Stay well hydrated (approximately 2–3 litres of water per day for
adults). Avoid smoking and limit alcohol consumption. Schedule regular preventive health
check-ups, vaccinations, and screenings appropriate for your age and risk factors. Manage stress
through mindfulness, relaxation techniques, and social support.
"""

# ---------------------------------------------------------------------------
# RAG service functions
# ---------------------------------------------------------------------------


async def retrieve_context(
    query: str,
    doc_ids: Optional[List[str]] = None,
    n_results: int = 5,
) -> List[Dict[str, Any]]:
    """
    Retrieve the most semantically relevant chunks for *query*.

    Parameters
    ----------
    query:
        The user's question or message.
    doc_ids:
        Optional list of document IDs to restrict retrieval to.  When
        ``None``, the entire vector store is searched.
    n_results:
        Maximum number of chunks to return.

    Returns
    -------
    List of dicts with keys ``text``, ``metadata``, and ``distance``.
    """
    try:
        hits = vector_store.search(query=query, n_results=n_results, doc_ids=doc_ids)
        logger.debug("Retrieved %d context chunks for query='%s'.", len(hits), query[:80])
        return hits
    except Exception as exc:
        logger.error("Vector store search failed: %s", exc, exc_info=True)
        return []


async def build_prompt(
    query: str,
    context_chunks: List[Dict[str, Any]],
    chat_history: List[Dict[str, str]],
    language: str = "en",
) -> str:
    """
    Assemble the final prompt that will be sent to the LLM.

    The prompt incorporates:
    * A system role with medical-disclaimer instructions.
    * Any retrieved context passages.
    * Recent conversation history (up to the last 6 exchanges).
    * The current user query.
    * Language-specific response instructions.

    Parameters
    ----------
    query:
        The current user question.
    context_chunks:
        Passages retrieved from the vector store.
    chat_history:
        List of previous turn dicts with ``role`` and ``content`` keys.
    language:
        BCP-47 language tag.  Supported: ``"en"`` (English), ``"hi"`` (Hindi).

    Returns
    -------
    Fully assembled prompt string ready for the LLM.
    """
    # ------------------------------------------------------------------
    # 1. System instructions
    # ------------------------------------------------------------------
    if language == "hi":
        lang_instruction = (
            "Please respond in Hindi (Devanagari script). "
            "If medical terms have no direct Hindi equivalent, you may include "
            "the English term in parentheses."
        )
    else:
        lang_instruction = "Please respond in clear, simple English."

    system_block = f"""You are a knowledgeable, empathetic AI Health Assistant.

IMPORTANT GUIDELINES:
- Provide accurate, evidence-based health information.
- Always recommend consulting a qualified healthcare professional for personal medical decisions, diagnosis, or treatment.
- Do NOT diagnose conditions or prescribe medications.
- If a question describes a medical emergency, instruct the user to call emergency services immediately.
- Be compassionate and supportive in tone.
- {lang_instruction}
"""

    # ------------------------------------------------------------------
    # 2. Context block
    # ------------------------------------------------------------------
    context_block = ""
    if context_chunks:
        passages = []
        for i, chunk in enumerate(context_chunks, start=1):
            meta = chunk.get("metadata", {})
            source_label = ""
            if meta.get("heading"):
                source_label = f" [{meta['heading']}]"
            elif meta.get("page"):
                source_label = f" [Page {meta['page']}]"
            passages.append(f"[{i}]{source_label} {chunk['text'].strip()}")
        context_block = (
            "\n\nRELEVANT MEDICAL INFORMATION:\n"
            + "\n\n".join(passages)
        )

    # ------------------------------------------------------------------
    # 3. Conversation history (last 6 turns max)
    # ------------------------------------------------------------------
    history_block = ""
    if chat_history:
        recent = chat_history[-6:]
        history_lines = []
        for turn in recent:
            role_label = "User" if turn.get("role") == "user" else "Assistant"
            history_lines.append(f"{role_label}: {turn.get('content', '').strip()}")
        history_block = "\n\nCONVERSATION HISTORY:\n" + "\n".join(history_lines)

    # ------------------------------------------------------------------
    # 4. Assemble full prompt
    # ------------------------------------------------------------------
    prompt = (
        system_block
        + context_block
        + history_block
        + f"\n\nUser Question: {query.strip()}"
        + "\n\nAssistant Response:"
    )

    return prompt
