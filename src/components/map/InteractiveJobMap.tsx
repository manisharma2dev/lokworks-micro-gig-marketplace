import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { GigJob } from '../../types';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  IndianRupee, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

// Fix Leaflet standard default marker assets in Vite bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Documented realistic coordinates for recognized Bengaluru areas
const KNOWN_BENGALURU_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'indiranagar': { lat: 12.9716, lng: 77.6412 },
  'koramangala': { lat: 12.9345, lng: 77.6258 },
  'mg road': { lat: 12.9698, lng: 77.5937 },
  'cubbon park': { lat: 12.9698, lng: 77.5937 },
  'peenya': { lat: 13.0617, lng: 77.4754 },
  'biec': { lat: 13.0617, lng: 77.4754 },
  'whitefield': { lat: 12.9698, lng: 77.7499 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  'jayanagar': { lat: 12.9308, lng: 77.5838 },
  'jp nagar': { lat: 12.9063, lng: 77.5857 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  'electronic city': { lat: 12.8399, lng: 77.6770 },
  'malleshwaram': { lat: 13.0031, lng: 77.5643 },
  'hebbal': { lat: 13.0358, lng: 77.5970 },
  'rajajinagar': { lat: 12.9982, lng: 77.5530 },
  'marathahalli': { lat: 12.9591, lng: 77.6974 },
  'bellandur': { lat: 12.9304, lng: 77.6784 },
  'yelahanka': { lat: 13.1007, lng: 77.5963 },
  'banashankari': { lat: 12.9255, lng: 77.5468 },
  'basavanagudi': { lat: 12.9421, lng: 77.5753 },
};

// Validate and retrieve real geographic coordinates for a job
export function getJobCoordinates(job: GigJob): [number, number] | null {
  if (
    typeof job.location?.lat === 'number' &&
    typeof job.location?.lng === 'number' &&
    !isNaN(job.location.lat) &&
    !isNaN(job.location.lng) &&
    job.location.lat >= -90 && job.location.lat <= 90 &&
    job.location.lng >= -180 && job.location.lng <= 180 &&
    (job.location.lat !== 0 || job.location.lng !== 0)
  ) {
    return [job.location.lat, job.location.lng];
  }

  // Fallback to documented coordinates for recognized demo localities
  const text = `${job.location?.area || ''} ${job.location?.address || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_BENGALURU_COORDINATES)) {
    if (text.includes(key)) {
      return [coords.lat, coords.lng];
    }
  }

  return null;
}

// Controller component inside Leaflet context to coordinate view panning and bounds fitting
interface MapControllerProps {
  selectedCoords: [number, number] | null;
  allCoords: [number, number][];
  onBoundsFitted?: () => void;
  triggerFitAll: number;
}

const MapController: React.FC<MapControllerProps> = ({ 
  selectedCoords, 
  allCoords, 
  triggerFitAll 
}) => {
  const map = useMap();
  const prevTrigger = useRef(triggerFitAll);
  const initialFitted = useRef(false);

  // Invalidate map size to prevent tile clipping when mounting or resizing
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Initial fit of available job bounds
  useEffect(() => {
    if (!initialFitted.current && allCoords.length > 0) {
      if (allCoords.length === 1) {
        map.setView(allCoords[0], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
      initialFitted.current = true;
    }
  }, [allCoords, map]);

  // Explicit user trigger to fit all jobs
  useEffect(() => {
    if (triggerFitAll !== prevTrigger.current && allCoords.length > 0) {
      prevTrigger.current = triggerFitAll;
      if (allCoords.length === 1) {
        map.setView(allCoords[0], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      }
    }
  }, [triggerFitAll, allCoords, map]);

  // Pan to selected job when selection changes
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, Math.max(map.getZoom(), 14), {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedCoords, map]);

  return null;
};

// Create custom interactive HTML marker icon with live job pricing and status
function createJobDivIcon(job: GigJob, isSelected: boolean) {
  const isFull = job.filledSlots >= job.requiredWorkers;

  const bgStyle = isSelected
    ? 'background-color: #4f46e5; color: #ffffff; border: 2px solid #ffffff; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -4px rgba(79, 70, 229, 0.4); transform: scale(1.1);'
    : isFull
    ? 'background-color: #fffbeb; color: #78350f; border: 1.5px solid #fcd34d; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'
    : 'background-color: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';

  const dotColor = isSelected ? '#ffffff' : isFull ? '#d97706' : '#4f46e5';
  const subtitleColor = isSelected ? '#e0e7ff' : '#64748b';
  const pingElement = isSelected
    ? '<span style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></span>'
    : '';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
      ${pingElement}
      <div style="padding: 4px 8px; border-radius: 12px; display: flex; align-items: center; gap: 6px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: all 0.2s ease; ${bgStyle}">
        <span style="width: 7px; height: 7px; border-radius: 9999px; background-color: ${dotColor}; flex-shrink: 0;"></span>
        <div style="text-align: left; white-space: nowrap; line-height: 1.1;">
          <div style="font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">₹${job.payPerWorker}</div>
          <div style="font-size: 9px; color: ${subtitleColor}; max-width: 90px; overflow: hidden; text-overflow: ellipsis;">
            ${job.location.area.split('/')[0].trim()}
          </div>
        </div>
      </div>
      <div style="width: 8px; height: 8px; transform: rotate(45deg); margin-top: -4px; z-index: -1; ${
        isSelected 
          ? 'background-color: #4f46e5; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;' 
          : isFull 
          ? 'background-color: #fffbeb; border-right: 1.5px solid #fcd34d; border-bottom: 1.5px solid #fcd34d;' 
          : 'background-color: #ffffff; border-right: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;'
      }"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-job-marker-pin',
    iconSize: [110, 42],
    iconAnchor: [55, 42],
    popupAnchor: [0, -42],
  });
}

interface InteractiveJobMapProps {
  onSelectJob?: (job: GigJob) => void;
}

export const InteractiveJobMap: React.FC<InteractiveJobMapProps> = ({ onSelectJob }) => {
  const { gigJobs, bookGigSlot, currentUser, joinWaitingList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<GigJob | null>(gigJobs[0] || null);
  const [callingHost, setCallingHost] = useState<{ hostName: string; phone: string } | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [tileError, setTileError] = useState<boolean>(false);
  const [fitAllTrigger, setFitAllTrigger] = useState<number>(0);

  // Center coordinate around Bengaluru Metropolitan (Indiranagar / MG Road corridor)
  const defaultBengaluruCenter: [number, number] = [12.9716, 77.5946];

  // Filter open gig jobs by search query
  const filteredJobs = useMemo(() => {
    return gigJobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gigJobs, searchQuery]);

  // Associate valid geographic coordinates with each job
  const jobsWithCoords = useMemo(() => {
    return filteredJobs
      .map(job => ({
        job,
        coords: getJobCoordinates(job),
      }))
      .filter((item): item is { job: GigJob; coords: [number, number] } => item.coords !== null);
  }, [filteredJobs]);

  const allCoordsList = useMemo(() => {
    return jobsWithCoords.map(item => item.coords);
  }, [jobsWithCoords]);

  // Keep selectedJob synced when list changes or if search filters it out
  useEffect(() => {
    if (selectedJob && !filteredJobs.some(j => j.id === selectedJob.id)) {
      if (filteredJobs.length > 0) {
        setSelectedJob(filteredJobs[0]);
      } else {
        setSelectedJob(null);
      }
    } else if (!selectedJob && filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  // Coordinates of the currently selected job
  const selectedJobCoords = useMemo(() => {
    return selectedJob ? getJobCoordinates(selectedJob) : null;
  }, [selectedJob]);

  const handleSelectJob = (job: GigJob) => {
    setSelectedJob(job);
    if (onSelectJob) {
      onSelectJob(job);
    }
  };

  const handleBook = (job: GigJob) => {
    const res = bookGigSlot(job.id);
    if (res.success) {
      setBookingSuccessMsg(`Slot successfully confirmed for "${job.title}"!`);
      setTimeout(() => setBookingSuccessMsg(null), 3500);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[750px] relative">
      
      {/* Top Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by locality (Indiranagar, Koramangala, Peenya, MG Road)..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFitAllTrigger(t => t + 1)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Fit all job markers in viewport"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fit All Gigs</span>
          </button>
          
          <span className="hidden sm:flex items-center gap-1 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bengaluru Center (12.97° N, 77.59° E)</span>
          </span>

          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-800 font-mono">
            {jobsWithCoords.length} {jobsWithCoords.length === 1 ? 'gig marker' : 'gig markers'}
          </span>
        </div>
      </div>

      {/* Booking Feedback Banner */}
      {bookingSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-4 py-2 text-xs flex items-center gap-2 z-10 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bookingSuccessMsg}</span>
        </div>
      )}

      {/* Tile Loading Error Banner */}
      {tileError && (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-2 text-xs flex items-center gap-2 z-10">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Notice:</strong> Unable to load some OpenStreetMap tiles. Please check your internet connection.
          </span>
        </div>
      )}

      {/* Main Map Body: Left Side Real Leaflet Map, Right Side Selected Job Details */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Real Interactive Leaflet + OpenStreetMap Map Area */}
        <div className="flex-1 relative bg-slate-100 min-h-[380px] z-0 isolate">
          
          {jobsWithCoords.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Geocoded Micro-Gigs Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                No active gigs match your filter query "{searchQuery}". Clear your search or explore other areas of Bengaluru.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <MapContainer
              center={defaultBengaluruCenter}
              zoom={12}
              scrollWheelZoom={true}
              className="w-full h-full"
              attributionControl={true}
            >
              {/* Standard OpenStreetMap Tile Layer with Proper Attribution */}
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                maxZoom={19}
                eventHandlers={{
                  tileerror: () => setTileError(true),
                  load: () => setTileError(false),
                }}
              />

              {/* Map View Controller for Pan/Fit interactions */}
              <MapController
                selectedCoords={selectedJobCoords}
                allCoords={allCoordsList}
                triggerFitAll={fitAllTrigger}
              />

              {/* Real Geographic Markers for Each Job */}
              {jobsWithCoords.map(({ job, coords }) => {
                const isSelected = selectedJob?.id === job.id;
                const icon = createJobDivIcon(job, isSelected);

                return (
                  <Marker
                    key={job.id}
                    position={coords}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        handleSelectJob(job);
                      },
                    }}
                  >
                    <Popup className="lokworks-map-popup" autoPan={false}>
                      <div className="text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                            {job.category.replace('_', ' ')}
                          </span>
                          <span className="font-bold font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            ₹{job.payPerWorker}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs leading-snug">
                          {job.title}
                        </h5>
                        <div className="text-[11px] text-slate-600">
                          📍 {job.location.address}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Slots: {job.filledSlots}/{job.requiredWorkers} filled
                        </div>
                        <button
                          onClick={() => handleSelectJob(job)}
                          className="w-full mt-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          View Shift Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          {/* Real-time Geographic Metadata Floating Badge */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 shadow-md flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">Live OpenStreetMap Active</span>
              <span className="text-[10px] text-slate-500 block">Bengaluru Metropolitan Region</span>
            </div>
          </div>
        </div>

        {/* Right Details Panel for Selected Job — Preserved Exactly */}
        {selectedJob ? (
          <div className="w-full md:w-88 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                    {selectedJob.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5 leading-snug">
                    {selectedJob.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                  ₹{selectedJob.payPerWorker}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedJob.location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedJob.date} • {selectedJob.startTime} - {selectedJob.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Slots: <strong className="text-slate-900 font-mono">{selectedJob.filledSlots} / {selectedJob.requiredWorkers} filled</strong>
                    {selectedJob.waitingListCount > 0 && (
                      <span className="text-amber-700 ml-1 font-semibold">({selectedJob.waitingListCount} on waitlist)</span>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedJob.description}
              </p>

              {/* Skills required */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Requirements:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.skillsRequired.map((s, idx) => (
                    <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Host Simulator */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Posted by Host:</span>
                  <span className="text-xs font-semibold text-slate-900">{selectedJob.hostName}</span>
                </div>
                <button
                  onClick={() => setCallingHost({ hostName: selectedJob.hostName, phone: '+91 98201 99881' })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Call Host</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 space-y-2">
              {selectedJob.filledSlots >= selectedJob.requiredWorkers ? (
                <div className="space-y-2">
                  <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>All slots filled! {selectedJob.waitingListCount} people waiting.</span>
                  </div>
                  <button
                    onClick={() => {
                      const res = joinWaitingList(selectedJob.id);
                      if (res.success) {
                        alert(`Joined Waiting list at position #${res.position}!`);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    Join Waiting List
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleBook(selectedJob)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reserve Slot Now (₹{selectedJob.payPerWorker})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full md:w-88 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col items-center justify-center text-center text-slate-400">
            <MapPin className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs font-medium">Select a gig marker on the map to inspect shift details.</p>
          </div>
        )}
      </div>

      {/* Simulated Phone Call Modal — Preserved Exactly */}
      {callingHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-7 h-7 animate-bounce" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Calling Gig Host...</h4>
            <p className="text-sm font-semibold text-indigo-600 mt-1">{callingHost.hostName}</p>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{callingHost.phone}</p>
            <p className="text-xs text-slate-400 mt-3 bg-slate-50 p-2 rounded-lg">
              Simulated direct platform dialer via masked number to safeguard privacy.
            </p>
            <button
              onClick={() => setCallingHost(null)}
              className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
