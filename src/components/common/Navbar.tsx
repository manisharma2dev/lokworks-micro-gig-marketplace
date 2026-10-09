import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Wallet, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenAuth }) => {
  const { currentUser, logout, activeView, setActiveView, notifications } = useApp();

  const unreadCount = notifications.filter(
    n => (!n.read) && (n.recipientId === currentUser?.id || n.recipientId === 'all' || n.roleTarget === currentUser?.role)
  ).length;

  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { id: 'explore_gigs', label: 'Micro-Gigs' },
        { id: 'explore_services', label: 'Local Services' },
        { id: 'how_it_works', label: 'How Escrow Works' },
        { id: 'subscriptions', label: 'Pricing & Plans' },
      ];
    }

    switch (currentUser.role) {
      case 'gig_partner':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'gigs_browse', label: 'Find Gigs' },
          { id: 'map_view', label: 'Map Discovery' },
          { id: 'my_bookings', label: 'My Bookings' },
          { id: 'profile', label: 'My Profile' },
        ];
      case 'gig_host':
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'post_gig', label: '+ Post Gig' },
          { id: 'my_gigs', label: 'Manage Gigs' },
          { id: 'claims', label: 'Item Protection' },
          { id: 'subscriptions', label: 'Subscriptions' },
          { id: 'rehire_partners', label: 'Direct Rehire' },
        ];
      case 'client':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'services_browse', label: 'Browse Technicians' },
          { id: 'map_view', label: 'Nearby Pros' },
          { id: 'my_bookings', label: 'Service Bookings' },
          { id: 'subscriptions', label: 'Promotion Plans' },
        ];
      case 'service_partner':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'my_services', label: 'My Services' },
          { id: 'my_bookings', label: 'Client Orders' },
          { id: 'profile', label: 'Credentials & KYC' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Command Center' },
          { id: 'admin_jobs', label: 'Job Monitor' },
          { id: 'admin_escrow', label: 'Escrow Ledger' },
          { id: 'admin_claims', label: 'Protection Claims' },
          { id: 'admin_users', label: 'User Verification' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="w-full bg-white border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              LW
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                LokWorks
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Micro-Gig & Local Services
              </span>
            </div>
          </button>

          {currentUser && (
            <div className="hidden sm:block ml-2">
              {currentUser.role === 'gig_partner' && (
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  Gig Partner Portal
                </span>
              )}
              {currentUser.role === 'gig_host' && (
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                  Gig Host Portal
                </span>
              )}
              {currentUser.role === 'client' && (
                <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg">
                  Client Portal
                </span>
              )}
              {currentUser.role === 'service_partner' && (
                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                  Service Partner Portal
                </span>
              )}
              {currentUser.role === 'admin' && (
                <span className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg">
                  Admin Monitor Console
                </span>
              )}
            </div>
          )}
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                activeView === link.id
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5'
                  : 'text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions & User Info */}
        <div className="flex items-center gap-3">
          
          {currentUser ? (
            <>
              {/* Escrow & Wallet indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Wallet:</span>
                <span className="font-bold text-slate-900">₹{currentUser.walletBalance.toLocaleString('en-IN')}</span>
                {currentUser.escrowLockedBalance > 0 && (
                  <span className="text-amber-700 ml-1 bg-amber-50 px-1 rounded">
                    (₹{currentUser.escrowLockedBalance.toLocaleString('en-IN')} Escrow)
                  </span>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile button */}
              <button
                onClick={() => setActiveView('profile')}
                className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div className="hidden sm:block">
                  <span className="text-xs font-semibold text-slate-900 block leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize flex items-center gap-0.5">
                    {currentUser.role.replace('_', ' ')}
                    {currentUser.verificationStatus.kycGovtId && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline ml-0.5" />
                    )}
                  </span>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
