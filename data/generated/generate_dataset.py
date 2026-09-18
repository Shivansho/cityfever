"""
CivicFlow — Synthetic Civic Incident Dataset Generator
======================================================
Generates realistic multi-department civic complaints with realistic text descriptions,
Indian urban localities, geographic coordinates, durations, and issue types.
Outputs:
- data/generated/civicflow_complaints.csv
- data/generated/civicflow_train.csv
- data/generated/civicflow_test.csv
- data/generated/dataset_summary.json
"""

import os
import json
import random
import csv

# Set random seed for reproducibility
random.seed(42)

DEPARTMENTS_CONFIG = {
    "Roads": {
        "issues": ["Pothole", "Road Damage", "Missing Manhole Cover", "Footpath Damage"],
        "templates": [
            "There is a deep {issue} on {locality} Main Road causing severe traffic congestion.",
            "Dangerous {issue} near {landmark} in {locality} for {duration}, multiple bike slips reported.",
            "Urgent repair needed for {issue} near {landmark}, road surface completely broken.",
            "Heavy rain created a massive {issue} in {locality}, risk of fatal accidents at night.",
            "The road in {locality} has an unrepaired {issue} for {duration}, vehicles are getting damaged.",
            "Large {issue} right in front of {landmark} in {locality}. Please fix immediately.",
        ]
    },
    "Water": {
        "issues": ["Water Leakage", "Water Contamination", "Low Water Pressure", "Pipeline Burst"],
        "templates": [
            "Severe {issue} observed near {landmark} in {locality}, clean drinking water being wasted for {duration}.",
            "Drinking water supply in {locality} has brown smelly {issue} for {duration}, health risk to residents.",
            "Underground {issue} near {landmark} causing street flooding in {locality}.",
            "No drinking water received in {locality} due to {issue} since last {duration}.",
            "Major {issue} on the main line near {landmark} in {locality}, whole sector affected.",
            "Contaminated foul-smelling water coming from taps in {locality} for {duration}."
        ]
    },
    "Sanitation": {
        "issues": ["Garbage Dump", "Overflowing Bin", "Dead Animal", "Illegal Dumping"],
        "templates": [
            "Massive {issue} accumulating near {landmark} in {locality} for {duration}, terrible stench.",
            "Community dustbin has {issue} in {locality}, stray dogs and cows scattering trash everywhere.",
            "Sanitation workers haven't cleared {issue} near {landmark} in {locality} for past {duration}.",
            "Illegal waste and {issue} dumped openly beside {landmark} in {locality}.",
            "Uncollected garbage and {issue} rotting in {locality} for {duration}, breeding mosquitoes.",
            "Public health emergency due to unattended {issue} near school gate in {locality}."
        ]
    },
    "Electrical": {
        "issues": ["Broken Street Light", "Power Outage", "Exposed Wire", "Transformer Fault"],
        "templates": [
            "Street light pole has {issue} near {landmark} in {locality}, complete darkness for {duration}.",
            "Hazardous live {issue} hanging dangerously low near {landmark} in {locality}, risk of electric shock.",
            "Frequent sudden {issue} in {locality} for {duration}, appliances getting damaged.",
            "Distribution transformer has {issue} sparking continuously near {landmark} in {locality}.",
            "Street dark and unsafe for women due to {issue} on 3rd Cross, {locality} for {duration}.",
            "Uncovered electrical junction box with {issue} near children's park in {locality}."
        ]
    },
    "Sewage": {
        "issues": ["Sewage Overflow", "Sewage Blockage", "Gutter Stagnation", "Manhole Overflow"],
        "templates": [
            "Black foul-smelling {issue} flooding the main road in {locality} for {duration}.",
            "Underground sewer line has {issue} near {landmark} in {locality}, water entering ground floor homes.",
            "Choked drainage and {issue} outside {landmark} in {locality} for past {duration}.",
            "Open drain with {issue} causing severe mosquito menace in {locality}.",
            "Manhole lid broken with {issue} near school in {locality}, life-threatening for children.",
            "Stagnant sewer water and {issue} overflowing onto pavement in {locality} for {duration}."
        ]
    },
    "Traffic": {
        "issues": ["Traffic Signal Down", "Illegal Parking", "Missing Signboard", "Traffic Congestion"],
        "templates": [
            "Major intersection in {locality} has {issue} near {landmark}, creating chaotic traffic jam.",
            "Commercial vehicles and cabs doing {issue} on narrow road in {locality} for {duration}.",
            "Auto-rickshaws blocking entry with {issue} outside {landmark} in {locality}.",
            "Key traffic junction has {issue} at {locality} crossing, accidents happening daily.",
            "Missing directional signboard and {issue} near {landmark} in {locality}.",
            "Continuous gridlock and {issue} due to illegal encroaching near {landmark} in {locality}."
        ]
    },
    "Parks": {
        "issues": ["Overgrown Vegetation", "Broken Bench", "Tree Fall Hazard", "Park Cleanliness"],
        "templates": [
            "Public park in {locality} has {issue} for {duration}, unsafe for walking.",
            "Old banyan tree has {issue} leaning over pedestrian pathway near {landmark} in {locality}.",
            "Children play area has damaged swings and {issue} in {locality} municipal park.",
            "Dense bushes and {issue} in {locality} park haven't been trimmed for {duration}.",
            "Heavy storm caused {issue} blocking the entrance of {locality} park near {landmark}.",
            "Broken boundary wall and {issue} in municipal garden, {locality}."
        ]
    },
    "Other": {
        "issues": ["Noise Pollution", "Stray Animals", "Public Nuisance", "Encroachment"],
        "templates": [
            "Unauthorized commercial establishment causing {issue} late night in {locality} for {duration}.",
            "Pack of aggressive stray dogs causing {issue} near {landmark} in {locality}.",
            "Illegal temporary stalls and {issue} blocking the walkway in {locality}.",
            "Loudspeakers and industrial machinery causing unbearable {issue} in residential {locality} for {duration}.",
            "Cattle wandering on road causing {issue} near {landmark} in {locality}.",
            "Public walkway encroached by shops causing {issue} in {locality} for {duration}."
        ]
    }
}

