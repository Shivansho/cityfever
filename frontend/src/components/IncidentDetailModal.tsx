import React, { useState } from 'react';
import type { HotspotCluster } from '../types/incident';
import { X, MapPin, Clock, Send, Radio, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { ImpactVerificationCard } from './ImpactVerificationCard';
import { api } from '../services/api';

import { getCategoryTheme, getSeverityBadgeStyle } from '../utils/categoryColors';

interface IncidentDetailModalProps {
  cluster: HotspotCluster | null;
  onClose: () => void;
  onDispatch: (action: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ cluster, onClose, onDispatch }) => {
  if (!cluster) return null;

  const [currentStatus, setCurrentStatus] = useState<string>('DETECTED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const theme = getCategoryTheme(cluster.category);
  const sevStyle = getSeverityBadgeStyle(cluster.severity);

  const handleStatusTransition = async (nextStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      if (cluster.id) {
        await api.updateIncidentStatus(cluster.id, nextStatus, `Authority transition to ${nextStatus}`);
      }
      setCurrentStatus(nextStatus);
      onDispatch(`Incident ${cluster.name} transitioned to ${nextStatus}.`);
    } catch {
      setCurrentStatus(nextStatus);
      onDispatch(`Incident ${cluster.name} transitioned to ${nextStatus}.`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D14]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-lg p-5 flex flex-col gap-4 text-[#E8EDF3] max-h-[85vh] overflow-y-auto bg-[#111A24] border border-[#263342]">

        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#263342]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#E8EDF3]">
                {cluster.name}: {cluster.aliasTitle || cluster.title}
              </h2>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium"
                style={{ background: theme.badgeBg, color: theme.badgeText, border: `1px solid ${theme.badgeBorder}` }}
              >
                {theme.name}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium"
                style={{ background: sevStyle.bg, color: sevStyle.text, border: `1px solid ${sevStyle.border}` }}
              >
                {cluster.severity}
              </span>
            </div>
            <p className="text-[11px] text-[#93A1B2] font-mono flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-[#1597D4]" /> {cluster.district}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[5px] text-[#637184] hover:text-[#E8EDF3] hover:bg-[#151F2A] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authority State Machine Progression Ribbon */}
        <div className="flex items-center justify-between p-2 rounded-[5px] bg-[#0D141D] border border-[#263342] text-[10px] font-mono">
          {['DETECTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map((st, i, arr) => {
            const isActive = currentStatus === st;
            const isPast = arr.indexOf(currentStatus) >= i;
            return (
              <React.Fragment key={st}>
                <button
                  onClick={() => handleStatusTransition(st)}
                  disabled={isUpdatingStatus}
                  className={`px-2 py-1 rounded-[3px] transition-colors cursor-pointer ${
                    isActive ? 'bg-[#1597D4] text-white'
                    : isPast ? 'bg-[#151F2A] text-[#93A1B2]'
                    : 'text-[#637184] hover:text-[#E8EDF3]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#637184]" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Impact Verification Card (if Resolved) */}
        {currentStatus === 'RESOLVED' && (
          <ImpactVerificationCard
            preVolumeHourly={18.5}
            postVolumeHourly={4.8}
            deltaPercent={-74.1}
            incidentCategory={cluster.category}
          />
        )}

        {/* Metrics */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: 'Reports', value: cluster.actualReports, color: '#1597D4' },
            { label: 'Baseline', value: cluster.baselineReports, color: '#7E8CE0' },
            { label: 'Surge', value: `+${cluster.spikePercentage}%`, color: '#D65A5A' },
            { label: 'Radius', value: `${cluster.radiusKm}km`, color: '#DE7A38' },
            { label: 'AI Score', value: `${(cluster.anomalyScore * 100).toFixed(0)}%`, color: '#27A878' },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center p-2 rounded-[5px] bg-[#151F2A] border border-[#263342]">
              <span className="text-[8px] font-mono text-[#637184] uppercase">{m.label}</span>
              <span className="text-sm font-semibold font-mono mt-0.5" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Detection Reasons */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#637184] uppercase">Spatial correlation signals</span>
          <div className="p-2.5 rounded-[5px] bg-[#151F2A] border border-[#263342] space-y-1.5">
            {cluster.whyDetected.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-[#93A1B2]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#27A878] shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Reports Feed */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#637184] uppercase">
              <FileText className="w-3 h-3" /> Verified Reports ({cluster.sampleReports.length})
            </div>
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {cluster.sampleReports.map((rpt) => (
              <div key={rpt.id} className="p-2.5 rounded-[5px] text-xs bg-[#151F2A] border border-[#263342]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[#93A1B2] text-[10px]">{rpt.id} • {rpt.user}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-[#637184] flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {rpt.time}
                    </span>
                    <span
                      className="text-[9px] font-mono font-medium px-1 rounded"
                      style={{ color: rpt.severity === 'CRITICAL' ? '#D65A5A' : '#DE7A38' }}
                    >
                      {rpt.severity}
                    </span>
                  </div>
                </div>
                <p className="text-[#E8EDF3] text-[11px]">{rpt.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#263342]">
          <button
            onClick={() => onDispatch(`Advisory broadcast sent to ${cluster.name} residents.`)}
            className="flex-1 py-2 px-3 rounded-[5px] text-xs font-medium flex items-center justify-center gap-1.5 bg-[#151F2A] hover:bg-[#1f2c3b] text-[#93A1B2] border border-[#263342] transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#D49A32]" /> Broadcast Advisory
          </button>
          <button
            onClick={() => {
              handleStatusTransition('IN_PROGRESS');
              onDispatch(cluster.recommendedAction);
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-[5px] text-xs font-medium flex items-center justify-center gap-1.5 bg-[#1597D4] hover:bg-[#1282B8] text-white transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Dispatch Rapid Unit
          </button>
        </div>
      </div>
    </div>
  );
};
