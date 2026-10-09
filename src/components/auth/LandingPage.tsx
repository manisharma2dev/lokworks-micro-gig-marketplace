import React, { useState } from 'react';
import { UserRole } from '../../types';
import { 
  Briefcase, 
  Wrench, 
  ShieldCheck, 
  Home, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  LogIn,
  UserPlus,
  ShieldAlert,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register', role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'micro_gig' | 'local_services'>('all');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 max-w-7xl mx-auto text-center space-y-6">
        
        {/* Top Protocol Pill */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>India’s On-Demand Dual-Track Gig & Local Services Marketplace</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Where Rapid Micro-Gigs Meet Verified Local Craftsmanship
        </h1>

        {/* Subtitle / Short Description */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          LokWorks operates two independent marketplace streams across four dedicated roles: hire reliable operational helpers for event & retail micro-gigs, or book certified master technicians with guaranteed escrow protection.
        </p>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth('register', 'gig_partner')}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onOpenAuth('login', 'gig_host')}
            className="py-3 px-5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>Sign In to Portal</span>
          </button>
        </div>

        {/* Category Filter Switcher Tabs */}
        <div className="pt-8 max-w-xl mx-auto">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center justify-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles (4)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('micro_gig')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeCategoryFilter === 'micro_gig'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Category 1: Micro-Gigs</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('local_services')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeCategoryFilter === 'local_services'
                  ? 'bg-white text-purple-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Category 2: Local Services</span>
            </button>
          </div>
        </div>

        {/* THE FOUR ROLE CARDS */}
        <div className="pt-6 text-left max-w-6xl mx-auto space-y-10">
          
          {/* ============================================================ */}
          {/* CATEGORY 1: MICRO-GIG MARKETPLACE */}
          {/* ============================================================ */}
          {(activeCategoryFilter === 'all' || activeCategoryFilter === 'micro_gig') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  C1
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Category 1: Micro-Gig Marketplace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rapid operational tasks: Event assistants, retail stocking, warehouse packing, and crowd queuing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* ROLE 1: GIG HOST */}
                <div className="bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-3xl p-6 sm:p-7 shadow-xs transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        Job Provider
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Micro-Gig Marketplace
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        Gig Host
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        For event leads, store managers, retail operators, and businesses looking to post flexible operational shifts with locked escrow guarantees.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Post multi-worker shifts (1 to 50 slots per task)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Automated waiting lists & slot auto-promotions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Merchant item protection & direct rehire plans</span>
                      </li>
                    </ul>
                  </div>

                  {/* Buttons for Gig Host */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => onOpenAuth('login', 'gig_host')}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In as Gig Host</span>
                    </button>
                    <button
                      onClick={() => onOpenAuth('register', 'gig_host')}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>

                {/* ROLE 2: GIG PARTNER */}
                <div className="bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-3xl p-6 sm:p-7 shadow-xs transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        Job Finder
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Micro-Gig Marketplace
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        Gig Partner
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        For college students, young professionals, and part-time helpers seeking flexible shifts with instant wallet payouts upon job check-out.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Instant slot booking & GPS site check-in</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Refer-a-Slot bulk bookings for friend circles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Academic balance: Max 8 monthly shifts for students</span>
                      </li>
                    </ul>
                  </div>

                  {/* Buttons for Gig Partner */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => onOpenAuth('login', 'gig_partner')}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In as Gig Partner</span>
                    </button>
                    <button
                      onClick={() => onOpenAuth('register', 'gig_partner')}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CATEGORY 2: LOCAL SERVICE MARKETPLACE */}
          {/* ============================================================ */}
          {(activeCategoryFilter === 'all' || activeCategoryFilter === 'local_services') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  C2
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Category 2: Local Service Marketplace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Experienced & certified trades: Master electricians, senior plumbers, carpenters, and technicians.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* ROLE 3: CLIENT */}
                <div className="bg-white border-2 border-slate-200 hover:border-purple-400 rounded-3xl p-6 sm:p-7 shadow-xs transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Home className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                        Service Seeker
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                        Local Service Marketplace
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        Client
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        For homeowners, apartment residents, and householders seeking experienced craft professionals with guaranteed escrow custody until satisfied.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>100% Escrow custody: Funds safe until work inspected</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Verified technician portfolios, ratings, & reviews</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Transparent fixed service / shift pricing and satisfaction approval</span>
                      </li>
                    </ul>
                  </div>

                  {/* Buttons for Client */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => onOpenAuth('login', 'client')}
                      className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In as Client</span>
                    </button>
                    <button
                      onClick={() => onOpenAuth('register', 'client')}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>

                {/* ROLE 4: SERVICE PARTNER */}
                <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 sm:p-7 shadow-xs transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                        Skilled Provider
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                        Local Service Marketplace
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        Service Partner
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        For experienced and verified trade professionals (electricians, plumbers, carpenters) wanting fair transparent client orders without payment defaults.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Pre-funded escrow: No unpaid invoices or defaults</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Identity, KYC, and experienced pro badges</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Direct neighborhood order scheduling</span>
                      </li>
                    </ul>
                  </div>

                  {/* Buttons for Service Partner */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => onOpenAuth('login', 'service_partner')}
                      className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In as Service Partner</span>
                    </button>
                    <button
                      onClick={() => onOpenAuth('register', 'service_partner')}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </section>

      {/* Escrow State Machine Explainer */}
      <section className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Default Payment Guarantee</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How the LokWorks Automated Escrow Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
              Guaranteed payment custody protects gig partners from defaults, while ensuring hosts and clients only pay for verified work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-xs text-slate-900">Upfront Escrow Deposit</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Host or Client funds the full payment pool into platform escrow prior to shift opening.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-xs text-slate-900">GPS Site Check-In</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Worker arrives at worksite, triggering location check-in. Status transitions to "In Progress".
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-xs text-slate-900">Work Check-Out Inspection</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Worker checks out upon concluding tasks. Host or Client validates completion in 1 tap.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/60 border-emerald-200 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-xs text-emerald-950">Instant Wallet Credit</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Escrow automatically releases straight into the partner's wallet, available for payout.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer with Discreet Admin Portal Link */}
      <footer className="border-t border-slate-200 bg-slate-900 text-white py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              LW
            </div>
            <span className="font-bold text-white text-sm">LokWorks</span>
            <span className="text-slate-500"> • On-Demand Micro-Gig & Local Services Marketplace</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenAuth('login', 'admin')}
              className="text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Monitor Portal Login</span>
            </button>
            <span className="text-slate-600">|</span>
            <span>Bengaluru, India (₹ INR)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
