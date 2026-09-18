import React, { useState } from 'react';
import { X, Zap, Activity, Cpu, Layers } from 'lucide-react';

interface AIIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (action: string) => void;
}

export const AIIntelligenceModal: React.FC<AIIntelligenceModalProps> = ({ isOpen, onClose, onDispatch }) => {
  const [activeTab, setActiveTab] = useState<'correlation' | 'cascading' | 'predictive'>('correlation');

  if (!isOpen) return null;

  const tabs = [
    { id: 'correlation' as const, label: 'Root Cause', icon: Cpu },
    { id: 'cascading' as const, label: 'Cascade Sim', icon: Activity },
    { id: 'predictive' as const, label: 'Forecast', icon: Layers },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D14]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-lg p-5 flex flex-col gap-4 bg-[#111A24] border border-[#263342] text-[#E8EDF3] max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#263342]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[5px] bg-[#151F2A] border border-[#263342] text-[#1597D4]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#E8EDF3]">Operational Intelligence Console</h2>
              <p className="text-xs text-[#637184]">Multi-signal anomaly and root cause correlator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[5px] text-[#637184] hover:text-[#E8EDF3] hover:bg-[#151F2A] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#263342]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-[4px] transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#151F2A] text-[#1597D4] border-b-2 border-[#1597D4]'
                    : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50 border-b-2 border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'correlation' && (
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-[5px] bg-[#151F2A] border border-[#263342]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#E8EDF3]">Primary Correlation: Sector 4 ↔ Ward 7</span>
                <span className="text-[10px] font-mono text-[#27A878] bg-[#27A878]/20 border border-[#27A878]/30 px-2 py-0.5 rounded-[3px]">
                  94.2% Confidence
                </span>
              </div>
              <p className="text-xs text-[#93A1B2] leading-relaxed">
                The simultaneous surge in <strong className="text-[#D49A32]">Sector 4 Streetlights (+327%)</strong> and{' '}
                <strong className="text-[#1597D4]">Ward 7 Water Pressure Drops (+218%)</strong> correlates with
                a single high-voltage substation relay trip along the underground utility tunnel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[5px] bg-[#151F2A] border border-[#263342]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#D49A32] mb-2">
                  <Zap className="w-4 h-4 text-[#D49A32]" /> Substation Telemetry
                </div>
                <div className="text-xs text-[#93A1B2] flex flex-col gap-1.5 font-mono text-[11px]">
                  <div>• Breaker trip at 17:14 on Grid B4</div>
                  <div>• Booster Pump #2 lost primary feed</div>
                  <div>• 47 Luminaire Nodes on emergency mesh</div>
                </div>
              </div>
              <div className="p-3 rounded-[5px] bg-[#151F2A] border border-[#263342]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#1597D4] mb-2">
                  <Layers className="w-4 h-4 text-[#1597D4]" /> Citizen Telemetry
                </div>
                <div className="text-xs text-[#93A1B2] flex flex-col gap-1.5 font-mono text-[11px]">
                  <div>• 85 verified reports within 45 mins</div>
                  <div>• Report frequency surged 4.2x</div>
                  <div>• 0 emergency delays reported</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cascading' && (
          <div className="p-3.5 rounded-[5px] bg-[#151F2A] border border-[#263342]">
            <div className="text-xs font-semibold text-[#E8EDF3] mb-3">60-minute ripple projection without intervention:</div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0D141D] border border-[#263342] text-[#D65A5A]">
                <span className="font-mono text-[11px] font-semibold">Phase 1 (Now):</span>
                <span>Sector 4 dark → Pedestrian congestion (+45%)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0D141D] border border-[#263342] text-[#D49A32]">
                <span className="font-mono text-[11px] font-semibold">Phase 2 (+30m):</span>
                <span>Ward 7 pump failure → Pressure drop spreading to adjacent grids</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0D141D] border border-[#263342] text-[#DE7A38]">
                <span className="font-mono text-[11px] font-semibold">Phase 3 (+60m):</span>
                <span>Traffic gridlock cascading into Central Zone intersections</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="p-3.5 rounded-[5px] bg-[#151F2A] border border-[#263342]">
            <div className="text-xs font-semibold text-[#1597D4] mb-1.5">Predictive Resolution Model</div>
            <p className="text-xs text-[#93A1B2] leading-relaxed">
              If Emergency Grid Dispatch is authorized within 10 minutes, anomaly indices project
              complete normalization by 21:30 (baseline 14 reports/hr).
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#263342]">
          <span className="text-[10px] font-mono text-[#637184]">
            Protocol: <span className="text-[#93A1B2]">CIVIC-OPERATIONAL-09</span>
          </span>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-3.5 py-1.5 rounded-[5px] text-xs font-medium text-[#93A1B2] bg-[#151F2A] hover:bg-[#1f2c3b] border border-[#263342] transition-colors cursor-pointer">
              Dismiss
            </button>
            <button
              onClick={() => { onDispatch('All response units dispatched via Operational Command.'); onClose(); }}
              className="px-3.5 py-1.5 rounded-[5px] text-xs font-medium text-white bg-[#1597D4] hover:bg-[#1282B8] transition-colors cursor-pointer">
              Execute Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
