import type { IncidentCategory, IncidentReport, SeverityLevel, IncidentStatus } from '../types/incident';
import { HOTSPOT_CLUSTERS } from './hotspots';

// Pseudo-random deterministic generator to ensure stable renders
function createSeededRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const titlesByCategory: Record<IncidentCategory, string[]> = {
  all: ['Civic anomaly report'],
  streetlight: [
    'Phase-3 Main Line Blackout',
    'Flickering LED luminaire node',
    'Dark corridor pedestrian hazard',
    'Relay breaker tripped at substation',
    'Smart pole photodiode failure',
    'Underpass lighting fixture dead',
  ],
  water: [
    'Main trunk pipe low pressure',
    'Discolored tap water & sediment',
    'Hydrant valve underground leak',
    'Booster pump station shutdown',
    'Stormwater backflow at junction',
    'Building floor 6+ water outage',
  ],
  waste: [
    'Smart compactor receptacle overflow',
    'Commercial bulk debris accumulation',
    'Litter sensor exceeded threshold',
    'Recycling hopper gate jam',
    'Sanitation collection delay',
    'Illegal dumping on side alley',
  ],
  traffic: [
    'Traffic light controller timing sync failure',
    'Severe intersection queue bottleneck',
    'Pedestrian signal button unresponsive',
    'V2X roadside unit sensor packet drop',
    'Gridlock at expressway feeder ramp',
    'Bus priority lane sensor anomaly',
  ],
  road: [
    'Deep asphalt pothole causing tire damage',
    'Roadbed subsidence and asphalt fissure',
    'Dislodged manhole cover hazard',
    'Loose construction gravel on roadway',
    'Damaged steel bridge expansion joint',
    'Missing guardrail barrier reflector',
  ],
  safety: [
    'Emergency callbox intercom static',
    'CCTV visual occlusion alert',
    'Park security barrier open sensor',
    'Pedestrian density crush threshold',
    'Waterfront safety fence telemetry warning',
    'Subway ventilation noise alarm',
  ],
};

export function generateDeterministicIncidents(): IncidentReport[] {
  const rand = createSeededRandom(42);
  const incidents: IncidentReport[] = [];

  const categories: IncidentCategory[] = [
    'streetlight',
    'water',
    'waste',
    'traffic',
    'road',
    'safety',
  ];

  let idCounter = 1000;

  // Generate around clusters first (70% of total)
  HOTSPOT_CLUSTERS.forEach((cluster) => {
    const countForCluster = Math.floor(180 + rand() * 120);
    for (let i = 0; i < countForCluster; i++) {
      idCounter++;
      // Gaussian-like scatter around cluster center
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 2) * (cluster.radiusKm * 0.015);
      const lat = cluster.latitude + Math.sin(angle) * dist;
      const lng = cluster.longitude + Math.cos(angle) * dist * 1.2;

      // Hour distribution biased toward afternoon & evening (16:00 - 21:00)
      let hour: number;
      const r = rand();
      if (r < 0.1) hour = Math.floor(rand() * 6); // 00-05
      else if (r < 0.25) hour = 6 + Math.floor(rand() * 6); // 06-11
      else if (r < 0.5) hour = 12 + Math.floor(rand() * 4); // 12-15
      else hour = 16 + Math.floor(rand() * 8); // 16-23 peak

      const min = Math.floor(rand() * 60);
      const sec = Math.floor(rand() * 60);
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      // Mostly match cluster category, with a few other types
      const cat = rand() < 0.75 ? cluster.category : categories[Math.floor(rand() * categories.length)];
      const titleList = titlesByCategory[cat] || titlesByCategory.all;
      const title = titleList[Math.floor(rand() * titleList.length)];

      let severity: SeverityLevel = 'LOW';
      const sevRand = rand();
      if (cluster.severity === 'HIGH' || cluster.severity === 'CRITICAL') {
        if (sevRand < 0.25) severity = 'CRITICAL';
        else if (sevRand < 0.65) severity = 'HIGH';
        else if (sevRand < 0.9) severity = 'MEDIUM';
      } else {
        if (sevRand < 0.1) severity = 'CRITICAL';
        else if (sevRand < 0.35) severity = 'HIGH';
        else if (sevRand < 0.75) severity = 'MEDIUM';
      }

      let status: IncidentStatus = 'ACTIVE';
      if (hour < 12) status = rand() < 0.8 ? 'RESOLVED' : 'DISPATCHED';
      else if (hour < 17) status = rand() < 0.5 ? 'INVESTIGATING' : 'DISPATCHED';
      else status = rand() < 0.7 ? 'ACTIVE' : 'INVESTIGATING';

      incidents.push({
        id: `INC-${idCounter}`,
        clusterId: cluster.id,
        timestamp: timeStr,
        hour,
        category: cat,
        title,
        description: `${title} reported near ${cluster.district}. Sensor & citizen verified.`,
        locationName: `${cluster.name} • Grid ${Math.floor(rand() * 40) + 1}`,
        district: cluster.district,
        latitude: lat,
        longitude: lng,
        severity,
        status,
        citizenReporter: `Reporter ID #${Math.floor(1000 + rand() * 9000)}`,
        confidenceScore: parseFloat((0.85 + rand() * 0.14).toFixed(2)),
      });
    }
  });

  // Generate background citywide ambient incidents (30%)
  const ambientCount = 800;
  for (let i = 0; i < ambientCount; i++) {
    idCounter++;
    // Scatter across metro bounding box
    const lat = 31.15 + rand() * 0.18;
    const lng = 121.30 + rand() * 0.35;
    const cat = categories[Math.floor(rand() * categories.length)];
    const hour = Math.floor(rand() * 24);
    const min = Math.floor(rand() * 60);
    const sec = Math.floor(rand() * 60);
    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    const titleList = titlesByCategory[cat];
    const title = titleList[Math.floor(rand() * titleList.length)];

    incidents.push({
      id: `INC-${idCounter}`,
      clusterId: 'ambient',
      timestamp: timeStr,
      hour,
      category: cat,
      title,
      description: `${title} in metro district corridor.`,
      locationName: `Metro Zone ${Math.floor(rand() * 18) + 1}`,
      district: 'Metropolitan Area',
      latitude: lat,
      longitude: lng,
      severity: rand() < 0.15 ? 'HIGH' : rand() < 0.5 ? 'MEDIUM' : 'LOW',
      status: hour < 14 ? 'RESOLVED' : 'ACTIVE',
      citizenReporter: `Citizen #${Math.floor(1000 + rand() * 9000)}`,
      confidenceScore: parseFloat((0.80 + rand() * 0.18).toFixed(2)),
    });
  }

  return incidents;
}

export const ALL_INCIDENTS = generateDeterministicIncidents();
