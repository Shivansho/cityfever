"""
Tests for Member 3 Spatial Clustering and Hotspot Detection
"""

import unittest
from backend.services.clusters import cluster_spatial_incidents, detect_hotspots, haversine_km


class TestSpatialClusters(unittest.TestCase):
    def setUp(self):
        # Sample complaints co-located around Connaught Place, Delhi (~28.6315, 77.2167)
        self.sample_complaints = [
            {
                "id": "C101",
                "department": "Water",
                "issue_type": "Pipeline Leak",
                "priority_level": "High",
                "latitude": 28.6315,
                "longitude": 77.2167,
            },
            {
                "id": "C102",
                "department": "Water",
                "issue_type": "Water Contamination",
                "priority_level": "High",
                "latitude": 28.6318,
                "longitude": 77.2170,
            },
            {
                "id": "C103",
                "department": "Water",
                "issue_type": "Low Pressure",
                "priority_level": "Medium",
                "latitude": 28.6312,
                "longitude": 77.2165,
            },
            # Far away complaint in Noida (~28.5355, 77.3910)
            {
                "id": "C201",
                "department": "Roads",
                "issue_type": "Pothole",
                "priority_level": "Low",
                "latitude": 28.5355,
                "longitude": 77.3910,
            },
        ]

    def test_haversine_distance(self):
        dist = haversine_km(28.6315, 77.2167, 28.6318, 77.2170)
        self.assertLess(dist, 0.1)  # Less than 100 meters

    def test_cluster_spatial_incidents(self):
        clusters = cluster_spatial_incidents(self.sample_complaints, eps_km=0.5, min_samples=2)
        self.assertGreaterEqual(len(clusters), 1)

        primary_cluster = clusters[0]
        self.assertIn("cluster_id", primary_cluster)
        self.assertGreaterEqual(primary_cluster["complaint_count"], 3)
        self.assertEqual(primary_cluster["dominant_department"], "Water")
        self.assertIn("C101", primary_cluster["complaint_ids"])
        self.assertIn("C102", primary_cluster["complaint_ids"])
        self.assertNotIn("C201", primary_cluster["complaint_ids"])

    def test_detect_hotspots(self):
        hotspots = detect_hotspots(self.sample_complaints, min_count=3, radius_km=0.5)
        self.assertGreaterEqual(len(hotspots), 1)
        self.assertEqual(hotspots[0]["urgency"], "High")
        self.assertIn("Water", hotspots[0]["description"])


if __name__ == "__main__":
    unittest.main()
