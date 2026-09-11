import re
from typing import List, Tuple

def sanitize_message_content(text: str, child_name: str = "Alex", contact_name: str = "User") -> Tuple[str, List[str], int]:
    sanitized = text
    pii_found = []

    # Phone numbers
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    phones = re.findall(phone_pattern, sanitized)
    for p in phones:
        pii_found.append(f"Phone: {p[:3]}***")
    sanitized = re.sub(phone_pattern, "[PHONE_NUMBER_REDACTED]", sanitized)

    # Email
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails = re.findall(email_pattern, sanitized)
    for e in emails:
        pii_found.append(f"Email: {e[:2]}***")
    sanitized = re.sub(email_pattern, "[EMAIL_REDACTED]", sanitized)

    # Child name
    if child_name and len(child_name) > 1:
        child_pat = re.compile(rf"\b{re.escape(child_name)}\b", re.IGNORECASE)
        if child_pat.search(sanitized):
            pii_found.append(f"Child Name: {child_name}")
            sanitized = child_pat.sub("[CHILD]", sanitized)

    # Contact name
    if contact_name and len(contact_name) > 1 and contact_name != "User":
        cont_pat = re.compile(rf"\b{re.escape(contact_name)}\b", re.IGNORECASE)
        if cont_pat.search(sanitized):
            pii_found.append(f"Contact Name: {contact_name}")
            sanitized = cont_pat.sub("[CONTACT]", sanitized)

    return sanitized, pii_found, len(pii_found)
