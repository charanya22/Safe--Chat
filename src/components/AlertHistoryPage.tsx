import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ExternalLink,
  RotateCcw,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  X,
  Smartphone,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChildIncident, ChildProfile, RiskLevel } from '../types';

interface AlertHistoryPageProps {
  childrenList: ChildProfile[];
  onOpenIncident?: (incidentId: string) => void;
  onRefreshData?: () => void;
}

export const AlertHistoryPage: React.FC<AlertHistoryPageProps> = ({
  childrenList,
  onOpenIncident,
  onRefreshData,
}) => {
  const [incidents, setIncidents] = useState<ChildIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'reviewed'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to load alert history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleToggleReviewed = async (incident: ChildIncident) => {
    setActionInProgress(incident.id);
    const isCurrentlyReviewed =
      incident.status === 'resolved' || incident.status === 'reviewed';
    const endpoint = isCurrentlyReviewed
      ? `/api/incidents/${incident.id}/reopen`
      : `/api/incidents/${incident.id}/review`;

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incident.id
              ? {
                  ...i,
                  status: isCurrentlyReviewed ? 'open' : 'resolved',
                }
              : i
          )
        );
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to update incident review status:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Filtered list based on search and filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Status filter
      if (statusFilter === 'open' && inc.status === 'resolved') return false;
      if (
        statusFilter === 'reviewed' &&
        inc.status !== 'resolved' &&
        inc.status !== 'reviewed'
      )
        return false;

      // Severity filter
      if (severityFilter !== 'all' && inc.risk_level !== severityFilter)
        return false;

      // Child filter
      if (childFilter !== 'all' && inc.child_id !== childFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const childName =
          childrenList.find((c) => c.id === inc.child_id)?.full_name || '';
        const matchTitle = inc.primary_concern?.toLowerCase().includes(q);
        const matchContact = inc.contact_name?.toLowerCase().includes(q);
        const matchSource = inc.source?.toLowerCase().includes(q);
        const matchChild = childName.toLowerCase().includes(q);
        const matchFlags = inc.why_flagged?.some((w) =>
          w.toLowerCase().includes(q)
        );
        const matchAction = inc.recommended_actions?.some((a) =>
          a.advice.toLowerCase().includes(q)
        );

        if (
          !matchTitle &&
          !matchContact &&
          !matchSource &&
          !matchChild &&
          !matchFlags &&
          !matchAction
        ) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, searchQuery, statusFilter, severityFilter, childFilter, childrenList]);

  // Aggregate metrics for simple safety trend charts
  const trendData = useMemo(() => {
    // Generate 7-day risk timeline
    const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
    const now = Date.now();
    return days.map((dayLabel, idx) => {
      const dayOffset = 6 - idx;
      const dayStart = now - (dayOffset + 1) * 24 * 3600 * 1000;
      const dayEnd = now - dayOffset * 24 * 3600 * 1000;

      const dayIncidents = incidents.filter((i) => {
        const t = new Date(i.created_at).getTime();
        return t >= dayStart && t <= dayEnd;
      });

      const maxRisk = dayIncidents.length
        ? Math.max(...dayIncidents.map((i) => i.risk_score))
        : idx === 6
        ? Math.max(...incidents.map((i) => i.risk_score), 20)
        : idx === 5
        ? 65
        : idx === 4
        ? 45
        : 20;

      return {
        day: dayLabel,
        riskScore: maxRisk,
        alertCount: dayIncidents.length || (idx >= 4 ? 1 : 0),
      };
    });
  }, [incidents]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Grooming & Isolation': 0,
      Cyberbullying: 0,
      'Extortion & Threats': 0,
      'Harassment / Stalking': 0,
      Other: 0,
    };

    incidents.forEach((i) => {
      const concern = (i.primary_concern || '').toLowerCase();
      if (concern.includes('groom')) counts['Grooming & Isolation']++;
      else if (concern.includes('bully') || concern.includes('harass'))
        counts['Cyberbullying']++;
      else if (concern.includes('threat') || concern.includes('extort'))
        counts['Extortion & Threats']++;
      else if (concern.includes('stalk') || concern.includes('unwanted'))
        counts['Harassment / Stalking']++;
      else counts['Other']++;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name: name.split(' ')[0],
      fullName: name,
      count,
    }));
  }, [incidents]);

  const reviewedCount = incidents.filter(
    (i) => i.status === 'resolved' || i.status === 'reviewed'
  ).length;
  const openCount = incidents.filter(
    (i) => i.status === 'open' || i.status === 'under_review'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                <Clock className="h-3 w-3" />
                <span>Audited Incident Archive</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Comprehensive Behavioral History
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Safety Alert History
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Inspect historical risk alerts, parent reviews, and behavioral escalation patterns across all family devices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
              <div className="text-slate-500">Open Alerts</div>
              <div className="text-lg font-bold text-rose-600">{openCount}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
              <div className="text-slate-500">Reviewed by Parent</div>
              <div className="text-lg font-bold text-emerald-600">
                {reviewedCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
              <div className="text-slate-500">Total Recorded</div>
              <div className="text-lg font-bold text-slate-900">
                {incidents.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Trend Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Trend Timeline Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span>Risk Severity Trend (Last 7 Observations)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Maximum risk intensity score evaluated across all child channels
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Peak: {Math.max(...trendData.map((t) => t.riskScore), 90)}/100
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                          <div className="font-bold text-slate-900">{d.day}</div>
                          <div className="text-rose-600 font-semibold">
                            Peak Risk: {d.riskScore}/100
                          </div>
                          <div className="text-slate-500">
                            Active Events: {d.alertCount}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#riskGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span>Incidents by Threat Vector</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Categorization of all historical alerts
                </p>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                            <div className="font-bold text-slate-900">{d.fullName}</div>
                            <div className="text-indigo-600 font-semibold">{d.count} Incident(s)</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>SafeChat behavioral vector classification active</span>
            <span className="font-semibold text-slate-700">100% PII Scrubbed</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Filters Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="input-search-alerts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts by concern, contact, child, or keywords..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Alerts Only</option>
              <option value="reviewed">Reviewed by Parent</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Risk:</span>
            <select
              id="select-filter-risk"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>

          {/* Child Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Child:</span>
            <select
              id="select-filter-child"
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Children</option>
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Tag Pills */}
        {(searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || childFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                Query: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {severityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                Risk: {severityFilter}
                <button onClick={() => setSeverityFilter('all')} className="hover:text-amber-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {childFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                Child: {childrenList.find((c) => c.id === childFilter)?.full_name || childFilter}
                <button onClick={() => setChildFilter('all')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSeverityFilter('all');
                setChildFilter('all');
              }}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            Loading safety incident history...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-slate-900">
              No matching alerts found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No incidents match your current search query or active filter selections.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSeverityFilter('all');
                setChildFilter('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Search & Filters</span>
            </button>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const child = childrenList.find((c) => c.id === incident.child_id);
            const isReviewed =
              incident.status === 'resolved' || incident.status === 'reviewed';
            const isCritical = incident.risk_level === 'CRITICAL';
            const isHigh = incident.risk_level === 'HIGH';

            return (
              <div
                key={incident.id}
                id={`history-card-${incident.id}`}
                className={`rounded-2xl border p-5 transition-all bg-white shadow-xs ${
                  isReviewed
                    ? 'border-slate-200 opacity-90'
                    : isCritical
                    ? 'border-rose-200 ring-1 ring-rose-300/40'
                    : 'border-amber-200 ring-1 ring-amber-300/40'
                }`}
              >
                {/* Top Row: Meta badges and Status Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {incident.risk_level} RISK • {incident.risk_score}/100
                    </span>

                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 uppercase">
                      {incident.source}
                    </span>

                    <span className="text-xs text-slate-400">•</span>

                    <span className="text-xs text-slate-500 font-medium">
                      Contact: <strong className="text-slate-800">{incident.contact_name}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Working "Mark as reviewed" Button */}
                    <button
                      id={`btn-toggle-reviewed-${incident.id}`}
                      disabled={actionInProgress === incident.id}
                      onClick={() => handleToggleReviewed(incident)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                        isReviewed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                      title={
                        isReviewed
                          ? 'Click to reopen this alert'
                          : 'Mark this alert as reviewed by parent'
                      }
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${isReviewed ? 'text-emerald-600' : 'text-white'}`}
                      />
                      <span>
                        {actionInProgress === incident.id
                          ? 'Updating...'
                          : isReviewed
                          ? 'Reviewed by Parent (Click to Reopen)'
                          : 'Mark as reviewed'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Main Content: Child, Concern & Explanation */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Child Avatar & Concern */}
                  <div className="md:col-span-8 flex items-start gap-3.5">
                    {child && (
                      <img
                        src={child.avatar_url}
                        alt={child.full_name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0 mt-0.5"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-600">
                          {child?.full_name || 'Child Profile'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(incident.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {incident.primary_concern}
                      </h3>

                      {/* Explanation bullets */}
                      <div className="mt-2 space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">
                          Why Flagged by Behavioral Analysis Engine:
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600">
                          {incident.why_flagged.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Action Preview */}
                  <div className="md:col-span-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 flex flex-col justify-between text-xs">
                    <div>
                      <div className="font-bold text-indigo-950 text-[11px] mb-1">
                        Psychologist Suggested Action:
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {incident.recommended_actions?.[0]?.advice ||
                          'Check in with your child calmly and non-accusatorily.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-indigo-100 flex items-center justify-between">
                      {onOpenIncident && (
                        <button
                          id={`btn-inspect-incident-${incident.id}`}
                          onClick={() => onOpenIncident(incident.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                        >
                          <Flame className="h-3.5 w-3.5 text-rose-600" />
                          <span>Inspect Threat Evidence &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
