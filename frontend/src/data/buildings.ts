import type * as GeoJSON from 'geojson';

/**
 * Deterministic generator for realistic 3D metropolitan building blocks and skyscrapers.
 * Centered around Shanghai / Metro Core [121.495, 31.232].
 */
export function generateCity3DBuildings(): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];

  // Anchor zones with different building densities and height profiles
  const zones = [
    // 1. Sector 4 & Financial Center (Supertalls & High-Rises)
    { centerLng: 121.5015, centerLat: 31.2396, count: 65, minH: 120, maxH: 420, radiusLng: 0.012, radiusLat: 0.009 },
    // 2. Ward 7 Civic Core (Mid-rise Government & Civic Complexes)
    { centerLng: 121.4882, centerLat: 31.2285, count: 50, minH: 40, maxH: 140, radiusLng: 0.014, radiusLat: 0.010 },
    // 3. Central Commercial Core (Dense Skyscrapers & Towers)
    { centerLng: 121.4940, centerLat: 31.2340, count: 70, minH: 80, maxH: 280, radiusLng: 0.013, radiusLat: 0.010 },
    // 4. North Transport Hub & Terminal Zone
    { centerLng: 121.4820, centerLat: 31.2460, count: 40, minH: 30, maxH: 110, radiusLng: 0.012, radiusLat: 0.009 },
    // 5. East Tech Park & Industrial Grid
    { centerLng: 121.5160, centerLat: 31.2250, count: 45, minH: 45, maxH: 160, radiusLng: 0.015, radiusLat: 0.011 },
    // 6. Historic West Quarter
    { centerLng: 121.4760, centerLat: 31.2290, count: 35, minH: 25, maxH: 75, radiusLng: 0.011, radiusLat: 0.008 },
  ];

  let idCounter = 1;

  zones.forEach((zone) => {
    // Deterministic pseudo-random seed generator
    let seed = Math.abs(Math.sin(zone.centerLng * 1000 + zone.centerLat * 1000)) * 10000;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < zone.count; i++) {
      const angle = pseudoRandom() * Math.PI * 2;
      const dist = Math.sqrt(pseudoRandom());
      
      const lngOffset = Math.cos(angle) * dist * zone.radiusLng;
      const latOffset = Math.sin(angle) * dist * zone.radiusLat;

      const baseLng = zone.centerLng + lngOffset;
      const baseLat = zone.centerLat + latOffset;

      // Building footprint dimensions
      const widthLng = 0.00045 + pseudoRandom() * 0.00065;
      const heightLat = 0.00035 + pseudoRandom() * 0.00055;

      // Building height with distance attenuation from zone center
      const centerProximity = 1 - (dist * 0.5);
      const rawHeight = zone.minH + pseudoRandom() * (zone.maxH - zone.minH);
      const height = Math.round(rawHeight * centerProximity);

      // Create rectangular / stepped polygon footprint
      const polygonCoordinates = [
        [
          [baseLng - widthLng / 2, baseLat - heightLat / 2],
          [baseLng + widthLng / 2, baseLat - heightLat / 2],
          [baseLng + widthLng / 2, baseLat + heightLat / 2],
          [baseLng - widthLng / 2, baseLat + heightLat / 2],
          [baseLng - widthLng / 2, baseLat - heightLat / 2],
        ],
      ];

      features.push({
        type: 'Feature',
        id: `bld-${idCounter++}`,
        geometry: {
          type: 'Polygon',
          coordinates: polygonCoordinates,
        },
        properties: {
          id: `bld-${idCounter}`,
          height: Math.max(20, height),
          base_height: 0,
          tier: height > 250 ? 'supertall' : height > 120 ? 'highrise' : 'midrise',
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
