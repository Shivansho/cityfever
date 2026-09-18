"""
CivicFlow integration tests — Member 6.

These hit a RUNNING backend (default http://localhost:8000) over HTTP. They do not
import backend modules directly, on purpose: the point is to catch contract mismatches
between what Member 2 actually ships and what docs/API_CONTRACT.md promises, the same
way a judge's browser would hit it.

Run:
    pip install requests pytest
    uvicorn main:app --reload            # in another terminal, from backend/
    pytest tests/test_integration.py -v

If the server isn't reachable, tests are skipped (not failed) so this file can live in
CI/local dev without blocking on someone else's terminal being open.
"""

import os
import time

import pytest
import requests

BASE_URL = os.environ.get("CIVICFLOW_API_BASE", "http://localhost:8000")
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.60"))

REQUIRED_COMPLAINT_FIELDS = {
    "id", "complaint_text", "department", "issue_type",
    "department_confidence", "issue_confidence",
    "priority_score", "priority_level",
    "locality", "duration_text",
    "latitude", "longitude",
    "duplicate_cluster_id", "status", "created_at",
}

CANONICAL_DEPARTMENTS = {
    "Roads", "Water", "Sanitation", "Electrical",
    "Sewage", "Traffic", "Parks", "Other",
}


def _server_up():
    try:
        requests.get(f"{BASE_URL}/docs", timeout=2)
        return True
    except requests.exceptions.RequestException:
        return False


pytestmark = pytest.mark.skipif(
    not _server_up(),
    reason=f"Backend not reachable at {BASE_URL} — start it with `uvicorn main:app --reload`",
)


# ---------------------------------------------------------------------------
# 1. Backend startup / basic health (06 checklist: "Server starts")
# ---------------------------------------------------------------------------

class TestServerHealth:
    def test_docs_available(self):
        resp = requests.get(f"{BASE_URL}/docs")
        assert resp.status_code == 200

    def test_dashboard_stats_reachable(self):
        resp = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert resp.status_code == 200, "GET /api/dashboard/stats must exist per API_CONTRACT.md §5"


# ---------------------------------------------------------------------------
# 2. Complaint submission pipeline (06 checklist: "Complaint POST works")
# ---------------------------------------------------------------------------

class TestComplaintSubmission:
    def test_submit_high_priority_sewage_complaint(self):
        """Mirrors the exact opening line of the 06 demo script."""
        payload = {
            "complaint_text": "Sewage has been overflowing near a school for three days.",
            "latitude": 27.4924,
            "longitude": 77.6737,
        }
        resp = requests.post(f"{BASE_URL}/api/complaints", json=payload)
        assert resp.status_code in (200, 201)
        data = resp.json()

        missing = REQUIRED_COMPLAINT_FIELDS - data.keys()
        assert not missing, f"Response missing canonical fields: {missing}"

        assert data["department"] in CANONICAL_DEPARTMENTS
        assert 0.0 <= data["department_confidence"] <= 1.0
        assert 0.0 <= data["issue_confidence"] <= 1.0
        assert 0 <= data["priority_score"] <= 100
        assert data["priority_level"] in {"Low", "Medium", "High"}
        assert data["status"] in {"Pending", "Manual Review", "In Progress", "Resolved"}

        # Entity extraction: this sentence contains a duration phrase
        assert data.get("duration_text"), "Expected duration_text extracted from 'for three days'"

        self.__class__._last_complaint = data

    def test_response_includes_priority_reasons(self):
        """API_CONTRACT.md §1 — reasons must accompany the score, per 04's requirement."""
        payload = {"complaint_text": "Large pothole causing accidents near the market for 3 days."}
        resp = requests.post(f"{BASE_URL}/api/complaints", json=payload)
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "priority_reasons" in data, (
            "priority_reasons missing from response — see API_CONTRACT.md §1. "
            "04_priority_entities.md requires reasons, not just a score."
        )
        assert isinstance(data["priority_reasons"], list)
        assert len(data["priority_reasons"]) > 0

    def test_low_confidence_routes_to_manual_review(self):
        """02's confidence rule: department_confidence < 0.60 -> status = Manual Review."""
        payload = {"complaint_text": "There is some kind of a problem near the thing by the road maybe."}
        resp = requests.post(f"{BASE_URL}/api/complaints", json=payload)
        assert resp.status_code in (200, 201)
        data = resp.json()
        if data["department_confidence"] < CONFIDENCE_THRESHOLD:
            assert data["status"] == "Manual Review", (
                "Confidence below threshold but status was not forced to Manual Review (02)"
            )

    def test_missing_complaint_text_is_rejected(self):
        resp = requests.post(f"{BASE_URL}/api/complaints", json={})
        assert resp.status_code in (400, 422), "Empty submission should be rejected, not silently accepted"


