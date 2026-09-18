import React from 'react';
import type {
  IncidentCategory,
  TimeRangeOption,
  VisualizationSettings,
} from '../types/incident';
import {
  Layers,
  Lightbulb,
  Droplets,
  Trash2,
  Car,
  Cone,
  Shield,
  ChevronDown,
  Sliders,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: IncidentCategory;
  onSelectCategory: (category: IncidentCategory) => void;
  selectedTimeRange: TimeRangeOption;
  onSelectTimeRange: (range: TimeRangeOption) => void;
  visSettings: VisualizationSettings;
  onUpdateVisSettings: (settings: Partial<VisualizationSettings>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetReplay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const INCIDENT_LAYERS: {
  id: IncidentCategory;
  label: string;
  count: number;
  icon: any;
}[] = [
  { id: 'all', label: 'All incidents', count: 2548, icon: Layers },
  { id: 'water', label: 'Water supply', count: 546, icon: Droplets },
  { id: 'road', label: 'Road damage', count: 482, icon: Cone },
  { id: 'streetlight', label: 'Streetlight & power', count: 419, icon: Lightbulb },
  { id: 'traffic', label: 'Traffic grid', count: 395, icon: Car },
  { id: 'waste', label: 'Sanitation & waste', count: 312, icon: Trash2 },
  { id: 'safety', label: 'Public safety', count: 176, icon: Shield },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTimeRange,
  onSelectTimeRange,
  visSettings,
  onUpdateVisSettings,
  selectedCity,
  onSelectCity,
}) => {
  return (
    <aside className="w-60 shrink-0 h-full bg-[#111A24] border-r border-[#263342] flex flex-col overflow-y-auto z-30 select-none text-xs">
      {/* ── Section 1: Operations Header & Zone Picker ── */}
      <div className="p-3 border-b border-[#263342] bg-[#0D141D]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#93A1B2] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#1597D4]" />
            Operations
          </span>
          <span className="text-[10px] font-mono text-[#637184]">
            Delhi NCR
          </span>
        </div>

        <label className="text-[10px] text-[#637184] block mb-1">Metro sector</label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="w-full bg-[#0D141D] border border-[#263342] rounded px-2.5 py-1.5 text-xs text-[#E8EDF3] font-medium focus:outline-none focus:border-[#1597D4] appearance-none cursor-pointer pr-7"
          >
            <option value="metro-core">Delhi Metro Core (All Wards)</option>
            <option value="ward-14">Ward 14 — Rohini North</option>
            <option value="ward-42">Ward 42 — Connaught Place</option>
            <option value="ward-28">Ward 28 — Lajpat Nagar</option>
            <option value="ward-19">Ward 19 — East Delhi Central</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#637184] absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* ── Section 2: Incident Layers ── */}
      <div className="p-2.5 border-b border-[#263342]">
        <div className="text-[10px] font-bold text-[#637184] uppercase tracking-wider mb-1.5 px-2">
          Incident layers
        </div>

        <div className="space-y-0.5">
          {INCIDENT_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedCategory === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onSelectCategory(layer.id)}
                className={`w-full px-2.5 py-1.5 rounded flex items-center justify-between transition-colors cursor-pointer text-left border-l-2 ${
                  isSelected
                    ? 'bg-[#151F2A] border-[#1597D4] text-[#E8EDF3] font-medium'
                    : 'border-transparent text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#1597D4]' : 'text-[#637184]'}`} />
                  <span className="truncate">{layer.label}</span>
                </div>
                <span className={`text-[11px] font-mono ${isSelected ? 'text-[#93A1B2]' : 'text-[#637184]'}`}>
                  {layer.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Time Range Filter ── */}
      <div className="p-2.5 border-b border-[#263342]">
        <div className="text-[10px] font-bold text-[#637184] uppercase tracking-wider mb-1.5 px-2">
          Time window
        </div>
        <div className="grid grid-cols-2 gap-1 bg-[#0D141D] p-1 rounded border border-[#263342]">
          {(
            [
              { id: 'realtime', label: 'Real-time' },
              { id: 'today', label: '24 hours' },
              { id: 'last7d', label: '7 days' },
              { id: 'last30d', label: '30 days' },
            ] as { id: TimeRangeOption; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTimeRange(t.id)}
              className={`py-1 text-[11px] font-mono rounded cursor-pointer transition-colors text-center ${
                selectedTimeRange === t.id
                  ? 'bg-[#151F2A] text-[#E8EDF3] font-medium border border-[#37475A]'
                  : 'text-[#637184] hover:text-[#93A1B2]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 4: GIS Workspace Display Settings ── */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-[#637184] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#637184]" />
            GIS display
          </span>
          <span className="text-[10px] font-mono text-[#1597D4]">{visSettings.viewMode}</span>
        </div>

        {/* 2D / 3D Mode */}
        <div className="grid grid-cols-2 gap-1 bg-[#0D141D] p-1 rounded border border-[#263342]">
          <button
            onClick={() => onUpdateVisSettings({ viewMode: '3D', pitch: 50 })}
            className={`py-1 text-[11px] font-mono rounded cursor-pointer transition-colors text-center ${
              visSettings.viewMode === '3D'
                ? 'bg-[#151F2A] text-[#E8EDF3] font-medium border border-[#37475A]'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            3D Mode
          </button>
          <button
            onClick={() => onUpdateVisSettings({ viewMode: '2D', pitch: 0 })}
            className={`py-1 text-[11px] font-mono rounded cursor-pointer transition-colors text-center ${
              visSettings.viewMode === '2D'
                ? 'bg-[#151F2A] text-[#E8EDF3] font-medium border border-[#37475A]'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            2D Plan
          </button>
        </div>

        {/* Heatmap Density Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#93A1B2] mb-1">
            <span>Incident density field</span>
            <span className="font-mono text-[#E8EDF3]">{visSettings.heatIntensity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={visSettings.heatIntensity}
            onChange={(e) => onUpdateVisSettings({ heatIntensity: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Cluster Radius Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#93A1B2] mb-1">
            <span>Cluster proximity</span>
            <span className="font-mono text-[#E8EDF3]">{visSettings.hotspotRadius}m</span>
          </div>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={visSettings.hotspotRadius}
            onChange={(e) => onUpdateVisSettings({ hotspotRadius: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </aside>
  );
};
