import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Bell,
  Smartphone,
  User,
  LogOut,
  Lock,
  Plus,
  Settings,
  Radio,
  ChevronDown,
  ExternalLink,
  MessageSquarePlus,
} from 'lucide-react';
import { ParentUser, ParentNotification, ChildProfile } from './types';
import { SafeChatLogo } from './SafeChatLogo';

interface ParentHeaderProps {
  parent: ParentUser | null;
  childrenList: ChildProfile[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  notifications: ParentNotification[];
  onOpenNotifications: () => void;
  onOpenDeviceSimulator: () => void;
  onOpenAddChildModal: () => void;
  onOpenCreateTestConversation?: () => void;
  onOpenAccountSettings: () => void;
  onSwitchToChildMode: () => void;
  onLogout: () => void;
  viewMode: 'family' | 'child';
  onSetViewMode: (mode: 'family' | 'child') => void;
  realtimeConnected?: boolean;
}

export const ParentHeader: React.FC<ParentHeaderProps> = ({
  parent,
  childrenList,
  selectedChildId,
  onSelectChild,
  notifications,
  onOpenNotifications,
  onOpenDeviceSimulator,
  onOpenAddChildModal,
  onOpenCreateTestConversation,
  onOpenAccountSettings,
  onSwitchToChildMode,
  onLogout,
  viewMode,
  onSetViewMode,
  realtimeConnected = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Identity with New Professional Family Safety Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSetViewMode('family')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            title="SafeChat - Safe conversations. Safer families."
          >
            <SafeChatLogo size={38} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">SafeChat</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <Lock className="h-3 w-3" />
                  Privacy-Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="hidden text-xs text-slate-500 sm:block font-normal">
                  Safe conversations. Safer families.
                </p>
                {realtimeConnected && (
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Protection
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* View Switcher / Quick Child Selector */}
        <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex">
          <button
            id="nav-family-overview"
            onClick={() => onSetViewMode('family')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'family'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Family Overview
          </button>
          {childrenList.map((c) => (
            <button
              key={c.id}
              id={`nav-child-${c.id}`}
              onClick={() => {
                onSelectChild(c.id);
                onSetViewMode('child');
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'child' && selectedChildId === c.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{c.full_name.split(' ')[0]}</span>
              {c.safety_status === 'Critical' && (
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              )}
              {c.safety_status === 'Attention Needed' && (
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          ))}
          <button
            id="btn-header-add-child-quick"
            onClick={onOpenAddChildModal}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
            title="Pair a new child device"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Child</span>
          </button>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Test Conversation Synthetic Testing Button */}
          {onOpenCreateTestConversation && (
            <button
              id="btn-header-test-conversation"
              onClick={onOpenCreateTestConversation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-100 transition"
              title="Create synthetic test conversation to test cyberbullying/threat detection"
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Test Conversation</span>
              <span className="inline sm:hidden">Test</span>
            </button>
          )}

          {/* Child Device Agent Status & Simulator */}
          <button
            id="btn-child-device-status"
            onClick={onOpenDeviceSimulator}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
            title="Test child device simulator & live event ingestion"
          >
            <Smartphone className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Device Sim</span>
            <span className="inline sm:hidden">Sim</span>
          </button>

          {/* Notifications Bell */}
          <button
            id="btn-notifications-bell"
            onClick={onOpenNotifications}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
            title="Safety Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Parent Profile Menu Dropdown */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3" ref={menuRef}>
            <button
              id="btn-parent-account-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs ring-1 ring-indigo-200">
                {parent?.full_name ? parent.full_name[0] : 'P'}
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {parent?.full_name || 'Priya Sharma'}
                </div>
                <div className="text-[10px] text-slate-500">Parent Guardian</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-fadeIn z-50">
                <div className="border-b border-slate-100 px-3 py-2">
                  <div className="text-xs font-bold text-slate-900">{parent?.full_name || 'Priya Sharma'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{parent?.email || 'priya.sharma@example.com'}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAddChildModal();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <Plus className="h-4 w-4 text-indigo-600" />
                    <span>Pair New Child Device</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccountSettings();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSwitchToChildMode();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span>Switch to Child Mode</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
