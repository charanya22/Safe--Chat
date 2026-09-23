import React from 'react';
import { TrendingUp, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { EscalationDataPoint, RiskLevel } from './types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface PatternTimelineProps {
  timeline: EscalationDataPoint[];
  hasEscalated: boolean;
  percentageIncrease: number;
  trendDescription: string;
}

export const PatternTimeline: React.FC<PatternTimelineProps> = ({
  timeline,
  hasEscalated,
  percentageIncrease,
  trendDescription,
}) => {
  const getDotStyle = (severity: RiskLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-100 text-red-700';
      case 'HIGH':
        return 'border-rose-500 bg-rose-100 text-rose-700';
      case 'MEDIUM':
        return 'border-amber-500 bg-amber-100 text-amber-700';
      case 'LOW':
      default:
        return 'border-emerald-500 bg-emerald-100 text-emerald-700';
    }
  };

  const getBadgeStyle = (severity: RiskLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        {/* Header with Escalation Highlight */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pattern Escalation Analysis
            </div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-500" />
              Conversation Risk Timeline
            </h3>
          </div>

          {hasEscalated && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
              <TrendingUp className="h-3.5 w-3.5" />
              Risk Increased +{percentageIncrease}%
            </div>
          )}
        </div>

        {/* Narrative Callout */}
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
          <p className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900">Why Pattern Detection Matters: </strong>
              {trendDescription} Individual messages often bypass simple keyword filters, but sequential behavioral changes over time surface critical threats early.
            </span>
          </p>
        </div>

        {/* Recharts Escalation Curve */}
        <div className="mt-4 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="riskAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EscalationDataPoint;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-md">
                        <div className="font-bold text-slate-900">{data.day}</div>
                        <div className="text-rose-600 font-semibold">Risk Score: {data.score}/100</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{data.label}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#e11d48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#riskAreaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chronological Milestone List */}
        <div className="mt-4 space-y-2">
          {timeline.map((point, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${getDotStyle(
                    point.severity
                  )}`}
                >
                  {point.dayNumber || index + 1}
                </span>
                <div>
                  <span className="font-semibold text-slate-900">{point.day}: </span>
                  <span className="text-slate-600">{point.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {point.triggerEvent && (
                  <span className="hidden text-[10px] text-slate-500 italic md:inline">
                    &ldquo;{point.triggerEvent}&rdquo;
                  </span>
                )}
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getBadgeStyle(
                    point.severity
                  )}`}
                >
                  {point.score}% {point.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stat */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>Monitored Window: {timeline.length} Observation Checkpoints</span>
        <span className="font-medium text-slate-700 flex items-center gap-1">
          Escalation Index Verified <ArrowUpRight className="h-3 w-3 text-rose-500" />
        </span>
      </div>
    </div>
  );
};
