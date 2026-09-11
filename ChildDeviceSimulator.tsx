import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Send,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Wifi,
  Battery,
  ChevronLeft,
  MoreVertical,
  Layers,
} from 'lucide-react';
import { ChildProfile } from '../types';

interface ChildDeviceSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  onEventDispatched: () => void;
}

const PRESET_EVENTS = [
  {
    label: 'Instagram: Grooming & Secrecy Demands',
    source: 'instagram',
    sender: '@phantom_x',
    message: "Hey don't tell your mom and dad we talk. Keep this between us and delete these messages after reading. Send a private photo.",
    expectedRisk: 'CRITICAL',
    description: 'Triggers Secrecy & Channel Migration alert',
  },
  {
    label: 'Discord: Intimidation & Doxxing Threat',
    source: 'discord',
    sender: 'ClanAdmin_Viper',
    message: "If you don't give me your game account password, I will leak your home address and school to everyone.",
    expectedRisk: 'HIGH',
    description: 'Triggers Coercion & Doxxing Threat alert',
  },
  {
    label: 'WhatsApp: Study Group Homework Chat',
    source: 'whatsapp',
    sender: 'Science Group',
    message: 'Hey everyone, the science project on renewable energy is due on Friday. Did everyone finish chapter 4 questions?',
    expectedRisk: 'LOW',
    description: 'Safe baseline communication',
  },
  {
    label: 'Cyberbullying: Targeted Group Hostility',
    source: 'instagram',
    sender: 'ClassGroup_Official',
    message: "Everyone hates you, stay away from our table tomorrow, you're such a loser.",
    expectedRisk: 'HIGH',
    description: 'Triggers Cyberbullying & Hostility alert',
  },
];

