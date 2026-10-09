import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { 
  Wrench, 
  Calendar, 
  PlusCircle, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  IndianRupee, 
  Upload, 
  UserCheck,
  FileCheck
} from 'lucide-react';

export const ServicePartnerDashboard: React.FC = () => {
  const { 
    currentUser, 
    serviceListings, 
    serviceBookings, 
    createServiceListing, 
    checkInServiceBooking, 
    checkOutServiceBooking,
    activeView,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'add_service' | 'credentials'>('bookings');

  useEffect(() => {
    if (activeView === 'my_services') setActiveTab('listings');
    else if (activeView === 'profile') setActiveTab('credentials');
    else if (activeView === 'my_bookings' || activeView === 'dashboard') setActiveTab('bookings');
  }, [activeView]);

  // Create listing form
  const [title, setTitle] = useState('Certified Master Electrician & Tripping Diagnostics');
  const [trade, setTrade] = useState<ServiceListing['trade']>('Electrician');
  const [experienceYears, setExperienceYears] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(450);
  const [description, setDescription] = useState('Professional electrical troubleshooting, wiring, MCB replacements, inverter setups, and concealed cabling.');
  const [skills, setSkills] = useState('MCB Diagnostics, Inverter Wiring, Tripping Fix, Earthing Testing');
  const [city, setCity] = useState('Bengaluru');
  const [areaCoverage, setAreaCoverage] = useState('Koramangala, HSR Layout, Indiranagar, BTM Layout');
  const [portfolioUrl, setPortfolioUrl] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
  const [listingSuccessMsg, setListingSuccessMsg] = useState<string | null>(null);

  // My listings
  const myListings = serviceListings.filter(s => s.partnerId === currentUser?.id);

  // Bookings assigned to this partner
  const myBookings = serviceBookings.filter(b => b.partnerId === currentUser?.id);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    createServiceListing({
      title,
      trade,
      experienceYears: Number(experienceYears),
      hourlyRate: Number(hourlyRate),
      description,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      areaCoverage: areaCoverage.split(',').map(s => s.trim()).filter(Boolean),
      city,
      portfolioImages: [portfolioUrl],
      isAvailable: true,
    });
    setListingSuccessMsg('New service listing published successfully!');
    setActiveTab('listings');
    setTimeout(() => setListingSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Credentials Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                {currentUser?.skills[0] || 'Master Electrician'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{currentUser?.location}</span>
              <span>•</span>
              <span>Reliability Score: <strong className="text-slate-900 font-mono">{currentUser?.reliabilityScore}/100</strong></span>
              <span>•</span>
              <span>Rating: <strong className="text-amber-600 font-mono">{currentUser?.rating} ★</strong> ({currentUser?.reviewCount} completed jobs)</span>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                ✓ Identity Verified
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                ✓ Skill Verified
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                ✓ Experienced Professional
              </span>
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 min-w-[200px]">
          <span className="text-xs text-purple-800 font-medium block">Wallet Balance</span>
          <span className="text-2xl font-bold font-mono text-purple-950 mt-0.5 block">
            ₹{currentUser?.walletBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-purple-700 mt-1 block">
            ₹{currentUser?.escrowLockedBalance} in escrow pipelines
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Service Orders ({myBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>My Published Services ({myListings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('add_service')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'add_service'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service Offering</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>KYC & Verification Portfolio</span>
        </button>
      </div>

      {listingSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{listingSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: SERVICE ORDERS & GPS CHECK-IN / CHECK-OUT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Service Partner On-Site Protocol:</strong> Check in upon reaching the client's home. Once work finishes, tap "Work Done - Check Out" to prompt the client for escrow release.
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
                    <span>Client: <strong className="text-slate-900">{b.clientName}</strong></span>
                    <span>•</span>
                    <span>Address: {b.clientAddress}</span>
                    <span>•</span>
                    <span>Scheduled: {b.date} ({b.timeSlot})</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-slate-900">
                      Escrow: ₹{b.totalAmount} (Payout ₹{b.totalAmount - b.platformFee})
                    </span>
                  </div>

                  {b.checkedInAt && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                      ✓ Checked In at Client Site at: <span className="font-mono font-bold">{b.checkedInAt}</span>
                    </div>
                  )}

                  {b.checkedOutAt && (
                    <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg">
                      ✓ Service Completed at: <span className="font-mono font-bold">{b.checkedOutAt}</span>. Awaiting Client Approval.
                    </div>
                  )}

                  {b.status === 'client_approved' && (
                    <div className="text-xs text-emerald-800 bg-emerald-100/60 p-2 rounded-lg font-medium">
                      ✓ Client Approved Work: ₹{b.totalAmount - b.platformFee} credited to your wallet.
                    </div>
                  )}
                </div>

                {/* State Machine Actions */}
                <div className="flex items-center gap-2">
                  {b.status === 'secured_escrow' && (
                    <button
                      onClick={() => checkInServiceBooking(b.id)}
                      className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Arrived at Address & Check-In</span>
                    </button>
                  )}

                  {b.status === 'partner_checked_in' && (
                    <button
                      onClick={() => checkOutServiceBooking(b.id)}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Work Completed → Check-Out</span>
                    </button>
                  )}

                  {b.status === 'work_completed' && (
                    <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                      Awaiting Client Escrow Release
                    </span>
                  )}
                </div>
              </div>
            ))}

            {myBookings.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No service orders right now.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myListings.map((listing) => (
            <div key={listing.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{listing.trade}</span>
                  <h4 className="font-bold text-sm text-slate-900 mt-0.5">{listing.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">₹{listing.hourlyRate}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">Fixed / Shift Price</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">{listing.description}</p>

              <div className="flex flex-wrap gap-1">
                {listing.skills.map((s, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Coverage: {listing.areaCoverage.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ADD NEW SERVICE LISTING */}
      {activeTab === 'add_service' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-base text-slate-900">Publish New Local Service Listing</h3>
          <p className="text-xs text-slate-500">
            Define your service trade, fixed service / shift price, and skill specializations for clients in your city.
          </p>

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Service Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trade Category</label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="AC Technician">AC Technician</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Painter">Painter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fixed Service / Shift Price (₹)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description & Diagnostics Guarantee</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Technical Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Area Coverage</label>
              <input
                type="text"
                value={areaCoverage}
                onChange={(e) => setAreaCoverage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Publish Service Listing
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CREDENTIALS & KYC PORTFOLIO */}
      {activeTab === 'credentials' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-slate-900">Multi-Method Verification & Badges</h3>
          <p className="text-xs text-slate-500">
            LokWorks avoids rigid certificate-only lock-in by recognizing government KYC, employer references, portfolio audits, and customer reviews.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Government ID / KYC</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Aadhaar/PAN verification completed via DigiLocker token.</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold mt-3 inline-block">
                ✓ Verified
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Skill Assessment & References</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">8 years trade experience corroborated by 3 verified references.</p>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold mt-3 inline-block">
                ✓ Skill Verified
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Client Ratings Index</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">4.9 / 5.0 cumulative rating across 88 completed jobs.</p>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold mt-3 inline-block">
                ✓ Experienced Professional
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
