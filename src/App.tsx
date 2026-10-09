import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/auth/LandingPage';
import { GigPartnerDashboard } from './components/gigPartner/GigPartnerDashboard';
import { GigHostDashboard } from './components/gigHost/GigHostDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ServicePartnerDashboard } from './components/servicePartner/ServicePartnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AIMatchingAssistant } from './components/ai/AIMatchingAssistant';
import { UserRole } from './types';
import { ShieldAlert, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

function parseTargetRole(): UserRole | null {
  // Check hash first (e.g. #/gig_host/dashboard)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const path = window.location.pathname.replace(/^\//, '').trim();
  const raw = hash || path;
  if (!raw) return null;
  const segment = raw.split('/')[0];
  const validRoles: UserRole[] = ['gig_partner', 'gig_host', 'client', 'service_partner', 'admin'];
  if (validRoles.includes(segment as UserRole)) {
    return segment as UserRole;
  }
  if (segment.startsWith('admin')) return 'admin';
  return null;
}

function AppContent() {
  const { currentUser, isAIChatOpen, setIsAIChatOpen, bannerAlert, clearBannerAlert, logout } = useApp();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);
  const [showLandingOverview, setShowLandingOverview] = useState(false);
  const [targetRoleBeforeAuth] = useState<UserRole | null>(() => parseTargetRole());

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const activeRoleFromUrl = parseTargetRole();

  // For unauthenticated visitors: redirect browser URL to #/login while preserving the requested role notice
  useEffect(() => {
    if (!currentUser) {
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        window.history.replaceState(null, '', '/#/login' + window.location.search);
      } else if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }
  }, [currentUser]);

  // Auto-redirect unauthorized attempts back to user's dashboard after notice
  useEffect(() => {
    if (currentUser && activeRoleFromUrl && activeRoleFromUrl !== currentUser.role) {
      const timer = setTimeout(() => {
        window.location.hash = `#/${currentUser.role}/dashboard`;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, activeRoleFromUrl]);

  // If authenticated user visits #/login, #/, or blank hash, keep them on their role's dashboard
  useEffect(() => {
    if (currentUser) {
      const clean = currentHash.replace(/^#\/?/, '').trim();
      if (!clean || clean === 'login') {
        window.location.hash = `#/${currentUser.role}/dashboard`;
      }
    }
  }, [currentUser, currentHash]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // UNAUTHENTICATED FLOW: Always display login page first regardless of requested URL
  if (!currentUser) {
    if (showLandingOverview) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
          <div className="bg-indigo-950 text-white px-4 py-2.5 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  Platform Guide
                </span>
                <span className="text-slate-300 hidden sm:inline text-xs">
                  Reviewing LokWorks ecosystem overview & marketplace roles
                </span>
              </div>
              <button
                onClick={() => setShowLandingOverview(false)}
                className="px-3.5 py-1.5 bg-white text-indigo-950 font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
          <LandingPage onOpenAuth={() => setShowLandingOverview(false)} />
        </div>
      );
    }

    return (
      <LoginPage
        requestedRole={targetRoleBeforeAuth}
        onOpenOverview={() => setShowLandingOverview(true)}
      />
    );
  }

  // AUTHENTICATED FLOW: Role-based dashboard with strict access control
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Global Access Notification Banner if triggered */}
      {bannerAlert && (
        <div className={`px-4 py-2.5 text-xs flex items-center justify-between transition-colors z-50 ${
          bannerAlert.type === 'warning'
            ? 'bg-amber-600 text-white shadow-sm'
            : bannerAlert.type === 'success'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-indigo-600 text-white shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{bannerAlert.title}:</span>
              <span>{bannerAlert.message}</span>
            </div>
            <button
              onClick={clearBannerAlert}
              className="text-white/80 hover:text-white p-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation - Clean single sticky bar */}
      <div className="sticky top-0 z-40 shadow-xs">
        <Navbar
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuth={() => {}}
        />
      </div>

      {/* Main Role-Specific Viewport with Strict Route & Access Protection */}
      <main className="flex-1">
        {activeRoleFromUrl && activeRoleFromUrl !== currentUser.role ? (
          /* STRICT ACCESS CONTROL BLOCK: User attempted to access another role's route */
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white border-2 border-rose-300 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 font-mono text-xs font-bold rounded-full border border-rose-200">
              403 Forbidden • Route Protected
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Access Denied to {activeRoleFromUrl.replace('_', ' ').toUpperCase()} Portal
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You are currently authenticated as a <strong className="text-slate-900 capitalize font-bold">{currentUser.role.replace('_', ' ')}</strong>. You are strictly prohibited from accessing <strong className="text-rose-600 capitalize font-bold">{activeRoleFromUrl.replace('_', ' ')}</strong> routes.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Your Role:</span>
                <span className="font-semibold text-slate-800">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attempted Route:</span>
                <span className="font-semibold text-rose-600">{currentHash || window.location.pathname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Policy:</span>
                <span className="font-semibold text-emerald-700">Strict Role Isolation</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Redirecting you to your dashboard in 4 seconds...
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.location.hash = `#/${currentUser.role}/dashboard`;
                }}
                className="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Return to Your {currentUser.role.replace('_', ' ')} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl transition-colors"
              >
                Sign Out to Switch Accounts
              </button>
            </div>
          </div>
        ) : currentUser.role === 'gig_partner' ? (
          <GigPartnerDashboard />
        ) : currentUser.role === 'gig_host' ? (
          <GigHostDashboard />
        ) : currentUser.role === 'client' ? (
          <ClientDashboard />
        ) : currentUser.role === 'service_partner' ? (
          <ServicePartnerDashboard />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <LoginPage
            requestedRole={targetRoleBeforeAuth}
            onOpenOverview={() => setShowLandingOverview(true)}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <AIMatchingAssistant
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
