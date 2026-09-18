import type { IncidentCategory, SeverityLevel } from './incident';

export type UserRole = 'citizen' | 'commander' | 'field-worker';

export type ComplaintStatus = 'REPORTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export interface CitizenComplaint {
  id: string; // e.g. "CP-1024"
  category: IncidentCategory;
  title: string;
  description: string;
  location: string;
  ward: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  reportedAt: string;
  status: ComplaintStatus;
  severity: SeverityLevel;
  upvotes: number;
  hasUpvoted?: boolean;
  assignedCrew?: string;
  assignedDept?: string;
  estimatedResolutionHours?: number;
  statusUpdates: {
    status: ComplaintStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  resolutionNotes?: string;
  resolutionPhotoUrl?: string;
  citizenRating?: number;
}

export type FieldJobStatus = 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_REPAIR' | 'RESOLVED';

export interface FieldJob {
  id: string; // e.g. "JOB-882"
  complaintId: string;
  title: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  ward: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  assignedToCrew: string;
  assignedAt: string;
  slaDeadline: string;
  status: FieldJobStatus;
  reportedIssue: string;
  citizenContact?: string;
  partsRequired: string[];
  checklist: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  workNotes?: string;
}

export type NotificationType = 'CRITICAL' | 'WORK_ORDER' | 'RESOLVED' | 'AI_ANOMALY';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: UserRole;
  relatedId?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  ward: string;
  avatarUrl?: string;
  karmaPoints: number;
  resolvedCount: number;
  badge: string;
}
