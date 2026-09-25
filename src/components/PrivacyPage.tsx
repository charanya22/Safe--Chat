import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  EyeOff,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  HeartHandshake,
  Download,
} from 'lucide-react';
import { sanitizeMessageContent } from '../lib/privacyFilter';

export const PrivacyPage: React.FC = () => {
  const [testInput, setTestInput] = useState<string>(
    'Hey Maya, call my private cell at 555-019-4821 or meet me after basketball practice at 742 Evergreen Terrace. Do not tell your mom Priya!'
  );
  const [childName, setChildName] = useState<string>('Maya');
  const [contactName, setContactName] = useState<string>('Alex');

  // Real-time PII Scrubbing Result
  const scrubbedResult = sanitizeMessageContent(testInput, childName, contactName);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Privacy & Architecture Guarantee</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-emerald-200">
              Zero Raw Messages Collected
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Privacy-Preserving Child Safety
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            SafeChat was engineered around a simple truth: surveillance damages parental trust. We protect children from severe threats—grooming, sextortion, and cyberbullying—without recording or exposing their private personal conversations.
          </p>
        </div>
      </div>

      {/* Public Demo Transparency Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="text-xs">
            <h2 className="text-sm font-bold text-amber-950">
              Public Demo Disclosure: What Information Does This Demo Use?
            </h2>
            <div className="mt-1 text-amber-900/90 leading-relaxed space-y-1.5">
              <p>
                <strong>100% Fictional Data:</strong> Every profile (Aarav, Maya, Ethan, Sara, Liam), scenario, and dialogue in this public portfolio demo is completely fictional and synthetically generated.
              </p>
              <p>
                <strong>No Real Personal Data:</strong> SafeChat does not record or collect any real children&apos;s messages, photos, phone numbers, or account credentials.
              </p>
              <p>
                <strong>No Mandatory Account Sign-In:</strong> Visitors can explore the family dashboard, test simulation scenarios, and inspect threat reports without signing in or submitting personal credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3">
              <EyeOff className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              1. Zero-Voyeurism Architecture
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Traditional parental spyware uploads every private diary message, intimate selfie, and homework chat to parent dashboards. SafeChat discards raw messages, evaluating only synthesized behavioral risk signals.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Children maintain digital autonomy and privacy
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              2. On-Device PII Scrubbing
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Before any behavioral pattern evaluation is run, a client-side filter scrubs addresses, phone numbers, school references, and private credentials into anonymized tokens.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Personal identifiers never reach cloud storage
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              3. Non-Confrontational Guidance
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              When an alert is flagged, parents receive psychologist-crafted conversation scripts rather than accusatory logs. This preserves the bond of trust between parent and child.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Prevents punitive device confiscation
          </div>
        </div>
      </div>

      {/* Interactive PII Scrubber Playground */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Interactive PII Scrubber Demonstration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type or edit text below to see how SafeChat strips personally identifiable information in real time
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100 self-start sm:self-auto">
            Live Interactive Filter
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="test-input-raw" className="font-semibold text-slate-700">
                Raw Input Message (Simulated Child Device):
              </label>
              <button
                type="button"
                onClick={() =>
                  setTestInput(
                    'Hey Maya, call my private cell at 555-019-4821 or meet me after basketball practice at 742 Evergreen Terrace. Do not tell your mom Priya!'
                  )
                }
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Reset Example
              </button>
            </div>

            <textarea
              id="test-input-raw"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-none transition"
              placeholder="Type any message containing phone numbers, addresses, or private names..."
            />

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() =>
                  setTestInput(
                    'My home address is 1044 Richmond Way and my phone is 202-555-0182.'
                  )
                }
                className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Address & Phone
              </button>
              <button
                type="button"
                onClick={() =>
                  setTestInput(
                    'Delete these texts! Switch to Snapchat @dark_viper right now.'
                  )
                }
                className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Secrecy & Handle
              </button>
            </div>
          </div>

          {/* Sanitized Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800">
                Sanitized Behavioral Vector (Sent to AI Engine):
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {scrubbedResult.redactedCount} Item(s) Scrubbed
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs font-mono text-emerald-950 min-h-[96px] leading-relaxed whitespace-pre-wrap">
              {scrubbedResult.sanitizedText}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-medium">Redacted tokens:</span>
              {scrubbedResult.piiItems.length === 0 ? (
                <span className="text-slate-400 italic">No PII items found in text</span>
              ) : (
                scrubbedResult.piiItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800"
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Standards Compliance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Compliance & Child Data Protection Standards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="font-bold text-slate-900 mb-1">COPPA Compliance</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Adheres strictly to the Children&apos;s Online Privacy Protection Act by avoiding persistent storage of children&apos;s personal identifying records.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="font-bold text-slate-900 mb-1">GDPR-K Children&apos;s Rights</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Honors Article 8 principles on data minimization, proportionate processing, and the child&apos;s right to digital confidentiality.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="font-bold text-slate-900 mb-1">Parental Revocation</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Parents retain 100% control to revoke device pairing, erase simulated telemetry, or disconnect devices with a single tap.
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Deliverables & Complete Project ZIP */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-600 text-white p-1">
              <Download className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Download Complete Portfolio Project (Offline / Local Run)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Download the entire updated source code archive (React + Express full-stack codebase) with all mock datasets, PII filters, threat detection algorithms, and documentation.
          </p>
        </div>

        <a
          href="/api/download-zip"
          download="safechat-portfolio-project.zip"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs transition shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4 text-indigo-300" />
          <span>Download Project ZIP</span>
        </a>
      </div>
    </div>
  );
};
