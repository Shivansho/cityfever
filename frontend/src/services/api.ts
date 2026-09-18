/**
 * CivicPulse Frontend API Client
 * Connects React UI to FastAPI backend with WebSocket live updates and fallback data
 */

export const API_BASE_URL = 'http://localhost:8000/api';
export const WS_URL = 'ws://localhost:8000/api/ws/incidents';

export interface IncidentSummary {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  status: string;
  severity: string;
  score: number;
  centroid_lat: number;
  centroid_lng: number;
  radius_m: number;
  report_count: number;
  baseline_count: number;
  growth_percent: number;
  anomaly_score: number;
  assigned_dept?: string;
  assigned_crew?: string;
  recommended_action?: string;
  detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  pre_volume_hourly?: number;
  post_volume_hourly?: number;
  impact_delta_pct?: number;
  why_detected?: string[];
}

export interface CitizenReportPayload {
  description: string;
  latitude: number;
  longitude: number;
  ward?: string;
  category?: string;
  severity?: string;
  reporter_name?: string;
}

export interface TelemetryKPIs {
  totalReportsToday: number;
  activeIncidentsCount: number;
  maxSpikePercent: number;
  responseVelocityScore: number;
  gridStrainIndex: number;
  resolvedTodayCount: number;
  anomalyWindowActive: boolean;
}

export const api = {
  // Fetch active / emerging incidents from DBSCAN pipeline
  async getEmergingIncidents(category?: string, severity?: string): Promise<IncidentSummary[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (severity && severity !== 'all') params.append('severity', severity);
      const res = await fetch(`${API_BASE_URL}/incidents/emerging?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using offline cache', e);
      return [];
    }
  },

  // Fetch incident detail with status history and prediction
  async getIncidentDetail(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch incident ${id}`, e);
      return null;
    }
  },

  // Update incident status (State Machine: DETECTED -> ACKNOWLEDGED -> ASSIGNED -> IN_PROGRESS -> RESOLVED)
  async updateIncidentStatus(
    id: string,
    status: string,
    note?: string,
    assigned_dept?: string,
    assigned_crew?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note: note || `Status transitioned to ${status}`,
        assigned_dept,
        assigned_crew,
        changed_by: 'Incident Commander'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // Submit citizen report
  async submitCitizenReport(payload: CitizenReportPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // Fetch telemetry KPIs
  async getTelemetry(): Promise<TelemetryKPIs | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/telemetry`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch GeoJSON Hotspots
  async getHotspotsGeoJSON(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/hotspots`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch Temporal Replay frame
  async getReplayFrame(hour: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/replay?hour=${hour}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }
};
