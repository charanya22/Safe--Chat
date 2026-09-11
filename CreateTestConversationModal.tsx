import React, { useState } from 'react';
import {
  X,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Info,
  RefreshCw,
  MessageSquare,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ChildProfile } from '../types';

interface CreateTestConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  onConversationCreated: (conversationData: any) => void;
  onOpenIncident?: (incidentId: string) => void;
  onOpenDeviceSimulator?: () => void;
}

interface MessageItem {
  id: string;
  sender_type: 'sender' | 'child';
  sender_name: string;
  text: string;
}

const PRESET_TEMPLATES = [
  {
    title: 'Cyberbullying & Exclusion',
    category: 'Bullying',
    source: 'school_group',
    riskHint: 'HIGH',
    messages: [
      { sender_type: 'sender', sender_name: 'Kyle (School Chat)', text: "Why do you even show up? Nobody wants you in this group." },
      { sender_type: 'child', sender_name: 'Aarav', text: "Stop saying that. We have to do the science project together." },
      { sender_type: 'sender', sender_name: 'Kyle (School Chat)', text: "You're a complete loser. Everyone is laughing at you behind your back. Leave now." },
    ],
  },
  {
    title: 'Coercion & Doxxing Threats',
    category: 'Threats',
    source: 'gaming',
    riskHint: 'CRITICAL',
    messages: [
      { sender_type: 'sender', sender_name: 'ViperClan99', text: "Give me your gamer tag credentials right now." },
      { sender_type: 'child', sender_name: 'Aarav', text: "No way, I spent months leveling that up." },
      { sender_type: 'sender', sender_name: 'ViperClan99', text: "I have your IP and I know which school you go to. If you don't send it in 5 mins I will post your address online." },
    ],
  },
  {
    title: 'Grooming & Secrecy Demands',
    category: 'Grooming',
    source: 'unknown_contacts',
    riskHint: 'CRITICAL',
    messages: [
      { sender_type: 'sender', sender_name: 'ShadowAlex', text: "Hey you're really mature for your age. Do you want free game skins?" },
      { sender_type: 'child', sender_name: 'Aarav', text: "Sure, how do I get them?" },
      { sender_type: 'sender', sender_name: 'ShadowAlex', text: "Don't tell your parents about this. Switch to Snapchat right now and keep it our secret." },
    ],
  },
  {
    title: 'Safe Baseline Conversation',
    category: 'Safe',
    source: 'messaging',
    riskHint: 'LOW',
    messages: [
      { sender_type: 'sender', sender_name: 'Leo', text: "Hey! Did you study for tomorrow's history quiz?" },
      { sender_type: 'child', sender_name: 'Aarav', text: "Yeah, finished chapter 6. Want to review notes together?" },
      { sender_type: 'sender', sender_name: 'Leo', text: "Sounds good, see you at the library after 4pm!" },
    ],
  },
];

