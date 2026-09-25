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
  Sparkles,
  Clock,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ParentUser, ParentNotification, ChildProfile } from '../types';
import { SafeChatLogo } from './SafeChatLogo';

export type DashboardViewMode = 'family' | 'child' | 'simulator' | 'history' | 'privacy';

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
  viewMode: DashboardViewMode;
  onSetViewMode: (mode: DashboardViewMode) => void;
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
        {/* Brand & Identity with Professional Family Safety Logo */}
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

        {/* View Switcher / Quick Navigation Tabs (Desktop) */}
        <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 lg:flex">
          <button
            id="nav-family-overview"
            onClick={() => onSetViewMode('family')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'family'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Family Overview
          </button>

          <button
            id="nav-simulator"
            onClick={() => onSetViewMode('simulator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'simulator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulator</span>
            <span className="rounded-full bg-amber-400 text-amber-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
              Demo
            </span>
          </button>

          <button
            id="nav-history"
            onClick={() => onSetViewMode('history')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Alert History</span>
          </button>

          <button
            id="nav-privacy"
            onClick={() => onSetViewMode('privacy')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'privacy'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Privacy & Architecture</span>
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Children Quick Switchers */}
          {childrenList.slice(0, 3).map((c) => (
            <button
              key={c.id}
              id={`nav-child-${c.id}`}
              onClick={() => {
                onSelectChild(c.id);
                onSetViewMode('child');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'child' && selectedChildId === c.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
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
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Simulator Button for tablets & medium screens */}
          <button
            id="btn-header-open-simulator-quick"
            onClick={() => onSetViewMode('simulator')}
            className="hidden md:inline-flex lg:hidden items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 transition cursor-pointer"
            title="Launch Interactive Scenario Simulator"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Simulator</span>
          </button>

          {/* Child Device Agent Status & Simulator */}
          <button
            id="btn-child-device-status"
            onClick={onOpenDeviceSimulator}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 cursor-pointer"
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
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none cursor-pointer"
            title="Safety Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Parent Profile Menu Dropdown */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3" ref={menuRef}>
            <button
              id="btn-parent-account-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs ring-1 ring-indigo-200">
                {parent?.full_name ? parent.full_name[0] : 'P'}
              </div>
              <div className="hidden text-left sm:block">
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
                  <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <Shield className="h-3 w-3" /> Public Demo Session
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAddChildModal();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-indigo-600" />
                    <span>Pair New Child Device</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccountSettings();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSwitchToChildMode();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
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
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Reset Demo Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle (Hamburger) */}
          <button
            id="btn-mobile-nav-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSetViewMode('family');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'family'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Family Overview</span>
            </button>

            <button
              onClick={() => {
                onSetViewMode('simulator');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'simulator'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Safety Simulator</span>
            </button>

            <button
              onClick={() => {
                onSetViewMode('history');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'history'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Alert History</span>
            </button>

            <button
              onClick={() => {
                onSetViewMode('privacy');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'privacy'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Privacy & Demo</span>
            </button>
          </div>

          {/* Mobile Child Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Protected Children:
            </div>
            <div className="flex flex-wrap gap-2">
              {childrenList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectChild(c.id);
                    onSetViewMode('child');
                    setMobileNavOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'child' && selectedChildId === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.full_name}</span>
                  {c.safety_status === 'Critical' && (
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                  )}
                  {c.safety_status === 'Attention Needed' && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
