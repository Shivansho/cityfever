import React, { createContext, useContext, useState } from 'react';
import type {
  UserRole,
  CitizenComplaint,
  FieldJob,
  FieldJobStatus,
  AppNotification,
  UserProfile,
} from '../types/multiRole';
import {
  INITIAL_CITIZEN_PROFILE,
  INITIAL_CITIZEN_COMPLAINTS,
  INITIAL_FIELD_JOBS,
  INITIAL_NOTIFICATIONS,
} from '../data/multiRoleData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  
  // Citizen state
  userProfile: UserProfile;
  complaints: CitizenComplaint[];
  addComplaint: (newComplaint: Omit<CitizenComplaint, 'id' | 'reportedAt' | 'upvotes' | 'statusUpdates'>) => CitizenComplaint;
  upvoteComplaint: (id: string) => void;
  rateComplaint: (id: string, rating: number) => void;

  // Field worker state
  fieldJobs: FieldJob[];
  updateJobStatus: (jobId: string, status: FieldJobStatus, notes?: string) => void;
  toggleChecklistItem: (jobId: string, checkId: string) => void;
  updateJobNotes: (jobId: string, notes: string) => void;
  completeJob: (jobId: string, notes?: string, afterPhotoUrl?: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Settings & i18n
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Toast / Global alert
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('commander');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_CITIZEN_PROFILE);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(INITIAL_CITIZEN_COMPLAINTS);
  const [fieldJobs, setFieldJobs] = useState<FieldJob[]>(INITIAL_FIELD_JOBS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add new complaint
  const addComplaint = (data: Omit<CitizenComplaint, 'id' | 'reportedAt' | 'upvotes' | 'statusUpdates'>) => {
    const id = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const newTicket: CitizenComplaint = {
      ...data,
      id,
      reportedAt: `${dateStr}, ${timeStr}`,
      upvotes: 1,
      hasUpvoted: true,
      status: 'REPORTED',
      statusUpdates: [
        {
          status: 'REPORTED',
          timestamp: timeStr,
          note: 'Complaint officially registered and queued for AI verification',
          actor: 'Citizen App',
        },
      ],
    };

    setComplaints((prev) => [newTicket, ...prev]);

    // Update karma points
    setUserProfile((prev) => ({
      ...prev,
      karmaPoints: prev.karmaPoints + 25,
    }));

    // Generate automatic notification
    addNotification({
      type: 'CRITICAL',
      title: `📝 New Report Filed: ${id}`,
      message: `${data.title} in ${data.ward}. Priority: ${data.severity}.`,
      relatedId: id,
    });

    showToast(`Complaint ${id} registered successfully! +25 Civic Karma awarded.`);
    return newTicket;
  };

  // Upvote complaint
  const upvoteComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasUpvoted = !c.hasUpvoted;
          return {
            ...c,
            upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
            hasUpvoted,
          };
        }
        return c;
      })
    );
  };

  // Rate resolved complaint
  const rateComplaint = (id: string, rating: number) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, citizenRating: rating } : c))
    );
    showToast(`Thank you! Your feedback (${rating} Stars) has been recorded.`);
  };

  // Update Field Job Status
  const updateJobStatus = (jobId: string, status: FieldJobStatus, notes?: string) => {
    setFieldJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            status,
            workNotes: notes || job.workNotes,
          };
        }
        return job;
      })
    );

    // Also sync with associated Citizen complaint
    const targetJob = fieldJobs.find((j) => j.id === jobId);
    if (targetJob) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusMap: Record<FieldJobStatus, any> = {
        ASSIGNED: 'ASSIGNED',
        EN_ROUTE: 'ASSIGNED',
        ON_SITE: 'IN_PROGRESS',
        IN_REPAIR: 'IN_PROGRESS',
        RESOLVED: 'RESOLVED',
      };

      const mappedStatus = statusMap[status];

      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === targetJob.complaintId) {
            const newUpdates = [
              ...c.statusUpdates,
              {
                status: mappedStatus,
                timestamp: nowTime,
                note: `Field update: Crew transitioned status to ${status.replace('_', ' ')}.${notes ? ` Note: ${notes}` : ''}`,
                actor: targetJob.assignedToCrew,
              },
            ];
            return {
              ...c,
              status: mappedStatus,
              statusUpdates: newUpdates,
            };
          }
          return c;
        })
      );
    }

    showToast(`Work order ${jobId} updated to ${status.replace('_', ' ')}.`);
  };

  // Toggle checklist item in field job
  const toggleChecklistItem = (jobId: string, checkId: string) => {
    setFieldJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            checklist: j.checklist.map((item) =>
              item.id === checkId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return j;
      })
    );
  };

  // Update job notes
  const updateJobNotes = (jobId: string, notes: string) => {
    setFieldJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, workNotes: notes } : j))
    );
  };

  // Complete field job
  const completeJob = (jobId: string, notes?: string, afterPhotoUrl?: string) => {
    updateJobStatus(jobId, 'RESOLVED', notes);
    if (afterPhotoUrl) {
      setFieldJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, afterPhotoUrl } : j))
      );
    }

    const job = fieldJobs.find((j) => j.id === jobId);
    addNotification({
      type: 'RESOLVED',
      title: `✅ Work Order ${jobId} Completed`,
      message: `${job?.title || 'Job'} marked as RESOLVED by ${job?.assignedToCrew || 'Crew'}.`,
      relatedId: job?.complaintId,
    });
  };

  // Notification methods
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `N-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        userProfile,
        complaints,
        addComplaint,
        upvoteComplaint,
        rateComplaint,
        fieldJobs,
        updateJobStatus,
        toggleChecklistItem,
        updateJobNotes,
        completeJob,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        isNotificationsOpen,
        setIsNotificationsOpen,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        isSettingsOpen,
        setIsSettingsOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
