import React, { useState, useEffect } from 'react';
import type {
  IncidentCategory,
  TimeRangeOption,
  VisualizationSettings,
  HotspotCluster,
} from '../types/incident';
import { HOTSPOT_CLUSTERS } from '../data/hotspots';
import { filterIncidentsByState } from '../utils/incidentAnalytics';
import { KPIBar } from '../components/KPIBar';
import { Sidebar } from '../components/Sidebar';
import { CityMap } from '../components/CityMap';
import { RightPanel } from '../components/RightPanel';
import { Timeline } from '../components/Timeline';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { AIIntelligenceModal } from '../components/AIIntelligenceModal';
import { ReportSubmissionModal } from '../components/ReportSubmissionModal';
import { CheckCircle2, Sparkles, PlusCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>('realtime');
  const [selectedCity, setSelectedCity] = useState<string>('metro-core');
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);

  const [visSettings, setVisSettings] = useState<VisualizationSettings>({
    heatIntensity: 70,
    hotspotRadius: 450,
    buildingHeight: 2.0,
    viewMode: '3D',
    pitch: 50,
    bearing: -15,
  });

  const [currentHour, setCurrentHour] = useState<number>(19);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);

  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Replay loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= 24) { setIsPlaying(false); return 24; }
        return parseFloat(next.toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleUpdateVisSettings = (s: Partial<VisualizationSettings>) => {
    setVisSettings((prev) => ({ ...prev, ...s }));
  };

  const handleSelectCluster = (cluster: HotspotCluster) => {
    setSelectedCluster(cluster);
    setIsDetailModalOpen(true);
  };

  const handleDispatch = (actionText: string) => {
    setNotification(actionText);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleReportCreated = (report: any) => {
    handleDispatch(`New report ${report.id} successfully filed in ${report.ward}. Auto-classified as ${report.category.toUpperCase()}.`);
  };

  const activeIncidents = filterIncidentsByState(selectedCategory, currentHour, selectedCluster?.id || null);
  const filteredHotspots = HOTSPOT_CLUSTERS.filter((h) => selectedCategory === 'all' ? true : h.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#080D14] text-[#E8EDF3] font-sans">
      {/* Telemetry Operational Header */}
      <KPIBar currentHour={currentHour} activeIncidentsCount={activeIncidents.length} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTimeRange={selectedTimeRange}
          onSelectTimeRange={setSelectedTimeRange}
          visSettings={visSettings}
          onUpdateVisSettings={handleUpdateVisSettings}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onResetReplay={() => { setIsPlaying(false); setCurrentHour(0); }}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />

        {/* Center: Map + Timeline */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Action Bar */}
          <div className="absolute top-3 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#1597D4] hover:bg-[#1597D4]/90 shadow-md transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>File incident</span>
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#E8EDF3] bg-[#151F2A] hover:bg-[#192433] border border-[#263342] shadow-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1597D4]" />
              <span>Operational insights</span>
            </button>
          </div>

          <CityMap
            hotspots={filteredHotspots}
            incidents={activeIncidents}
            selectedClusterId={selectedCluster?.id || null}
            onSelectCluster={handleSelectCluster}
            visSettings={visSettings}
            onUpdateVisSettings={handleUpdateVisSettings}
            currentHour={currentHour}
          />

          <Timeline
            currentHour={currentHour}
            onSeekHour={(h) => setCurrentHour(h)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => { setIsPlaying(false); setCurrentHour(0); }}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
          />
        </div>

        {/* Right Panel */}
        <RightPanel
          hotspots={filteredHotspots}
          selectedClusterId={selectedCluster?.id || null}
          onSelectCluster={handleSelectCluster}
          currentHour={currentHour}
          onQuickDispatch={handleDispatch}
        />
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <IncidentDetailModal
          cluster={selectedCluster}
          onClose={() => setIsDetailModalOpen(false)}
          onDispatch={handleDispatch}
        />
      )}

      <AIIntelligenceModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onDispatch={handleDispatch}
      />

      <ReportSubmissionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={handleReportCreated}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-14 right-6 z-50 p-3 rounded flex items-center gap-2.5 text-xs bg-[#151F2A] border border-[#263342] shadow-2xl text-[#E8EDF3]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#27A878] shrink-0" />
          <div>
            <div className="text-[10px] text-[#27A878] font-mono uppercase tracking-wide font-medium">
              Operational event
            </div>
            <div className="text-[#93A1B2] mt-0.5 max-w-xs text-xs">{notification}</div>
          </div>
        </div>
      )}
    </div>
  );
};
