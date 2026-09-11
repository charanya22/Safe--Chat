import unittest
from backend.app.services.privacy_filter import sanitize_message_content

class TestPrivacyFilter(unittest.TestCase):
    def test_phone_number_redaction(self):
        text = "Call me at 555-438-9201 right now"
        sanitized, pii, count = sanitize_message_content(text)
        self.assertNotIn("555-438-9201", sanitized)
        self.assertIn("[PHONE_NUMBER_REDACTED]", sanitized)
        self.assertGreater(count, 0)

    def test_email_redaction(self):
        text = "Send it to alex.secret@gmail.com please"
        sanitized, pii, count = sanitize_message_content(text)
        self.assertNotIn("alex.secret@gmail.com", sanitized)
        self.assertIn("[EMAIL_REDACTED]", sanitized)

    def test_child_name_redaction(self):
        text = "Hey Aarav, can you meet me?"
        sanitized, pii, count = sanitize_message_content(text, child_name="Aarav")
        self.assertNotIn("Aarav", sanitized)
        self.assertIn("[CHILD]", sanitized)

    def test_normal_text_unaltered(self):
        text = "Let's do the science homework together tomorrow"
        sanitized, pii, count = sanitize_message_content(text)
        self.assertEqual(count, 0)
        self.assertIn("science homework", sanitized)

if __name__ == "__main__":
    unittest.main()
