import React, { useState } from 'react';
import { MessageSquare, Copy, Check, PhoneCall, HeartHandshake, ShieldCheck } from 'lucide-react';
import { ParentActionRecommendation } from './types';

interface RecommendedActionsProps {
  recommendations: ParentActionRecommendation[];
  childName: string;
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({
  recommendations,
  childName,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Decision Support
          </div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
            Recommended Parental Actions
          </h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          Trust-First Guidance
        </span>
      </div>

      {/* Action Cards */}
      <div className="mt-4 space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    rec.priority === 'urgent'
                      ? 'bg-rose-600'
                      : rec.priority === 'important'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-slate-900">{rec.title}</span>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  rec.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : rec.priority === 'important'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {rec.priority}
              </span>
            </div>

            <p className="mt-2 text-slate-600 leading-relaxed">{rec.advice}</p>

            {/* Conversation Starter with Copy Action */}
            {rec.conversationStarter && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2 pb-1.5">
                  <span className="text-[11px] font-semibold text-indigo-900 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-indigo-600" />
                    Recommended Conversation Starter:
                  </span>
                  <button
                    onClick={() => handleCopy(rec.id, rec.conversationStarter)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                    title="Copy conversation starter"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-700 italic leading-relaxed text-[11.5px]">
                  {rec.conversationStarter}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Support & Hotlines Strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 p-3 text-xs text-white">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-emerald-400" />
          <span className="font-medium">National Child Safety Helpline (NCMEC):</span>
          <span className="font-mono text-emerald-300 font-bold">1-800-843-5678</span>
        </div>
        <span className="text-[11px] text-slate-400">
          24/7 Confidential Child Exploitation Support & Guidance
        </span>
      </div>
    </div>
  );
};