LOCALITIES = [
    ("Krishna Nagar", 28.6601, 77.2792),
    ("Lajpat Nagar", 28.5677, 77.2433),
    ("Karol Bagh", 28.6514, 77.1907),
    ("Rohini Sector 14", 28.7180, 77.1325),
    ("Dwarka Sector 6", 28.5823, 77.0606),
    ("Mayur Vihar Phase 1", 28.6087, 77.2954),
    ("Indirapuram", 28.6415, 77.3714),
    ("Noida Sector 62", 28.6280, 77.3649),
    ("Civil Lines", 28.6784, 77.2223),
    ("Connaught Place", 28.6315, 77.2167),
    ("Saket", 28.5244, 77.2066),
    ("Janakpuri Block B", 28.6219, 77.0878),
    ("Vasant Kunj", 28.5293, 77.1539),
    ("Shahdara", 28.6734, 77.2882),
    ("Pitampura", 28.6990, 77.1384),
]

LANDMARKS = [
    "Gate 2", "Metro Station", "Govt Senior Secondary School", "City Hospital",
    "Community Center", "Main Market", "Pillar 45", "Bus Stand", "Mother Dairy",
    "Central Park", "Post Office", "Police Station", "Railway Crossing"
]

DURATIONS = [
    "2 days", "3 days", "5 days", "1 week", "2 weeks", "24 hours", "48 hours",
    "since Monday", "since last Thursday", "for past 4 days", "almost 10 days"
]


def generate_complaint(complaint_id: int):
    dept_name = random.choice(list(DEPARTMENTS_CONFIG.keys()))
    dept_info = DEPARTMENTS_CONFIG[dept_name]
    issue = random.choice(dept_info["issues"])
    template = random.choice(dept_info["templates"])
    loc_name, base_lat, base_lon = random.choice(LOCALITIES)
    landmark = random.choice(LANDMARKS)
    duration = random.choice(DURATIONS)

    # slight jitter for coordinates (within ~200m)
    lat = round(base_lat + random.uniform(-0.002, 0.002), 6)
    lon = round(base_lon + random.uniform(-0.002, 0.002), 6)

    text = template.format(
        issue=issue,
        locality=loc_name,
        landmark=landmark,
        duration=duration
    )

    statuses = ["Pending", "In Progress", "Resolved", "Manual Review"]
    status_weights = [0.45, 0.25, 0.25, 0.05]
    stat = random.choices(statuses, weights=status_weights)[0]

    return {
        "id": f"C{complaint_id:04d}",
        "complaint_text": text,
        "department": dept_name,
        "issue_type": issue,
        "locality": loc_name,
        "duration_text": duration,
        "latitude": lat,
        "longitude": lon,
        "status": stat
    }


def main():
    out_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out_dir, exist_ok=True)

    total_samples = 1200
    complaints = [generate_complaint(i + 1001) for i in range(total_samples)]

    # Split train/test (80/20)
    random.shuffle(complaints)
    split_idx = int(total_samples * 0.8)
    train_data = complaints[:split_idx]
    test_data = complaints[split_idx:]

    fields = ["id", "complaint_text", "department", "issue_type", "locality", "duration_text", "latitude", "longitude", "status"]

    # Write full dataset
    full_path = os.path.join(out_dir, "civicflow_complaints.csv")
    with open(full_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(complaints)

    # Write train dataset
    train_path = os.path.join(out_dir, "civicflow_train.csv")
    with open(train_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(train_data)

    # Write test dataset
    test_path = os.path.join(out_dir, "civicflow_test.csv")
    with open(test_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(test_data)

    # Summary JSON
    dept_counts = {}
    issue_counts = {}
    for c in complaints:
        dept_counts[c["department"]] = dept_counts.get(c["department"], 0) + 1
        issue_counts[c["issue_type"]] = issue_counts.get(c["issue_type"], 0) + 1

    summary = {
        "total_records": total_samples,
        "train_records": len(train_data),
        "test_records": len(test_data),
        "departments_distribution": dept_counts,
        "issue_types_distribution": issue_counts,
        "unique_localities": len(LOCALITIES),
    }

    summary_path = os.path.join(out_dir, "dataset_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Generated {total_samples} complaints in {out_dir}")
    print(f"Train: {len(train_data)}, Test: {len(test_data)}")


if __name__ == "__main__":
    main()
