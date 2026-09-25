import React, { useState, useEffect, useCallback } from 'react';
import { ParentHeader, DashboardViewMode } from './components/ParentHeader';
import { ParentLogin } from './components/ParentLogin';
import { FamilyOverview } from './components/FamilyOverview';
import { ChildSafetyDashboard } from './components/ChildSafetyDashboard';
import { ChildDeviceSimulator } from './components/ChildDeviceSimulator';
import { NotificationCenter } from './components/NotificationCenter';
import { ThreatPatternInvestigationPage } from './components/ThreatPatternInvestigationPage';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { ChildProtectionView } from './components/ChildProtectionView';
import { AddChildPairingModal } from './components/AddChildPairingModal';
import { ParentAccountSettingsModal } from './components/ParentAccountSettingsModal';
import { CreateTestConversationModal } from './components/CreateTestConversationModal';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AlertHistoryPage } from './components/AlertHistoryPage';
import { PrivacyPage } from './components/PrivacyPage';
import { useParentRealtime } from './hooks/useParentRealtime';
import { ParentUser, ChildProfile, ParentNotification } from './types';
import { Loader2, AlertTriangle, CheckCircle2, Info, X, RefreshCw } from 'lucide-react';

const getInitialIncidentId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/alert/')) {
    const id = path.replace('/alert/', '').split('/')[0].split('?')[0];
    if (id) return id;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('alert');
};

const getInitialRole = (): 'select' | 'parent' | 'child' => {
  if (typeof window === 'undefined') return 'parent';
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role === 'child') return 'child';
  if (role === 'select') return 'select';
  if (role === 'parent') return 'parent';
  if (params.get('code')) return 'child';
  return 'parent';
};

const getInitialViewMode = (): DashboardViewMode => {
  if (typeof window === 'undefined') return 'family';
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'simulator' || view === 'history' || view === 'privacy' || view === 'child' || view === 'family') {
    return view as DashboardViewMode;
  }
  return 'family';
};

const getUrlCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<'select' | 'parent' | 'child'>(getInitialRole);
  const [urlPairingCode, setUrlPairingCode] = useState<string | null>(getUrlCode);

  // The public portfolio demo opens automatically without requiring a sign-in
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('safechat_auth_token') || 'demo_token_priya';
  });
  const [parent, setParent] = useState<ParentUser | null>({
    id: 'parent_priya_01',
    email: 'priya.sharma@example.com',
    full_name: 'Priya Sharma',
    phone_number: '+1 (555) 438-9201',
    children_count: 3,
  });

  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('child_aarav_01');
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [viewMode, setViewMode] = useState<DashboardViewMode>(getInitialViewMode);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(getInitialIncidentId);

  // Modals state
  const [isDeviceSimulatorOpen, setIsDeviceSimulatorOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState<boolean>(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);
  const [isCreateTestConversationOpen, setIsCreateTestConversationOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveIncidentId(getInitialIncidentId());
      setCurrentRole(getInitialRole());
      setViewMode(getInitialViewMode());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenIncident = (incidentId: string) => {
    window.history.pushState({ incidentId }, '', `/alert/${incidentId}`);
    setActiveIncidentId(incidentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromIncident = () => {
    window.history.pushState({}, '', '/');
    setActiveIncidentId(null);
  };

  const handleSetViewMode = (mode: DashboardViewMode) => {
    setViewMode(mode);
    if (activeIncidentId) {
      handleBackFromIncident();
    }
    const url = mode === 'family' ? '/' : `/?view=${mode}`;
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch children and notifications
  const loadDashboardData = useCallback(async () => {
    try {
      setLoadError(null);
      const parentId = parent?.id || 'parent_priya_01';
      const [childrenRes, notifRes, profileRes] = await Promise.all([
        fetch(`/api/children?parent_id=${encodeURIComponent(parentId)}`),
        fetch('/api/notifications'),
        fetch('/api/auth/me'),
      ]);

      if (childrenRes.ok) {
        const cData = await childrenRes.json();
        setChildrenList(cData);
        if (cData.length > 0 && !selectedChildId) {
          setSelectedChildId(cData[0].id);
        }
      }

      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotifications(nData);
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setParent(pData);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setLoadError('Failed to synchronize family data. Click below to reconnect.');
    } finally {
      setIsLoading(false);
    }
  }, [parent?.id, selectedChildId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Realtime Server-Sent Events Hook
  const { isConnected: realtimeConnected, latestToast, dismissToast } = useParentRealtime({
    parentId: parent?.id || 'parent_priya_01',
    onChildPaired: (data) => {
      loadDashboardData();
      if (data.child_id) {
        setSelectedChildId(data.child_id);
      }
    },
    onRiskAlert: () => {
      loadDashboardData();
    },
    onRefreshNeeded: () => {
      loadDashboardData();
    },
  });

  const handleLoginSuccess = (token: string, parentData: any) => {
    localStorage.setItem('safechat_auth_token', token);
    setAuthToken(token);
    setParent({
      id: parentData.parent_id || 'parent_priya_01',
      email: parentData.email || 'priya.sharma@example.com',
      full_name: parentData.full_name || 'Priya Sharma',
      children_count: 3,
    });
    setCurrentRole('parent');
    loadDashboardData();
  };

  const handleLogout = () => {
    localStorage.removeItem('safechat_auth_token');
    setAuthToken(null);
    setParent(null);
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setViewMode('child');
    if (activeIncidentId) {
      handleBackFromIncident();
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectDevice = async (childId: string) => {
    try {
      const res = await fetch(`/api/children/${childId}/disconnect-device`, {
        method: 'POST',
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to disconnect device:', err);
    }
  };

  const handleDisconnectAllDevices = async () => {
    try {
      const res = await fetch('/api/children/disconnect-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parent?.id }),
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to disconnect all devices:', err);
    }
  };

  // --------------------------------------------------------------------------
  // ROLE 1: ROLE SELECTION SCREEN
  // --------------------------------------------------------------------------
  if (currentRole === 'select') {
    return (
      <RoleSelectionScreen
        onSelectRole={(role) => {
          setCurrentRole(role);
          window.history.pushState({}, '', `/?role=${role}`);
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ROLE 2: CHILD PROTECTION SCREEN (CHILD DEVICE)
  // --------------------------------------------------------------------------
  if (currentRole === 'child') {
    return (
      <ChildProtectionView
        initialCode={urlPairingCode}
        onSwitchToParent={() => {
          setCurrentRole('parent');
          window.history.pushState({}, '', '/?role=parent');
        }}
        onBackToRoleSelect={() => {
          setCurrentRole('select');
          window.history.pushState({}, '', '/?role=select');
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ROLE 3: PARENT PORTAL (PUBLIC DEMO DEFAULT)
  // --------------------------------------------------------------------------
  if (!authToken) {
    return (
      <ParentLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToRoleSelect={() => {
          // Re-enter public demo mode immediately with zero sign-in friction
          setAuthToken('demo_token_priya');
          setParent({
            id: 'parent_priya_01',
            email: 'priya.sharma@example.com',
            full_name: 'Priya Sharma',
            phone_number: '+1 (555) 438-9201',
            children_count: 3,
          });
          setCurrentRole('parent');
          loadDashboardData();
        }}
      />
    );
  }

  const selectedChild =
    childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <ParentHeader
        parent={parent}
        childrenList={childrenList}
        selectedChildId={selectedChildId}
        onSelectChild={handleSelectChild}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDeviceSimulator={() => setIsDeviceSimulatorOpen(true)}
        onOpenAddChildModal={() => setIsAddChildModalOpen(true)}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
        onOpenCreateTestConversation={() => setIsCreateTestConversationOpen(true)}
        onSwitchToChildMode={() => {
          setCurrentRole('child');
          window.history.pushState({}, '', '/?role=child');
        }}
        onLogout={handleLogout}
        viewMode={viewMode}
        onSetViewMode={handleSetViewMode}
        realtimeConnected={realtimeConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">
              Connecting to SafeChat Protected Family Mesh...
            </span>
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto shadow-sm">
            <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Connection Interrupted</h2>
            <p className="text-xs text-slate-600 mt-1">{loadError}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                loadDashboardData();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : activeIncidentId ? (
          /* Separate Dedicated Threat Pattern Investigation Web Page */
          <ThreatPatternInvestigationPage
            incidentId={activeIncidentId}
            onBack={handleBackFromIncident}
            onOpenDeviceSimulator={() => setIsDeviceSimulatorOpen(true)}
          />
        ) : viewMode === 'family' ? (
          <FamilyOverview
            childrenList={childrenList}
            onSelectChild={handleSelectChild}
            onOpenDeviceSimulator={() => setIsDeviceSimulatorOpen(true)}
            onOpenIncident={handleOpenIncident}
            onOpenAddChildModal={() => setIsAddChildModalOpen(true)}
            onOpenCreateTestConversation={() => setIsCreateTestConversationOpen(true)}
            onOpenSimulator={() => handleSetViewMode('simulator')}
            onOpenHistory={() => handleSetViewMode('history')}
            onRefreshData={loadDashboardData}
          />
        ) : viewMode === 'simulator' ? (
          <ScenarioSimulator
            childrenList={childrenList}
            onScenarioCompleted={(incidentId) => {
              loadDashboardData();
            }}
            onOpenIncident={handleOpenIncident}
            onNavigateToDashboard={() => handleSetViewMode('family')}
            onNavigateToHistory={() => handleSetViewMode('history')}
          />
        ) : viewMode === 'history' ? (
          <AlertHistoryPage
            childrenList={childrenList}
            onOpenIncident={handleOpenIncident}
            onRefreshData={loadDashboardData}
          />
        ) : viewMode === 'privacy' ? (
          <PrivacyPage />
        ) : (
          selectedChild && (
            <ChildSafetyDashboard
              child={selectedChild}
              onBackToFamily={() => handleSetViewMode('family')}
              onOpenDeviceSimulator={() => setIsDeviceSimulatorOpen(true)}
              onOpenIncident={handleOpenIncident}
              onDisconnectDevice={handleDisconnectDevice}
            />
          )
        )}
      </main>

      {/* Realtime Toast Notification Banner */}
      {latestToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-short">
          <div
            className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-md flex items-start gap-3 text-xs ${
              latestToast.type === 'critical'
                ? 'bg-rose-950/95 text-white border-rose-500/50'
                : latestToast.type === 'warning'
                ? 'bg-amber-950/95 text-white border-amber-500/50'
                : latestToast.type === 'success'
                ? 'bg-emerald-950/95 text-white border-emerald-500/50'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            {latestToast.type === 'critical' ? (
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            ) : latestToast.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            ) : latestToast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5">{latestToast.title}</div>
              <div className="text-slate-300 leading-relaxed">{latestToast.message}</div>
            </div>

            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Child Pairing Modal */}
      <AddChildPairingModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        parentId={parent?.id || 'parent_priya_01'}
        onChildPairedSuccess={async (newChildId) => {
          await loadDashboardData();
          setSelectedChildId(newChildId);
        }}
      />

      {/* Parent Account Settings Modal */}
      <ParentAccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        parent={parent}
        onDisconnectAllDevices={handleDisconnectAllDevices}
      />

      {/* Create Test Conversation Modal (Synthetic Testing) */}
      <CreateTestConversationModal
        isOpen={isCreateTestConversationOpen}
        onClose={() => setIsCreateTestConversationOpen(false)}
        childrenList={childrenList}
        onConversationCreated={async () => {
          await loadDashboardData();
        }}
        onOpenIncident={handleOpenIncident}
        onOpenDeviceSimulator={() => setIsDeviceSimulatorOpen(true)}
      />

      {/* Child Mobile Device Simulator Companion */}
      <ChildDeviceSimulator
        isOpen={isDeviceSimulatorOpen}
        onClose={() => setIsDeviceSimulatorOpen(false)}
        childrenList={childrenList}
        onEventDispatched={() => {
          loadDashboardData();
        }}
      />

      {/* Parent Notification Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectChild={handleSelectChild}
        onOpenIncident={handleOpenIncident}
      />
    </div>
  );
}
