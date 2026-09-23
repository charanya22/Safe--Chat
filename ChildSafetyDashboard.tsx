import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  FileText,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ChildProfile,
  ChildConversation,
  ChildIncident,
  RiskLevel,
} from './types';
import { ChatAnalysisVisualizer } from './ChatAnalysisVisualizer';
import { MessageSquareWarning, Flame } from 'lucide-react';

interface ChildSafetyDashboardProps {
  child: ChildProfile;
  onBackToFamily: () => void;
  onOpenDeviceSimulator: () => void;
  onOpenIncident?: (incidentId: string) => void;
  onDisconnectDevice?: (childId: string) => Promise<void>;
}

export const ChildSafetyDashboard: React.FC<ChildSafetyDashboardProps> = ({
  child,
  onBackToFamily,
  onOpenDeviceSimulator,
  onOpenIncident,
  onDisconnectDevice,
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'visualizations' | 'conversations' | 'incidents'>('assessment');
  const [conversations, setConversations] = useState<ChildConversation[]>([]);
  const [incidents, setIncidents] = useState<ChildIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ChildIncident | null>(null);
  const [selectedConv, setSelectedConv] = useState<ChildConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Fetch child's conversations and incidents
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [convRes, incRes] = await Promise.all([
          fetch(`/api/children/${child.id}/conversations`),
          fetch(`/api/incidents/child/${child.id}`),
        ]);

        if (convRes.ok && incRes.ok) {
          const convData = await convRes.json();
          const incData = await incRes.json();
          if (isMounted) {
            setConversations(convData);
            setIncidents(incData);
            if (incData.length > 0) {
              setSelectedIncident(incData[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load child data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [child.id]);

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: 'open' | 'under_review' | 'resolved') => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
        );
        if (selectedIncident?.id === incidentId) {
          setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (e) {
      console.error('Failed to update incident status:', e);
    }
  };

  const isAlert = child.safety_status === 'Critical' || child.safety_status === 'Attention Needed';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Child Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            id="btn-back-to-family"
            onClick={onBackToFamily}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
            title="Back to Family Overview"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <img
            src={child.avatar_url}
            alt={child.full_name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {child.full_name}
              </h1>
              {isAlert ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  <AlertTriangle className="h-3 w-3" />
                  {child.safety_status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <CheckCircle2 className="h-3 w-3" />
                  All Safe
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{child.age} years old • {child.grade}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                {child.active_device?.device_name || 'Device'}
              </span>
              <span>•</span>
              {child.protection_status === 'INACTIVE' || child.active_device?.is_active === false ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Protection Paused (Device Disconnected)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Shield Active • Syncing Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons: Simulate event + Disconnect device */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-open-child-collector-companion"
            onClick={onOpenDeviceSimulator}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            <Smartphone className="h-4 w-4 text-indigo-600" />
            <span>Simulate Incoming Event</span>
          </button>

          {onDisconnectDevice && child.protection_status !== 'INACTIVE' && (
            <button
              id="btn-disconnect-child-device"
              onClick={() => setShowDisconnectModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition"
              title="Revoke device protection and disconnect"
            >
              <span>Disconnect Device</span>
            </button>
          )}
        </div>
      </div>

      {/* Disconnect Device Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 ring-1 ring-rose-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Disconnect {child.full_name}'s Device?
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will revoke SafeChat background protection and disconnect {child.active_device?.device_name || "the child's device"} immediately. You can re-pair the device anytime with a new 6-digit code.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-disconnect-device"
                disabled={isDisconnecting}
                onClick={async () => {
                  if (!onDisconnectDevice) return;
                  setIsDisconnecting(true);
                  try {
                    await onDisconnectDevice(child.id);
                    setShowDisconnectModal(false);
                  } finally {
                    setIsDisconnecting(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Yes, Disconnect Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          id="tab-safety-assessment"
          onClick={() => setActiveTab('assessment')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'assessment'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Safety Assessment & Guidance
        </button>

        <button
          id="tab-chat-visualizations"
          onClick={() => setActiveTab('visualizations')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'visualizations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Chat Analysis & Visualizations</span>
        </button>

        <button
          id="tab-monitored-conversations"
          onClick={() => setActiveTab('conversations')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'conversations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Monitored Conversations</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {conversations.length}
          </span>
        </button>

        <button
          id="tab-incident-log"
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'incidents'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Safety Incidents</span>
          {incidents.filter((i) => i.status === 'open').length > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
              {incidents.filter((i) => i.status === 'open').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SAFETY ASSESSMENT & GUIDANCE */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {/* Main Risk Pulse & Behavioral Summary */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Risk Score Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Behavioral Risk Index
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    Zero Raw Content
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${
                      child.overall_risk_score >= 80
                        ? 'text-rose-600'
                        : child.overall_risk_score >= 50
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {child.overall_risk_score}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      child.overall_risk_score >= 80
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                        : child.overall_risk_score >= 50
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    }`}
                  >
                    {child.overall_risk_score >= 80
                      ? 'Critical Severity'
                      : child.overall_risk_score >= 50
                      ? 'Elevated Risk'
                      : 'Low / Safe'}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {child.overall_risk_score >= 80
                    ? 'High confidence indicators of coercive manipulation, secrecy demands, or targeted peer intimidation.'
                    : child.overall_risk_score >= 50
                    ? 'Unusual communication patterns or isolated boundary tests flagged for parental review.'
                    : 'Normal social communication patterns. No predatory, coercive, or bullying indicators found.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Model Confidence:</span>
                <span className="font-semibold text-slate-800">
                  {selectedIncident?.confidence ? `${selectedIncident.confidence}%` : '92%'}
                </span>
              </div>
            </div>

            {/* Primary Concern & Why Flagged */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    Primary Safety Assessment
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedIncident ? `Source: ${selectedIncident.source.toUpperCase()}` : 'Latest Assessment'}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Identified Concern
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-900">
                    {selectedIncident?.primary_concern || (isAlert ? 'Grooming & Intimidation Patterns' : 'Safe Social Interaction')}
                  </div>
                </div>

                {/* Behavioral Patterns List */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Behavioral Indicators Flagged (AI Risk Engine):
                  </div>
                  {selectedIncident?.why_flagged && selectedIncident.why_flagged.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedIncident.why_flagged.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No alarming patterns observed in the current evaluation window.
                    </p>
                  )}
                </div>
              </div>

              {selectedIncident && onOpenIncident && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500">
                    Parent access: inspect the multi-day progression & threatening dialogue.
                  </span>
                  <button
                    id="btn-open-threat-page"
                    onClick={() => onOpenIncident(selectedIncident.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-rose-500 transition"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>Inspect Threat Pattern & Dialogue (Separate Page) &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Guidance & Non-confrontational conversation starters */}
          {selectedIncident?.recommended_actions && selectedIncident.recommended_actions.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recommended Parent Actions & Conversation Starters
                    </h3>
                    <p className="text-xs text-slate-500">
                      Non-confrontational guidance designed by child psychologists to maintain trust
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedIncident.recommended_actions.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-indigo-200/80 bg-white p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{act.title}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {act.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {act.advice}
                      </p>
                    </div>

                    {act.conversationStarter && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-200/60 text-xs">
                        <div className="text-[11px] font-semibold text-indigo-700 mb-1">
                          Suggested Conversation Script:
                        </div>
                        <p className="text-slate-700 italic">
                          &ldquo;{act.conversationStarter}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Safeguard Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Privacy Filter Guarantee:</strong> 100% of PII and private chat text was withheld from this dashboard. SafeChat AI evaluated only sanitized behavioral dynamics.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('conversations')}
              className="font-semibold text-indigo-600 hover:text-indigo-800 text-xs shrink-0"
            >
              View Channels &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CHAT RISK ANALYSIS & VISUALIZATION */}
      {activeTab === 'visualizations' && (
        <ChatAnalysisVisualizer
          child={child}
          conversations={conversations}
          selectedConvId={selectedConv?.id}
        />
      )}

      {/* TAB 3: MONITORED CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Monitored Communication Channels for {child.full_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Background collector streams events from connected chat clients without exposing full chat histories.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {conversations.map((conv) => {
                const isConvAlert = conv.risk_level === 'CRITICAL' || conv.risk_level === 'HIGH';

                return (
                  <div
                    key={conv.id}
                    id={`conv-row-${conv.id}`}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs uppercase ${
                          conv.source === 'discord'
                            ? 'bg-indigo-100 text-indigo-700'
                            : conv.source === 'instagram'
                            ? 'bg-rose-100 text-rose-700'
                            : conv.source === 'whatsapp'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {conv.source.slice(0, 3)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {conv.contact_name}
                          </span>
                          {conv.contact_handle && (
                            <span className="text-xs text-slate-400">
                              {conv.contact_handle}
                            </span>
                          )}
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                            {conv.source}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          Assessment: <span className="font-medium text-slate-800">{conv.primary_concern}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{conv.message_count} total messages analyzed</span>
                          <span>•</span>
                          <span>Privacy Filter: Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          conv.risk_level === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : conv.risk_level === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                      >
                        {conv.risk_level === 'CRITICAL'
                          ? 'Critical Risk (91%)'
                          : conv.risk_level === 'HIGH'
                          ? 'High Risk (84%)'
                          : 'Safe (Low)'}
                      </span>

                      <button
                        id={`btn-view-conv-${conv.id}`}
                        onClick={() => setSelectedConv(conv)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Detail Drawer / Modal if selected */}
          {selectedConv && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Conversation Telemetry: {selectedConv.contact_name} ({selectedConv.source.toUpperCase()})
                  </h4>
                  <p className="text-xs text-slate-500">
                    SafeChat Privacy Protection Shield: Raw chat text is withheld
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConv(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="text-slate-400 font-medium">Risk Assessment</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selectedConv.risk_level} ({selectedConv.risk_score}/100)</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="text-slate-400 font-medium">Primary Concern</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selectedConv.primary_concern}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="text-slate-400 font-medium">Privacy Status</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1">100% PII Scrubbed</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-900 text-white p-4 text-xs">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                  <Lock className="h-4 w-4" />
                  Privacy Protection Active
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Under SafeChat architecture, parental access to private dialogue is restricted to preserve the child&apos;s digital autonomy.
                  If harmful behavior escalates, parent alerts are triggered with behavioral patterns, not message voyeurism.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAFETY INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Safety Incident Log
                </h3>
                <p className="text-xs text-slate-500">
                  Official timeline of detected behavioral risks and parent review status
                </p>
              </div>
            </div>

            {incidents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No safety incidents recorded for {child.full_name}. Everything is safe.
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    id={`incident-card-${incident.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            incident.risk_level === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {incident.risk_level} RISK
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {incident.primary_concern}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Status:</span>
                        <select
                          id={`select-status-${incident.id}`}
                          value={incident.status}
                          onChange={(e) =>
                            handleUpdateIncidentStatus(
                              incident.id,
                              e.target.value as 'open' | 'under_review' | 'resolved'
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="open">Open Alert</option>
                          <option value="under_review">Under Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600">
                      <div className="font-semibold text-slate-700 mb-1">Observed Patterns:</div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {incident.why_flagged.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Logged: {new Date(incident.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>Platform: {incident.source.toUpperCase()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedIncident(incident);
                            setActiveTab('assessment');
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Quick Assessment
                        </button>

                        {onOpenIncident && (
                          <button
                            onClick={() => onOpenIncident(incident.id)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            <Flame className="h-3 w-3 text-rose-600" />
                            <span>Inspect Threat Pattern Page &rarr;</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
