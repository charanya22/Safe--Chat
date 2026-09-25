import React from 'react';
import { HelpCircle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { BehavioralPattern } from '../types';

interface ExplainableAIProps {
  patterns: BehavioralPattern[];
  whyFlagged: string[];
  evidenceSummary: string;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({
  patterns,
  whyFlagged,
  evidenceSummary,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Explainable AI Reasoning
          </div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-indigo-600" />
            Why Was This Flagged?
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
          Transparent Inference
        </span>
      </div>

      {/* Summary Narrative */}
      <div className="mt-4 rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100 text-xs text-slate-700">
        <div className="font-semibold text-indigo-950 mb-1 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-indigo-600" />
          AI Synthesis Summary
        </div>
        <p className="leading-relaxed">{evidenceSummary}</p>
      </div>

      {/* Flagged Signals Checklist */}
      <div className="mt-4 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Identified Safety Markers
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {whyFlagged.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-800"
            >
              <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Behavioral Pattern Cards */}
      {patterns.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Detected Behavioral Modalities ({patterns.length})
          </div>

          <div className="space-y-2.5">
            {patterns.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
                      !
                    </span>
                    <span className="font-bold text-slate-900">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Confidence: {p.confidence}%</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        p.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : p.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.severity}
                    </span>
                  </div>
                </div>

                <p className="mt-1.5 text-slate-600 leading-relaxed">{p.description}</p>

                <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600 border border-slate-100">
                  <span>
                    <strong className="text-slate-700">Signal: </strong> {p.detail}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] shrink-0">{p.firstObservedDay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responsible AI Disclaimer (Prompt Section 13) */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] text-amber-900">
        <p className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Responsible AI Notice: </strong>
            SafeChat AI identifies behavioral patterns associated with potential online safety risks. The system is an early-warning and decision-support tool, not a replacement for parental judgment or professional intervention.
          </span>
        </p>
      </div>
    </div>
  );
};
