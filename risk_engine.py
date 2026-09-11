import re
from typing import Dict, Any, List

GROOMING_SIGNALS = [
    (r"\b(don'?t tell (your|ur) (mom|dad|parents)|keep (this|it) (our|a) secret|between us)\b", "Secrecy & Parental Isolation", 40),
    (r"\b(delete (this|these) (messages?|chats?)|erase the chat|switch to (snap|whatsapp|telegram))\b", "Channel Migration & Covert Communication", 35),
    (r"\b(you'?re so mature for your age|not like other kids|special friend|trust me)\b", "Flattery & False Intimacy", 30),
    (r"\b(send (a |me )?(pic|photo|picture|snap)|what are you wearing|are you alone)\b", "Boundary Testing & Private Requests", 55),
]

BULLYING_SIGNALS = [
    (r"\b(everyone hates you|nobody likes you|kill yourself|kys|go die)\b", "Severe Emotional Torment / Exclusion", 60),
    (r"\b(you'?re (so )?(ugly|stupid|fat|worthless|loser|pathetic|freak|useless))\b", "Targeted Name-Calling & Demoralization", 40),
    (r"\b(don'?t sit with us|stay away from us|you'?re not welcome|kick (him|her|them) out)\b", "Social Isolation & Exclusion", 30),
]

THREAT_SIGNALS = [
    (r"\b(leak your (address|photos?|pics?)|doxx you|expose you|post (this|your))\b", "Doxxing & Extortion / Blackmail", 65),
    (r"\b(beat you up|gonna get you after school|jump you|watch your back)\b", "Physical Intimidation & Violence", 70),
    (r"\b(pay me or|give me your (account|password|skins)|or else)\b", "Coercion & Digital Extortion", 55),
]

def analyze_chat_message(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    score = 5
    detected_patterns = []
    primary_concern = "Normal Everyday Interaction"

    grooming_score = 0
    for pat, desc, weight in GROOMING_SIGNALS:
        if re.search(pat, text_lower):
            grooming_score += weight
            detected_patterns.append({"name": desc, "severity": "HIGH", "category": "grooming"})

    bullying_score = 0
    for pat, desc, weight in BULLYING_SIGNALS:
        if re.search(pat, text_lower):
            bullying_score += weight
            detected_patterns.append({"name": desc, "severity": "HIGH", "category": "cyberbullying"})

    threat_score = 0
    for pat, desc, weight in THREAT_SIGNALS:
        if re.search(pat, text_lower):
            threat_score += weight
            detected_patterns.append({"name": desc, "severity": "CRITICAL", "category": "threats"})

    max_cat_score = max(grooming_score, bullying_score, threat_score)
    score = min(max_cat_score, 100) if max_cat_score > 0 else 5

    if score >= 65 or threat_score >= 60:
        risk_level = "CRITICAL"
    elif score >= 35 or grooming_score >= 35 or bullying_score >= 35:
        risk_level = "HIGH"
    elif score >= 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if threat_score >= 50:
        primary_concern = "Intimidation & Extortion Threat"
    elif grooming_score >= 35:
        primary_concern = "Grooming & Manipulation Patterns"
    elif bullying_score >= 35:
        primary_concern = "Cyberbullying & Hostile Peer Language"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "confidence": 92 if score > 20 else 85,
        "primary_concern": primary_concern,
        "detected_patterns": detected_patterns,
    }
