import React, { useState, useEffect } from 'react';
import { Activity, Brain, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenAIModal: () => void;
  onOpenReportModal?: () => void;
  activeIncidentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIModal, onOpenReportModal, activeIncidentsCount }) => {
  const [timeStr, setTimeStr] = useState('19:00:12');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="h-12 w-full flex items-center justify-between px-5 z-40 relative select-none shrink-0"
      style={{ background: 'rgba(8,12,20,0.95)', borderBottom: '1px solid rgba(148,163,184,0.08)' }}
    >
      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{ background: 'linear-gradient(135deg, #0c4a6e, #7c3aed)', boxShadow: '0 0 10px rgba(56,189,248,0.15)' }}>
          <Activity className="w-3.5 h-3.5 text-sky-200" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CivicPulse
          </h1>
          <p className="text-[10px] text-slate-500 -mt-0.5">
            Delhi NCR Command Center • Urban Intelligence
          </p>
        </div>
      </div>

      {/* ── Center: Live Status ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md"
          style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.06)' }}>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Live</span>
          <span className="text-[11px] font-mono text-slate-300">{timeStr}</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">Grid:</span>
          <span className="text-slate-300 font-medium">Connected</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Active:</span>
          <span className="text-orange-400 font-mono font-medium">{activeIncidentsCount}</span>
        </div>
      </div>

      {/* ── Right: Action Buttons ── */}
      <div className="flex items-center gap-2.5">
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-sky-100 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400/30 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>+ File Report</span>
          </button>
        )}

        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(56,189,248,0.1))',
            border: '1px solid rgba(167,139,250,0.2)',
            color: '#c4b5fd',
          }}
        >
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          <span>AI Intelligence</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </button>
      </div>
    </header>
  );
};
