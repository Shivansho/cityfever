import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { HOURLY_TREND_DATA } from '../data/analytics';

interface IncidentTrendProps {
  currentHour?: number;
}

export const IncidentTrend: React.FC<IncidentTrendProps> = ({ currentHour = 19 }) => {
  // Find peak point
  const peakPoint = HOURLY_TREND_DATA.reduce(
    (max, pt) => (pt.actual > max.actual ? pt : max),
    HOURLY_TREND_DATA[0]
  );

  const formattedHour = `${String(currentHour).padStart(2, '0')}:00`;

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between pb-1 border-b border-[#263342]">
        <span className="text-[11px] font-semibold text-[#E8EDF3]">
          Activity over time
        </span>
        <div className="flex items-center gap-2.5 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-[#93A1B2]">
            <span className="w-2.5 h-[2px] bg-[#1597D4] inline-block rounded-xs" /> Actual
          </span>
          <span className="flex items-center gap-1 text-[#637184]">
            <span
              className="w-2.5 h-[1.5px] bg-[#637184] inline-block rounded-xs"
              style={{ borderTop: '1px dashed #637184' }}
            /> Baseline
          </span>
        </div>
      </div>

      <div
        className="w-full h-[110px] min-h-[110px] mt-0.5 relative rounded-[5px] p-1 bg-[#151F2A] border border-[#263342]"
      >
        <ResponsiveContainer width="100%" height={102} minWidth={0} minHeight={100}>
          <AreaChart data={HOURLY_TREND_DATA} margin={{ top: 8, right: 6, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradientDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1597D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1597D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="transparent"
              tick={{ fontSize: 8, fill: '#637184', fontWeight: 500 }}
              tickLine={false}
              interval={3}
            />
            <YAxis
              stroke="transparent"
              tick={{ fontSize: 8, fill: '#637184', fontWeight: 500 }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div
                      className="p-2 rounded-[5px] text-[10px] bg-[#0D141D] border border-[#263342] text-[#E8EDF3] shadow-lg"
                    >
                      <div className="font-mono text-[#E8EDF3] font-semibold mb-0.5">{label}</div>
                      <div className="text-[#93A1B2] flex justify-between gap-3">
                        <span>Actual:</span>
                        <span className="text-[#1597D4] font-mono font-medium">{d.actual} inc/h</span>
                      </div>
                      <div className="text-[#637184] flex justify-between gap-3">
                        <span>Baseline:</span>
                        <span className="text-[#93A1B2] font-mono">{d.baseline}</span>
                      </div>
                      {d.isAnomaly && (
                        <div className="mt-1 pt-1 border-t border-[#263342] text-[#D65A5A] font-medium font-mono flex items-center gap-1">
                          <span>▲ +{d.anomalyDelta} surge anomaly</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Anomaly zone */}
            <ReferenceLine x="16:00" stroke="#D65A5A" strokeDasharray="2 2" strokeOpacity={0.4} />
            <ReferenceLine x="22:00" stroke="#D65A5A" strokeDasharray="2 2" strokeOpacity={0.4} />

            {/* Current hour vertical marker */}
            <ReferenceLine x={formattedHour} stroke="#1597D4" strokeWidth={1.5} strokeDasharray="3 3" />

            {/* Baseline */}
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#637184"
              strokeWidth={1}
              strokeDasharray="4 3"
              fill="transparent"
              dot={false}
            />
            {/* Actual */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#1597D4"
              strokeWidth={1.8}
              fill="url(#actualGradientDark)"
              dot={false}
              activeDot={{ r: 3.5, fill: '#1597D4', stroke: '#0D141D', strokeWidth: 2 }}
            />
            {/* Peak marker */}
            <ReferenceDot
              x={peakPoint.hour}
              y={peakPoint.actual}
              r={3.5}
              fill="#D65A5A"
              stroke="#0D141D"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono px-0.5 text-[#637184]">
        <span>Window: 16:00–22:00</span>
        <span className="text-[#D65A5A]">Peak 19:00 (+327%)</span>
      </div>
    </div>
  );
};
