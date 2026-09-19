import React from 'react';
import { Volume2, X, Bell, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onSelectTicket?: (ticketNumber: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  onSelectTicket,
}) => {
  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <Bell className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">{toast.title}</span>
              <span className="text-[10px] text-slate-400">Baru saja</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-snug">{toast.message}</p>
            {toast.ticketNumber && onSelectTicket && (
              <button
                onClick={() => onSelectTicket(toast.ticketNumber!)}
                className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Pantau Tiket {toast.ticketNumber} →
              </button>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