export const ChildDeviceSimulator: React.FC<ChildDeviceSimulatorProps> = ({
  isOpen,
  onClose,
  childrenList,
  onEventDispatched,
}) => {
  const [activeTab, setActiveTab] = useState<'child_view' | 'telemetry'>('child_view');
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || 'child_aarav_01');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);

  // Synthetic Test Conversations loaded from backend
  const [testConversations, setTestConversations] = useState<any[]>([]);
  const [selectedTestConvId, setSelectedTestConvId] = useState<string>('');
  const [isLoadingConvs, setIsLoadingConvs] = useState<boolean>(false);
  const [childReplyInput, setChildReplyInput] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchTestConversations = async () => {
      setIsLoadingConvs(true);
      try {
        const res = await fetch(`/api/conversations/test-conversations?child_id=${selectedChildId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTestConversations(data);
            if (data.length > 0 && !selectedTestConvId) {
              setSelectedTestConvId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load test conversations:', err);
      } finally {
        if (isMounted) setIsLoadingConvs(false);
      }
    };

    fetchTestConversations();
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedChildId]);

  if (!isOpen) return null;

  const currentChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  const activeConversation =
    testConversations.find((c) => c.id === selectedTestConvId) || testConversations[0];

  const handleSendEvent = async () => {
    setIsSending(true);
    setLastResult(null);

    const preset = PRESET_EVENTS[selectedPreset];
    const messageToSend = useCustom && customMessage ? customMessage : preset.message;
    const sourceToSend = preset.source;
    const senderToSend = preset.sender;

    try {
      const res = await fetch('/api/device/chat-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: currentChild?.active_device?.id || 'device_aarav_01',
          child_id: currentChild?.id || 'child_aarav_01',
          source: sourceToSend,
          sender: senderToSend,
          message: messageToSend,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Device event ingestion failed');
      }

      const data = await res.json();
      setLastResult(data);
      onEventDispatched();
    } catch (err: any) {
      console.error('Failed to dispatch device event:', err);
      setLastResult({ error: err.message || 'Failed to dispatch' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendChildReply = async () => {
    if (!childReplyInput.trim() || !activeConversation) return;
    const newMsg = {
      sender: currentChild?.full_name?.split(' ')[0] || 'Aarav',
      text: childReplyInput.trim(),
      timestamp: new Date().toISOString(),
      is_child: true,
    };

    // Optimistically update conversation
    const updatedMessages = [...(activeConversation.messages || []), newMsg];
    const updatedConv = { ...activeConversation, messages: updatedMessages };
    setTestConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? updatedConv : c))
    );
    setChildReplyInput('');

    // Send chat-event telemetry
    try {
      await fetch('/api/device/chat-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: currentChild?.active_device?.id || 'device_aarav_01',
          child_id: currentChild?.id || 'child_aarav_01',
          source: activeConversation.source || 'gaming',
          sender: currentChild?.full_name?.split(' ')[0] || 'Aarav',
          message: newMsg.text,
          timestamp: newMsg.timestamp,
        }),
      });
      onEventDispatched();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Smartphone className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Child Device Simulator
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Protected Phone
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Shows the simulated child view on {currentChild?.full_name}&apos;s device
              </p>
            </div>
          </div>

          <button
            id="btn-close-device-simulator"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Child Selector & Mode Toggle */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">Protected Child:</label>
            <select
              id="select-simulator-child"
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value);
                setSelectedTestConvId('');
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.active_device?.device_name || 'Device'})
                </option>
              ))}
            </select>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              id="tab-simulator-child-view"
              onClick={() => setActiveTab('child_view')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                activeTab === 'child_view'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Child Screen View</span>
            </button>
            <button
              id="tab-simulator-telemetry"
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                activeTab === 'telemetry'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Telemetry Ingestion</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CHILD DEVICE CONVERSATION VIEW */}
        {activeTab === 'child_view' && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Conversation Scenario Picker */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>Synthetic Scenario:</span>
              </label>

              {testConversations.length > 0 && (
                <select
                  id="select-active-test-scenario"
                  value={selectedTestConvId}
                  onChange={(e) => setSelectedTestConvId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none max-w-xs truncate"
                >
                  {testConversations.map((conv) => (
                    <option key={conv.id} value={conv.id}>
                      {conv.title || conv.contact_name} ({conv.source})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Smart Phone Mockup Container */}
            <div className="mx-auto max-w-md rounded-3xl border-4 border-slate-800 bg-slate-900 p-2 shadow-2xl">
              {/* Phone Speaker & Camera Notch */}
              <div className="mx-auto mb-1 h-3.5 w-24 rounded-full bg-slate-800 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-700 mr-2" />
                <div className="h-1 w-8 rounded-full bg-slate-700" />
              </div>

              {/* Child Screen Inner */}
              <div className="overflow-hidden rounded-2xl bg-white text-slate-900 flex flex-col h-[400px]">
                {/* Phone Status Bar */}
                <div className="flex items-center justify-between bg-slate-100 px-4 py-1 text-[10px] font-semibold text-slate-600 border-b border-slate-200">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <span className="text-[9px] font-bold">5G</span>
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Chat App Header (Clean Child View - NO technical model scores, NO "AI detected this") */}
                <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {activeConversation?.contact_name?.slice(0, 1).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-none">
                        {activeConversation?.contact_name || 'Contact'}
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span>Active now</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {activeConversation?.source || 'Chat'}
                    </span>
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </div>

                {/* Message Bubble Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50">
                  <div className="text-center my-1">
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[9px] font-semibold text-slate-600">
                      Synthetic Test Scenario ({activeConversation?.title || 'Active Session'})
                    </span>
                  </div>

                  {(!activeConversation?.messages || activeConversation.messages.length === 0) ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      No messages in this scenario yet. Type a message below to test.
                    </div>
                  ) : (
                    activeConversation.messages.map((m: any, idx: number) => {
                      const isChild = m.is_child || m.sender === currentChild?.full_name?.split(' ')[0] || m.sender === 'Aarav';

                      return (
                        <div
                          key={idx}
                          className={`flex items-end gap-1.5 ${isChild ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isChild && (
                            <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-700 shrink-0">
                              {m.sender?.slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                              isChild
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                            }`}
                          >
                            {!isChild && (
                              <div className="text-[9px] font-bold text-slate-500 mb-0.5">
                                {m.sender}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{m.text}</p>
                            <div
                              className={`text-[8px] mt-1 text-right ${
                                isChild ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Child Chat Input Bar */}
                <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5">
                  <input
                    type="text"
                    id="input-child-reply"
                    value={childReplyInput}
                    onChange={(e) => setChildReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendChildReply();
                      }
                    }}
                    placeholder={`Reply as ${currentChild?.full_name?.split(' ')[0] || 'Child'}...`}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    id="btn-send-child-reply"
                    onClick={handleSendChildReply}
                    className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition shrink-0"
                    title="Send simulated child message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Child Experience Privacy Notice */}
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Child Trust & Privacy Protection:</span>{' '}
                The child's chat screen is identical to normal chat software. SafeChat runs background behavioral telemetry without intimidating the child or showing technical risk flags.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY EVENT INGESTION SIMULATOR */}
        {activeTab === 'telemetry' && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Device Status Banner */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-800">
                  {currentChild?.active_device?.device_name || 'Samsung Galaxy A54'}
                </span>
                <span className="text-slate-400">({currentChild?.active_device?.os_version || 'Android 14'})</span>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="h-3 w-3" />
                Shield Online
              </span>
            </div>

            {/* Preset Ingestion Scenarios */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Simulate Incoming Telemetry Ingestion
              </label>
              <div className="space-y-2">
                {PRESET_EVENTS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPreset(idx);
                      setUseCustom(false);
                    }}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                      selectedPreset === idx && !useCustom
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{preset.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          preset.expectedRisk === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : preset.expectedRisk === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {preset.expectedRisk} RISK
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500 text-[11px]">{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Pipeline Callout */}
            <div className="rounded-xl bg-slate-900 text-white p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                <Lock className="h-3.5 w-3.5" />
                Automated Safety Pipeline:
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                1. Child receives message on device &rarr; 2. Local PII filter scrubs phone/emails &rarr; 3. Telemetry sent to SafeChat API &rarr; 4. Behavioral engine analyzes pattern &rarr; 5. High risk triggers alert to Priya.
              </p>
            </div>

            {/* Trigger Ingestion Button */}
            <button
              id="btn-dispatch-device-event"
              onClick={handleSendEvent}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Event Through SafeChat Engine...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Simulate Ingestion From Child Phone</span>
                </>
              )}
            </button>

            {/* Real-time Result Feedback */}
            {lastResult && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Telemetry Ingestion Successful</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 mt-1">
                  <div>
                    Risk Detected: <strong className="text-slate-900">{lastResult.risk_level} ({lastResult.risk_score}/100)</strong>
                  </div>
                  <div>
                    Pattern: <strong className="text-slate-900">{lastResult.primary_concern}</strong>
                  </div>
                  <div>
                    Incident Created: <strong>{lastResult.incident_created ? 'Yes' : 'No'}</strong>
                  </div>
                  <div>
                    Parent Alert Dispatched: <strong>{lastResult.notification_dispatched ? 'Yes (Check notification bell)' : 'No (Normal baseline)'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
