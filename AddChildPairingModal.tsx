import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Shield,
  Clock,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AddChildPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  onChildPairedSuccess: (newChildId: string) => void;
}

export const AddChildPairingModal: React.FC<AddChildPairingModalProps> = ({
  isOpen,
  onClose,
  parentId,
  onChildPairedSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'code' | 'success'>('form');
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState('11-13');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated pairing session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [copied, setCopied] = useState(false);
  const [pairedChildId, setPairedChildId] = useState<string | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setChildName('');
      setAgeGroup('11-13');
      setError(null);
      setSessionId(null);
      setPairingCode(null);
      setExpiresAt(null);
      setCopied(false);
      setPairedChildId(null);
    }
  }, [isOpen]);

  // Countdown timer for pairing code
  useEffect(() => {
    if (step !== 'code' || !expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, expiresAt]);

  // Polling check for pairing completion
  useEffect(() => {
    if (step !== 'code' || !sessionId) return;

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/pairing/status/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAIRED' && data.paired_child_id) {
            if (isMounted) {
              setPairedChildId(data.paired_child_id);
              setStep('success');
              onChildPairedSuccess(data.paired_child_id);
            }
          }
        }
      } catch (err) {
        console.warn('Pairing status check error:', err);
      }
    };

    const interval = setInterval(pollStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, sessionId, onChildPairedSuccess]);

  if (!isOpen) return null;

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setError('Please enter your child’s name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/pairing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: parentId,
          child_display_name: childName.trim(),
          age_group: ageGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      setSessionId(data.session_id);
      setPairingCode(data.pairing_code);
      setExpiresAt(new Date(data.expires_at).getTime());
      setSecondsRemaining(600);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!pairingCode) return;
    const url = `${window.location.origin}/?role=child&code=${pairingCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChildTab = () => {
    if (!pairingCode) return;
    window.open(`${window.location.origin}/?role=child&code=${pairingCode}`, '_blank');
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: ENTER CHILD INFO */}
        {step === 'form' && (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 ring-1 ring-indigo-100">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Pair a Child Device
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Generate a secure 6-digit activation code to connect your child's phone or tablet to your family safety network.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerateCode} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child's Display Name
                </label>
                <input
                  id="input-add-child-name"
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Leo, Maya, Alex"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age Group
                </label>
                <select
                  id="select-add-child-age"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Under 10">Under 10 years old</option>
                  <option value="11-13">11 – 13 years old (Middle School)</option>
                  <option value="14-16">14 – 16 years old (High School)</option>
                  <option value="17+">17+ years old</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Privacy Assurance: </span>
                SafeChat does NOT read private WhatsApp or social media chats. It connects via SafeChat's child environment with automated behavioral protection.
              </div>

              <button
                id="btn-generate-pairing-code"
                type="submit"
                disabled={isGenerating || !childName.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Secure Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Pairing Code</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: DISPLAY 6-DIGIT PAIRING CODE */}
        {step === 'code' && (
          <div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 mb-3">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Pairing Code Active</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Connect {childName}'s Device
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enter this 6-digit code on the child's device to activate protection.
              </p>
            </div>

            {/* Huge Monospace Code Box */}
            <div className="my-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-center">
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-indigo-700 select-all">
                {pairingCode?.slice(0, 3)} {pairingCode?.slice(3, 6)}
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Expires in: </span>
                <span className={`font-mono font-bold ${secondsRemaining < 120 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatTime(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Live Waiting Status */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs text-slate-600 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
              </span>
              <span>Waiting for child device to enter code...</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                id="btn-open-child-tab-modal"
                onClick={handleOpenChildTab}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <span>Open Child Device in New Window</span>
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                id="btn-copy-pairing-link"
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>Copy Child Activation Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAIRING SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Device Paired Successfully!
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              <strong className="text-slate-900">{childName}</strong>'s device has been linked to your SafeChat family account. SafeChat behavioral protection is now active.
            </p>

            <div className="mt-6">
              <button
                id="btn-finish-pairing"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <span>Done & View Family Safety</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
