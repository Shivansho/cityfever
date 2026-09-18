export type IncidentCategory =
  | 'all'
  | 'streetlight'
  | 'water'
  | 'waste'
  | 'traffic'
  | 'road'
  | 'safety';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'DISPATCHED' | 'RESOLVED';

export interface IncidentReport {
  id: string;
  clusterId: string;
  timestamp: string; // e.g., "19:04:12"
  hour: number; // 0 to 23
  category: IncidentCategory;
  title: string;
  description: string;
  locationName: string;
  district: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  status: IncidentStatus;
  citizenReporter: string;
  confidenceScore: number; // 0.85 to 0.99
}

export interface HotspotCluster {
  id: string;
  rank: number;
  name: string;
  aliasTitle?: string;
  district: string;
  category: IncidentCategory;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  currentDensity: number; // reports / km² (e.g. 98.6)
  baselineReports: number; // e.g. 11
  actualReports: number; // e.g. 47
  spikePercentage: number; // +327%
  severity: SeverityLevel;
  radiusKm: number;
  buildingHeightMultiplier: number;
  anomalyScore: number; // 0.0 to 1.0
  whyDetected: string[];
  sampleReports: {
    id: string;
    time: string;
    text: string;
    severity: SeverityLevel;
    user: string;
  }[];
  hourlyDistribution: number[]; // 24 hours of report counts
  recommendedAction: string;
}

export type TimeRangeOption =
  | 'realtime'
  | 'today'
  | 'last24h'
  | 'last7d'
  | 'last30d';

export interface ReplayState {
  isPlaying: boolean;
  currentHour: number;
  playbackSpeed: number;
  phaseText: string;
  phaseColor: string;
}

export interface VisualizationSettings {
  heatIntensity: number; // 0 to 100
  hotspotRadius: number; // 100m to 1000m
  buildingHeight: number; // 1.0x to 4.0x
  viewMode: '3D' | '2D';
  pitch: number; // 0 to 60 deg
  bearing: number; // -180 to 180 deg
}
