import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/auth/LandingPage';
import { GigPartnerDashboard } from './components/gigPartner/GigPartnerDashboard';
import { GigHostDashboard } from './components/gigHost/GigHostDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ServicePartnerDashboard } from './components/servicePartner/ServicePartnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AIMatchingAssistant } from './components/ai/AIMatchingAssistant';
import { UserRole } from './types';
import { ShieldAlert, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

function parseTargetRoleFromHash(hash: string): UserRole | null {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) return null;
  const segment = clean.split('/')[0];
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

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const requestedRole = parseTargetRoleFromHash(currentHash);

  // Auto-redirect unauthorized attempts back to user's dashboard after notice
  useEffect(() => {
    if (currentUser && requestedRole && requestedRole !== currentUser.role) {
      const timer = setTimeout(() => {
        window.location.hash = `#/${currentUser.role}/dashboard`;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, requestedRole]);

  const [authConfig, setAuthConfig] = useState<{
    isOpen: boolean;
    initialTab?: 'login' | 'register';
    initialRole?: UserRole;
  }>({
    isOpen: false,
    initialTab: 'login',
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login', role?: UserRole) => {
    setAuthConfig({
      isOpen: true,
      initialTab: tab,
      initialRole: role,
    });
  };

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
          onOpenAuth={() => handleOpenAuth('login')}
        />
      </div>

      {/* Main Role-Specific Viewport with Strict Route & Access Protection */}
      <main className="flex-1">
        {!currentUser ? (
          requestedRole ? (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Authentication Required
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You must sign in to an authorized <strong className="text-slate-900 capitalize">{requestedRole.replace('_', ' ')}</strong> account to access this portal.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleOpenAuth('login', requestedRole)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Sign In as {requestedRole.replace('_', ' ')}
                </button>
                <button
                  onClick={() => {
                    window.location.hash = '#/';
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Return to Home Overview
                </button>
              </div>
            </div>
          ) : (
            <LandingPage onOpenAuth={(mode, role) => handleOpenAuth(mode, role)} />
          )
        ) : requestedRole && requestedRole !== currentUser.role ? (
          /* STRICT ACCESS CONTROL BLOCK: User attempted to access another role's route */
          <div className="max-w-2xl mx-auto my-16 p-8 bg-white border-2 border-rose-300 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 font-mono text-xs font-bold rounded-full border border-rose-200">
              403 Forbidden • Route Protected
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Access Denied to {requestedRole.replace('_', ' ').toUpperCase()} Portal
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You are currently authenticated as a <strong className="text-slate-900 capitalize font-bold">{currentUser.role.replace('_', ' ')}</strong>. You are strictly prohibited from accessing <strong className="text-rose-600 capitalize font-bold">{requestedRole.replace('_', ' ')}</strong> routes.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Your Role:</span>
                <span className="font-semibold text-slate-800">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attempted Route:</span>
                <span className="font-semibold text-rose-600">{currentHash}</span>
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
          <LandingPage onOpenAuth={(mode, role) => handleOpenAuth(mode, role)} />
        )}
      </main>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={authConfig.isOpen}
        onClose={() => setAuthConfig(prev => ({ ...prev, isOpen: false }))}
        initialTab={authConfig.initialTab}
        initialRole={authConfig.initialRole}
      />
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
