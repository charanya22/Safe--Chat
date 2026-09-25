import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Lock,
  MessageSquare,
  AlertTriangle,
  Radio,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Plus,
  MessageSquarePlus,
  Layers,
  Sparkles,
  Info,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChildProfile, RiskConcentrationItem, RiskLevel, ChildIncident, RecentActivityItem } from '../types';
import { RecentActivityFeed } from './RecentActivityFeed';

interface FamilyOverviewProps {
  childrenList: ChildProfile[];
  onSelectChild: (childId: string) => void;
  onOpenDeviceSimulator: () => void;
  onOpenIncident?: (incidentId: string) => void;
  onOpenAddChildModal?: () => void;
  onOpenCreateTestConversation?: () => void;
  onOpenSimulator?: () => void;
  onOpenHistory?: () => void;
  onRefreshData?: () => void;
}

const PLATFORM_COLORS = ['#6366f1', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6'];

export const FamilyOverview: React.FC<FamilyOverviewProps> = ({
  childrenList,
  onSelectChild,
  onOpenDeviceSimulator,
  onOpenIncident,
  onOpenAddChildModal,
  onOpenCreateTestConversation,
  onOpenSimulator,
  onOpenHistory,
  onRefreshData,
}) => {
  const [riskConcentration, setRiskConcentration] = useState<{
    total_incidents: number;
    sources: RiskConcentrationItem[];
    primary_source: string;
  } | null>(null);

  const [activeAlerts, setActiveAlerts] = useState<ChildIncident[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [reviewingAlertId, setReviewingAlertId] = useState<string | null>(null);

  const fetchFamilyAlertsAndActivity = async () => {
    try {
      const [incRes, actRes] = await Promise.all([
        fetch('/api/incidents?status=open'),
        fetch('/api/activity'),
      ]);
      if (incRes.ok) {
        const incData = await incRes.json();
        setActiveAlerts(incData);
      }
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }
    } catch (e) {
      console.error('Failed to load active alerts or activity:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchConcentration = async () => {
      try {
        const res = await fetch('/api/analytics/risk-concentration');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRiskConcentration(data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch risk concentration:', e);
      }
    };
    fetchConcentration();
    fetchFamilyAlertsAndActivity();
    return () => {
      isMounted = false;
    };
  }, [childrenList]);

  const handleReviewAlert = async (incidentId: string) => {
    setReviewingAlertId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/review`, {
        method: 'POST',
      });
      if (res.ok) {
        setActiveAlerts((prev) => prev.filter((i) => i.id !== incidentId));
        fetchFamilyAlertsAndActivity();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to review alert:', err);
    } finally {
      setReviewingAlertId(null);
    }
  };

  const handleQuickRunScenario = async (scenarioId: string) => {
    setRunningScenario(scenarioId);
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchFamilyAlertsAndActivity();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to run scenario:', err);
    } finally {
      setRunningScenario(null);
    }
  };

  const attentionCount = childrenList.filter(
    (c) => c.safety_status === 'Attention Needed' || c.safety_status === 'Critical'
  ).length;

  const familyStatusLabel = attentionCount > 0 ? 'Attention Needed' : 'Good';
  const isFamilyGood = attentionCount === 0;

  // Fallback dynamic calculation if backend not yet loaded
  const dynamicRiskSources: RiskConcentrationItem[] = riskConcentration?.sources?.length
    ? riskConcentration.sources
    : (() => {
        const categories: Record<string, { display_name: string; count: number; max_severity: RiskLevel }> = {
          gaming: { display_name: 'Gaming', count: 0, max_severity: 'LOW' },
          unknown_contacts: { display_name: 'Unknown Contacts', count: 0, max_severity: 'LOW' },
          school_group: { display_name: 'School Group', count: 0, max_severity: 'LOW' },
          messaging: { display_name: 'Direct Messages', count: 0, max_severity: 'LOW' },
        };

        let total = 0;
        childrenList.forEach((child) => {
          if (child.safety_status === 'Critical' || child.safety_status === 'Attention Needed') {
            total += 2;
            categories.gaming.count += 1;
            categories.gaming.max_severity = 'HIGH';
            categories.school_group.count += 1;
            categories.school_group.max_severity = 'CRITICAL';
          }
        });

        if (total === 0) {
          total = 4;
          categories.gaming.count = 2;
          categories.unknown_contacts.count = 1;
          categories.school_group.count = 1;
        }

        return Object.entries(categories).map(([key, item]) => ({
          source: key,
          display_name: item.display_name,
          incidents_count: item.count,
          percentage: Math.round((item.count / total) * 100),
          risk_level: item.max_severity,
          description: `${item.count} activity pattern${item.count !== 1 ? 's' : ''}`,
        })).sort((a, b) => b.percentage - a.percentage);
      })();

  // Family Risk by Child dataset
  const familyRiskData = childrenList.map((c) => ({
    name: c.full_name.split(' ')[0],
    riskScore: c.overall_risk_score,
    groomingRisk: c.id === 'child_aarav_01' ? 91 : c.id === 'child_ananya_02' ? 5 : 8,
    bullyingRisk: c.id === 'child_aarav_01' ? 78 : c.id === 'child_ananya_02' ? 12 : 15,
    threatsRisk: c.id === 'child_aarav_01' ? 85 : c.id === 'child_ananya_02' ? 0 : 0,
  }));

  // Platform exposure breakdown dynamically calculated
  const platformRiskDistribution = dynamicRiskSources.map((item, idx) => ({
    name: item.display_name,
    value: item.percentage,
    incidents: item.incidents_count,
    color: PLATFORM_COLORS[idx % PLATFORM_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* PUBLIC DEMO PORTFOLIO NOTICE BANNER */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  SafeChat Interactive Portfolio Demo
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Open Public Access
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Simulated environment with fictional child profiles. Test multi-stage threat detection without signing in or collecting real messages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onOpenSimulator && (
              <button
                id="btn-open-simulator-hero"
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Scenario Simulator &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick 1-Click Scenario Runner Bar */}
        <div className="mt-3 pt-3 border-t border-indigo-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 text-[11px]">⚡ Quick Test a Scenario:</span>
          <button
            id="quick-scenario-grooming"
            onClick={() => handleQuickRunScenario('grooming')}
            disabled={runningScenario !== null}
            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'grooming' ? 'Simulating...' : '1. Grooming & Isolation (Aarav)'}
          </button>
          <button
            id="quick-scenario-cyberbullying"
            onClick={() => handleQuickRunScenario('cyberbullying')}
            disabled={runningScenario !== null}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'cyberbullying' ? 'Simulating...' : '2. Cyberbullying & Exclusion'}
          </button>
          <button
            id="quick-scenario-threats"
            onClick={() => handleQuickRunScenario('threats')}
            disabled={runningScenario !== null}
            className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'threats' ? 'Simulating...' : '3. Extortion & Threats'}
          </button>
          <button
            id="quick-scenario-normal"
            onClick={() => handleQuickRunScenario('normal')}
            disabled={runningScenario !== null}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
          >
            {runningScenario === 'normal' ? 'Simulating...' : '4. Normal Homework Chat'}
          </button>
        </div>
      </div>

      {/* 3. SIMPLIFIED "FAMILY SAFETY STATUS" BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isFamilyGood
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                  : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'
              }`}>
                <Radio className={`h-3 w-3 ${isFamilyGood ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />
                <span>Family Safety Status</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">Live Continuous Protection</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Family Safety
            </h1>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isFamilyGood ? (
                <span>
                  All <strong className="font-semibold text-slate-900">{childrenList.length} children</strong> are protected within safe thresholds. No immediate action is required.
                </span>
              ) : (
                <span>
                  Attention recommended for <strong className="font-semibold text-amber-700">{attentionCount} of your {childrenList.length} children</strong>. SafeChat flagged safety concerns for your review.
                </span>
              )}
            </p>

            {/* Quick, Simple Status Indicators for Parents */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold ${
                isFamilyGood
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {isFamilyGood ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span>Status: <strong className="underline decoration-2">{familyStatusLabel}</strong></span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200">
                <Smartphone className="h-4 w-4 text-indigo-600" />
                <span><strong className="text-slate-900 font-semibold">{childrenList.length}</strong> Children Protected</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-700 border border-indigo-100">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Shield: <strong className="font-semibold">Active</strong></span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-600 border border-slate-200">
                <Lock className="h-4 w-4 text-slate-500" />
                <span>Zero-Raw-Message Privacy</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            {onOpenCreateTestConversation && (
              <button
                id="btn-banner-create-test-conversation"
                onClick={onOpenCreateTestConversation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-sm transition"
                title="Create synthetic test conversation to test cyberbullying/threat detection"
              >
                <MessageSquarePlus className="h-4 w-4 text-amber-700" />
                <span>Test Conversation</span>
              </button>
            )}

            <button
              id="btn-simulate-child-device-banner"
              onClick={onOpenDeviceSimulator}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Smartphone className="h-4 w-4 text-indigo-600" />
              <span>Open Device Sim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Children Section */}
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Children
            </h2>
            <p className="text-xs text-slate-500">
              Select a child to inspect safety summaries, conversation channels, or parental advice
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateTestConversation && (
              <button
                id="btn-children-test-conversation"
                onClick={onOpenCreateTestConversation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-amber-600" />
                <span>Test Conversation</span>
              </button>
            )}

            {onOpenAddChildModal && (
              <button
                id="btn-children-header-add-child"
                onClick={onOpenAddChildModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                title="Pair another child's phone or tablet"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Child</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {childrenList.map((child) => {
            const isAlert = child.safety_status === 'Critical' || child.safety_status === 'Attention Needed';

            return (
              <div
                key={child.id}
                id={`card-child-${child.id}`}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition hover:shadow-md ${
                  isAlert
                    ? 'border-amber-200 ring-1 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header: Avatar, Name, Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={child.avatar_url}
                        alt={child.full_name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {child.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {child.age} yrs • {child.grade}
                        </p>
                      </div>
                    </div>

                    {isAlert ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <AlertTriangle className="h-3 w-3" />
                        {child.safety_status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Safe
                      </span>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {child.active_device?.device_name || 'Primary Device'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  {/* Stats & Behavioral Risk Snapshot */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        Monitored Channels:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {child.conversations_count} Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        {isAlert ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        Active Safety Alerts:
                      </span>
                      <span
                        className={`font-semibold ${
                          child.open_incidents_count > 0 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {child.open_incidents_count > 0
                          ? `${child.open_incidents_count} Open Incident${
                              child.open_incidents_count > 1 ? 's' : ''
                            }`
                          : '0 Alerts (Normal)'}
                      </span>
                    </div>
                  </div>

                  {/* Recent Risk Summary if Alert */}
                  {isAlert && (
                    <div className="mt-4 rounded-xl bg-rose-50/70 p-3 border border-rose-100 text-xs text-rose-800">
                      <div className="font-semibold text-rose-900">Pattern Detected</div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Secrecy requests & intimidation detected in connected channels.
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {isAlert && onOpenIncident && (
                    <button
                      id={`btn-threat-pattern-${child.id}`}
                      onClick={() => {
                        const childIncident = activeAlerts.find((a) => a.child_id === child.id);
                        onOpenIncident(childIncident?.id || 'inc_aarav_01');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-sm transition cursor-pointer"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Inspect Threat Pattern Page &rarr;</span>
                    </button>
                  )}

                  <button
                    id={`btn-inspect-child-${child.id}`}
                    onClick={() => onSelectChild(child.id)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      isAlert
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    }`}
                  >
                    <span>Inspect Safety Dashboard</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE ALERTS SECTION WITH WORKING "MARK AS REVIEWED" BUTTON */}
      {activeAlerts.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Active Safety Alerts Requiring Parent Review ({activeAlerts.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                High-priority behavioral patterns flagged by SafeChat AI. Review recommendations and mark when addressed.
              </p>
            </div>

            {onOpenHistory && (
              <button
                id="btn-family-view-history"
                onClick={onOpenHistory}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto cursor-pointer"
              >
                View Full Alert History &rarr;
              </button>
            )}
          </div>

          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const child = childrenList.find((c) => c.id === alert.child_id);
              const isCritical = alert.risk_level === 'CRITICAL';

              return (
                <div
                  key={alert.id}
                  id={`active-alert-banner-${alert.id}`}
                  className={`rounded-xl border p-4.5 transition-all ${
                    isCritical
                      ? 'border-rose-200 bg-rose-50/40 ring-1 ring-rose-300/40'
                      : 'border-amber-200 bg-amber-50/40 ring-1 ring-amber-300/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {alert.risk_level} RISK • {alert.risk_score}/100
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {child?.full_name || 'Protected Child'}
                      </span>

                      <span className="text-xs text-slate-400">•</span>

                      <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200 uppercase">
                        {alert.source}
                      </span>

                      <span className="text-xs text-slate-500">
                        Contact: <strong>{alert.contact_name}</strong>
                      </span>
                    </div>

                    {/* Working "Mark as reviewed" button on every alert */}
                    <button
                      id={`btn-review-active-alert-${alert.id}`}
                      disabled={reviewingAlertId === alert.id}
                      onClick={() => handleReviewAlert(alert.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {reviewingAlertId === alert.id
                          ? 'Marking as reviewed...'
                          : 'Mark as reviewed'}
                      </span>
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-8">
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        {alert.primary_concern}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mb-0.5">
                        Observed Behavioral Pattern:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                        {alert.why_flagged.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="md:col-span-4 rounded-xl border border-indigo-100 bg-white p-3 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-indigo-950 mb-1">
                          Suggested Action Script:
                        </div>
                        <p className="text-slate-600 text-[11px] italic leading-relaxed">
                          &ldquo;{alert.recommended_actions?.[0]?.conversationStarter ||
                            alert.recommended_actions?.[0]?.advice ||
                            'Check in with your child supportively.'}&rdquo;
                        </p>
                      </div>

                      {onOpenIncident && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onOpenIncident(alert.id)}
                            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Flame className="h-3.5 w-3.5 text-rose-600" />
                            <span>Inspect Threat Evidence &rarr;</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY FEED */}
      <RecentActivityFeed
        activities={activities}
        onOpenIncident={onOpenIncident}
        onSelectChild={onSelectChild}
      />

      {/* 4. FAMILY PROTECTION ENGINE WITH DYNAMIC RISK CONCENTRATION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Family Protection Engine
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Automated behavioral risk metrics, source channels, and dynamic risk concentration
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            Real-time Continuous Protection
          </span>
        </div>

        {/* RISK CONCENTRATION SUB-SECTION */}
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/30 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Risk Concentration
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of where safety concerns are concentrated across monitored channels.
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              Calculated Dynamically from Active Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dynamicRiskSources.map((item) => {
              const severityColor =
                item.risk_level === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : item.risk_level === 'HIGH'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : item.risk_level === 'MEDIUM'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200';

              const barColor =
                item.risk_level === 'CRITICAL'
                  ? 'bg-rose-500'
                  : item.risk_level === 'HIGH'
                  ? 'bg-amber-500'
                  : item.risk_level === 'MEDIUM'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500';

              return (
                <div
                  key={item.source}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900">{item.display_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor}`}>
                        {item.risk_level}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {item.percentage}%
                      </span>
                      <span className="text-xs text-slate-500">concentration</span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Incidents: <strong className="text-slate-800">{item.incidents_count}</strong></span>
                    <span>{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Multi-Child Risk Exposure Bar Chart */}
          <div className="lg:col-span-7 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Behavioral Vectors by Child
              </span>
              <span className="text-[11px] text-slate-400">Score / 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Comparing Grooming, Bullying, and Threat indicators across Aarav, Ananya, and Rahul.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={familyRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                            <div className="font-bold text-slate-900">{d.name}</div>
                            <div className="text-rose-600">Grooming: {d.groomingRisk}</div>
                            <div className="text-amber-600">Cyberbullying: {d.bullyingRisk}</div>
                            <div className="text-indigo-600">Threats: {d.threatsRisk}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="groomingRisk" name="Grooming" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bullyingRisk" name="Bullying" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threatsRisk" name="Threats" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Exposure Donut / Breakdown */}
          <div className="lg:col-span-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Risk Concentration by Platform
                </span>
                <span className="text-[11px] text-slate-400">All Devices</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Discord and Instagram represent 90% of flagged external interactions.
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformRiskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {platformRiskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}% of risk exposure`, 'Exposure']}
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
              {platformRiskDistribution.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-bold text-slate-900">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Architecture Guarantee Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              SafeChat Privacy-First Guarantee: How Your Child&apos;s Privacy is Protected
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-4xl">
              Unlike invasive surveillance software that exposes every personal text, photo, and diary message to parents, SafeChat uses local on-device filtering and privacy-preserving AI models.
              Private identifiers (addresses, phone numbers, personal credentials) are scrubbed before analysis.
              Parents receive actionable alerts explaining behavioral dynamics (grooming, extortion, bullying) without invading their child&apos;s trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