export const CreateTestConversationModal: React.FC<CreateTestConversationModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  onConversationCreated,
  onOpenIncident,
  onOpenDeviceSimulator,
}) => {
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || 'child_aarav_01');
  const [title, setTitle] = useState('Synthetic Scenario: Social Coercion');
  const [source, setSource] = useState('gaming');
  const [contactName, setContactName] = useState('ViperClan99');
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: '1', sender_type: 'sender', sender_name: 'ViperClan99', text: 'Give me your gamer tag credentials right now.' },
    { id: '2', sender_type: 'child', sender_name: 'Aarav', text: 'No way, I spent months leveling that up.' },
    { id: '3', sender_type: 'sender', sender_name: 'ViperClan99', text: 'I know which school you go to. If you don\'t send it I will post your address online.' },
  ]);

  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageType, setNewMessageType] = useState<'sender' | 'child'>('sender');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setTitle(`Synthetic Scenario: ${tpl.title}`);
    setSource(tpl.source);
    const childName = currentChild?.full_name?.split(' ')[0] || 'Child';
    setContactName(tpl.messages[0].sender_name);
    setMessages(
      tpl.messages.map((m, idx) => ({
        id: String(idx + 1),
        sender_type: m.sender_type as 'sender' | 'child',
        sender_name: m.sender_type === 'child' ? childName : m.sender_name,
        text: m.text,
      }))
    );
    setAnalysisResult(null);
  };

  const handleAddMessage = () => {
    if (!newMessageText.trim()) return;
    const childName = currentChild?.full_name?.split(' ')[0] || 'Child';
    const msg: MessageItem = {
      id: String(Date.now()),
      sender_type: newMessageType,
      sender_name: newMessageType === 'child' ? childName : contactName,
      text: newMessageText.trim(),
    };
    setMessages([...messages, msg]);
    setNewMessageText('');
  };

  const handleRemoveMessage = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    if (messages.length === 0) return;
    setIsSubmitting(true);
    setAnalysisResult(null);

    const childName = currentChild?.full_name?.split(' ')[0] || 'Child';

    try {
      const payload = {
        child_id: currentChild?.id || 'child_aarav_01',
        title: title || 'Synthetic Test Conversation',
        source: source || 'unknown_contacts',
        contact_name: contactName || 'Contact',
        is_test_data: true,
        messages: messages.map((m) => ({
          sender: m.sender_type === 'child' ? childName : m.sender_name || contactName,
          text: m.text,
          timestamp: new Date().toISOString(),
          is_child: m.sender_type === 'child',
        })),
      };

      const res = await fetch('/api/conversations/test-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to run test conversation analysis');
      }

      const data = await res.json();
      setAnalysisResult(data);
      onConversationCreated(data);
    } catch (err: any) {
      console.error(err);
      alert(`Error submitting test conversation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Create Test Conversation
                </h3>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                  Synthetic Test Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Safely test the AI safety engine without touching personal messaging apps.
              </p>
            </div>
          </div>

          <button
            id="btn-close-test-conversation-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Quick Preset Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Select Pre-built Synthetic Scenario</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left rounded-xl border border-slate-200 bg-slate-50 p-2.5 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-indigo-600">
                      {tpl.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        tpl.riskHint === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : tpl.riskHint === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tpl.riskHint}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900 line-clamp-1">
                    {tpl.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Child
              </label>
              <select
                id="select-test-child"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.age} yrs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Channel
              </label>
              <select
                id="select-test-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="gaming">Gaming (Discord / Steam)</option>
                <option value="school_group">School Group Chat</option>
                <option value="unknown_contacts">Unknown Contacts</option>
                <option value="social_media">Social Media (Instagram)</option>
                <option value="messaging">Direct Messaging</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sender / Contact Name
              </label>
              <input
                type="text"
                id="input-test-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. ViperClan99"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation Bubble Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                Conversation Turns ({messages.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Sender vs. Child message flow
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 max-h-52 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No messages added yet. Choose a preset above or add a message below.
                </div>
              ) : (
                messages.map((m) => {
                  const isChild = m.sender_type === 'child';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2 ${isChild ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isChild && (
                        <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                          {m.sender_name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`group relative max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                          isChild
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5 text-[10px] opacity-75">
                          <span className="font-semibold">{m.sender_name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMessage(m.id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                            title="Remove message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                      {isChild && (
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                          {currentChild?.full_name?.slice(0, 1) || 'C'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Message Box */}
            <div className="mt-3 flex items-center gap-2">
              <select
                value={newMessageType}
                onChange={(e) => setNewMessageType(e.target.value as 'sender' | 'child')}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="sender">Sender ({contactName || 'Contact'})</option>
                <option value="child">{currentChild?.full_name?.split(' ')[0] || 'Child'}</option>
              </select>

              <input
                type="text"
                id="input-new-test-message"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMessage();
                  }
                }}
                placeholder="Type message text..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              />

              <button
                type="button"
                id="btn-add-test-turn"
                onClick={handleAddMessage}
                className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Immediate Analysis Result Card */}
          {analysisResult && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    SafeChat AI Safety Engine Analysis Completed
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    analysisResult.risk_level === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : analysisResult.risk_level === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {analysisResult.risk_level} RISK ({analysisResult.risk_score}/100)
                </span>
              </div>

              <div className="rounded-lg bg-white p-3 text-xs text-slate-700 border border-indigo-100/70">
                <div className="font-semibold text-slate-900 mb-0.5">Parent Assessment:</div>
                <p className="text-slate-600 leading-relaxed">
                  {analysisResult.parent_summary || analysisResult.analysis?.parent_summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>Flagged incident created: <strong className="text-slate-900">{analysisResult.incident_id ? 'Yes' : 'No'}</strong></span>
                  <span>•</span>
                  <span>Alert dispatched: <strong className="text-slate-900">{analysisResult.notification_id ? 'Yes' : 'No'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {analysisResult.incident_id && onOpenIncident && (
                    <button
                      id="btn-view-analyzed-incident"
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenIncident(analysisResult.incident_id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition"
                    >
                      <span>Investigate Threat Page</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}

                  {onOpenDeviceSimulator && (
                    <button
                      id="btn-view-analyzed-simulator"
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDeviceSimulator();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>View on Child Simulator</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Separation Guarantee */}
          <div className="rounded-xl bg-slate-900 text-white p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-Raw-Message & Test Separation Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This synthetic scenario is tagged with <code className="text-amber-300">is_test_data: true</code>. SafeChat does not access private messaging apps without permission. All test runs feed the risk concentration metrics dynamically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-submit-test-conversation"
            onClick={handleSubmit}
            disabled={isSubmitting || messages.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running AI Safety Analysis...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit & Analyze Conversation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
