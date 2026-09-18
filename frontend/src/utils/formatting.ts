export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDensity(val: number): string {
  return `${val.toFixed(1)} /km²`;
}

export function formatPercentage(val: number): string {
  return `+${Math.round(val)}%`;
}

export function getSeverityBadgeColor(severity: string): { bg: string; text: string; border: string; glow: string } {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
        glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500/50',
        glow: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/50',
        glow: 'shadow-[0_0_8px_rgba(234,179,8,0.3)]',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-400',
        border: 'border-cyan-500/40',
        glow: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]',
      };
  }
}

export function getCategoryIconName(category: string): string {
  switch (category) {
    case 'streetlight':
      return 'Lightbulb';
    case 'water':
      return 'Droplet';
    case 'waste':
      return 'Trash2';
    case 'traffic':
      return 'Car';
    case 'road':
      return 'Construction';
    case 'safety':
      return 'ShieldAlert';
    default:
      return 'AlertTriangle';
  }
}
