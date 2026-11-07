import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  QrCode, 
  Trash2, 
  Plus, 
  Bed, 
  Plane, 
  Utensils, 
  Compass, 
  Car, 
  Ship, 
  Mountain, 
  Sparkles, 
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function MyBookingsModal() {
  const { 
    isMyBookingsOpen, 
    closeMyBookings, 
    bookings, 
    loadingBookings, 
    cancelBooking, 
    openExplorer,
    activeStatusFilter,
    setActiveStatusFilter,
    fetchUserBookings
  } = useBooking();

  const [activeTab, setActiveTab] = useState(activeStatusFilter || 'all');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  if (!isMyBookingsOpen) return null;

  const categoryIcons = {
    hotels: Bed,
    flights: Plane,
    dining: Utensils,
    experiences: Compass,
    transportation: Car,
    cruises: Ship,
    adventures: Mountain,
    wellness: Sparkles,
    essentials: ShieldCheck
  };

  const statusTabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'refunded', label: 'Refunds' }
  ];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return (b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending') && new Date(b.dates?.startDate) >= new Date();
    }
    if (activeTab === 'confirmed') return b.bookingStatus === 'confirmed';
    if (activeTab === 'pending') return b.bookingStatus === 'pending' || b.bookingStatus === 'payment_pending';
    if (activeTab === 'cancelled') return b.bookingStatus === 'cancelled';
    if (activeTab === 'refunded') return b.paymentStatus === 'refunded' || b.bookingStatus === 'cancelled';
    return true;
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? If eligible, your refund will be processed within 3-5 business days.')) {
      setCancellingId(bookingId);
      try {
        await cancelBooking(bookingId, 'User requested cancellation');
      } catch (err) {
        alert(err.message || 'Cancellation failed');
      } finally {
        setCancellingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[900px] bg-[#090C0F] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0E1116] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#090C0F] rounded-[10px] flex items-center justify-center">
                <FileText size={16} className="text-[#06B6D4]" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading">
                My Travel Bookings & Vouchers
              </h2>
              <p className="text-xs text-white/50">
                Track, manage, and verify all your live reservations in one synchronized place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeMyBookings();
                openExplorer('hotels');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-xs font-semibold text-white flex items-center gap-1 shadow-lg active:scale-95"
            >
              <Plus size={14} />
              <span>Book Service</span>
            </button>

            <button
              onClick={closeMyBookings}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-6 py-2.5 bg-[#0D1015] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = bookings.filter((b) => {
              if (tab.id === 'all') return true;
              if (tab.id === 'upcoming') return b.bookingStatus === 'confirmed' && new Date(b.dates?.startDate) >= new Date();
              if (tab.id === 'confirmed') return b.bookingStatus === 'confirmed';
              if (tab.id === 'pending') return b.bookingStatus === 'pending' || b.bookingStatus === 'payment_pending';
              if (tab.id === 'cancelled') return b.bookingStatus === 'cancelled';
              if (tab.id === 'refunded') return b.paymentStatus === 'refunded' || b.bookingStatus === 'cancelled';
              return true;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A855F7]/30 to-[#06B6D4]/30 border border-[#06B6D4]/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#06B6D4] text-black font-bold' : 'bg-white/10 text-white/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          {loadingBookings ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-white/50">Retrieving verified travel bookings...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/30">
                <FileText size={26} />
              </div>
              <h3 className="text-base font-bold text-white">No {activeTab !== 'all' ? activeTab : ''} bookings found</h3>
              <p className="text-xs text-white/50 max-w-sm">
                You haven't confirmed any reservations in this section yet. Explore luxury hotels, direct flights, or dining experiences.
              </p>
              <button
                onClick={() => {
                  closeMyBookings();
                  openExplorer('hotels');
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-xs font-bold text-white shadow-lg"
              >
                Explore Services & Book
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const Icon = categoryIcons[b.category] || Bed;
                const isCancelled = b.bookingStatus === 'cancelled';
                const isConfirmed = b.bookingStatus === 'confirmed';

                return (
                  <div
                    key={b._id || b.bookingId}
                    className="p-5 rounded-2xl bg-[#11141A] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                  >
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#06B6D4] shrink-0">
                        <Icon size={22} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#06B6D4]">
                            {b.bookingId}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isConfirmed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            isCancelled ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {b.bookingStatus}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/60 uppercase">
                            {b.provider}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {b.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#06B6D4]" />
                            {b.destination}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#A855F7]" />
                            {b.dates?.startDate ? new Date(b.dates.startDate).toLocaleDateString() : 'Dates Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Pricing & Actions */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-white">
                          ${b.price?.totalAmount || b.price?.amount || 0}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                          {b.paymentStatus === 'completed' ? 'Paid & Verified' : b.paymentStatus}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedVoucher(b)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <QrCode size={13} className="text-[#06B6D4]" />
                          <span>Voucher</span>
                        </button>

                        {!isCancelled && (
                          <button
                            disabled={cancellingId === (b._id || b.bookingId)}
                            onClick={() => handleCancel(b._id || b.bookingId)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === (b._id || b.bookingId) ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Voucher Detail Modal */}
        {selectedVoucher && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0F1217] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl relative text-left">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>

              <div className="text-center space-y-2 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center mx-auto text-white">
                  <QrCode size={20} />
                </div>
                <h3 className="text-base font-bold text-white">TRIPONA Boarding & Voucher Pass</h3>
                <div className="font-mono text-xs font-bold text-[#06B6D4]">{selectedVoucher.bookingId}</div>
              </div>

              {/* QR Mock */}
              <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="w-full h-full border-4 border-dashed border-black/80 flex flex-col items-center justify-center text-black">
                  <QrCode size={64} />
                  <span className="text-[8px] font-mono font-bold mt-1">VERIFIED GDS</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between">
                  <span className="text-white/40">Service:</span>
                  <span className="font-semibold text-white">{selectedVoucher.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Provider:</span>
                  <span className="text-white">{selectedVoucher.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedVoucher.bookingStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Total Paid:</span>
                  <span className="text-white font-bold">${selectedVoucher.price?.totalAmount || 0}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Voucher PDF downloaded for ${selectedVoucher.bookingId}`);
                  setSelectedVoucher(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-xs font-bold text-white shadow-lg"
              >
                Download PDF Voucher
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
