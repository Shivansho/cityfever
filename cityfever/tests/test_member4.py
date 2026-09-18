"""
Tests for Member 4: Priority Scoring, Entity Extraction, and Duplicate Detection
"""

import unittest
from backend.services.priority import calculate_priority
from backend.services.entities import extract_entities, extract_duration, extract_locality
from backend.services.duplicates import find_similar_complaints, haversine_distance_meters


class TestPriorityScoring(unittest.TestCase):
    def test_high_priority_complaint(self):
        # Sewage overflow near a school, hazardous for children, lasting 5 days
        result = calculate_priority(
            text="Dangerous sewage overflow near Delhi Public School, risk of accident for children",
            issue_type="Sewage Overflow",
            duration_text="5 days",
            locality="Krishna Nagar"
        )
        self.assertIn("priority_score", result)
        self.assertIn("priority_level", result)
        self.assertIn("priority_reasons", result)
        self.assertGreaterEqual(result["priority_score"], 61)
        self.assertEqual(result["priority_level"], "High")
        self.assertTrue(any("School" in r or "location" in r.lower() for r in result["priority_reasons"]))
        self.assertTrue(any("Sewage" in r for r in result["priority_reasons"]))

    def test_low_priority_complaint(self):
        result = calculate_priority(
            text="Small graffiti on back wall of residential boundary",
            issue_type="Graffiti",
            duration_text="1 hour",
            locality=None
        )
        self.assertLessEqual(result["priority_score"], 30)
        self.assertEqual(result["priority_level"], "Low")

    def test_score_bounds(self):
        # Verify clamped between 0 and 100
        result = calculate_priority(
            text="Catastrophic emergency fire gas leak explosion hazard near hospital and school children dying",
            issue_type="Gas Leak",
            duration_text="30 days",
            locality="Civil Lines"
        )
        self.assertLessEqual(result["priority_score"], 100)
        self.assertGreaterEqual(result["priority_score"], 0)


class TestEntityExtraction(unittest.TestCase):
    def test_extract_duration(self):
        self.assertIn("5 days", extract_duration("Water pipeline broken for 5 days") or "")
        self.assertIn("Monday", extract_duration("No streetlights since Monday evening") or "")
        self.assertIn("3 weeks", extract_duration("Pothole unrepaired for past 3 weeks") or "")

    def test_extract_locality_and_hint(self):
        res1 = extract_entities("Open manhole in Krishna Nagar for 5 days")
        self.assertEqual(res1["locality"], "Krishna Nagar")
        self.assertIn("5 days", res1["duration_text"] or "")

        res2 = extract_entities("Dangerous pothole near Gate 2 opposite Metro Station")
        self.assertIsNotNone(res2["location_hint"])
        self.assertTrue("Gate 2" in (res2["location_hint"] or "") or "Metro" in (res2["location_hint"] or ""))

    def test_empty_and_none(self):
        res = extract_entities("")
        self.assertIsNone(res["locality"])
        self.assertIsNone(res["duration_text"])


class TestDuplicateDetection(unittest.TestCase):
    def setUp(self):
        self.existing = [
            {
                "id": "C1001",
                "text": "Huge pothole on Main Road causing traffic near Gate 1",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "duplicate_cluster_id": "CL-001"
            },
            {
                "id": "C1002",
                "text": "Garbage overflow near market entrance",
                "latitude": 28.7041,
                "longitude": 77.1025,
                "duplicate_cluster_id": None
            }
        ]

    def test_haversine_accuracy(self):
        # Two points approx 111 km apart (1 degree lat)
        dist = haversine_distance_meters(28.0, 77.0, 29.0, 77.0)
        self.assertAlmostEqual(dist, 111195, delta=1000)

    def test_duplicate_match_with_coords(self):
        # Text similarity + 50m away from C1001
        new_complaint = "Very big pothole on Main Road creating traffic jam near Gate 1"
        res = find_similar_complaints(
            complaint_text=new_complaint,
            latitude=28.6141,
            longitude=77.2091,
            existing_complaints=self.existing
        )
        self.assertTrue(res["is_duplicate"])
        self.assertIn("C1001", res["matched_complaint_ids"])
        self.assertEqual(res["duplicate_cluster_id"], "CL-001")
        self.assertGreater(res["similarity"], 0.5)

    def test_non_duplicate(self):
        new_complaint = "Street light broken and dark outside house"
        res = find_similar_complaints(
            complaint_text=new_complaint,
            latitude=28.6139,
            longitude=77.2090,
            existing_complaints=self.existing
        )
        self.assertFalse(res["is_duplicate"])
        self.assertEqual(len(res["matched_complaint_ids"]), 0)


if __name__ == "__main__":
    unittest.main()
