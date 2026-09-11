import React from 'react';
import { ShieldCheck, Lock, UserX, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { PrivacyMetrics } from '../types';

interface PrivacyBannerProps {
  metrics: PrivacyMetrics;
  showPrivacyModal: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({
  metrics,
  showPrivacyModal,
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        {/* Left: Philosophy & Value Proposition */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Privacy-Preserving Safety Guarantee
            </h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Active Protection
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl">
            {metrics.parentGuarantee}
          </p>
        </div>

        {/* Right: 4-Pillar Privacy Status Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {/* Item 1 */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Message Storage</div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                OFF <span className="text-[10px] font-normal text-emerald-600">(Ephemeral)</span>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <UserX className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">PII & Names</div>
              <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                REMOVED <span className="text-[10px] font-normal text-indigo-600">({metrics.piiItemsRedacted} scrubbed)</span>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <EyeOff className="h-4 w-4 text-rose-600 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Parent Sees Raw Text</div>
              <div className="text-xs font-bold text-rose-900">
                NO <span className="text-[10px] font-normal text-slate-500">(Private)</span>
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">AI Risk Summary</div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                YES <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
