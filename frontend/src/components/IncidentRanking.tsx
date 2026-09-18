import React from 'react';
import type { HotspotCluster } from '../types/incident';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { getCategoryTheme } from '../utils/categoryColors';

interface IncidentRankingProps {
  hotspots: HotspotCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  currentHour: number;
}

export const IncidentRanking: React.FC<IncidentRankingProps> = ({
  hotspots,
  selectedClusterId,
  onSelectCluster,
  currentHour,
}) => {
  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#263342]">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D49A32]" />
          <span className="text-[11px] font-semibold text-[#E8EDF3]">
            Active incidents
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#637184]">
          {Math.floor(currentHour).toString().padStart(2, '0')}:00
        </span>
      </div>

      {/* Incident List: Compact rows separated by hairline borders */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5 divide-y divide-[#263342]/60">
        {hotspots.slice(0, 6).map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          const hourIdx = Math.floor(currentHour) % 24;
          const hourRatio = (cluster.hourlyDistribution[hourIdx] || 10) / (cluster.actualReports || 1);
          const dynamicReports = Math.max(3, Math.round(cluster.actualReports * hourRatio));
          const incId = `INC-${2040 + cluster.rank}`;
          const theme = getCategoryTheme(cluster.category);

          return (
            <div
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className={`p-2.5 transition-colors cursor-pointer text-left relative rounded-sm ${
                isSelected
                  ? 'bg-[#151F2A] text-[#E8EDF3]'
                  : 'bg-transparent hover:bg-[#151F2A]/60 text-[#93A1B2]'
              }`}
            >
              {/* Civic blue accent indicator */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1597D4]" />
              )}

              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#93A1B2] font-semibold">
                    {incId}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      border: `1px solid ${theme.badgeBorder}`,
                    }}
                  >
                    {theme.name}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-[#D65A5A] font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{cluster.spikePercentage}%
                </span>
              </div>

              <div className="text-xs font-medium text-[#E8EDF3] truncate">
                {cluster.name}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#637184] mt-1 pt-1">
                <span className="font-mono text-[#93A1B2]">
                  {dynamicReports} reports
                </span>
                <span className="text-[#27A878] font-normal">
                  Team {String(cluster.rank).padStart(2, '0')} assigned
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
