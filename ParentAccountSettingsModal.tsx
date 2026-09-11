import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Shield,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  FileText,
  Loader2,
  Trash2,
} from 'lucide-react';
import { ParentUser } from '../types';

interface ParentAccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: ParentUser | null;
  onDisconnectAllDevices: () => Promise<void>;
}

export const ParentAccountSettingsModal: React.FC<ParentAccountSettingsModalProps> = ({
  isOpen,
  onClose,
  parent,
  onDisconnectAllDevices,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy' | 'devices'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectDone, setDisconnectDone] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setIsChangingPw(true);
    setPwStatus(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parent?.email || 'priya.sharma@example.com',
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPwStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwStatus({ type: 'error', message: err.message || 'Password update failed' });
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleDisconnectAll = async () => {
    if (
      !confirm(
        'Are you sure you want to disconnect ALL child devices? Protection and background synchronization will be revoked immediately for all children.'
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      await onDisconnectAllDevices();
      setDisconnectDone(true);
      setTimeout(() => setDisconnectDone(false), 4000);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Parent Account & Settings</h3>
              <p className="text-xs text-slate-500">Security, family device mesh, and privacy settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Guarantee
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'devices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Device Management
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg ring-2 ring-indigo-200">
                  {parent?.full_name ? parent.full_name[0] : 'P'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{parent?.full_name || 'Priya Sharma'}</h4>
                  <p className="text-xs text-slate-500">{parent?.email || 'priya.sharma@example.com'}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Parent Account
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                  <span className="text-slate-500 block mb-0.5">Protection Network</span>
                  <strong className="text-slate-800">SafeChat Family Shield Tier 1</strong>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                  <span className="text-slate-500 block mb-0.5">Emergency Phone</span>
                  <strong className="text-slate-800">{parent?.phone_number || '+1 (555) 019-2834'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {pwStatus && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                    pwStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pwStatus.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  )}
                  <span>{pwStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password (Min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Repeat new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {isChangingPw ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PRIVACY GUARANTEE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>SafeChat Privacy-Guaranteed Architecture</span>
                </div>
                <p>
                  SafeChat protects children through automated behavioral intelligence rather than invasive surveillance. Our system enforces strict privacy safeguards:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3 bg-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">PII Redaction Engine:</strong>
                    Names, phone numbers, email addresses, and physical locations are automatically scrubbed before behavioral classification.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3 bg-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">No Third-Party Interception:</strong>
                    SafeChat does not secretly spy on WhatsApp, Instagram, or Snapchat. All protection is coordinated via SafeChat's controlled environment and pairing mesh.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3 bg-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Threat Evidence Isolation:</strong>
                    Parents are notified of risk patterns and high-threat incidents without exposing harmless daily conversations.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVICE MANAGEMENT */}
          {activeTab === 'devices' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Active Family Mesh</h4>
                <p className="text-xs text-slate-600">
                  Manage background synchronization and protection privileges across all connected child smartphones and tablets.
                </p>
              </div>

              {disconnectDone && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>All child devices have been disconnected successfully.</span>
                </div>
              )}

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Revoke All Connected Devices</span>
                </h4>
                <p className="text-xs text-rose-700 mb-4">
                  Immediately halt SafeChat protection and disconnect all children's phones. You can re-pair them at any time with a new pairing code.
                </p>
                <button
                  onClick={handleDisconnectAll}
                  disabled={isDisconnecting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Disconnecting All Devices...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Disconnect All Child Devices</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
