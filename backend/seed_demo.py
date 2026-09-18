"""
Member 6 — seed script.

Posts a curated set of realistic complaint texts to the running backend so
the frontend (Member 3) and Mapbox view (Member 5) have real-looking data to
build against and demo, even before Member 1's real classifier and Member 4's
real priority/entity/duplicate modules are plugged in.

Usage:
    cd backend && uvicorn main:app --reload --port 8000   # in one terminal
    python seed_demo.py                                    # in another
    python seed_demo.py --url http://127.0.0.1:8000        # custom backend URL
    python seed_demo.py --reset                             # wipe civicflow.db first

Requires: requests  (pip install requests)
"""

import argparse
import json
import os
import sys
import time

import requests

DEFAULT_URL = "http://127.0.0.1:8000"
DATA_FILE = os.path.join(os.path.dirname(__file__), "civicflow_seed_complaints.json")


def wait_for_backend(base_url: str, timeout: int = 15) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(base_url + "/", timeout=2)
            if r.status_code == 200:
                return True
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
    return False


def main():
    parser = argparse.ArgumentParser(description="Seed CivicFlow backend with demo complaints.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Backend base URL")
    parser.add_argument(
        "--reset", action="store_true",
        help="Delete backend/civicflow.db before seeding (backend must be restarted after this).",
    )
    args = parser.parse_args()

    if args.reset:
        db_path = os.path.join(os.path.dirname(__file__), "civicflow.db")
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"Deleted {db_path}. Restart the backend, then re-run this script without --reset.")
        else:
            print("No civicflow.db found to delete.")
        sys.exit(0)

    if not wait_for_backend(args.url):
        print(f"Could not reach backend at {args.url}. Is `uvicorn main:app` running?")
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        complaints = json.load(f)

    created, manual_review, failed = 0, 0, 0

    for entry in complaints:
        try:
            resp = requests.post(f"{args.url}/api/complaints", json=entry, timeout=5)
            if resp.status_code == 200:
                result = resp.json()
                created += 1
                if result.get("status") == "Manual Review":
                    manual_review += 1
                print(f"  [{result['id']}] {result['department']:<12} {result['issue_type']:<22} "
                      f"priority={result['priority_score']:<3} status={result['status']}")
            else:
                failed += 1
                print(f"  FAILED ({resp.status_code}): {entry['complaint_text'][:60]}...")
        except requests.exceptions.RequestException as e:
            failed += 1
            print(f"  ERROR: {e}")

    print()
    print(f"Seeded {created}/{len(complaints)} complaints "
          f"({manual_review} landed in Manual Review, {failed} failed).")
    print(f"Check {args.url}/api/dashboard/stats or {args.url}/docs to explore the data.")


if __name__ == "__main__":
    main()