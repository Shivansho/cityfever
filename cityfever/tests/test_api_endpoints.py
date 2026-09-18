"""
End-to-End API Integration Tests for CivicFlow
==============================================
Validates the complete pipeline:
Submission -> Classification -> Entities -> Priority -> Duplicate -> DB -> Queue
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine


class TestCivicFlowAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")

    def test_submit_complaint_canonical_schema(self):
        payload = {
            "complaint_text": "Dangerous sewage overflow leaking near Delhi Public School for 5 days, kids at risk",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        response = self.client.post("/api/complaints", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Validate canonical schema fields
        required_fields = [
            "id", "complaint_text", "department", "issue_type",
            "department_confidence", "issue_confidence", "priority_score",
            "priority_level", "priority_reasons", "locality", "duration_text",
            "latitude", "longitude", "duplicate_cluster_id", "status", "created_at"
        ]
        for field in required_fields:
            self.assertIn(field, data, f"Missing field in canonical schema: {field}")

        # Check values
        self.assertEqual(data["department"], "Sewage")
        self.assertEqual(data["priority_level"], "High")
        self.assertGreaterEqual(data["priority_score"], 61)
        self.assertTrue(len(data["priority_reasons"]) > 0)
        self.assertIn("5 days", data["duration_text"] or "")

    def test_duplicate_clustering(self):
        # 1. Submit initial complaint
        p1 = {
            "complaint_text": "Massive pothole near Gate 1 on Main Road causing accidents",
            "latitude": 28.5355,
            "longitude": 77.3910
        }
        r1 = self.client.post("/api/complaints", json=p1)
        self.assertEqual(r1.status_code, 201)

        # 2. Submit near-duplicate within 50m
        p2 = {
            "complaint_text": "Huge pothole near Gate 1 on Main Road causing major traffic and accident",
            "latitude": 28.5357,
            "longitude": 77.3912
        }
        r2 = self.client.post("/api/complaints", json=p2)
        self.assertEqual(r2.status_code, 201)
        d2 = r2.json()

        self.assertIsNotNone(d2["duplicate_cluster_id"])
        self.assertTrue(d2["duplicate_cluster_id"].startswith("CL-"))

    def test_department_queue(self):
        response = self.client.get("/api/queues/Sewage")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["department"], "Sewage")
        self.assertIn("pending_count", data)
        self.assertIn("items", data)

    def test_dashboard_stats(self):
        # Ensure at least one complaint exists
        self.client.post("/api/complaints", json={
            "complaint_text": "Broken street light causing darkness near park",
            "latitude": 28.5,
            "longitude": 77.2
        })
        response = self.client.get("/api/dashboard/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_complaints", data)
        self.assertIn("status_counts", data)
        self.assertIn("priority_distribution", data)
        self.assertIn("department_breakdown", data)
        self.assertGreaterEqual(data["total_complaints"], 1)


if __name__ == "__main__":
    unittest.main()
