import React from 'react';
import type { HotspotCluster } from '../types/incident';
import { IncidentRanking } from './IncidentRanking';
import { IncidentTrend } from './IncidentTrend';
import { CategoryChart } from './CategoryChart';
import { AIInsightPanel } from './AIInsightPanel';
import { Activity } from 'lucide-react';

interface RightPanelProps {
  hotspots: HotspotCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  currentHour: number;
  onQuickDispatch: (action: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  hotspots,
  selectedClusterId,
  onSelectCluster,
  currentHour,
  onQuickDispatch,
}) => {
  return (
    <aside className="w-80 shrink-0 h-full bg-[#111A24] border-l border-[#263342] flex flex-col overflow-y-auto z-30 select-none text-xs">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#263342] bg-[#0D141D] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#1597D4]" />
            <h2 className="text-[11px] font-semibold text-[#E8EDF3] tracking-wide">
              Civic Intelligence
            </h2>
          </div>
          <p className="text-[10px] text-[#637184] mt-0.5 font-normal">
            Live operational picture
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#151F2A] border border-[#263342] rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27A878]"></span>
          <span className="text-[9px] font-mono text-[#93A1B2]">LIVE</span>
        </div>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Section 1: Active Incidents */}
        <IncidentRanking
          hotspots={hotspots}
          selectedClusterId={selectedClusterId}
          onSelectCluster={onSelectCluster}
          currentHour={currentHour}
        />

        <div className="border-t border-[#263342]" />

        {/* Section 2: Operational Insights */}
        <AIInsightPanel
          selectedClusterId={selectedClusterId}
          currentHour={currentHour}
          onQuickDispatch={onQuickDispatch}
        />

        <div className="border-t border-[#263342]" />

        {/* Section 3: Activity over time */}
        <IncidentTrend currentHour={currentHour} />

        <div className="border-t border-[#263342]" />

        {/* Section 4: District Strain & Categories */}
        <CategoryChart />
      </div>
    </aside>
  );
};
