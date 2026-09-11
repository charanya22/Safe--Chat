import React from 'react';
import { Shield, Sparkles, Network, Play, EyeOff } from 'lucide-react';

interface HeaderProps {
  onOpenDemo: () => void;
  onOpenArchitecture: () => void;
  onOpenCustomChat: () => void;
  isAnalyzing: boolean;
  isLiveGemini?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemo,
  onOpenArchitecture,
  onOpenCustomChat,
  isAnalyzing,
  isLiveGemini = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
            <Shield className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">SafeChat AI</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                <EyeOff className="h-3 w-3" />
                Privacy-Preserving
              </span>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10 sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                {isLiveGemini ? 'Gemini 3.8 Flash' : 'Pattern Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              &ldquo;We don&apos;t monitor every message. We monitor the patterns that matter.&rdquo;
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-custom-chat"
            onClick={onOpenCustomChat}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 md:inline-flex"
            title="Type or paste custom conversation to test AI"
          >
            Custom Chat Test
          </button>

          <button
            id="btn-view-architecture"
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="View system architecture and judges pitch summary"
          >
            <Network className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          <button
            id="btn-trigger-30s-demo"
            onClick={onOpenDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>30s Judge Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
