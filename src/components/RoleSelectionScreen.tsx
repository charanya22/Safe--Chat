import React from 'react';
import { Smartphone, ArrowRight, Lock, Users, Sparkles, ExternalLink } from 'lucide-react';
import { SafeChatLogo } from './SafeChatLogo';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'parent' | 'child') => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  const handleOpenChildNewTab = () => {
    onSelectRole('child');
  };

  const handleOpenParentNewTab = () => {
    onSelectRole('parent');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Brand */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <SafeChatLogo size={56} variant="light" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm mb-3">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Parent–Child Device Pairing & Behavioral Shield</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          SafeChat
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal">
          Safe conversations. Safer families.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="mx-auto max-w-3xl w-full my-8">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Select Your Role to Continue
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Parent Portal Card */}
          <div
            id="role-card-parent"
            onClick={() => onSelectRole('parent')}
            className="group relative cursor-pointer rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md transition-all duration-200 hover:border-indigo-500 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md mb-5 group-hover:scale-105 transition">
                <Users className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                Parent or Guardian
              </span>
              <h2 className="text-xl font-bold text-white mb-2">
                Parent Dashboard
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Monitor behavioral risk patterns, generate 6-digit child device pairing codes, review safety insights, and manage multi-child protection.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Pair & activate multiple child devices
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Zero-raw-message privacy protection
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Real-time threat alerts & pattern engine
                </li>
              </ul>
            </div>

            <button
              id="btn-select-parent-role"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 group-hover:shadow-indigo-500/25"
            >
              <span>Enter as Parent</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Child Device Card */}
          <div
            id="role-card-child"
            onClick={() => onSelectRole('child')}
            className="group relative cursor-pointer rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md transition-all duration-200 hover:border-emerald-500 hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md mb-5 group-hover:scale-105 transition">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Child Device
              </span>
              <h2 className="text-xl font-bold text-white mb-2">
                Child Protection Mode
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Connect your phone or tablet to your parent's SafeChat account with a 6-digit code to activate background protection.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Simple 6-digit pairing activation
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Controlled SafeChat chat environment
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Live connection & protection status
                </li>
              </ul>
            </div>

            <button
              id="btn-select-child-role"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 group-hover:shadow-emerald-500/25"
            >
              <span>Connect Child Device</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Cross-Device / 2-Tab Testing Helper */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <p className="text-xs text-slate-400 mb-2">
            💡 <strong className="text-slate-200">Testing two devices or tabs?</strong> Open one tab as Parent and another as Child to see instant realtime pairing and alerts:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleOpenParentNewTab}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              <span>Open Parent in New Tab</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </button>
            <button
              onClick={handleOpenChildNewTab}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-slate-700 transition"
            >
              <span>Open Child in New Tab</span>
              <ExternalLink className="h-3 w-3 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Privacy Note */}
      <div className="mx-auto max-w-xl text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>SafeChat never secretly monitors third-party apps. SafeChat uses its own controlled child environment.</span>
        </div>
      </div>
    </div>
  );
};
