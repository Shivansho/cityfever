import type { IncidentCategory, SeverityLevel } from '../types/incident';

export interface CategoryTheme {
  id: IncidentCategory;
  name: string;
  hindiName: string;
  hex: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  markerColor: string;
  pulseColor: string;
}

export const CATEGORY_THEMES: Record<IncidentCategory, CategoryTheme> = {
  all: {
    id: 'all',
    name: 'All Incidents',
    hindiName: 'सभी घटनाएँ',
    hex: '#1597D4',
    bgLight: 'rgba(21, 151, 212, 0.08)',
    borderLight: 'rgba(21, 151, 212, 0.25)',
    textLight: '#60C2F2',
    badgeBg: 'rgba(21, 151, 212, 0.12)',
    badgeText: '#60C2F2',
    badgeBorder: 'rgba(21, 151, 212, 0.3)',
    markerColor: '#1597D4',
    pulseColor: 'rgba(21, 151, 212, 0.3)',
  },
  streetlight: {
    id: 'streetlight',
    name: 'Streetlight & Power',
    hindiName: 'स्ट्रीट लाइट और पावर',
    hex: '#D49A32',
    bgLight: 'rgba(212, 154, 50, 0.08)',
    borderLight: 'rgba(212, 154, 50, 0.25)',
    textLight: '#E8B65A',
    badgeBg: 'rgba(212, 154, 50, 0.12)',
    badgeText: '#E8B65A',
    badgeBorder: 'rgba(212, 154, 50, 0.3)',
    markerColor: '#D49A32',
    pulseColor: 'rgba(212, 154, 50, 0.3)',
  },
  water: {
    id: 'water',
    name: 'Water Supply',
    hindiName: 'जल आपूर्ति',
    hex: '#1597D4',
    bgLight: 'rgba(21, 151, 212, 0.08)',
    borderLight: 'rgba(21, 151, 212, 0.25)',
    textLight: '#60C2F2',
    badgeBg: 'rgba(21, 151, 212, 0.12)',
    badgeText: '#60C2F2',
    badgeBorder: 'rgba(21, 151, 212, 0.3)',
    markerColor: '#1597D4',
    pulseColor: 'rgba(21, 151, 212, 0.3)',
  },
  waste: {
    id: 'waste',
    name: 'Waste & Sanitation',
    hindiName: 'कचरा और सफाई',
    hex: '#27A878',
    bgLight: 'rgba(39, 168, 120, 0.08)',
    borderLight: 'rgba(39, 168, 120, 0.25)',
    textLight: '#5FD4A7',
    badgeBg: 'rgba(39, 168, 120, 0.12)',
    badgeText: '#5FD4A7',
    badgeBorder: 'rgba(39, 168, 120, 0.3)',
    markerColor: '#27A878',
    pulseColor: 'rgba(39, 168, 120, 0.3)',
  },
  traffic: {
    id: 'traffic',
    name: 'Traffic Grid',
    hindiName: 'यातायात ग्रिड',
    hex: '#DE7A38',
    bgLight: 'rgba(222, 122, 56, 0.08)',
    borderLight: 'rgba(222, 122, 56, 0.25)',
    textLight: '#F4A575',
    badgeBg: 'rgba(222, 122, 56, 0.12)',
    badgeText: '#F4A575',
    badgeBorder: 'rgba(222, 122, 56, 0.3)',
    markerColor: '#DE7A38',
    pulseColor: 'rgba(222, 122, 56, 0.3)',
  },
  road: {
    id: 'road',
    name: 'Road Damage',
    hindiName: 'सड़क क्षति',
    hex: '#D65A5A',
    bgLight: 'rgba(214, 90, 90, 0.08)',
    borderLight: 'rgba(214, 90, 90, 0.25)',
    textLight: '#F08C8C',
    badgeBg: 'rgba(214, 90, 90, 0.12)',
    badgeText: '#F08C8C',
    badgeBorder: 'rgba(214, 90, 90, 0.3)',
    markerColor: '#D65A5A',
    pulseColor: 'rgba(214, 90, 90, 0.3)',
  },
  safety: {
    id: 'safety',
    name: 'Public Safety',
    hindiName: 'सार्वजनिक सुरक्षा',
    hex: '#7E8CE0',
    bgLight: 'rgba(126, 140, 224, 0.08)',
    borderLight: 'rgba(126, 140, 224, 0.25)',
    textLight: '#B0B9F4',
    badgeBg: 'rgba(126, 140, 224, 0.12)',
    badgeText: '#B0B9F4',
    badgeBorder: 'rgba(126, 140, 224, 0.3)',
    markerColor: '#7E8CE0',
    pulseColor: 'rgba(126, 140, 224, 0.3)',
  },
};

export const getCategoryTheme = (category?: string): CategoryTheme => {
  if (!category) return CATEGORY_THEMES.all;
  const key = category.toLowerCase() as IncidentCategory;
  return CATEGORY_THEMES[key] || CATEGORY_THEMES.all;
};

export const getSeverityBadgeStyle = (severity: SeverityLevel) => {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'rgba(214, 90, 90, 0.12)',
        text: '#F08C8C',
        border: 'rgba(214, 90, 90, 0.35)',
        hex: '#D65A5A',
      };
    case 'HIGH':
      return {
        bg: 'rgba(222, 122, 56, 0.12)',
        text: '#F4A575',
        border: 'rgba(222, 122, 56, 0.35)',
        hex: '#DE7A38',
      };
    case 'MEDIUM':
      return {
        bg: 'rgba(212, 154, 50, 0.12)',
        text: '#E8B65A',
        border: 'rgba(212, 154, 50, 0.35)',
        hex: '#D49A32',
      };
    case 'LOW':
    default:
      return {
        bg: 'rgba(99, 113, 132, 0.12)',
        text: '#93A1B2',
        border: 'rgba(99, 113, 132, 0.25)',
        hex: '#637184',
      };
  }
};
