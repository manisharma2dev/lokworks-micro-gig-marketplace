import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GigJob, GigBooking } from '../../types';
import { InteractiveJobMap } from '../map/InteractiveJobMap';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  IndianRupee,
  Navigation,
  Sparkles,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export const GigPartnerDashboard: React.FC = () => {
  const { 
    currentUser, 
    gigJobs, 
    gigBookings, 
    waitingList,
    bookGigSlot, 
    joinWaitingList, 
    cancelGigBooking, 
    referSlotsBulk,
    checkInGig, 
    checkOutGig,
    activeView,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'available' | 'my_bookings' | 'refer_slot' | 'map' | 'profile'>(
    activeView === 'my_bookings' ? 'my_bookings' : 
    activeView === 'map_view' ? 'map' : 
    activeView === 'profile' ? 'profile' : 'available'
  );

  useEffect(() => {
    if (activeView === 'my_bookings') setActiveTab('my_bookings');
    else if (activeView === 'map_view') setActiveTab('map');
    else if (activeView === 'profile') setActiveTab('profile');
    else if (activeView === 'gigs_browse' || activeView === 'dashboard') setActiveTab('available');
  }, [activeView]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [referJobId, setReferJobId] = useState<string>('gig_job_retail_replenish');
  const [friendCount, setFriendCount] = useState<number>(5);
  const [referSuccessMsg, setReferSuccessMsg] = useState<string | null>(null);

  // Filter only gigs relevant to Gig Partner (Micro-Gigs only)
  const availableGigs = gigJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.location.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || job.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Partner's active bookings
  const myBookings = gigBookings.filter(b => b.partnerId === currentUser?.id);
  const myWaitlist = waitingList.filter(w => w.partnerId === currentUser?.id);

  const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
  const studentLimit = currentUser?.studentWorkLimit ?? 8;
  const studentCompleted = currentUser?.studentJobsCompletedThisMonth ?? 1;
  const studentRemaining = Math.max(studentLimit - studentCompleted, 0);

  const handleBooking = (jobId: string) => {
    if (currentUser?.isStudent && studentRemaining === 0) {
      alert('Monthly Work Limit Reached! As a college student, you cannot book more gigs this month to protect your study hours.');
      return;
    }
    const res = bookGigSlot(jobId);
    if (!res.success) {
      if (res.waitingListRequired) {
        if (confirm('All slots are filled! Would you like to join the Waiting List?')) {
          joinWaitingList(jobId);
        }
      } else {
        alert(res.error);
      }
    }
  };

  const handleReferSubmit = () => {
    const res = referSlotsBulk(referJobId, friendCount);
    if (res.success) {
      setReferSuccessMsg(res.message);
      setTimeout(() => setReferSuccessMsg(null), 4000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Account Suspension Banner (Scenario G) */}
      {currentUser?.isSuspended && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Account Temporarily Suspended</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Reason: {currentUser.suspensionReason || 'Repeated cancellations beyond permitted limit.'}
            </p>
            <p className="text-xs text-rose-600 mt-1 font-medium">
              Suspension active for {currentUser.suspensionEndDate || '21 days'}. New gig slot bookings and waitlist entries are restricted during this period.
            </p>
          </div>
        </div>
      )}

      {/* Top Profile Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100"
            />
            {currentUser?.verificationStatus.kycGovtId && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full text-xs shadow-xs" title="Identity KYC Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
              {currentUser?.isStudent && (
                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                  Student Partner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{currentUser?.location}</span>
              <span>•</span>
              <span>Reliability Score: <strong className="text-slate-900 font-mono">{currentUser?.reliabilityScore}/100</strong></span>
              <span>•</span>
              <span>Rating: <strong className="text-amber-600 font-mono">{currentUser?.rating} ★</strong> ({currentUser?.reviewCount} reviews)</span>
            </p>
          </div>
        </div>

        {/* Monthly Academic Work Limit Widget */}
        {currentUser?.isStudent && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[270px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Monthly Academic Work Limit</span>
              <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentMonthYear}
              </span>
            </div>
            
            <div className="flex items-baseline justify-between text-xs my-1">
              <span className="font-mono font-bold text-indigo-600">
                {studentCompleted} / {studentLimit} Jobs Completed
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                {studentRemaining === 0 ? (
                  <span className="text-rose-600 font-bold">0 Jobs Remaining</span>
                ) : (
                  <span><strong>{studentRemaining}</strong> {studentRemaining === 1 ? 'Job' : 'Jobs'} Remaining</span>
                )}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-1">
              <div 
                className={`h-full rounded-full transition-all ${
                  studentRemaining === 0 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min((studentCompleted / studentLimit) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {studentRemaining === 0 ? (
                  <strong className="text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Monthly Work Limit Reached
                  </strong>
                ) : (
                  <span>Protects study hours</span>
                )}
              </span>
              <span className="text-[10px] text-slate-400">Resets monthly</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'available'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Available Gigs ({availableGigs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('my_bookings')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'my_bookings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Active Bookings ({myBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('refer_slot')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'refer_slot'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Refer Slot / Bulk Book</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'map'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Map Discovery</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Reputation & History</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE GIGS */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs or locations..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
              >
                <option value="all">All Micro-Gigs</option>
                <option value="event_helper">Event Assistance</option>
                <option value="store_replenish">Retail Stocking</option>
                <option value="packing_warehouse">Warehouse Packing</option>
                <option value="flyer_distribution">Flyer Handouts</option>
              </select>
            </div>
          </div>

          {/* Gigs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGigs.map((job) => {
              const isFull = job.filledSlots >= job.requiredWorkers;
              const hasBooked = gigBookings.some(b => b.jobId === job.id && b.partnerId === currentUser?.id && b.status !== 'cancelled');

              return (
                <div
                  key={job.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-indigo-300 ${
                    job.extendedVisibilityActive ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {job.extendedVisibilityActive && (
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded w-fit">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Extended Visibility Active (+5 hrs)</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                        {job.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        ₹{job.payPerWorker}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                      {job.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.date} • {job.startTime} - {job.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Slots: <strong className="font-mono text-slate-900">{job.filledSlots} / {job.requiredWorkers}</strong>
                          {isFull && <span className="ml-1 text-amber-600 font-semibold">(Waitlist: #{job.waitingListCount})</span>}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.skillsRequired.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {hasBooked ? (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Slot Reserved</span>
                      </div>
                    ) : isFull ? (
                      <button
                        onClick={() => {
                          if (currentUser?.isStudent && studentRemaining === 0) {
                            alert('Monthly Work Limit Reached! As a college student, you cannot join the waiting list for more gigs this month to protect your study hours.');
                            return;
                          }
                          const res = joinWaitingList(job.id);
                          if (res.success) {
                            alert(`Joined Waiting list at position #${res.position}! You will be promoted if a confirmed partner cancels.`);
                          }
                        }}
                        disabled={currentUser?.isSuspended || (currentUser?.isStudent && studentRemaining === 0)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          currentUser?.isStudent && studentRemaining === 0
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>{currentUser?.isStudent && studentRemaining === 0 ? 'Monthly Limit Reached' : `Join Waiting List (Pos #${job.waitingListCount + 1})`}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBooking(job.id)}
                        disabled={currentUser?.isSuspended || (currentUser?.isStudent && studentRemaining === 0)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                          currentUser?.isStudent && studentRemaining === 0
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{currentUser?.isStudent && studentRemaining === 0 ? 'Monthly Limit Reached' : 'Book Slot Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY BOOKINGS & GPS CHECK-IN */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-6">
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>GPS Verification Workflow:</strong> Use the "Simulate Arrived at Site" control to unlock the Check-In button. Check-Out alerts the Gig Host for completion approval and escrow payout.
            </span>
          </div>

          <div className="space-y-4">
            {myBookings.map((booking) => {
              const job = gigJobs.find(j => j.id === booking.jobId);
              if (!job) return null;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{job.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        booking.status === 'arrived_checked_in' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        booking.status === 'completed_pending_approval' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        booking.status === 'approved_paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location.address}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.startTime} - {job.endTime}
                      </span>
                      <span>•</span>
                      <span className="font-mono font-semibold text-slate-900">
                        Payout: ₹{booking.payoutAmount}
                      </span>
                    </div>

                    {booking.checkedInAt && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        ✓ Location Verified & Checked In at: <span className="font-mono font-bold">{booking.checkedInAt}</span>
                      </div>
                    )}

                    {booking.checkedOutAt && (
                      <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
                        ✓ Work Completed & Checked Out at: <span className="font-mono font-bold">{booking.checkedOutAt}</span> (Awaiting Host Approval)
                      </div>
                    )}

                    {booking.status === 'approved_paid' && (
                      <div className="text-xs text-emerald-800 bg-emerald-100/60 p-2 rounded-lg font-medium">
                        ✓ Completed & Escrow Released: ₹{booking.payoutAmount} credited to your wallet balance.
                      </div>
                    )}
                  </div>

                  {/* Actions for Booking State Machine */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => checkInGig(booking.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Simulate Arrived & Check-In</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel? Repeated cancellations will lower your reliability score and trigger a temporary suspension.')) {
                              cancelGigBooking(booking.id);
                            }
                          }}
                          className="w-full sm:w-auto px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {booking.status === 'arrived_checked_in' && (
                      <button
                        onClick={() => checkOutGig(booking.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Work Done → Check-Out</span>
                      </button>
                    )}

                    {booking.status === 'completed_pending_approval' && (
                      <div className="text-xs text-purple-600 font-medium px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-200">
                        Awaiting Host Inspection Approval
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {myBookings.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No bookings yet. Browse open gigs to reserve a slot!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REFER SLOT / BULK BOOKING */}
      {activeTab === 'refer_slot' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Refer Slot / Group Slot Reservation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Invite friends to work the same gig alongside you. Generate a referral link or simulate friends joining together to reserve bulk slots.
            </p>
          </div>

          {referSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{referSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Target Gig Job
                </label>
                <select
                  value={referJobId}
                  onChange={(e) => setReferJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  {gigJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.requiredWorkers - j.filledSlots} slots open) - ₹{j.payPerWorker}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Number of Friends to Reserve Slots For
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={friendCount}
                  onChange={(e) => setFriendCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <button
                onClick={handleReferSubmit}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Simulate Friends Joining via Referral Link</span>
              </button>
            </div>

            {/* Referral Link Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Shareable Referral Link:
                </span>
                <div className="bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-700 break-all select-all">
                  https://lokworks.in/slot-invite/REF-{referJobId.slice(0, 10).toUpperCase()}-GRP
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  When your friends open this link, they are automatically placed in the same team shift and group checked-in.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
                <strong>Bulk Booking Guarantee:</strong> Ensures friends are not split across separate dispatch waves or stations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MAP VIEW */}
      {activeTab === 'map' && (
        <InteractiveJobMap />
      )}

      {/* TAB 5: PROFILE & REPUTATION */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Overall Reliability Score</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {currentUser?.reliabilityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Computed from punctuality, check-in accuracy, and completion approvals.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Cancellation History</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {currentUser?.cancellationCount} <span className="text-xs text-slate-400 font-normal">cancellations</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cancellation rate: <span className="font-semibold text-slate-700">{currentUser?.cancellationRate}%</span> (Limit is 3 before suspension).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">Verified Platform Badges</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUser?.verificationStatus.kycGovtId && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                    ✓ Identity Verified
                  </span>
                )}
                {currentUser?.verificationStatus.skillVerified && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                    ✓ Skill Verified
                  </span>
                )}
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-semibold">
                  ✓ Phone Verified
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2">Work History & Skills</h4>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {currentUser?.skills.map((skill, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentUser?.bio}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
