import React from 'react';
import { generateAIInsight } from '../utils/incidentAnalytics';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface AIInsightPanelProps {
  selectedClusterId: string | null;
  currentHour: number;
  onQuickDispatch: (action: string) => void;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  selectedClusterId,
  currentHour,
  onQuickDispatch,
}) => {
  const insight = generateAIInsight(selectedClusterId, currentHour);

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#263342]">
        <span className="text-[11px] font-semibold text-[#E8EDF3]">
          Operational insight
        </span>
        <span className="text-[10px] font-mono text-[#1597D4]">
          Confidence: 94%
        </span>
      </div>

      {/* Structured Operational Narrative */}
      <div className="p-2.5 rounded bg-[#151F2A] border border-[#263342] text-[#93A1B2] text-[11px] leading-relaxed">
        {insight.narrative}
      </div>

      {/* Operational Highlights */}
      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-2 p-2 rounded bg-[#151F2A]/60 border border-[#263342] text-[#E8EDF3]">
          <AlertCircle className="w-3 h-3 text-[#D49A32] shrink-0" />
          <span>Incident density surged +28% in Sector 7 grid</span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-[#151F2A]/60 border border-[#263342] text-[#E8EDF3]">
          <CheckCircle2 className="w-3 h-3 text-[#27A878] shrink-0" />
          <span>3 field units within 2.5 km radius on standby</span>
        </div>
      </div>

      {/* Action Recommendation */}
      <div className="p-2.5 rounded bg-[#151F2A] border border-[#263342] space-y-2">
        <div className="text-[10px] text-[#93A1B2] font-semibold uppercase tracking-wider">
          Recommended Action
        </div>
        <p className="text-[11px] text-[#E8EDF3] leading-snug">
          {insight.recommendedAction}
        </p>

        <button
          onClick={() => onQuickDispatch(insight.recommendedAction)}
          className="w-full py-1.5 rounded-[5px] bg-[#1597D4] hover:bg-[#1282B8] text-white font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Deploy response team</span>
        </button>
      </div>
    </div>
  );
};
