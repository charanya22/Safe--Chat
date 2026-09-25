import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Lock,
  MessageSquare,
  Flame,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ChildProfile, RiskLevel } from '../types';
import { DEMO_SCENARIOS } from '../data/scenarios';

interface ScenarioSimulatorProps {
  childrenList: ChildProfile[];
  onScenarioCompleted: (incidentId?: string) => void;
  onOpenIncident?: (incidentId: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToHistory?: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  childrenList,
  onScenarioCompleted,
  onOpenIncident,
  onNavigateToDashboard,
  onNavigateToHistory,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('grooming');
  const [targetChildId, setTargetChildId] = useState<string>(
    childrenList[0]?.id || 'child_aarav_01'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStage, setSimulationStage] = useState<number>(0);
  const [lastGeneratedIncident, setLastGeneratedIncident] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedScenario =
    DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
  const targetChild =
    childrenList.find((c) => c.id === targetChildId) || childrenList[0];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationStage(1);
    setLastGeneratedIncident(null);
    setSuccessMessage(null);

    // Progressive simulated telemetry steps for engaging visual feedback
    const timer1 = setTimeout(() => setSimulationStage(2), 500);
    const timer2 = setTimeout(() => setSimulationStage(3), 1100);

    try {
      const res = await fetch(`/api/scenarios/${selectedScenario.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: targetChild?.id,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsSimulating(false);
        setSimulationStage(4);
        if (data.incident) {
          setLastGeneratedIncident(data.incident);
          setSuccessMessage(
            `Safety alert successfully created for ${targetChild?.full_name}! Risk score updated to ${data.scenario.risk_score}/100.`
          );
        } else {
          setSuccessMessage(
            `Normal interaction simulated for ${targetChild?.full_name}. Child safety status confirmed as Safe.`
          );
        }
        onScenarioCompleted(data.incident?.id);
      }, 1600);
    } catch (err) {
      console.error('Scenario simulation failed:', err);
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-7 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/30">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                <span>Interactive Safety Simulator</span>
              </span>
              <span className="text-xs text-indigo-300">•</span>
              <span className="text-xs font-medium text-indigo-200">
                100% Synthetic Fictional Scenarios
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Simulate Child Safety Scenarios
            </h1>

            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
              Experience SafeChat&apos;s privacy-first detection engine in real time. Choose a scenario below, run the simulation, and observe how the dashboard, risk score, and parental recommendations update instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-indigo-700/50 bg-indigo-950/60 p-4 text-xs">
              <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero Data Collection</span>
              </div>
              <p className="text-slate-300 text-[11px] max-w-xs leading-relaxed">
                All scenarios run on predefined, synthetic dialogues. No real children&apos;s data or external apps are touched.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Step 1: Choose a Fictional Safety Scenario
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DEMO_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            const isCritical = scen.risk_level === 'CRITICAL';
            const isHigh = scen.risk_level === 'HIGH';
            const isLow = scen.risk_level === 'LOW';

            return (
              <button
                key={scen.id}
                id={`btn-scenario-${scen.id}`}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  setSuccessMessage(null);
                  setLastGeneratedIncident(null);
                }}
                className={`text-left rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-600/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isHigh
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {scen.risk_level} • {scen.risk_score}/100
                    </span>

                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {scen.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {scen.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{scen.contact_tag}</span>
                  <span>{scen.timeframe}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Scenario Deep-Dive & Target Child Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenario Details & Message Timeline */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Scenario Dialogue & Behavioral Signals
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      selectedScenario.risk_level === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedScenario.risk_level === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedScenario.risk_level} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sender: <strong className="text-slate-800">{selectedScenario.contact_name}</strong> •{' '}
                  {selectedScenario.timeframe}
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {selectedScenario.messages.length} messages in scenario
              </div>
            </div>

            {/* Message Excerpt Stream */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedScenario.messages.map((msg) => {
                const isContact = msg.sender === 'contact' || msg.sender === 'peer';
                const hasSignal = !!msg.concerningSignal;

                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-3 text-xs border transition ${
                      hasSignal
                        ? 'border-rose-200 bg-rose-50/50'
                        : isContact
                        ? 'border-slate-200 bg-slate-50/80'
                        : 'border-indigo-100 bg-indigo-50/40 ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-900">
                        {msg.displayName}
                        {!isContact && ' (Child)'}
                      </span>
                      <span className="text-slate-400">{msg.timestamp}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                      &ldquo;{msg.text}&rdquo;
                    </p>

                    {hasSignal && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md inline-flex">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Behavioral Flag: {msg.concerningSignal}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              SafeChat privacy guarantee: Raw messages are masked locally. Parents receive behavioral summaries and guidance.
            </span>
          </div>
        </div>

        {/* Right: Simulation Controls & Trigger */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Step 2: Assign Child Profile & Run
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Simulate Scenario for Child:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {childrenList.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setTargetChildId(child.id)}
                    className={`rounded-xl border p-2.5 text-left transition flex items-center gap-2.5 ${
                      targetChildId === child.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={child.avatar_url}
                      alt={child.full_name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {child.full_name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500">{child.age} yrs</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expected AI Output Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
              <div className="font-bold text-slate-900 text-xs">
                Expected Safety Evaluation:
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Primary Concern:</span>
                <span className="font-bold text-slate-800">
                  {selectedScenario.benchmarkAnalysis.primary_concern}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Predicted Risk Score:</span>
                <span
                  className={`font-bold ${
                    selectedScenario.risk_level === 'CRITICAL'
                      ? 'text-rose-600'
                      : selectedScenario.risk_level === 'HIGH'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {selectedScenario.risk_score} / 100 ({selectedScenario.risk_level})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Parental Guidance:</span>
                <span className="font-bold text-slate-800">
                  {selectedScenario.benchmarkAnalysis.recommended_parent_action.length} Action Step(s)
                </span>
              </div>
            </div>

            {/* In-Flight Simulation Progress */}
            {isSimulating && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Processing Privacy & Threat Pipeline...</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-2 ${
                      simulationStage >= 1 ? 'text-indigo-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>1. On-device local PII redaction</span>
                    {simulationStage >= 2 && <Check className="h-3 w-3 text-emerald-600" />}
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      simulationStage >= 2 ? 'text-indigo-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>2. Multi-tier behavioral pattern classification</span>
                    {simulationStage >= 3 && <Check className="h-3 w-3 text-emerald-600" />}
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      simulationStage >= 3 ? 'text-indigo-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>3. Synthesizing psychologist parent guidance scripts</span>
                    {simulationStage >= 4 && <Check className="h-3 w-3 text-emerald-600" />}
                  </div>
                </div>
              </div>
            )}

            {/* Success Results Banner */}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Simulation Complete!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed mb-3">
                  {successMessage}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200/80">
                  {lastGeneratedIncident && onOpenIncident && (
                    <button
                      onClick={() => onOpenIncident(lastGeneratedIncident.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-500 transition"
                    >
                      <Flame className="h-3 w-3" />
                      <span>Inspect Threat Evidence & Review &rarr;</span>
                    </button>
                  )}

                  {onNavigateToDashboard && (
                    <button
                      onClick={onNavigateToDashboard}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
                    >
                      <span>View Family Dashboard</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}

                  {onNavigateToHistory && (
                    <button
                      onClick={onNavigateToHistory}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>Find in History</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              id="btn-run-simulation-trigger"
              disabled={isSimulating}
              onClick={handleRunSimulation}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running Simulation Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Run Scenario on {targetChild?.full_name.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
