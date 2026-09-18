import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { DISTRICT_RADAR_DATA, CATEGORY_DISTRIBUTION } from '../data/analytics';

export const CategoryChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'radar' | 'breakdown'>('radar');

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between pb-1 border-b border-[#263342]">
        <span className="text-[11px] font-semibold text-[#E8EDF3]">
          {viewMode === 'radar' ? 'District strain' : 'Category breakdown'}
        </span>
        <div className="flex items-center gap-1 bg-[#0D141D] border border-[#263342] rounded p-0.5 text-[9px]">
          <button
            onClick={() => setViewMode('radar')}
            className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-[#151F2A] text-[#1597D4] font-medium'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setViewMode('breakdown')}
            className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'breakdown'
                ? 'bg-[#151F2A] text-[#1597D4] font-medium'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Categories
          </button>
        </div>
      </div>

      <div
        className="w-full h-[120px] min-h-[120px] mt-0.5 relative rounded-[5px] p-1 flex items-center justify-center bg-[#151F2A] border border-[#263342]"
      >
        {viewMode === 'radar' ? (
          <ResponsiveContainer width="100%" height={112} minWidth={0} minHeight={110}>
            <RadarChart
              data={DISTRICT_RADAR_DATA}
              margin={{ top: 6, right: 14, bottom: 6, left: 14 }}
              cx="50%"
              cy="50%"
              outerRadius="72%"
            >
              <PolarGrid stroke="#263342" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: '#93A1B2', fontSize: 8, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div
                        className="p-2 rounded-[5px] text-[10px] bg-[#0D141D] border border-[#263342] text-[#E8EDF3] shadow-lg"
                      >
                        <div className="font-semibold text-[#E8EDF3]">{d.district}</div>
                        <div className="text-[#1597D4]">Strain: {d.densityScore}</div>
                        <div className="text-[#7E8CE0]">Cascade Risk: {d.cascadingRisk}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Strain"
                dataKey="densityScore"
                stroke="#1597D4"
                fill="#1597D4"
                fillOpacity={0.25}
                strokeWidth={1.5}
              />
              <Radar
                name="Cascade"
                dataKey="cascadingRisk"
                stroke="#7E8CE0"
                fill="#7E8CE0"
                fillOpacity={0.15}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col justify-between py-1 px-1.5 overflow-hidden">
            {CATEGORY_DISTRIBUTION.slice(0, 4).map((cat) => (
              <div key={cat.category} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[#93A1B2] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#637184]">{cat.count}</span>
                    <span className="text-[#E8EDF3]">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-[#0D141D] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.count / 650) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] px-0.5 text-[#637184]">
        <span className="text-[#1597D4] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1597D4] inline-block" /> Strain Index 94
        </span>
        <span className="text-[#7E8CE0] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7E8CE0] inline-block" /> Cascade 91
        </span>
      </div>
    </div>
  );
};
