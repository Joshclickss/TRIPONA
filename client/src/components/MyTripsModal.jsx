import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { exportTripToPdf } from '../utils/exportPdf';

export default function MyTripsModal({ isOpen, onClose, onPlanNewTrip }) {
  const { user, isAuthenticated } = useAuth();
  const { trips, loadingTrips, deleteTrip, saveNewTrip } = useTrip();
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCopyLink = (trip) => {
    const tripId = trip._id || trip.id;
    const shareUrl = `${window.location.origin}/#trip-${tripId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(tripId);
    showToast('Trip link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDuplicate = async (trip) => {
    try {
      const duplicateData = {
        ...trip,
        title: `${trip.title || 'Trip'} (Copy)`,
        createdAt: new Date().toISOString()
      };
      delete duplicateData._id;
      delete duplicateData.id;
      await saveNewTrip(duplicateData);
      showToast('Trip duplicated successfully!');
    } catch (err) {
      console.error('Duplicate failed:', err);
      showToast('Could not duplicate trip.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      await deleteTrip(id);
      showToast('Trip itinerary deleted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl p-6 sm:p-8 bg-[#090B0E] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.98),0_0_40px_rgba(168,85,247,0.25)] max-h-[88vh] flex flex-col">
        
        {/* Toast notification inside modal */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-purple-950/90 border border-purple-500/40 text-purple-200 text-xs backdrop-blur-md shadow-xl flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close My Trips"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A855F7]/30 to-[#06B6D4]/30 border border-purple-500/30 flex items-center justify-center text-[#A855F7]">
              <Bookmark size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white font-heading">My Saved Journeys</h3>
              <p className="text-xs text-[#94A3B8]">Your autonomous itineraries & stored travel records</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onPlanNewTrip) onPlanNewTrip();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 shadow-md active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* Trips List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loadingTrips ? (
            <div className="py-20 flex flex-col items-center justify-center text-white/50 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#06B6D4]" />
              <p className="text-xs font-mono">Synchronizing journeys with TRIPONA cloud...</p>
            </div>
          ) : !trips || trips.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-white/30 border border-white/10">
                <Bookmark size={28} />
              </div>
              <div>
                <p className="text-base font-bold text-white font-heading">No saved trips yet</p>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  Create your first personalized trip using TRIPONA's AI Travel Concierge.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onPlanNewTrip) onPlanNewTrip();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 active:scale-95 transition-all"
              >
                <Sparkles size={14} className="text-[#06B6D4]" />
                <span>Plan A Trip Now</span>
              </button>
            </div>
          ) : (
            trips.map((trip) => {
              const tripId = trip._id || trip.id;
              const isExpanded = expandedTripId === tripId;

              return (
                <div
                  key={tripId}
                  className="rounded-2xl glass-panel border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setExpandedTripId(isExpanded ? null : tripId)}>
                      <div className="flex items-center gap-2 text-xs text-[#06B6D4] font-semibold">
                        <MapPin size={12} />
                        <span>{trip.destination || 'Custom Journey'}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/60">{trip.duration || '7 Days'}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white font-heading hover:text-purple-300 transition-colors">
                        {trip.title || 'Bespoke Travel Masterplan'}
                      </h4>
                      <p className="text-xs text-white/60 line-clamp-1">
                        {typeof trip.overview === 'string' ? trip.overview : (typeof trip.itinerary === 'string' ? trip.itinerary.slice(0, 120) : 'Personalized itinerary')}
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        title="Download PDF"
                        onClick={() => exportTripToPdf(trip)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 flex items-center justify-center border border-white/10 transition-colors"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        title="Share link"
                        onClick={() => handleCopyLink(trip)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
                      >
                        {copiedId === tripId ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                      </button>

                      <button
                        title="Duplicate Trip"
                        onClick={() => handleDuplicate(trip)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 flex items-center justify-center border border-white/10 transition-colors"
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        title="Delete Trip"
                        onClick={() => handleDelete(tripId)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 flex items-center justify-center border border-white/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        onClick={() => setExpandedTripId(isExpanded ? null : tripId)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-center border border-white/10 transition-colors ml-1"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-white/[0.01] space-y-3 text-xs animate-fadeIn">
                      <div className="text-white/80 whitespace-pre-line leading-relaxed">
                        {typeof trip.overview === 'string' && trip.overview}
                      </div>

                      {Array.isArray(trip.days) && trip.days.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider">
                            Daily Schedule ({trip.days.length} Days)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {trip.days.slice(0, 4).map((d, i) => (
                              <div key={i} className="p-2.5 rounded-lg bg-[#0A0D12] border border-white/5 space-y-1">
                                <div className="font-bold text-white text-[11px]">
                                  Day {d.day}: {d.title}
                                </div>
                                <div className="text-[10px] text-white/60 line-clamp-2">
                                  {typeof d.morning === 'object' ? d.morning.activity : (d.morning || d.summary || '')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
