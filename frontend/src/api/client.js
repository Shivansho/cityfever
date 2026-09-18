/**
 * CivicFlow — Unified API Client
 * Wraps calls to FastAPI /api/* backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function submitComplaint({ complaint_text, latitude, longitude }) {
  const res = await fetch(`${API_BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaint_text, latitude, longitude }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to submit complaint' }));
    throw new Error(error.detail || 'Submission failed');
  }
  return res.json();
}

export async function fetchComplaints(params = {}) {
  const query = new URLSearchParams();
  if (params.department) query.append('department', params.department);
  if (params.status) query.append('status', params.status);
  if (params.priority_level) query.append('priority_level', params.priority_level);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const res = await fetch(`${API_BASE_URL}/complaints?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function fetchComplaint(id) {
  const res = await fetch(`${API_BASE_URL}/complaints/${id}`);
  if (!res.ok) throw new Error(`Complaint ${id} not found`);
  return res.json();
}

export async function updateComplaintStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function reassignComplaint(id, department, reason = '') {
  const res = await fetch(`${API_BASE_URL}/complaints/${id}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ department, reason }),
  });
  if (!res.ok) throw new Error('Failed to reassign complaint');
  return res.json();
}

export async function fetchDepartmentQueue(department) {
  const res = await fetch(`${API_BASE_URL}/queues/${encodeURIComponent(department)}`);
  if (!res.ok) throw new Error('Failed to fetch department queue');
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchSimilarComplaints(id) {
  const res = await fetch(`${API_BASE_URL}/complaints/${id}/similar`);
  if (!res.ok) throw new Error('Failed to fetch similar complaints');
  return res.json();
}

export async function fetchIncidentClusters() {
  const res = await fetch(`${API_BASE_URL}/dashboard/clusters`);
  if (!res.ok) throw new Error('Failed to fetch incident clusters');
  return res.json();
}

export async function fetchIncidentHotspots() {
  const res = await fetch(`${API_BASE_URL}/dashboard/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch incident hotspots');
  return res.json();
}

