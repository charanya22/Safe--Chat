import unittest
from backend.app.services.risk_engine import analyze_chat_message

class TestRiskEngine(unittest.TestCase):
    def test_grooming_detection(self):
        msg = "Don't tell your parents we talk. Keep it our secret."
        res = analyze_chat_message(msg)
        self.assertIn(res["risk_level"], ["HIGH", "CRITICAL"])
        self.assertGreaterEqual(res["risk_score"], 40)
        self.assertIn("Grooming", res["primary_concern"])

    def test_cyberbullying_detection(self):
        msg = "Everyone hates you, go die you worthless loser"
        res = analyze_chat_message(msg)
        self.assertIn(res["risk_level"], ["HIGH", "CRITICAL"])
        self.assertGreaterEqual(res["risk_score"], 50)

    def test_threat_detection(self):
        msg = "I will leak your address and doxx you online"
        res = analyze_chat_message(msg)
        self.assertEqual(res["risk_level"], "CRITICAL")
        self.assertGreaterEqual(res["risk_score"], 65)

    def test_benign_message(self):
        msg = "The soccer practice starts at 4pm on Saturday"
        res = analyze_chat_message(msg)
        self.assertEqual(res["risk_level"], "LOW")
        self.assertLess(res["risk_score"], 25)

if __name__ == "__main__":
    unittest.main()