# ---------------------------------------------------------------------------
# 3. Retrieval (06 checklist: "Complaint GET works")
# ---------------------------------------------------------------------------

class TestComplaintRetrieval:
    def test_list_complaints(self):
        resp = requests.get(f"{BASE_URL}/api/complaints")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_single_complaint_roundtrip(self):
        create = requests.post(
            f"{BASE_URL}/api/complaints",
            json={"complaint_text": "Broken streetlight near Gate 2 for a week."},
        )
        complaint_id = create.json()["id"]
        fetch = requests.get(f"{BASE_URL}/api/complaints/{complaint_id}")
        assert fetch.status_code == 200
        assert fetch.json()["id"] == complaint_id

    def test_get_nonexistent_complaint_404s(self):
        resp = requests.get(f"{BASE_URL}/api/complaints/DOES-NOT-EXIST")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# 4. Officer actions (06 checklist: "Reassignment works", "Status update works")
# ---------------------------------------------------------------------------

class TestOfficerActions:
    def _create_complaint(self):
        resp = requests.post(
            f"{BASE_URL}/api/complaints",
            json={"complaint_text": "Garbage piling up near the bus depot for 5 days."},
        )
        return resp.json()["id"]

    def test_status_update(self):
        complaint_id = self._create_complaint()
        resp = requests.patch(f"{BASE_URL}/api/complaints/{complaint_id}", json={"status": "In Progress"})
        assert resp.status_code == 200
        assert requests.get(f"{BASE_URL}/api/complaints/{complaint_id}").json()["status"] == "In Progress"

    def test_reassign_department(self):
        complaint_id = self._create_complaint()
        resp = requests.post(f"{BASE_URL}/api/complaints/{complaint_id}/reassign", json={"department": "Sanitation"})
        assert resp.status_code == 200
        assert requests.get(f"{BASE_URL}/api/complaints/{complaint_id}").json()["department"] == "Sanitation"


# ---------------------------------------------------------------------------
# 5. Duplicate detection (06 checklist: "Similarity check works",
#    "Original complaints remain visible", "Cluster ID returned where applicable")
# ---------------------------------------------------------------------------

class TestDuplicateDetection:
    def test_near_duplicate_reports_get_clustered(self):
        first = requests.post(
            f"{BASE_URL}/api/complaints",
            json={
                "complaint_text": "Water pipeline leakage on Sector 12 main road since Monday.",
                "latitude": 27.5105, "longitude": 77.6650,
            },
        ).json()
        time.sleep(0.2)
        second = requests.post(
            f"{BASE_URL}/api/complaints",
            json={
                "complaint_text": "Another water leak spotted very close to Sector 12 main road, same pipeline.",
                "latitude": 27.5107, "longitude": 77.6652,
            },
        ).json()

        # Both originals must still be individually retrievable (04: never delete originals)
        assert requests.get(f"{BASE_URL}/api/complaints/{first['id']}").status_code == 200
        assert requests.get(f"{BASE_URL}/api/complaints/{second['id']}").status_code == 200

        similar = requests.get(f"{BASE_URL}/api/complaints/{second['id']}/similar")
        assert similar.status_code == 200
        sim_data = similar.json()
        assert "is_duplicate" in sim_data
        assert "matched_complaint_ids" in sim_data


# ---------------------------------------------------------------------------
# 6. Dashboard stats (06 checklist: consumed by frontend + mapbox)
# ---------------------------------------------------------------------------

class TestDashboardStats:
    def test_stats_shape(self):
        resp = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert resp.status_code == 200
        data = resp.json()
        for key in ("total_complaints", "manual_review_count", "by_priority_level", "by_department"):
            assert key in data, f"dashboard/stats missing '{key}' — see API_CONTRACT.md §5"