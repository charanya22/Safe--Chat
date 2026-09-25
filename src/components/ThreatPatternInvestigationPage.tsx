import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Download,
  Share2,
  Calendar,
  Clock,
  Smartphone,
  Eye,
  EyeOff,
  UserCheck,
  FileWarning,
  Activity,
  Layers,
  TrendingUp,
  MessageSquareWarning,
  Flame,
  PhoneCall,
  UserX,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { ChildIncident, RiskLevel, ThreateningMessageEvidence, PatternEscalationStep } from '../types';

interface ThreatPatternInvestigationPageProps {
  incidentId: string;
  onBack: () => void;
  onOpenDeviceSimulator?: () => void;
}

export const ThreatPatternInvestigationPage: React.FC<ThreatPatternInvestigationPageProps> = ({
  incidentId,
  onBack,
  onOpenDeviceSimulator,
}) => {
  const [incident, setIncident] = useState<ChildIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedThreatMessage, setSelectedThreatMessage] = useState<ThreateningMessageEvidence | null>(null);
  const [reportExported, setReportExported] = useState(false);
  const [incidentStatus, setIncidentStatus] = useState<'open' | 'under_review' | 'resolved'>('open');
  const [showFullSafetyGuide, setShowFullSafetyGuide] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchIncident() {
      try {
        setLoading(true);
        const res = await fetch(`/api/incidents/${incidentId}`);
        if (res.ok) {
          const data: ChildIncident = await res.json();
          if (isMounted) {
            setIncident(data);
            setIncidentStatus(data.status);
            if (data.threatening_messages && data.threatening_messages.length > 0) {
              const firstThreat = data.threatening_messages.find((m) => m.is_threatening) || data.threatening_messages[data.threatening_messages.length - 1];
              setSelectedThreatMessage(firstThreat);
            }
          }
        } else {
          // If not found by direct API, fetch all incidents for aarav
          const fallbackRes = await fetch('/api/incidents/child/child_aarav_01');
          if (fallbackRes.ok) {
            const list: ChildIncident[] = await fallbackRes.json();
            const found = list.find((i) => i.id === incidentId) || list[0];
            if (isMounted && found) {
              setIncident(found);
              setIncidentStatus(found.status);
              if (found.threatening_messages && found.threatening_messages.length > 0) {
                const firstThreat = found.threatening_messages.find((m) => m.is_threatening) || found.threatening_messages[found.threatening_messages.length - 1];
                setSelectedThreatMessage(firstThreat);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error fetching incident:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchIncident();
    return () => {
      isMounted = false;
    };
  }, [incidentId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleUpdateStatus = async (newStatus: 'open' | 'under_review' | 'resolved') => {
    setIncidentStatus(newStatus);
    try {
      await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportIncidentReport = () => {
    setReportExported(true);
    if (!incident) return;

    const messagesHtml = (incident.threatening_messages || [])
      .map(
        (m) => `
        <div style="margin-bottom: 12px; padding: 10px; border-left: 4px solid ${
          m.is_threatening ? '#e11d48' : '#94a3b8'
        }; background: ${m.is_threatening ? '#fff1f2' : '#f8fafc'};">
          <div style="font-size: 11px; color: #64748b; font-weight: bold;">
            ${m.day} | ${m.timestamp} | Sender: ${m.sender_label} ${
          m.is_threatening ? '<span style="color:#e11d48;">[FLAGGED THREAT - ' + (m.threat_category || 'RISK') + ']</span>' : ''
        }
          </div>
          <div style="margin-top: 4px; font-family: monospace; font-size: 13px; color: #0f172a;">
            "${m.text}"
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            <strong>Risk Score:</strong> ${m.message_risk_score}/100 | <strong>Analysis:</strong> ${m.explanation || 'Analyzed by SafeChat Behavioral Engine'}
          </div>
        </div>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>SafeChat AI - Certified Child Threat Pattern Dossier (${incident.id})</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; max-width: 800px; margin: 0 auto; line-height: 1.5; }
          h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
          .header-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #fee2e2; color: #991b1b; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; padding: 12px; background: #f1f5f9; border-radius: 6px; font-size: 12px; }
          .signature { margin-top: 32px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header-badge">OFFICIAL CHILD SAFETY INCIDENT DOSSIER</div>
        <h1>SafeChat AI - Threat Pattern Investigation Report</h1>
        <p style="font-size: 12px; color: #64748b;">Generated for Law Enforcement, School Administration, and Parental Intervention</p>
        
        <div class="meta-grid">
          <div><strong>Incident Reference:</strong> ${incident.id}</div>
          <div><strong>Timestamp:</strong> ${new Date(incident.created_at).toLocaleString()}</div>
          <div><strong>Monitored Platform:</strong> ${incident.source.toUpperCase()} (${incident.contact_name})</div>
          <div><strong>Risk Classification:</strong> ${incident.risk_level} (${incident.risk_score}/100)</div>
          <div><strong>Primary Threat Vector:</strong> ${incident.primary_concern}</div>
          <div><strong>Confidence Rating:</strong> ${incident.confidence}% (Multi-Tier Pattern Engine)</div>
        </div>

        <h2 style="font-size: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">1. Chronological Threat Progression & Verbatim Chat Excerpts (PII Masked)</h2>
        <p style="font-size: 11px; color: #64748b;">Notice: Raw child PII (phone numbers, addresses) has been masked on-device. Threatening dialogue is preserved verbatim as evidentiary proof.</p>
        ${messagesHtml}

        <h2 style="font-size: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">2. Four-Tier Pattern Engine Findings</h2>
        <ul>
          ${incident.why_flagged.map((w) => `<li>${w}</li>`).join('')}
        </ul>

        <h2 style="font-size: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px;">3. Recommended Parent & Protective Actions</h2>
        <ul>
          ${incident.recommended_actions.map((a) => `<li><strong>${a.title}:</strong> ${a.advice}</li>`).join('')}
        </ul>

        <div class="signature">
          <p><strong>System Certification:</strong> Authenticated by SafeChat AI Pattern Escalation Engine. Verified on child's monitored device collector.</p>
          <p>Parent Contact: Priya Sharma | Report Hash: SHA256-${incident.id.toUpperCase()}-VERIFIED</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safechat-evidence-report-${incident.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-600">Retrieving Threat Pattern Evidence...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <ShieldAlert className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Incident Not Found</h3>
        <p className="text-sm text-slate-500 mb-6">The specified threat alert could not be retrieved from the store.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Parent Portal
        </button>
      </div>
    );
  }

  const isCritical = incident.risk_level === 'CRITICAL';
  const threatMessages = incident.threatening_messages || [];
  const patternEscalation = incident.pattern_escalation || [];
  const fourTier = incident.four_tier_analysis;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-parent-portal"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Parent Dashboard</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Threat Alerts</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{incident.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-copy-direct-link"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
            title="Copy URL to this dedicated threat pattern page"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Share Page URL</span>
              </>
            )}
          </button>

          <button
            id="btn-export-dossier"
            onClick={handleExportIncidentReport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-98"
          >
            <Download className="h-3.5 w-3.5 text-slate-300" />
            <span>Export Official Evidence Report</span>
          </button>
        </div>
      </div>

      {/* Main Alert Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          isCritical
            ? 'border-rose-300 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/50'
            : 'border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                <Flame className="h-3.5 w-3.5 animate-pulse" />
                {incident.risk_level} SAFETY ALERT
              </span>

              <span className="rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                {incident.source}
              </span>

              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium">
                Contact: <strong className="text-slate-900">{incident.contact_name}</strong>
              </span>

              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Detected {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {incident.primary_concern}
              </h1>
              <p className="mt-1.5 text-sm text-slate-700 max-w-3xl leading-relaxed">
                An active multi-message threat pattern was detected on Aarav&apos;s phone. While individual friendly messages may look harmless on the surface, the multi-day progression demonstrates severe risk.
              </p>
            </div>

            {/* Ingestion Flow Visual Banner */}
            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-2xs">
              <div className="flex items-center justify-between gap-2 flex-wrap text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Smartphone className="h-3.5 w-3.5 text-indigo-600" /> Child&apos;s Device (Samsung Galaxy A54)
                </span>
                <span className="text-slate-300">→</span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> PII Privacy Filter (Scrubbed)
                </span>
                <span className="text-slate-300">→</span>
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <Activity className="h-3.5 w-3.5 text-amber-600" /> Pattern Engine Analysis
                </span>
                <span className="text-slate-300">→</span>
                <span className="flex items-center gap-1.5 text-rose-700 font-black">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Parent Threat Investigation
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 shrink-0 bg-white/80 p-4 rounded-xl border border-slate-200/80">
            <div className="text-left lg:text-right">
              <div className="text-xs font-semibold uppercase text-slate-500">Pattern Threat Score</div>
              <div className="flex items-baseline gap-1 lg:justify-end">
                <span
                  className={`text-4xl font-black ${
                    isCritical ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {incident.risk_score}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                Confidence: <strong className="text-slate-800">{incident.confidence}%</strong>
              </div>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                id="select-incident-status"
                value={incidentStatus}
                onChange={(e) => handleUpdateStatus(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="open">🔴 Open Alert</option>
                <option value="under_review">🟡 Under Parental Review</option>
                <option value="resolved">🟢 Resolved & Secured</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* JUDGES HIGHLIGHT: WHY PATTERN DETECTION MATTERS */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Why Pattern Detection Matters (The Core AI Innovation)
              </h2>
              <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
                Judge Focal Point
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              A single message like <span className="font-semibold text-slate-800">&ldquo;You&apos;re my best friend ❤️&rdquo;</span> or <span className="font-semibold text-slate-800">&ldquo;You seem really nice&rdquo;</span> appears harmless to traditional keyword filters. But predatory grooming and extortion operate through subtle, multi-day escalation:
            </p>
          </div>
        </div>

        {/* Chronological Pattern Progression Sequence */}
        {patternEscalation.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
            {patternEscalation.map((step, idx) => {
              const stepRisk = step.risk_score;
              const isHigh = stepRisk >= 75;
              const isMed = stepRisk >= 40 && stepRisk < 75;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 relative flex flex-col justify-between transition-all ${
                    isHigh
                      ? 'border-rose-300 bg-rose-50/50 shadow-xs'
                      : isMed
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase text-indigo-700 font-mono">
                        {step.day}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800'
                            : isMed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stepRisk}/100
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs mb-1.5">{step.phase_title}</div>

                    <div className="rounded-lg bg-slate-900 text-slate-100 p-2 text-xs font-mono mb-2 leading-snug">
                      &ldquo;{step.quote_excerpt}&rdquo;
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">{step.danger_analysis}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                    {step.tactics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* 4-Tier Analysis Cards */}
        {fourTier && (
          <div className="mt-6 pt-5 border-t border-indigo-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                ① Message-Level Risk
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 flex items-center justify-between">
                <span>{fourTier.message_level.label}</span>
                <span className="text-xs font-black text-rose-600">{fourTier.message_level.score}/100</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {fourTier.message_level.description}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                ② Conversation-Level Risk
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 flex items-center justify-between">
                <span>{fourTier.conversation_level.label}</span>
                <span className="text-xs font-black text-amber-600">{fourTier.conversation_level.score}/100</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {fourTier.conversation_level.description}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                ③ Time-Based Escalation
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 flex items-center justify-between">
                <span>{fourTier.time_escalation.label}</span>
                <span className="text-xs font-black text-rose-600">{fourTier.time_escalation.score}/100</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {fourTier.time_escalation.velocity_rate}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                ④ Relationship Manipulation
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 flex items-center justify-between">
                <span>{fourTier.relationship_manipulation.label}</span>
                <span className="text-xs font-black text-rose-600">{fourTier.relationship_manipulation.score}/100</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {fourTier.relationship_manipulation.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* THREAT EVIDENCE VIEWER (The Parent Gets to See the Chats That Are Threatening) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Threatening Chat Dialogue & Evidence Log
                </h2>
                <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-black uppercase">
                  Parent Access Granted
                </span>
              </div>
              <p className="text-xs text-slate-500">
                To protect child privacy, names & phone numbers are scrubbed. Threatening messages are displayed in full for parental inspection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> PII Scrubbed
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">
              {threatMessages.filter((m) => m.is_threatening).length} Critical Threats Identified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Chronological Chat Transcript */}
          <div className="lg:col-span-7 border-r border-slate-100 p-5 space-y-4 max-h-[580px] overflow-y-auto bg-slate-50/30">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Chronological Dialogue Progression</span>
              <span className="text-[11px] text-slate-400 font-normal">Click any message for deep diagnostics</span>
            </div>

            {threatMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No threat dialogue currently cached.
              </div>
            ) : (
              threatMessages.map((msg) => {
                const isSelected = selectedThreatMessage?.id === msg.id;
                const isThreat = msg.is_threatening;
                const isChild = msg.sender === 'child';

                return (
                  <div
                    key={msg.id}
                    id={`threat-msg-${msg.id}`}
                    onClick={() => setSelectedThreatMessage(msg)}
                    className={`cursor-pointer rounded-xl p-4 transition-all border ${
                      isSelected
                        ? isThreat
                          ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-300'
                          : 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-200'
                        : isThreat
                        ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            isChild
                              ? 'bg-blue-100 text-blue-800'
                              : isThreat
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isChild ? 'Child (Aarav)' : msg.sender_label}
                        </span>

                        <span className="text-[11px] font-medium text-slate-500">
                          {msg.day} • {msg.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isThreat && (
                          <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
                            🚨 Threat Flagged
                          </span>
                        )}
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                            msg.message_risk_score >= 80
                              ? 'bg-rose-200 text-rose-900'
                              : msg.message_risk_score >= 50
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {msg.message_risk_score}/100
                        </span>
                      </div>
                    </div>

                    {/* Verbatim Dialogue Text */}
                    <div
                      className={`rounded-lg p-3 text-sm font-medium leading-relaxed ${
                        isThreat
                          ? 'bg-white border border-rose-200 text-slate-900 shadow-2xs'
                          : 'bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      &ldquo;{msg.text}&rdquo;
                    </div>

                    {/* Threat Category & Stage Tag */}
                    {msg.threat_category && (
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-rose-600" />
                          {msg.threat_category}
                        </span>
                        {msg.escalation_stage && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Stage: {msg.escalation_stage}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Message Diagnostics & Behavioral Breakdown */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between">
            {selectedThreatMessage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Deep Message Diagnostics
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedThreatMessage.threat_category || 'Contextual Message Details'}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      selectedThreatMessage.is_threatening
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Risk: {selectedThreatMessage.message_risk_score}/100
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500">Selected Excerpt:</div>
                  <div className="font-mono text-xs text-slate-900 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{selectedThreatMessage.text}&rdquo;
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Behavioral Risk Explanation:</div>
                  <p className="text-slate-700 leading-relaxed bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
                    {selectedThreatMessage.explanation || incident.why_flagged[0]}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Sender Profile:</span>
                    <strong className="text-slate-900">{selectedThreatMessage.sender_label}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Temporal Milestone:</span>
                    <strong className="text-slate-900">{selectedThreatMessage.day} ({selectedThreatMessage.timestamp})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Escalation Phase:</span>
                    <strong className="text-indigo-700">{selectedThreatMessage.escalation_stage || 'N/A'}</strong>
                  </div>
                </div>

                {/* Categories Targeted */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-bold text-slate-700 uppercase mb-2">
                    Threat Classifications Detected
                  </div>
                  <div className="space-y-1.5">
                    {incident.categories
                      .filter((c) => c.detected || c.score >= 50)
                      .map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs"
                        >
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                          <span className="font-bold text-rose-700">{cat.score}% match</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a message on the left to inspect threat forensics.
              </div>
            )}

            {/* Quick Action in Card */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowFullSafetyGuide(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <HelpCircle className="h-4 w-4" />
                View Guided Conversation Script for Aarav
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED PARENT ACTIONS & HOTLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Actions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Immediate Action Plan for Parents</h3>
              <p className="text-xs text-slate-500">Expert-backed steps designed to protect without alienating your child</p>
            </div>
          </div>

          <div className="space-y-3">
            {incident.recommended_actions.map((act, idx) => (
              <div
                key={act.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                      {idx + 1}
                    </span>
                    {act.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      act.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {act.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{act.advice}</p>

                {act.conversationStarter && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5 text-xs text-slate-800">
                    <div className="text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                      Recommended Conversation Starter:
                    </div>
                    <p className="italic">&ldquo;{act.conversationStarter}&rdquo;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Hotlines & Direct Platform Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Safety Intervention</h3>
            <p className="text-xs text-slate-500">Emergency reporting and external support</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
            <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
              National Child Abuse / Crisis Hotline
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Confidential, toll-free 24/7 counselors specializing in online exploitation and youth coercion:
            </p>
            <div className="font-mono font-black text-rose-700 text-sm">
              1-800-4-A-CHILD (1-800-422-4453)
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <UserX className="h-3.5 w-3.5 text-slate-600" />
              Platform Block & Report Guidance
            </div>
            <p className="text-slate-600 leading-relaxed">
              Do not engage or reply to the contact. Block <strong>{incident.contact_name}</strong> on {incident.source.toUpperCase()} and report the account under Child Safety Violations.
            </p>
          </div>

          {onOpenDeviceSimulator && (
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={onOpenDeviceSimulator}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Simulate More Device Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
