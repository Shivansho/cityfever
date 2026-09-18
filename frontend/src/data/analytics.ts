export interface HourlyTrendPoint {
  hour: string;
  hourNum: number;
  baseline: number;
  actual: number;
  anomalyDelta: number;
  isAnomaly: boolean;
}

export const HOURLY_TREND_DATA: HourlyTrendPoint[] = [
  { hour: '00:00', hourNum: 0, baseline: 12, actual: 11, anomalyDelta: -1, isAnomaly: false },
  { hour: '02:00', hourNum: 2, baseline: 9, actual: 8, anomalyDelta: -1, isAnomaly: false },
  { hour: '04:00', hourNum: 4, baseline: 8, actual: 7, anomalyDelta: -1, isAnomaly: false },
  { hour: '06:00', hourNum: 6, baseline: 15, actual: 18, anomalyDelta: 3, isAnomaly: false },
  { hour: '08:00', hourNum: 8, baseline: 28, actual: 32, anomalyDelta: 4, isAnomaly: false },
  { hour: '10:00', hourNum: 10, baseline: 36, actual: 39, anomalyDelta: 3, isAnomaly: false },
  { hour: '12:00', hourNum: 12, baseline: 41, actual: 44, anomalyDelta: 3, isAnomaly: false },
  { hour: '14:00', hourNum: 14, baseline: 45, actual: 52, anomalyDelta: 7, isAnomaly: false },
  { hour: '16:00', hourNum: 16, baseline: 48, actual: 64, anomalyDelta: 16, isAnomaly: true },
  { hour: '18:00', hourNum: 18, baseline: 52, actual: 78, anomalyDelta: 26, isAnomaly: true },
  { hour: '19:00', hourNum: 19, baseline: 54, actual: 98, anomalyDelta: 44, isAnomaly: true }, // PEAK SPIKE
  { hour: '20:00', hourNum: 20, baseline: 50, actual: 86, anomalyDelta: 36, isAnomaly: true },
  { hour: '22:00', hourNum: 22, baseline: 32, actual: 48, anomalyDelta: 16, isAnomaly: true },
  { hour: '24:00', hourNum: 24, baseline: 18, actual: 23, anomalyDelta: 5, isAnomaly: false },
];

export interface CategoryDistribution {
  category: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  baseline: number;
  anomalyRate: number; // e.g. 3.2x
}

export const CATEGORY_DISTRIBUTION: CategoryDistribution[] = [
  { category: 'streetlight', name: 'Streetlight', count: 642, percentage: 25.2, color: '#f59e0b', baseline: 160, anomalyRate: 4.0 },
  { category: 'water', name: 'Water Supply', count: 489, percentage: 19.2, color: '#06b6d4', baseline: 180, anomalyRate: 2.7 },
  { category: 'traffic', name: 'Traffic Grid', count: 412, percentage: 16.2, color: '#3b82f6', baseline: 390, anomalyRate: 1.1 },
  { category: 'road', name: 'Road Damage', count: 381, percentage: 14.9, color: '#ef4444', baseline: 240, anomalyRate: 1.6 },
  { category: 'safety', name: 'Public Safety', count: 330, percentage: 12.9, color: '#8b5cf6', baseline: 280, anomalyRate: 1.2 },
  { category: 'waste', name: 'Waste Mgmt', count: 294, percentage: 11.6, color: '#10b981', baseline: 200, anomalyRate: 1.5 },
];

export interface DistrictRadarMetric {
  district: string;
  name: string;
  densityScore: number;
  responseVelocity: number;
  infrastructureStrain: number;
  cascadingRisk: number;
  sentimentIndex: number;
}

export const DISTRICT_RADAR_DATA: DistrictRadarMetric[] = [
  { district: 'Cyber City Hub', name: 'Cyber City', densityScore: 98, responseVelocity: 74, infrastructureStrain: 92, cascadingRisk: 95, sentimentIndex: 40 },
  { district: 'Connaught Place', name: 'CP Core', densityScore: 88, responseVelocity: 85, infrastructureStrain: 82, cascadingRisk: 86, sentimentIndex: 54 },
  { district: 'South Extension', name: 'South Ext', densityScore: 80, responseVelocity: 88, infrastructureStrain: 76, cascadingRisk: 74, sentimentIndex: 62 },
  { district: 'Nehru Place Hub', name: 'Nehru Place', densityScore: 70, responseVelocity: 90, infrastructureStrain: 66, cascadingRisk: 62, sentimentIndex: 70 },
  { district: 'Noida Sector 62', name: 'Noida 62', densityScore: 64, responseVelocity: 84, infrastructureStrain: 58, cascadingRisk: 55, sentimentIndex: 76 },
  { district: 'Dwarka Sub-City', name: 'Dwarka', densityScore: 54, responseVelocity: 80, infrastructureStrain: 50, cascadingRisk: 46, sentimentIndex: 82 },
];
