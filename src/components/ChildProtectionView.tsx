import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  ArrowLeft,
  Users,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Info,
} from 'lucide-react';
import { ChildProtectionSession } from '../types';

interface ChildProtectionViewProps {
  initialCode?: string | null;
  onSwitchToParent: () => void;
  onBackToRoleSelect: () => void;
}

export const ChildProtectionView: React.FC<ChildProtectionViewProps> = ({
  initialCode,
  onSwitchToParent,
  onBackToRoleSelect,
}) => {
  const [pairingCode, setPairingCode] = useState<string>(initialCode || '');
  const [deviceName, setDeviceName] = useState<string>('My Smartphone');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active child protection session state
  const [session, setSession] = useState<ChildProtectionSession | null>(() => {
    try {
      const saved = localStorage.getItem('safechat_child_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Heartbeat ping status
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('Connecting...');
  const [isRevoked, setIsRevoked] = useState<boolean>(false);

  // Chat environment state
  const [selectedContact, setSelectedContact] = useState<{ name: string; handle: string }>({
    name: 'Sam (Classmate)',
    handle: '@sam_class',
  });
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: 'me' | 'contact'; text: string; time: string }>
  >([
    {
      id: 'm1',
      sender: 'contact',
      text: 'Hey! Did you finish the science assignment questions for tomorrow?',
      time: '3:15 PM',
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Almost done! Just working on the chart for question 4.',
      time: '3:16 PM',
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [analyzedCount, setAnalyzedCount] = useState<number>(session?.messages_analyzed || 2);
  const [childSafetyGuidance, setChildSafetyGuidance] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Persist session
  useEffect(() => {
    if (session) {
      localStorage.setItem('safechat_child_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('safechat_child_session');
    }
  }, [session]);

  // Auto-fill from URL code if provided
  useEffect(() => {
    if (initialCode && !session) {
      setPairingCode(initialCode);
    }
  }, [initialCode, session]);

  // Heartbeat loop: periodically notifies parent dashboard of device connectivity
  useEffect(() => {
    if (!session || isRevoked) return;

    let isMounted = true;
    const sendPing = async () => {
      try {
        const res = await fetch('/api/device/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_id: session.child_id,
            device_id: session.device_id,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'REVOKED') {
            if (isMounted) {
              setIsRevoked(true);
              setLastHeartbeat('Revoked by Parent');
            }
          } else if (isMounted) {
            setLastHeartbeat('Just now');
          }
        }
      } catch (e) {
        console.warn('Child heartbeat ping error:', e);
      }
    };

    // Immediate ping then every 15 seconds
    sendPing();
    const interval = setInterval(sendPing, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session, isRevoked]);

  // Handle pairing code submission
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = pairingCode.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code shown on your parent dashboard.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/pairing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairing_code: cleanCode,
          device_name: deviceName,
          device_type: 'smartphone',
          os_version: 'SafeChat Shield v2.4 (Android)',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect device. Please check the code.');
      }

      const newSession: ChildProtectionSession = {
        child_id: data.child_id,
        child_name: data.child_name,
        protection_status: 'ACTIVE',
        device_id: data.device_id,
        device_token: data.device_token,
        masked_parent: data.masked_parent,
        connected_at: new Date().toISOString(),
        messages_analyzed: 0,
        safety_status: 'Normal',
        last_analysis_time: 'Just now',
      };

      setSession(newSession);
      setIsRevoked(false);
      setAnalyzedCount(0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Activation failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle sending a chat message inside the controlled environment
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !session || isSending) return;

    setIsSending(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'me' as const,
      text: textToSend,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputMessage('');

    try {
      const res = await fetch('/api/device/chat-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: session.device_id,
          child_id: session.child_id,
          conversation_id: `conv_${session.child_id}_${selectedContact.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          source: 'safechat_child_env',
          sender: selectedContact.name,
          message: textToSend,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalyzedCount((prev) => prev + 1);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                messages_analyzed: (prev.messages_analyzed || 0) + 1,
                safety_status: data.risk_score >= 70 ? 'High Risk Pattern' : 'Normal',
                last_analysis_time: 'Just now',
              }
            : null
        );

        if (data.risk_score >= 70) {
          setChildSafetyGuidance(
            '🛡️ SafeChat Safety Shield: Remember to never share personal passwords, home addresses, or meet anyone you only know online without your parent present.'
          );
        } else {
          setChildSafetyGuidance(null);
        }
      }
    } catch (err) {
      console.warn('Failed to send device event:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Switch demo contact
  const handleSelectDemoScenario = (scenario: 'classmate' | 'suspicious_clan') => {
    if (scenario === 'classmate') {
      setSelectedContact({ name: 'Sam (Classmate)', handle: '@sam_class' });
      setChatMessages([
        {
          id: 'm1',
          sender: 'contact',
          text: 'Hey! Did you finish the science assignment questions for tomorrow?',
          time: '3:15 PM',
        },
        {
          id: 'm2',
          sender: 'me',
          text: 'Almost done! Just working on the chart for question 4.',
          time: '3:16 PM',
        },
      ]);
    } else {
      setSelectedContact({ name: 'ShadowRealm Gaming Clan', handle: '@shadow_mod' });
      setChatMessages([
        {
          id: 's1',
          sender: 'contact',
          text: 'Yo, keep this secret from everyone. Don’t tell your parents or I will leak your account info.',
          time: '4:20 PM',
        },
      ]);
    }
  };

  const handleResetDevice = () => {
    if (confirm('Disconnect this device and clear the active protection session?')) {
      setSession(null);
      setIsRevoked(false);
      localStorage.removeItem('safechat_child_session');
    }
  };

  // --------------------------------------------------------------------------
  // STATE 1: UNPAIRED - CHILD ACTIVATION SCREEN
  // --------------------------------------------------------------------------
  if (!session || isRevoked) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mx-auto max-w-lg w-full">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBackToRoleSelect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Role Selection</span>
            </button>
            <button
              onClick={onSwitchToParent}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Open Parent Portal
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-lg">
              <Smartphone className="h-7 w-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30 mb-3">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              SAFECHAT CHILD PROTECTION
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Connect this Device
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
              Enter the 6-digit pairing code shown on your parent's SafeChat dashboard to activate protection.
            </p>
          </div>

          {/* Revocation notice if device was disconnected by parent */}
          {isRevoked && (
            <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-950/50 p-4 text-xs text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Device Disconnected by Parent</span>
              </div>
              <p>
                Your parent disconnected this device from their dashboard. Enter a new 6-digit code to re-activate protection.
              </p>
            </div>
          )}

          {/* Pairing Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  6-Digit Pairing Code
                </label>
                <input
                  id="input-pairing-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl font-mono tracking-widest font-extrabold rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-emerald-400 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                />
                <p className="mt-2 text-[11px] text-slate-400 text-center">
                  Ask your parent to tap <strong className="text-slate-200">+ Add Child</strong> on their SafeChat dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Device Name
                </label>
                <input
                  id="input-device-name"
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Alex's Phone"
                />
              </div>

              <button
                id="btn-connect-device"
                type="submit"
                disabled={isVerifying || pairingCode.replace(/\D/g, '').length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating with SafeChat Mesh...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Connect Device</span>
                  </>
                )}
              </button>
            </form>

            {/* Privacy & Safety Promise */}
            <div className="mt-6 border-t border-slate-800 pt-5">
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Privacy & Safety Protection:</span>
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>SafeChat never reads private WhatsApp, Instagram, or Snapchat messages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Only chats inside the SafeChat environment are analyzed for harmful patterns.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Protects against cyberbullying, online grooming, and peer threats.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mx-auto max-w-md text-center text-xs text-slate-500 mt-6">
          SafeChat Child Protection System • Protected under Parent Authorization
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 2: PAIRED & PROTECTION ACTIVE
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Child Device Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">SafeChat Shield</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PROTECTION ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Child: <strong className="text-slate-200">{session.child_name}</strong> • Connected Parent: <span className="font-mono text-indigo-300">{session.masked_parent}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToParent}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              title="Open Parent Dashboard"
            >
              <span>View Parent Tab</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </button>
            <button
              onClick={handleResetDevice}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:border-rose-800 transition"
              title="Disconnect device"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* Main Child View Container */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-6 sm:px-6 space-y-6">
        {/* Device Protection Status Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Your SafeChat protection is now active.
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  SafeChat is monitoring conversations within the SafeChat environment for potential safety risks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Messages Analyzed
                </div>
                <div className="text-lg font-bold text-white">
                  {analyzedCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Safety Status
                </div>
                <div className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {session.safety_status || 'Normal'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Parent Sync
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {lastHeartbeat}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Guidance Alert (if risk detected) */}
        {childSafetyGuidance && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/50 p-4 text-xs text-amber-200 flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300 mb-0.5">Safety Tip from SafeChat</div>
              <div>{childSafetyGuidance}</div>
            </div>
          </div>
        )}

        {/* Child SafeChat Controlled Chat Environment */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden flex flex-col h-[520px]">
          {/* Chat Environment Header */}
          <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                {selectedContact.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{selectedContact.name}</span>
                  <span className="text-xs font-normal text-slate-400">{selectedContact.handle}</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  SafeChat Protected Chat Session
                </div>
              </div>
            </div>

            {/* Test Scenario Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Scenario:</span>
              <button
                onClick={() => handleSelectDemoScenario('classmate')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedContact.name.includes('Sam')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Normal Chat
              </button>
              <button
                onClick={() => handleSelectDemoScenario('suspicious_clan')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedContact.name.includes('ShadowRealm')
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                High Risk Test
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
            <div className="text-center my-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-[10px] text-slate-400 font-medium">
                <Lock className="h-3 w-3 text-slate-400" />
                End-to-end sanitized • AI safety filter active
              </span>
            </div>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'me'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Pre-composed Messages for Instant Testing */}
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-400">
            <span className="shrink-0 font-semibold text-[10px] uppercase tracking-wider text-slate-400">
              Quick Test:
            </span>
            <button
              onClick={() => handleSendMessage("Let's study for the math exam at 4pm")}
              className="shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 hover:bg-slate-700 text-slate-300 transition"
            >
              "Let's study at 4pm" (Safe)
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  'Delete these chats and do not tell your parents or everyone will know your secret.'
                )
              }
              className="shrink-0 rounded-full border border-rose-800/60 bg-rose-950/40 px-3 py-1 hover:bg-rose-900/60 text-rose-300 transition"
            >
              "Don't tell parents..." (Grooming Threat)
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${selectedContact.name}...`}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Send Message"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Information Callout */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">How SafeChat Protects You: </span>
            When you chat in the SafeChat environment, your personal names and phone numbers are scrubbed, and the AI evaluates potential harm patterns (such as bullying or grooming). Your parent receives high-level safety indicators without reading your private casual messages.
          </div>
        </div>
      </main>
    </div>
  );
};
