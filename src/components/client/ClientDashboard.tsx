import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceListing, ServiceBooking } from '../../types';
import { PaymentGatewayModal } from '../common/PaymentGatewayModal';
import { InteractiveJobMap } from '../map/InteractiveJobMap';
import { 
  Wrench, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation, 
  IndianRupee, 
  Award, 
  Sparkles,
  Phone,
  MessageSquare,
  Compass
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    currentUser, 
    serviceListings, 
    serviceBookings, 
    subscriptionPlans,
    purchaseSubscription,
    bookService, 
    approveServiceBooking, 
    reviewServiceBooking,
    activeView,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'my_bookings' | 'map' | 'subscriptions'>('browse');

  useEffect(() => {
    if (activeView === 'my_bookings') setActiveTab('my_bookings');
    else if (activeView === 'map_view') setActiveTab('map');
    else if (activeView === 'subscriptions') setActiveTab('subscriptions');
    else if (activeView === 'services_browse' || activeView === 'dashboard') setActiveTab('browse');
  }, [activeView]);

  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking modal state
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-10-09');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [clientAddress, setClientAddress] = useState('Flat 402, Prestige Palms, Koramangala');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState<any | null>(null);

  // Review modal state
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('Punctual, professional diagnostics and clean wiring repair!');

  // Filter listings
  const filteredServices = serviceListings.filter(s => {
    const matchesTrade = selectedTrade === 'all' || s.trade.toLowerCase() === selectedTrade.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrade && matchesSearch;
  });

  // Client's bookings
  const myBookings = serviceBookings.filter(b => b.clientId === currentUser?.id);

  const handleInitiateBooking = (service: ServiceListing) => {
    setSelectedService(service);
    const details = {
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      estimatedHours,
      clientAddress,
    };
    setPendingBookingDetails(details);
    setShowPaymentModal(true); // Open simulated escrow payment!
  };

  const handleEscrowSuccess = () => {
    if (selectedService && pendingBookingDetails) {
      bookService(selectedService.id, pendingBookingDetails);
      setShowPaymentModal(false);
      setActiveTab('my_bookings');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewBookingId) {
      reviewServiceBooking(reviewBookingId, ratingScore, reviewText);
      setReviewBookingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
            Category 2: Local Services Marketplace
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Verified Experienced Professionals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Book certified electricians, plumbers, carpenters & technicians with 100% Escrow Protection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'browse' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Browse Technicians
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'map' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Nearby Pros (Map)</span>
          </button>
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'my_bookings' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Orders ({myBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'subscriptions' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Promotion Plans</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE SERVICES */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by trade, skill or name (e.g. Electrician, Inverter, Leakage)..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['all', 'Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Appliance Repair'].map((trade) => (
                <button
                  key={trade}
                  onClick={() => setSelectedTrade(trade)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedTrade === trade ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {trade === 'all' ? 'All Trades' : trade}
                </button>
              ))}
            </div>
          </div>

          {/* Technicians Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-4"
              >
                <div>
                  {/* Partner Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.partnerAvatar}
                        alt={service.partnerName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{service.partnerName}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{service.rating}</span>
                          <span className="text-slate-400 font-normal">({service.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-slate-900">₹{service.hourlyRate}</span>
                      <span className="text-[10px] text-slate-500 block font-medium">Fixed / Shift Price</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {service.verifiedBadges.map((badge, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                        ✓ {badge}
                      </span>
                    ))}
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                      {service.experienceYears}+ Yrs Experience
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 mt-3">{service.title}</h5>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {service.skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Portfolio Thumbnail if available */}
                  {service.portfolioImages.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Verified Work Portfolio:
                      </span>
                      <img
                        src={service.portfolioImages[0]}
                        alt="Work portfolio sample"
                        className="w-full h-24 rounded-xl object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* Booking Trigger */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleInitiateBooking(service)}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Service via Escrow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY SERVICE BOOKINGS (Workflow: Check-in -> Complete -> Approval -> Escrow release) */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600 bg-purple-50/60 p-3 rounded-xl border border-purple-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Safe Escrow Timeline:</strong> Your payment stays securely locked until the technician finishes work and you tap "Approve & Release Payment".
            </span>
          </div>

          <div className="space-y-4">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{b.serviceTitle}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      b.status === 'secured_escrow' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'partner_checked_in' ? 'bg-amber-100 text-amber-800' :
                      b.status === 'work_completed' ? 'bg-purple-100 text-purple-800' :
                      b.status === 'client_approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>Technician: <strong className="text-slate-900">{b.partnerName}</strong></span>
                    <span>•</span>
                    <span>{b.date} ({b.timeSlot})</span>
                    <span>•</span>
                    <span>Address: {b.clientAddress}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-slate-900">
                      Total: ₹{b.totalAmount} (Escrow Protected)
                    </span>
                  </div>

                  {b.checkedInAt && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                      ✓ Partner Checked In at: <span className="font-mono font-bold">{b.checkedInAt}</span>
                    </div>
                  )}

                  {b.checkedOutAt && (
                    <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg">
                      ✓ Partner Checked Out at: <span className="font-mono font-bold">{b.checkedOutAt}</span>. Work completed!
                    </div>
                  )}

                  {b.clientReview && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                      Your Review: <strong className="text-amber-600">{b.clientReview.rating} ★</strong> - "{b.clientReview.comment}"
                    </div>
                  )}
                </div>

                {/* State Machine Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {b.status === 'work_completed' && (
                    <button
                      onClick={() => approveServiceBooking(b.id)}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Work & Release Escrow</span>
                    </button>
                  )}

                  {b.status === 'client_approved' && !b.clientReview && (
                    <button
                      onClick={() => setReviewBookingId(b.id)}
                      className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate & Review Technician</span>
                    </button>
                  )}

                  {b.status === 'secured_escrow' && (
                    <span className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-lg">
                      Awaiting Technician Arrival
                    </span>
                  )}
                </div>
              </div>
            ))}

            {myBookings.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No service bookings yet. Browse verified technicians to schedule a visit!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MAP VIEW */}
      {activeTab === 'map' && (
        <InteractiveJobMap />
      )}

      {/* TAB 4: PROMOTION PLANS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-bold text-lg text-slate-900">Platform Promotion Plans for Clients</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select verified trust packages to prioritize your service requests and receive rapid responses from certified master technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const isSubscribed = currentUser?.activeSubscriptions?.includes(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${
                    isSubscribed ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-400'
                  }`}
                >
                  <div>
                    {isSubscribed && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-2">
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
                    className="mt-6 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    {isSubscribed ? 'Promotion Active' : `Activate for ₹${plan.price.toLocaleString('en-IN')}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-base text-slate-900 mb-2">Rate & Review Technician</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingScore(s)}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${s <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewBookingId(null)}
                  className="py-2.5 px-4 text-slate-500 hover:text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Escrow Payment Gateway for Service Booking */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleEscrowSuccess}
        amount={selectedService ? selectedService.hourlyRate : 0}
        title="Lock Escrow for Local Service"
        subtitle={selectedService?.title || 'Skilled Service Booking'}
        beneficiaryName={selectedService?.partnerName || 'Service Partner'}
        isEscrow={true}
      />

    </div>
  );
};
