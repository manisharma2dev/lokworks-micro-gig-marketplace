import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GigJob } from '../../types';
import { classifyGigJobAI, AIJobClassificationResult } from '../../utils/aiJobClassifier';
import { PaymentGatewayModal } from '../common/PaymentGatewayModal';
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  FileText,
  UserCheck,
  Bot
} from 'lucide-react';

export const GigHostDashboard: React.FC = () => {
  const { 
    currentUser, 
    gigJobs, 
    gigBookings, 
    waitingList,
    postGigJob, 
    approveGigCompletion,
    itemClaims,
    submitItemClaim,
    subscriptionPlans,
    purchaseSubscription,
    activateExtendedVisibility,
    directRehirePartner,
    users,
    activeView,
    setActiveView,
    setIsAIChatOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_jobs' | 'post_job' | 'approvals' | 'claims' | 'subscriptions' | 'rehire'>(
    activeView === 'post_gig' ? 'post_job' :
    activeView === 'claims' ? 'claims' :
    activeView === 'subscriptions' ? 'subscriptions' :
    activeView === 'rehire_partners' ? 'rehire' : 'my_jobs'
  );

  useEffect(() => {
    if (activeView === 'post_gig') setActiveTab('post_job');
    else if (activeView === 'claims') setActiveTab('claims');
    else if (activeView === 'subscriptions') setActiveTab('subscriptions');
    else if (activeView === 'rehire_partners') setActiveTab('rehire');
    else if (activeView === 'my_gigs' || activeView === 'dashboard') setActiveTab('my_jobs');
  }, [activeView]);

  // Post Gig Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GigJob['category']>('event_helper');
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('Indiranagar 100ft Road');
  const [address, setAddress] = useState('Metro Lifestyle Complex');
  const [date, setDate] = useState('2026-10-12');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [requiredWorkers, setRequiredWorkers] = useState(8);
  const [payPerWorker, setPayPerWorker] = useState(850);
  const [skillsRequired, setSkillsRequired] = useState('Polite, Energetic, Basic Hindi/English');
  const [isItemProtected, setIsItemProtected] = useState(false);

  // AI Validation State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIJobClassificationResult | null>(null);

  // Payment Gateway Modal State for Escrow Funding
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingJobData, setPendingJobData] = useState<any | null>(null);
  const [successPostMessage, setSuccessPostMessage] = useState<string | null>(null);

  // Claim Form State
  const [claimJobId, setClaimJobId] = useState(gigJobs[0]?.id || '');
  const [itemDesc, setItemDesc] = useState('');
  const [claimedVal, setClaimedVal] = useState(2500);
  const [incidentType, setIncidentType] = useState<'stolen' | 'damaged' | 'misused' | 'lost'>('damaged');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  // Rehire Form
  const [rehireWorkerId, setRehireWorkerId] = useState('user_partner_rohan');
  const [rehirePay, setRehirePay] = useState(900);

  // Real-time AI Analysis on title or description change
  const handleAIValidation = async () => {
    if (!title && !description) return;
    setIsAnalyzingAI(true);
    const result = await classifyGigJobAI(title, description, skillsRequired.split(','));
    setAiAnalysisResult(result);
    setIsAnalyzingAI(false);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingAI(true);
    
    // Evaluate via AI
    const result = await classifyGigJobAI(title, description, skillsRequired.split(','));
    setAiAnalysisResult(result);
    setIsAnalyzingAI(false);

    // If AI detects a skilled profession, block immediately!
    if (result.isSkilledJob) {
      return; // Do not proceed
    }

    const jobData = {
      title,
      description,
      category,
      location: {
        city,
        area,
        address,
        lat: 12.9716,
        lng: 77.6412,
      },
      date,
      startTime,
      endTime,
      requiredWorkers: Number(requiredWorkers),
      payPerWorker: Number(payPerWorker),
      skillsRequired: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      isItemProtected,
    };

    setPendingJobData(jobData);
    setShowPaymentModal(true); // Open simulated escrow gateway!
  };

  const handleEscrowPaymentSuccess = () => {
    if (pendingJobData) {
      postGigJob(pendingJobData);
      setSuccessPostMessage(`Gig "${pendingJobData.title}" published! Escrow locked for ${pendingJobData.requiredWorkers} workers.`);
      setTitle('');
      setDescription('');
      setAiAnalysisResult(null);
      setActiveTab('my_jobs');
      setTimeout(() => setSuccessPostMessage(null), 5000);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const job = gigJobs.find(j => j.id === claimJobId);
    submitItemClaim({
      jobId: claimJobId,
      jobTitle: job?.title || 'Assigned Delivery Gig',
      partnerId: 'user_partner_rohan',
      partnerName: 'Assigned Partner Worker',
      itemDescription: itemDesc,
      claimedValue: Number(claimedVal),
      incidentType,
      incidentDate: '2026-10-08',
      evidenceNotes,
    });
    setClaimMsg('Protection claim submitted for admin review!');
    setItemDesc('');
    setEvidenceNotes('');
    setTimeout(() => setClaimMsg(null), 4000);
  };

  // Host's jobs
  const myGigs = gigJobs.filter(j => j.hostId === currentUser?.id);
  const myGigIds = myGigs.map(j => j.id);

  // All bookings for host's jobs
  const hostBookings = gigBookings.filter(b => myGigIds.includes(b.jobId));
  const pendingApprovals = hostBookings.filter(b => b.status === 'completed_pending_approval');

  // Proven 5-star partners eligible for direct rehire
  const topPartners = users.filter(u => u.role === 'gig_partner' && u.rating >= 4.7);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Host Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500">Active Gigs Posted</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{myGigs.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across retail & event locations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500">Escrow Locked Funds</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            ₹{currentUser?.escrowLockedBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Guaranteed safe payout pool</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500">Awaiting Completion Approval</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {pendingApprovals.length} <span className="text-xs text-slate-400 font-normal">workers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Checked out & ready for release</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs text-slate-500">Active Subscriptions</div>
          <div className="text-xs font-semibold text-slate-900 mt-2">
            {currentUser?.activeSubscriptions?.includes('direct_rehire') ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 inline-block">
                ✓ Direct Rehire Active
              </span>
            ) : (
              <span className="text-slate-400">None Active</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Instant 5-star partner rehire</p>
        </div>
      </div>

      {successPostMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successPostMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my_jobs')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'my_jobs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Posted Gigs ({myGigs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('post_job')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'post_job'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Micro-Gig (AI Moderated)</span>
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completion Approvals ({pendingApprovals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rehire')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'rehire'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Direct Rehire (Plan 1)</span>
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
          <span>Item Protection Claims</span>
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'subscriptions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Platform Subscriptions</span>
        </button>
      </div>

      {/* TAB 1: MY POSTED GIGS */}
      {activeTab === 'my_jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGigs.map((job) => {
              const jobBookings = gigBookings.filter(b => b.jobId === job.id);
              const checkedInWorkers = jobBookings.filter(b => b.status === 'arrived_checked_in' || b.status === 'completed_pending_approval' || b.status === 'approved_paid');

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {job.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        ₹{job.payPerWorker} / worker
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1">{job.title}</h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div>📍 {job.location.address}</div>
                      <div>🕒 {job.date} • {job.startTime} - {job.endTime}</div>
                      <div>
                        👥 Slots Filled: <strong className="font-mono text-slate-900">{job.filledSlots} / {job.requiredWorkers}</strong>
                        {job.waitingListCount > 0 && (
                          <span className="text-amber-700 ml-2 font-semibold">({job.waitingListCount} on Waitlist)</span>
                        )}
                      </div>
                      <div>
                        ⚡ Verified Arrived / Checked In: <strong className="font-mono text-emerald-700">{checkedInWorkers.length}</strong>
                      </div>
                    </div>

                    {/* Escrow Status Bar */}
                    <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Escrow Allocation:</span>
                        <span className="font-mono font-bold text-indigo-600">
                          ₹{(job.requiredWorkers * job.payPerWorker).toLocaleString('en-IN')} Secured
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Funds released per worker only when you approve completion.
                      </div>
                    </div>
                  </div>

                  {/* Actions: Extended Visibility Booster (Scenario H) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => activateExtendedVisibility(job.id)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{job.extendedVisibilityActive ? 'Visibility Active (+5h)' : 'Extend Visibility (Boost 5h)'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Assigned Workers ({jobBookings.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: POST GIG WITH AI CLASSIFICATION (Scenario E) */}
      {activeTab === 'post_job' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Post a Micro-Gig Job</h3>
            <p className="text-xs text-slate-500 mt-1">
              Micro-gigs are strictly for entry-level and operational roles. An active AI classification layer verifies all postings to maintain category boundaries.
            </p>
          </div>

          {/* AI Warning Banner (Scenario E) */}
          {aiAnalysisResult?.isSkilledJob && (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 text-rose-900 animate-in shake duration-200 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-900">
                    AI Moderation Alert: Specialized Trade Detected ({aiAnalysisResult.detectedProfession})
                  </h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">
                    {aiAnalysisResult.warningMessage}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-2 bg-rose-100/60 p-2 rounded-lg">
                    <strong>Rule:</strong> Gig Hosts are prohibited from posting specialized services (electrician, plumber, chef, carpenter, technician) in the Micro-Gig category. Please switch to the Local Services category to hire licensed professionals.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase">
                  Job Title (AI Scanned)
                </label>
                <button
                  type="button"
                  onClick={handleAIValidation}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Check with AI</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleAIValidation}
                placeholder="e.g. Marathon Refreshment Distribution or Retail Stocking"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Try typing "Electrician" or "Plumber" to test the AI moderation guard.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Job Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleAIValidation}
                placeholder="Describe responsibilities, attire, reporting point..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  <option value="event_helper">Event Helper</option>
                  <option value="store_replenish">Retail Stocking</option>
                  <option value="packing_warehouse">Warehouse Packing</option>
                  <option value="flyer_distribution">Flyer Distribution</option>
                  <option value="queue_standing">Queue Assistance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Area / Ward</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Workers Required</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={requiredWorkers}
                  onChange={(e) => setRequiredWorkers(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Payment per Worker (₹)</label>
                <input
                  type="number"
                  min="300"
                  max="10000"
                  value={payPerWorker}
                  onChange={(e) => setPayPerWorker(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Skills / Criteria</label>
              <input
                type="text"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                placeholder="Comma separated (e.g. Punctual, Fast Learner)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            {/* Escrow summary calculation */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Total Escrow Required</span>
                <span className="text-[11px] text-slate-500">{requiredWorkers} workers × ₹{payPerWorker} per worker</span>
              </div>
              <span className="text-xl font-bold font-mono text-indigo-700">
                ₹{(requiredWorkers * payPerWorker).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzingAI || aiAnalysisResult?.isSkilledJob}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Review Escrow & Publish Gig</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: COMPLETION APPROVALS & ESCROW RELEASE (Scenario A) */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Job Completion & Escrow Approvals</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify checked-out workers and approve completion to trigger automatic escrow release.
            </p>
          </div>

          <div className="space-y-3">
            {hostBookings.map((b) => {
              const job = gigJobs.find(j => j.id === b.jobId);

              return (
                <div
                  key={b.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.partnerAvatar}
                      alt={b.partnerName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{b.partnerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({job?.title})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Status: <strong className="capitalize text-slate-800">{b.status.replace(/_/g, ' ')}</strong>
                        {b.checkedInAt && ` • In: ${b.checkedInAt}`}
                        {b.checkedOutAt && ` • Out: ${b.checkedOutAt}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ₹{b.payoutAmount} payout
                    </span>

                    {b.status === 'completed_pending_approval' ? (
                      <button
                        onClick={() => approveGigCompletion(b.id)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Completion & Release Escrow</span>
                      </button>
                    ) : b.status === 'approved_paid' ? (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                        ✓ Escrow Released
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Shift In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}

            {hostBookings.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No active bookings on your gigs yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT REHIRE (Scenario I) */}
      {activeTab === 'rehire' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Direct Rehire Subscription Feature</h3>
              <p className="text-xs text-slate-500 mt-1">
                Instant reservation with previously proven 5-star gig workers, bypassing the public queue.
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg">
              Plan 1 Active: ₹3,999/month
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPartners.map((partner) => (
              <div
                key={partner.id}
                className="border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4 bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{partner.name}</h4>
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">
                      {partner.rating} ★ • ({partner.reviewCount} jobs) • {partner.reliabilityScore}% reliability
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partner.skills.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => directRehirePartner(partner.id, 'Dedicated Event Lead', 950)}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
                >
                  Direct Rehire (₹950)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ITEM PROTECTION CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Delivery & Item Protection Refund Claims</h3>
            <p className="text-xs text-slate-500 mt-1">
              If an assigned worker causes damage, theft, or loss of merchandise during a gig, submit a platform escrow refund claim.
            </p>
          </div>

          {claimMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs border border-emerald-200">
              {claimMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Associated Job
                </label>
                <select
                  value={claimJobId}
                  onChange={(e) => setClaimJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  {gigJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Incident Type
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="damaged">Item Damaged</option>
                    <option value="stolen">Item Stolen</option>
                    <option value="lost">Item Lost</option>
                    <option value="misused">Item Misused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Claimed Value (₹)
                  </label>
                  <input
                    type="number"
                    value={claimedVal}
                    onChange={(e) => setClaimedVal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="e.g. Broken display electronics or missing carton"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Evidence Notes
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Details of the incident, CCTV reference, invoice details..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
              >
                Submit Protection Claim to Admin
              </button>
            </form>

            {/* Existing Claims List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Submitted Claims & Status
              </span>
              {itemClaims.map((claim) => (
                <div key={claim.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{claim.itemDescription}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      claim.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                      claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Job: {claim.jobTitle} • Incident: <span className="capitalize font-medium">{claim.incidentType}</span>
                  </p>
                  
                  <div className="text-xs font-mono font-bold text-slate-900">
                    Claim Amount: ₹{claim.claimedValue.toLocaleString('en-IN')}
                    {claim.compensationAmount && (
                      <span className="text-emerald-700 ml-2 font-normal">
                        (Compensated: ₹{claim.compensationAmount})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SUBSCRIPTION PLANS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-bold text-lg text-slate-900">Platform Subscriptions for Gig Hosts</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select specialized plans to accelerate staffing, extend vacancy visibility, or directly rehire 5-star talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const isSubscribed = currentUser?.activeSubscriptions?.includes(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${
                    isSubscribed ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <div>
                    {isSubscribed && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-2">
                        Active Plan
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900">{plan.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                    <div className="mt-4 mb-4">
                      <span className="text-2xl font-bold font-mono text-slate-900">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/ {plan.validityDays} days</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => purchaseSubscription(plan.id)}
                    disabled={isSubscribed}
                    className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    {isSubscribed ? 'Subscription Active' : `Activate for ₹${plan.price.toLocaleString('en-IN')}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Escrow Payment Modal for Gig Posting */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleEscrowPaymentSuccess}
        amount={pendingJobData ? pendingJobData.requiredWorkers * pendingJobData.payPerWorker : 0}
        title="Lock Escrow Deposit for Gig Job"
        subtitle={pendingJobData?.title || 'Micro-Gig Shift'}
        beneficiaryName="LokWorks Escrow Reserve"
        isEscrow={true}
      />

    </div>
  );
};
