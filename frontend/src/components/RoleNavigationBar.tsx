import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  User,
  HardHat,
  LayoutGrid,
  Bell,
  Settings,
  Globe,
} from 'lucide-react';
import type { UserRole } from '../types/multiRole';

export const RoleNavigationBar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    unreadNotificationCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    setIsSettingsOpen,
    language,
    setLanguage,
    userProfile,
  } = useApp();

  const roles: { id: UserRole; label: string; icon: any; sub: string }[] = [
    {
      id: 'citizen',
      label: language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal',
      icon: User,
      sub: 'Public Service App',
    },
    {
      id: 'commander',
      label: language === 'hi' ? 'कमांड सेंटर' : 'Command Center',
      icon: LayoutGrid,
      sub: 'GIS Mission Control',
    },
    {
      id: 'field-worker',
      label: language === 'hi' ? 'फील्ड ऑप्स' : 'Field Operations',
      icon: HardHat,
      sub: 'Tactical Crew Terminal',
    },
  ];

  return (
    <header className="w-full bg-[#111A24] border-b border-[#263342] px-4 sm:px-6 py-0 flex items-center justify-between z-40 select-none shrink-0 h-13">
      {/* ── Left: CivicPulse Branding ── */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-[#1597D4]/15 border border-[#1597D4]/30 flex items-center justify-center text-[#1597D4]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-[#E8EDF3] tracking-tight">
              CIVICPULSE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#151F2A] text-[#93A1B2] border border-[#263342]">
              Delhi NCR
            </span>
          </div>
          <span className="text-[10px] text-[#637184] -mt-0.5">
            Municipal Intelligence
          </span>
        </div>
      </div>

      {/* ── Center: Operational Role Switcher ── */}
      <nav className="flex items-center h-full">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setCurrentRole(r.id)}
              className={`h-full px-4 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
                isActive
                  ? 'bg-[#151F2A] text-[#E8EDF3] border-[#1597D4] font-semibold'
                  : 'text-[#93A1B2] hover:text-[#E8EDF3] hover:bg-[#151F2A]/50 border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right: System Status & Controls ── */}
      <div className="flex items-center gap-2.5">
        {/* Live System Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0D141D] border border-[#263342] text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#27A878]"></span>
          <span className="text-[#93A1B2]">System status:</span>
          <span className="text-[#27A878] font-medium">Operational</span>
        </div>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-2.5 py-1 rounded bg-[#151F2A] hover:bg-[#192433] text-[#93A1B2] hover:text-[#E8EDF3] border border-[#263342] text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#637184]" />
          <span>{language === 'en' ? 'EN' : 'हिन्दी'}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-1.5 rounded border transition-colors cursor-pointer ${
            isNotificationsOpen
              ? 'bg-[#1597D4]/15 border-[#1597D4]/40 text-[#1597D4]'
              : 'bg-[#151F2A] hover:bg-[#192433] border-[#263342] text-[#93A1B2] hover:text-[#E8EDF3]'
          }`}
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D65A5A] text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded bg-[#151F2A] hover:bg-[#192433] text-[#93A1B2] hover:text-[#E8EDF3] border border-[#263342] transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User profile */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#263342] text-xs">
          <div className="w-6 h-6 rounded bg-[#1597D4]/20 text-[#1597D4] border border-[#1597D4]/30 flex items-center justify-center font-bold text-xs">
            {userProfile.name.charAt(0)}
          </div>
          <div className="text-left leading-tight">
            <div className="font-medium text-[#E8EDF3] text-[11px]">{userProfile.name}</div>
            <div className="text-[10px] text-[#637184]">{userProfile.ward.split('—')[0]}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
