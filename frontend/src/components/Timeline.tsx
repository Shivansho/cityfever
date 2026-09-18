import React, { useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getTimelinePhase } from '../utils/incidentAnalytics';

interface TimelineProps {
  currentHour: number;
  onSeekHour: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

const TIME_MARKS = [
  { val: 0, label: '00' },
  { val: 4, label: '04' },
  { val: 8, label: '08' },
  { val: 12, label: '12' },
  { val: 16, label: '16' },
  { val: 20, label: '20' },
  { val: 24, label: '24' },
];

export const Timeline: React.FC<TimelineProps> = ({
  currentHour,
  onSeekHour,
  isPlaying,
  onTogglePlay,
  onReset,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const phase = getTimelinePhase(currentHour);
  const progress = Math.min(100, Math.max(0, (currentHour / 24) * 100));

  const formatHour = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.floor((h - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeekHour(parseFloat((pos * 24).toFixed(1)));
  };

  return (
    <div className="w-full bg-[#111A24] border-t border-[#263342] px-4 sm:px-6 py-2 flex flex-col gap-1.5 z-40 select-none shrink-0 h-18">
      {/* Top Bar: Title, Controls & Phase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#93A1B2]">
            Activity timeline
          </span>

          {/* Minimal Play / Pause / Reset buttons */}
          <div className="flex items-center gap-1 bg-[#0D141D] p-0.5 rounded-[5px] border border-[#263342]">
            <button
              onClick={onTogglePlay}
              className="px-2 py-0.5 rounded-[3px] bg-[#1597D4] hover:bg-[#1282B8] text-white cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-medium"
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={onReset}
              className="p-1 rounded text-[#637184] hover:text-[#E8EDF3] transition-colors cursor-pointer"
              title="Reset timeline to 00:00"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>

            <button
              onClick={() => onChangeSpeed(playbackSpeed >= 5 ? 1 : playbackSpeed + 1)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-[#93A1B2] hover:text-[#E8EDF3] cursor-pointer"
            >
              {playbackSpeed}x
            </button>
          </div>

          <div className="font-mono text-xs text-[#1597D4] font-medium">
            {formatHour(currentHour)}
          </div>
        </div>

        {/* Phase descriptor */}
        <div className="text-[10px] text-[#93A1B2] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D49A32]"></span>
          <span>{phase.text}</span>
        </div>
      </div>

      {/* Analytical Timeline Track */}
      <div className="relative flex flex-col justify-center">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="w-full h-2 bg-[#0D141D] rounded-xs border border-[#263342] relative cursor-pointer overflow-hidden"
        >
          {/* Subtle Activity Density Heatmap Bands */}
          <div className="absolute inset-0 flex opacity-40">
            <div className="w-[25%] bg-[#1597D4]/40"></div>
            <div className="w-[25%] bg-[#27A878]/40"></div>
            <div className="w-[30%] bg-[#D49A32]/50"></div>
            <div className="w-[20%] bg-[#D65A5A]/60"></div>
          </div>

          {/* Progress bar */}
          <div
            className="h-full bg-[#1597D4] transition-all duration-75 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white"></div>
          </div>
        </div>

        {/* Ticks: 00 04 08 12 16 20 24 */}
        <div className="flex justify-between items-center px-0.5 text-[9px] font-mono text-[#637184] mt-0.5">
          {TIME_MARKS.map((mark) => (
            <span
              key={mark.val}
              onClick={() => onSeekHour(mark.val)}
              className="cursor-pointer hover:text-[#E8EDF3] transition-colors"
            >
              {mark.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
