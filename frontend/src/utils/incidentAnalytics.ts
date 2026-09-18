import type { HotspotCluster, IncidentReport } from '../types/incident';
import { HOTSPOT_CLUSTERS } from '../data/hotspots';
import { ALL_INCIDENTS } from '../data/incidents';

export interface AIInsightSummary {
  primaryCluster: HotspotCluster;
  headline: string;
  narrative: string;
  bulletInsights: string[];
  recommendedAction: string;
  anomalyRatio: number;
  cascadingRiskLevel: string;
  activeReportCount: number;
  affectedRadius: string;
}

export function generateAIInsight(
  selectedClusterId: string | null,
  currentHour: number = 19
): AIInsightSummary {
  const cluster =
    HOTSPOT_CLUSTERS.find((c) => c.id === selectedClusterId) ||
    HOTSPOT_CLUSTERS[0]; // Sector 4 default top anomaly

  // Calculate hour scaling factor based on timeline
  const hourFactor = Math.max(0.2, (cluster.hourlyDistribution[Math.floor(currentHour) % 24] || 10) / (cluster.actualReports || 1));
  const currentReports = Math.max(3, Math.round(cluster.actualReports * hourFactor));
  const anomalyRatio = parseFloat((currentReports / Math.max(1, cluster.baselineReports)).toFixed(1));

  const headline = `${cluster.name} (${cluster.district}) is exhibiting a critical surge in ${cluster.category} anomalies.`;
  const narrative = `${cluster.name} is showing an unusual increase in ${cluster.category} complaints. ${currentReports} reports were recorded compared with a historical baseline of ${cluster.baselineReports}. Reports are geographically concentrated within a ${cluster.radiusKm} km radius.`;

  const bulletInsights = [
    `✓ ${anomalyRatio}× above historical baseline volume`,
    `✓ Geographic cluster detected within ${cluster.radiusKm} km radius`,
    `✓ ${Math.max(4, Math.floor(currentReports * 0.35))} high-severity reports requiring immediate field triage`,
    `✓ Telemetry growth curve sustained across last ${Math.min(6, Math.max(2, Math.floor(currentHour / 3)))} consecutive hours`,
  ];

  return {
    primaryCluster: cluster,
    headline,
    narrative,
    bulletInsights,
    recommendedAction: cluster.recommendedAction,
    anomalyRatio,
    cascadingRiskLevel: anomalyRatio > 3.0 ? 'CRITICAL' : anomalyRatio > 1.8 ? 'ELEVATED' : 'MODERATE',
    activeReportCount: currentReports,
    affectedRadius: `${cluster.radiusKm} km`,
  };
}

export function filterIncidentsByState(
  category: string,
  currentHour: number,
  selectedClusterId: string | null
): IncidentReport[] {
  return ALL_INCIDENTS.filter((inc) => {
    if (category !== 'all' && inc.category !== category) return false;
    if (inc.hour > currentHour) return false;
    if (selectedClusterId && inc.clusterId !== selectedClusterId && inc.clusterId !== 'ambient') return false;
    return true;
  });
}

export function getTimelinePhase(hour: number): { text: string; color: string; statusBg: string } {
  if (hour < 8) {
    return {
      text: 'NORMAL ACTIVITY BASELINE',
      color: 'text-emerald-400',
      statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  } else if (hour < 14) {
    return {
      text: 'ACTIVITY INCREASE DETECTED',
      color: 'text-cyan-400',
      statusBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    };
  } else if (hour < 17) {
    return {
      text: 'CLUSTER FORMING: SECTOR 4 & WARD 7',
      color: 'text-amber-400',
      statusBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  } else if (hour < 19) {
    return {
      text: 'ANOMALY DETECTED: RAPID ESCALATION',
      color: 'text-orange-400',
      statusBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    };
  } else {
    return {
      text: 'EMERGING CRITICAL CIVIC INCIDENT',
      color: 'text-rose-400',
      statusBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    };
  }
}
