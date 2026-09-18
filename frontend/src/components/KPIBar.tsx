import React from 'react';
import { TrendingUp } from 'lucide-react';

interface KPIBarProps {
  currentHour: number;
  activeIncidentsCount: number;
}

export const KPIBar: React.FC<KPIBarProps> = ({ currentHour, activeIncidentsCount }) => {
  const hourFactor = Math.min(1.0, Math.max(0.2, currentHour / 19));
  const activeCount = Math.round(1800 + activeIncidentsCount * 12 + 350 * hourFactor);
  const criticalCount = Math.round(8 + 6 * hourFactor);
  const fieldTeams = 48;
  const avgSla = (12.4 + (1 - hourFactor) * 4.2).toFixed(1);
  const openWorkOrders = Math.round(110 + 24 * hourFactor);
  const totalReportsToday = Math.round(3800 + 1120 * hourFactor);

  return (
    <div className="w-full bg-[#0D141D] border-b border-[#263342] px-4 sm:px-6 py-2.5 flex items-center select-none shrink-0 overflow-x-auto">
      <div className="flex items-center justify-between w-full min-w-[760px] divide-x divide-[#263342]">
        {/* Metric 1: Active incidents */}
        <div className="flex-1 px-4 first:pl-0">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#E8EDF3] tracking-tight">
              {activeCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#27A878] font-mono flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +8.4%
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Active incidents</div>
        </div>

        {/* Metric 2: Critical incidents */}
        <div className="flex-1 px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#D65A5A] tracking-tight">
              {criticalCount}
            </span>
            <span className="text-[10px] text-[#D65A5A] font-medium">
              High priority
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Critical incidents</div>
        </div>

        {/* Metric 3: Field crews */}
        <div className="flex-1 px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#E8EDF3] tracking-tight">
              {fieldTeams}
            </span>
            <span className="text-[10px] text-[#27A878] font-mono">
              Active on site
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Field crews</div>
        </div>

        {/* Metric 4: Avg response */}
        <div className="flex-1 px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#E8EDF3] tracking-tight">
              {avgSla}m
            </span>
            <span className="text-[10px] text-[#27A878] font-mono">
              -18% vs avg
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Avg response</div>
        </div>

        {/* Metric 5: Open work orders */}
        <div className="flex-1 px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#E8EDF3] tracking-tight">
              {openWorkOrders}
            </span>
            <span className="text-[10px] text-[#D49A32] font-mono">
              Dispatched
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Open work orders</div>
        </div>

        {/* Metric 6: Reports today */}
        <div className="flex-1 px-4 last:pr-0">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-[#E8EDF3] tracking-tight">
              {totalReportsToday.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#637184] font-mono">
              24h total
            </span>
          </div>
          <div className="text-[11px] text-[#93A1B2]">Reports today</div>
        </div>
      </div>
    </div>
  );
};
