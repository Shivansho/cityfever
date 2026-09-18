import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Settings,
  Globe,
  Bell,
  Map,
  RotateCcw,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    language,
    setLanguage,
    showToast,
    userProfile,
  } = useApp();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D14]/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#111A24] border border-[#263342] rounded-lg overflow-hidden text-[#E8EDF3]">
        {/* Header */}
        <div className="p-4 bg-[#0D141D] border-b border-[#263342] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[5px] bg-[#151F2A] border border-[#263342] flex items-center justify-center text-[#1597D4]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[#E8EDF3]">
                System preferences
              </h2>
              <p className="text-xs text-[#637184]">Language, notification channels & GIS configuration</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-[5px] text-[#637184] hover:text-[#E8EDF3] hover:bg-[#151F2A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="font-medium text-[#93A1B2] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#1597D4]" />
              Language / भाषा
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setLanguage('en');
                  showToast('Language set to English');
                }}
                className={`p-2.5 rounded-[5px] border text-center font-medium cursor-pointer transition-colors ${
                  language === 'en'
                    ? 'bg-[#1597D4] border-[#1597D4] text-white'
                    : 'bg-[#0D141D] border-[#263342] text-[#93A1B2] hover:text-[#E8EDF3]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  setLanguage('hi');
                  showToast('भाषा बदलकर हिन्दी कर दी गई है');
                }}
                className={`p-2.5 rounded-[5px] border text-center font-medium cursor-pointer transition-colors ${
                  language === 'hi'
                    ? 'bg-[#1597D4] border-[#1597D4] text-white'
                    : 'bg-[#0D141D] border-[#263342] text-[#93A1B2] hover:text-[#E8EDF3]'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Account Ward */}
          <div className="space-y-1 bg-[#0D141D] p-3 rounded-[5px] border border-[#263342]">
            <span className="text-[#637184] uppercase font-mono text-[10px]">Registered Citizen Ward</span>
            <div className="font-medium text-[#E8EDF3] text-sm">{userProfile.ward}</div>
            <div className="text-xs text-[#1597D4] font-mono">Linked Contact: {userProfile.phone}</div>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-2">
            <label className="font-medium text-[#93A1B2] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#1597D4]" />
              Notification Channels
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-[5px] bg-[#0D141D] border border-[#263342] cursor-pointer">
                <div>
                  <div className="font-medium text-[#E8EDF3]">Incident Audio Alerts</div>
                  <div className="text-[11px] text-[#637184]">Play alert tone when cluster anomaly is verified</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-[#263342] text-[#1597D4] focus:ring-[#1597D4]" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-[5px] bg-[#0D141D] border border-[#263342] cursor-pointer">
                <div>
                  <div className="font-medium text-[#E8EDF3]">Citizen SMS Updates</div>
                  <div className="text-[11px] text-[#637184]">Send instant SMS upon on-site ticket resolution</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-[#263342] text-[#1597D4] focus:ring-[#1597D4]" />
              </label>
            </div>
          </div>

          {/* GIS Engine */}
          <div className="space-y-1.5">
            <label className="font-medium text-[#93A1B2] flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[#1597D4]" />
              GIS Engine
            </label>
            <div className="p-3 bg-[#0D141D] border border-[#263342] rounded-[5px] space-y-1.5 text-xs text-[#93A1B2] font-mono">
              <div className="flex justify-between">
                <span>Vector Cartography</span>
                <span className="text-[#1597D4]">MapLibre Dark GIS</span>
              </div>
              <div className="flex justify-between">
                <span>Metropolitan Anchor</span>
                <span className="text-[#1597D4]">Delhi NCR [28.6139° N, 77.2090° E]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0D141D] border-t border-[#263342] flex items-center justify-between">
          <button
            onClick={() => {
              showToast('Demo cache refreshed to defaults');
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1.5 text-[#637184] hover:text-[#E8EDF3] text-xs cursor-pointer font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Cache</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-[5px] bg-[#1597D4] hover:bg-[#1282B8] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
