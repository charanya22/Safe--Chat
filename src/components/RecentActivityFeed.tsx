import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Radio,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { RecentActivityItem } from '../types';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
  onOpenIncident?: (incidentId: string) => void;
  onSelectChild?: (childId: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onOpenIncident,
  onSelectChild,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Radio className="h-4 w-4 text-indigo-600 animate-pulse" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Family Safety Activity
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous background telemetry stream across connected devices
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 self-start sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live Telemetry Active
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No recent activity logged yet. All systems syncing normally.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.slice(0, 6).map((item) => {
            const isAlert = item.type === 'alert';
            const isReviewed = item.type === 'reviewed';
            const isSync = item.type === 'sync';

            return (
              <div
                key={item.id}
                className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs mt-0.5 ${
                      isAlert && item.risk_level === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : isAlert
                        ? 'bg-amber-100 text-amber-700'
                        : isReviewed
                        ? 'bg-emerald-100 text-emerald-700'
                        : isSync
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isAlert ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : isReviewed ? (
                      <FileCheck className="h-4 w-4" />
                    ) : isSync ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-slate-400">•</span>
                      <button
                        onClick={() => onSelectChild && onSelectChild(item.child_id)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {item.child_name}
                      </button>
                      {item.risk_level && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.risk_level === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.risk_level === 'HIGH'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.incident_id && onOpenIncident && (
                    <button
                      onClick={() => onOpenIncident(item.incident_id!)}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
