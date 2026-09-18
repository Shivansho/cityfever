import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Sparkles,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import type { NotificationType } from '../types/multiRole';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentRole,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | NotificationType>('ALL');

  if (!isNotificationsOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-[#D65A5A]" />;
      case 'WORK_ORDER':
        return <Briefcase className="w-4 h-4 text-[#1597D4]" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-[#27A878]" />;
      case 'AI_ANOMALY':
        return <Sparkles className="w-4 h-4 text-[#7E8CE0]" />;
    }
  };

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-[#D65A5A]/20 text-[#D65A5A] border-[#D65A5A]/30';
      case 'WORK_ORDER':
        return 'bg-[#1597D4]/20 text-[#1597D4] border-[#1597D4]/30';
      case 'RESOLVED':
        return 'bg-[#27A878]/20 text-[#27A878] border-[#27A878]/30';
      case 'AI_ANOMALY':
        return 'bg-[#7E8CE0]/20 text-[#7E8CE0] border-[#7E8CE0]/30';
    }
  };

  const handleNotificationClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.type === 'WORK_ORDER') {
      setCurrentRole('field-worker');
    } else if (n.type === 'CRITICAL' || n.type === 'AI_ANOMALY') {
      setCurrentRole('commander');
    } else if (n.type === 'RESOLVED') {
      setCurrentRole('citizen');
    }
    setIsNotificationsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#080D14]/80 backdrop-blur-xs">
      <div
        className="w-full max-w-md h-full bg-[#111A24] border-l border-[#263342] flex flex-col text-[#E8EDF3]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#263342] flex items-center justify-between bg-[#0D141D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[5px] bg-[#151F2A] border border-[#263342] flex items-center justify-center text-[#1597D4]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[#E8EDF3]">
                Notification Center
              </h2>
              <div className="text-xs text-[#637184]">Operational alerts & work orders</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-[#1597D4] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All</span>
            </button>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1.5 rounded-[5px] text-[#637184] hover:text-[#E8EDF3] hover:bg-[#151F2A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-2 border-b border-[#263342] bg-[#0D141D] flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors font-mono text-[11px] ${
              activeFilter === 'ALL' ? 'bg-[#151F2A] text-[#E8EDF3] border border-[#263342]' : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors font-mono text-[11px] ${
              activeFilter === 'CRITICAL' ? 'bg-[#151F2A] text-[#D65A5A] border border-[#D65A5A]/40' : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setActiveFilter('WORK_ORDER')}
            className={`px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors font-mono text-[11px] ${
              activeFilter === 'WORK_ORDER' ? 'bg-[#151F2A] text-[#1597D4] border border-[#1597D4]/40' : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors font-mono text-[11px] ${
              activeFilter === 'RESOLVED' ? 'bg-[#151F2A] text-[#27A878] border border-[#27A878]/40' : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setActiveFilter('AI_ANOMALY')}
            className={`px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors font-mono text-[11px] ${
              activeFilter === 'AI_ANOMALY' ? 'bg-[#151F2A] text-[#7E8CE0] border border-[#7E8CE0]/40' : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Anomalies
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#111A24]">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#637184]">
              <Bell className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-xs">No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  !n.read
                    ? 'bg-[#151F2A] border-[#1597D4]'
                    : 'bg-[#0D141D] border-[#263342] hover:bg-[#151F2A]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-[4px] bg-[#0D141D] border border-[#263342]">{getIcon(n.type)}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${getBadgeStyle(n.type)}`}>
                      {n.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#1597D4]"></span>}
                    <span className="text-[10px] text-[#637184] font-mono">{n.timestamp}</span>
                  </div>
                </div>

                <h3 className="text-xs font-medium text-[#E8EDF3]">{n.title}</h3>
                <p className="text-xs text-[#93A1B2] mt-1 leading-relaxed">{n.message}</p>

                <div className="mt-2.5 pt-2 border-t border-[#263342] flex items-center justify-between text-[11px] font-medium text-[#1597D4]">
                  <span>Click to view</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
