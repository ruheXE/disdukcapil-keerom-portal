export type ServiceCategory = 'KTP' | 'KK' | 'AKTA' | 'KIA_IKD' | 'KONSULTASI';

export interface DukcapilService {
  id: ServiceCategory;
  name: string;
  prefix: string;
  description: string;
  estimatedMinutes: number;
  requirements: string[];
  icon: string;
  badgeColor: string;
}

export type TicketStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED';

export interface QueueTicket {
  id: string;
  ticketNumber: string; // e.g. "A-012"
  nik: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  serviceId: ServiceCategory;
  serviceName: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00 - 10:00 WIB"
  notes?: string;
  status: TicketStatus;
  counterId?: number | null;
  counterName?: string | null;
  createdAt: string;
  calledAt?: string | null;
  servedAt?: string | null;
  completedAt?: string | null;
  queueIndex?: number;
}

export type CounterStatus = 'AVAILABLE' | 'CALLING' | 'SERVING' | 'BREAK' | 'CLOSED';

export interface ServiceCounter {
  id: number;
  name: string;
  officerName: string;
  assignedServices: ServiceCategory[];
  status: CounterStatus;
  currentTicketNumber?: string | null;
  currentTicketId?: string | null;
  currentServiceName?: string | null;
  totalServedToday: number;
}

export interface QueueStats {
  totalRegistered: number;
  totalWaiting: number;
  totalServing: number;
  totalCompleted: number;
  totalSkipped: number;
  averageWaitMinutes: number;
  averageServiceMinutes: number;
}

export interface RealtimeAnnouncement {
  id: string;
  ticketNumber: string;
  counterId: number;
  counterName: string;
  serviceName: string;
  citizenName: string;
  spokenText: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'call' | 'info' | 'success' | 'alert';
  ticketNumber?: string;
  timestamp: string;
  read?: boolean;
}
