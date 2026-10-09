import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Layers,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    gigJobs, 
    gigBookings, 
    waitingList,
    serviceListings, 
    serviceBookings, 
    itemClaims, 
    resolveItemClaim,
    transactions,
    verifyUserKyc, 
    suspendUser, 
    restoreUser,
    activeView,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'escrow' | 'claims' | 'users'>('overview');

  useEffect(() => {
    if (activeView === 'admin_jobs') setActiveTab('jobs');
    else if (activeView === 'admin_escrow') setActiveTab('escrow');
    else if (activeView === 'admin_claims') setActiveTab('claims');
    else if (activeView === 'admin_users') setActiveTab('users');
    else if (activeView === 'dashboard') setActiveTab('overview');
  }, [activeView]);

  // Metrics
  const totalHosts = users.filter(u => u.role === 'gig_host').length;
  const totalPartners = users.filter(u => u.role === 'gig_partner').length;
  const totalClients = users.filter(u => u.role === 'client').length;
  const totalServicePartners = users.filter(u => u.role === 'service_partner').length;
  const totalEscrowLocked = users.reduce((acc, u) => acc + u.escrowLockedBalance, 0);
  const totalPlatformRevenue = transactions
    .filter(t => t.type === 'subscription_purchase' || t.type === 'platform_commission')
    .reduce((acc, t) => acc + t.amount, 0);

  const suspendedUsers = users.filter(u => u.isSuspended);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Ecosystem Title Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            Category 3: Central Command Console
          </span>
          <h2 className="text-xl font-bold mt-0.5">Ecosystem Administration & Escrow Governance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring of transactions, dual marketplace streams, fraud flags, and refund claims.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            256-Bit Escrow Active
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Gig Hosts</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{totalHosts}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Gig Partners</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{totalPartners}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Clients</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{totalClients}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Service Pros</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{totalServicePartners}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Locked Escrow</span>
          <span className="text-xl font-bold font-mono text-indigo-600 mt-1 block">
            ₹{totalEscrowLocked.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Platform Revenue</span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            ₹{totalPlatformRevenue.toLocaleString('en-IN')}
          </span>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ecosystem Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs & Services Monitor</span>
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'escrow'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Escrow Ledger ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Protection Claims ({itemClaims.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Suspensions ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Live Activity Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Recent Financial Ledger Events</h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {transactions.slice(0, 8).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{tx.type.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ref: {tx.referenceId} • {tx.fromUserName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suspensions & Fraud Flags */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Flagged & Suspended Accounts ({suspendedUsers.length})</span>
            </h3>
            {suspendedUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No accounts currently under suspension.</p>
            ) : (
              <div className="space-y-3">
                {suspendedUsers.map((u) => (
                  <div key={u.id} className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-rose-950 block">{u.name} ({u.role})</span>
                      <p className="text-[11px] text-rose-800 mt-0.5">{u.suspensionReason}</p>
                      <span className="text-[10px] text-rose-600 mt-1 block">Reliability: {u.reliabilityScore}/100</span>
                    </div>
                    <button
                      onClick={() => restoreUser(u.id)}
                      className="py-1 px-2.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Lift Suspension
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOBS & SERVICES MONITOR */}
      {activeTab === 'jobs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">All Published Micro-Gigs Across the Platform</h3>
          <div className="divide-y divide-slate-100">
            {gigJobs.map((j) => (
              <div key={j.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{j.title}</span>
                  <span className="text-slate-500">
                    Host: {j.hostName} • {j.location.area} • {j.date}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span>Slots: {j.filledSlots}/{j.requiredWorkers}</span>
                  <span className="font-bold text-indigo-600">₹{j.payPerWorker}/worker</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-sans">
                    {j.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW LEDGER */}
      {activeTab === 'escrow' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Complete Platform Escrow Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{tx.referenceId}</td>
                    <td className="p-3 font-sans capitalize">{tx.type.replace('_', ' ')}</td>
                    <td className="p-3 font-sans">{tx.fromUserName}</td>
                    <td className="p-3 font-sans">{tx.toUserName || 'Platform Escrow'}</td>
                    <td className="p-3 font-bold text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-sans">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                        ✓ {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CLAIMS REVIEW */}
      {activeTab === 'claims' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Merchant Item Protection Claims</h3>
          <div className="space-y-3">
            {itemClaims.map((claim) => (
              <div key={claim.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{claim.itemDescription}</h4>
                    <p className="text-xs text-slate-500">
                      Host: {claim.hostName} • Job: {claim.jobTitle} • Incident: <strong className="capitalize">{claim.incidentType}</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{claim.evidenceNotes}"
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-900">₹{claim.claimedValue.toLocaleString('en-IN')}</span>
                    <span className={`block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1 ${
                      claim.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                      claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {claim.status === 'under_review' && (
                  <div className="pt-2 border-t border-slate-200 flex gap-2 justify-end">
                    <button
                      onClick={() => resolveItemClaim(claim.id, true, claim.claimedValue)}
                      className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Compensate ₹{claim.claimedValue}</span>
                    </button>
                    <button
                      onClick={() => resolveItemClaim(claim.id, false)}
                      className="py-1 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USER DIRECTORY & VERIFICATION */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Platform Users & KYC Moderation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Reliability</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Account State</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-3 capitalize">{u.role.replace('_', ' ')}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{u.reliabilityScore}/100</td>
                    <td className="p-3">
                      {u.verificationStatus.kycGovtId ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyUserKyc(u.id)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold"
                        >
                          Approve KYC
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      {u.isSuspended ? (
                        <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Active</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.isSuspended ? (
                        <button
                          onClick={() => restoreUser(u.id)}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => suspendUser(u.id, 'Administrative audit trigger.')}
                          className="text-xs text-rose-600 hover:underline font-medium"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
