import React from 'react';
import { ShieldCheck, TrendingDown, CheckCircle2, ArrowDownRight } from 'lucide-react';

interface ImpactVerificationProps {
  preVolumeHourly?: number;
  postVolumeHourly?: number;
  deltaPercent?: number;
  resolvedAt?: string;
  incidentCategory?: string;
}

export const ImpactVerificationCard: React.FC<ImpactVerificationProps> = ({
  preVolumeHourly = 18.5,
  postVolumeHourly = 4.8,
  deltaPercent = -74.1,
  resolvedAt,
  incidentCategory = 'General Civic'
}) => {
  return (
    <div className="bg-[#151F2A] border border-[#27A878]/30 rounded-lg p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#263342] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[5px] bg-[#27A878]/20 text-[#27A878] border border-[#27A878]/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#E8EDF3]">
              Post-resolution verification
            </h4>
            <p className="text-[10px] text-[#27A878] font-mono">
              Category: {incidentCategory.toUpperCase()} • Closed-loop verified
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono text-[#27A878] bg-[#27A878]/10 px-2 py-0.5 rounded-[4px] border border-[#27A878]/20">
          <CheckCircle2 className="w-3 h-3" />
          RESOLVED
        </span>
      </div>

      {/* Metric Visual Comparison */}
      <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#0D141D] rounded-[5px] border border-[#263342] mb-3">
        <div className="p-2">
          <div className="text-[10px] text-[#637184] uppercase">Pre-Resolution</div>
          <div className="text-sm font-bold text-[#D65A5A] font-mono mt-0.5">
            {preVolumeHourly} <span className="text-[9px] font-normal text-[#637184]">rep/hr</span>
          </div>
        </div>

        <div className="p-2 border-x border-[#263342] flex flex-col items-center justify-center">
          <div className="text-[10px] text-[#27A878] font-medium flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" />
            Impact Δ
          </div>
          <div className="text-base font-bold text-[#27A878] font-mono mt-0.5 flex items-center">
            <ArrowDownRight className="w-4 h-4" />
            {deltaPercent}%
          </div>
        </div>

        <div className="p-2">
          <div className="text-[10px] text-[#637184] uppercase">Post-Resolution</div>
          <div className="text-sm font-bold text-[#27A878] font-mono mt-0.5">
            {postVolumeHourly} <span className="text-[9px] font-normal text-[#637184]">rep/hr</span>
          </div>
        </div>
      </div>

      {/* Verification Details */}
      <div className="text-[11px] text-[#93A1B2] space-y-1 bg-[#0D141D] p-2.5 rounded-[5px] border border-[#263342]">
        <div className="flex justify-between text-[#93A1B2]">
          <span>Resolution timestamp:</span>
          <span className="font-mono text-[#E8EDF3]">
            {resolvedAt ? new Date(resolvedAt).toLocaleTimeString() : 'Verified (Recent)'}
          </span>
        </div>
        <div className="flex justify-between text-[#93A1B2]">
          <span>Baseline stabilization:</span>
          <span className="text-[#27A878] font-mono">100% Normalized</span>
        </div>
      </div>
    </div>
  );
};
