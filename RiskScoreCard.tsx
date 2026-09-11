import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { RiskCategoryScore, RiskLevel } from '../types';

interface RiskScoreCardProps {
  score: number;
  level: RiskLevel;
  confidence: number;
  primaryConcern: string;
  categories: RiskCategoryScore[];
  childName: string;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score,
  level,
  confidence,
  primaryConcern,
  categories,
  childName,
}) => {
  const getBadgeConfig = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL RISK',
          color: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
          dot: 'bg-red-600',
          progressColor: 'bg-red-600',
          textColor: 'text-red-700',
        };
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          color: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
          dot: 'bg-rose-600',
          progressColor: 'bg-rose-600',
          textColor: 'text-rose-700',
        };
      case 'MEDIUM':
        return {
          label: 'MODERATE RISK',
          color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
          dot: 'bg-amber-500',
          progressColor: 'bg-amber-500',
          textColor: 'text-amber-700',
        };
      case 'LOW':
      default:
        return {
          label: 'NORMAL / SAFE',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
          dot: 'bg-emerald-500',
          progressColor: 'bg-emerald-600',
          textColor: 'text-emerald-700',
        };
    }
  };

  const badge = getBadgeConfig(level);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Child Safety Status
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Protected Account: <span className="text-indigo-600 font-bold">{childName}</span>
            </h3>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${badge.color}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dot} animate-pulse`} />
            {badge.label}
          </div>
        </div>

        {/* Big Score Visual */}
        <div className="my-5 flex items-center gap-6">
          <div className="relative flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-50 border border-slate-200">
            <span className={`text-3xl font-extrabold tracking-tight ${badge.textColor}`}>
              {score}
            </span>
            <span className="text-[10px] font-medium text-slate-400">/ 100</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">Primary Flag</div>
            <div className="text-base font-bold text-slate-900 line-clamp-1">{primaryConcern}</div>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Info className="h-3 w-3" />
                AI Confidence:
              </span>
              <span className="font-semibold text-slate-900">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* 5-Category Risk Breakdown Bars */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Behavioral Risk Breakdown
          </div>

          <div className="space-y-2.5">
            {categories.map((cat) => {
              const catBadge = getBadgeConfig(
                cat.score >= 70 ? 'CRITICAL' : cat.score >= 45 ? 'HIGH' : cat.score >= 25 ? 'MEDIUM' : 'LOW'
              );

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      {cat.score >= 50 && (
                        <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                      )}
                      {cat.name}
                    </span>
                    <span className="font-semibold text-slate-900">{cat.score}%</span>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${catBadge.progressColor}`}
                      style={{ width: `${Math.max(3, cat.score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Safety Assurance Note */}
      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-900">Privacy Notice: </span>
        Raw chat text is never displayed on this dashboard. Only synthetic behavioral risk metrics are exposed.
      </div>
    </div>
  );
};
