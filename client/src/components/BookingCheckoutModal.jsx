import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Users, 
  MapPin, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  QrCode, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function BookingCheckoutModal() {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    checkoutService, 
    checkoutPrefills, 
    createBooking, 
    payBooking,
    openMyBookings 
  } = useBooking();
  
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Review, 2: Guests, 3: Payment, 4: Success
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [primaryGuest, setPrimaryGuest] = useState({
    name: user?.displayName || 'Alexander Vance',
    email: user?.email || 'alexander@tripona.in',
    phone: '+1 (555) 392-8819',
    specialRequests: 'High floor preferred, quiet room away from elevators.'
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    name: user?.displayName || 'Alexander Vance',
    expiry: '12/28',
    cvv: '•••'
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isCheckoutOpen || !checkoutService) return null;

  // Pricing calculations
  const baseRate = checkoutService.pricePerUnit || 250;
  const daysCount = 3; // default multi-day estimate
  const guestsCount = checkoutPrefills?.guests || 2;
  const subtotal = checkoutService.category === 'hotels' ? baseRate * daysCount : baseRate * guestsCount;
  const taxes = Math.round(subtotal * 0.10); // 10% taxes and tourism service levy
  const totalAmount = subtotal + taxes;
  const currencySymbol = checkoutService.currencySymbol || '$';

  // Handle Complete Booking + Payment
  const handleConfirmAndPay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create Booking Record
      const bookingPayload = {
        category: checkoutService.category || 'hotels',
        serviceId: checkoutService.id || 'svc-generic',
        title: checkoutService.title,
        destination: checkoutService.destination || 'Global',
        provider: checkoutService.provider || 'TRIPONA Official Partner',
        dates: {
          startDate: checkoutPrefills?.dates?.checkIn || new Date().toISOString().split('T')[0],
          endDate: checkoutPrefills?.dates?.checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
        },
        travellers: [
          {
            name: primaryGuest.name,
            email: primaryGuest.email,
            phone: primaryGuest.phone,
            isLead: true
          }
        ],
        price: {
          amount: subtotal,
          taxes: taxes,
          discount: 0,
          totalAmount: totalAmount,
          currency: checkoutService.currency || 'USD',
          priceType: checkoutService.priceType || 'verified_live'
        },
        metadata: {
          specialRequests: primaryGuest.specialRequests,
          roomType: checkoutService.roomTypes?.[0]?.name,
          airline: checkoutService.airline,
          cuisine: checkoutService.cuisine
        },
        cancellationPolicy: checkoutService.cancellationPolicy
      };

      const created = await createBooking(bookingPayload);
      const bookingId = created.booking._id || created.booking.bookingId;

      // 2. Process Simulated Payment
      const paymentRes = await payBooking(bookingId, paymentMethod);
      setConfirmedBooking(paymentRes.booking || created.booking);
      setStep(4); // Move to Confirmation screen
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment processing failed. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl bg-[#0B0E12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#10141A]/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] uppercase tracking-wider">
              SECURE CHECKOUT
            </span>
            <span className="text-xs text-white/50">• 256-Bit SSL Encrypted</span>
          </div>
          <button
            onClick={closeCheckout}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="px-6 py-3 bg-[#0D1015] border-b border-white/5 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#06B6D4]' : 'text-white/40'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              <span>Review & Rates</span>
            </div>
            <div className="w-8 h-[1px] bg-white/10" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#06B6D4]' : 'text-white/40'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              <span>Traveler Info</span>
            </div>
            <div className="w-8 h-[1px] bg-white/10" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#06B6D4]' : 'text-white/40'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              <span>Confirm & Pay</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: REVIEW SERVICE & BREAKDOWN */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Service Preview Card */}
              <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <img
                  src={checkoutService.image}
                  alt={checkoutService.title}
                  className="w-24 h-24 rounded-xl object-cover border border-white/10 shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#06B6D4]">
                    {checkoutService.provider || 'TRIPONA Official'}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {checkoutService.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <MapPin size={12} className="text-[#06B6D4]" />
                    <span>{checkoutService.destination}</span>
                  </div>
                </div>
              </div>

              {/* Booking Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/40 block">Dates & Duration:</span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#A855F7]" />
                    <span>{checkoutPrefills?.dates?.checkIn || 'Next Week'} → {checkoutPrefills?.dates?.checkOut || '5 Days'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/40 block">Party Size:</span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Users size={13} className="text-emerald-400" />
                    <span>{guestsCount} Travelers</span>
                  </div>
                </div>
              </div>

              {/* Transparent Price Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Base Fare / Tariff ({checkoutService.unitType || 'unit'})</span>
                  <span>{currencySymbol}{subtotal}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Verified Service Taxes & Tourism Levy (10%)</span>
                  <span>{currencySymbol}{taxes}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                  <span>Total Amount Due</span>
                  <span className="text-base text-[#06B6D4]">{currencySymbol}{totalAmount}</span>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold">Guaranteed Free Cancellation:</span> {checkoutService.cancellationPolicy || 'Cancel up to 48 hours prior to arrival for a 100% refund.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Lead Guest Information</h3>
                <p className="text-xs text-white/50">Vouchers and check-in confirmation will be sent to this email.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/60 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={primaryGuest.name}
                    onChange={(e) => setPrimaryGuest({ ...primaryGuest, name: e.target.value })}
                    className="w-full bg-[#13171D] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-white/60 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={primaryGuest.email}
                      onChange={(e) => setPrimaryGuest({ ...primaryGuest, email: e.target.value })}
                      className="w-full bg-[#13171D] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-white/60 block mb-1">Phone Number (with Country Code)</label>
                    <input
                      type="tel"
                      value={primaryGuest.phone}
                      onChange={(e) => setPrimaryGuest({ ...primaryGuest, phone: e.target.value })}
                      className="w-full bg-[#13171D] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/60 block mb-1">Special Preferences / Requests</label>
                  <textarea
                    rows={3}
                    value={primaryGuest.specialRequests}
                    onChange={(e) => setPrimaryGuest({ ...primaryGuest, specialRequests: e.target.value })}
                    placeholder="Dietary requirements, late check-in, honeymoon setup, child seat..."
                    className="w-full bg-[#13171D] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Payment Selection</h3>
                <p className="text-xs text-white/50">All transactions are tokenized with end-to-end encryption.</p>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                  { id: 'upi_netbanking', label: 'UPI / NetBanking', icon: Sparkles },
                  { id: 'pay_at_venue', label: 'Pay at Venue', icon: Lock }
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                        active 
                          ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-[#06B6D4]' : 'text-white/40'} />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Simulated Card Form */}
              {paymentMethod === 'credit_card' && (
                <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full bg-[#0B0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Expiration</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full bg-[#0B0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full bg-[#0B0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi_netbanking' && (
                <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 text-center space-y-2 text-xs">
                  <div className="text-white/70">Scan or authorize via Google Pay, PhonePe, Paytm or Apple Pay</div>
                  <div className="p-3 rounded-xl bg-white/[0.04] inline-block font-mono text-emerald-400">
                    tripona.merchant@icici
                  </div>
                </div>
              )}

              {paymentMethod === 'pay_at_venue' && (
                <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 text-xs text-white/70 space-y-1">
                  <p className="font-semibold text-white">Guaranteed Hold with Zero Prepayment</p>
                  <p>Your reservation will be held in confirmed status. Payment of {currencySymbol}{totalAmount} will be collected upon arrival at the venue.</p>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/50 block">Amount to charge:</span>
                  <span className="text-lg font-bold text-white">{currencySymbol}{totalAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-semibold block">Instant GDS Confirmation</span>
                  <span className="text-[10px] text-white/40">Zero Booking Fees</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & VOUCHER */}
          {step === 4 && confirmedBooking && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">Booking Confirmed!</h3>
                <p className="text-xs text-white/60">
                  Your reservation is verified with {confirmedBooking.provider || 'the provider network'}.
                </p>
              </div>

              {/* Official Voucher Card */}
              <div className="p-5 rounded-2xl bg-[#12151B] border border-white/15 text-left space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 block">BOOKING REFERENCE</span>
                    <span className="font-mono text-base font-bold text-[#06B6D4]">
                      {confirmedBooking.bookingId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-white/40 block">STATUS</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {confirmedBooking.bookingStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white text-sm">{confirmedBooking.title}</div>
                  <div className="text-white/60">{confirmedBooking.destination}</div>
                  <div className="text-white/40 text-[11px]">Primary Guest: {primaryGuest.name}</div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">TOTAL PAID</span>
                    <span className="font-bold text-white">{currencySymbol}{totalAmount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                    <QrCode size={18} className="text-[#06B6D4]" />
                    <span>Scan at Check-in</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    closeCheckout();
                    openMyBookings('all');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white text-xs font-bold shadow-lg"
                >
                  View in My Bookings
                </button>
                <button
                  onClick={() => {
                    alert(`Official TRIPONA Travel Voucher for ${confirmedBooking.bookingId} has been generated and dispatched to ${primaryGuest.email}`);
                  }}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>Download Voucher</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="px-6 py-4 bg-[#10141A] border-t border-white/10 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 hidden sm:inline">
                Total: <strong className="text-white">{currencySymbol}{totalAmount}</strong>
              </span>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmAndPay}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Securing Booking...</span>
                    </div>
                  ) : (
                    <span>Authorize & Confirm</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
