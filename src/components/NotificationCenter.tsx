import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCheck,
  Clock,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { ParentNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ParentNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectChild: (childId: string) => void;
  onOpenIncident?: (incidentId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectChild,
  onOpenIncident,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Safety Alerts</h3>
              <p className="text-xs text-slate-500">
                {notifications.filter((n) => !n.is_read).length} unread safety notifications
              </p>
            </div>
          </div>

          <button
            id="btn-close-notifications"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No safety notifications at this time. All child interactions are within normal parameters.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                id={`notif-item-${notif.id}`}
                onClick={() => {
                  onMarkRead(notif.id);
                  if (notif.incident_id && onOpenIncident) {
                    onOpenIncident(notif.incident_id);
                  } else {
                    onSelectChild(notif.child_id);
                  }
                  onClose();
                }}
                className={`cursor-pointer rounded-xl border p-4 transition text-xs relative ${
                  notif.is_read
                    ? 'border-slate-200 bg-white hover:bg-slate-50'
                    : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
                }`}
              >
                {!notif.is_read && (
                  <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-200" />
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      notif.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : notif.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {notif.severity} ALERT
                  </span>
                  <span className="font-semibold text-slate-800">{notif.child_name}</span>
                </div>

                <div className="font-bold text-slate-900 mb-1">{notif.title}</div>
                <p className="text-slate-600 leading-relaxed text-[11px] mb-2">{notif.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Inspect Threat Pattern & Dialogue &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Threatening chats revealed to parents (PII scrubbed)</span>
          </div>

          <button
            id="btn-mark-all-read"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>
    </div>
  );
};
