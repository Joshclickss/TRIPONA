import React, { useState } from 'react';
import { X, Handshake, Check, Loader2 } from 'lucide-react';

export default function PartnerModal({ isOpen, onClose }) {
  const [partnerType, setPartnerType] = useState('Hotels & Resorts');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#0d0d14] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(168,85,247,0.3)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-teal-500 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full rounded-full bg-[#0d0d14] flex items-center justify-center">
              <Handshake size={18} className="text-teal-300" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Partner With TRIPONA</h3>
            <p className="text-xs text-[#A5A5A5]">Connect your travel service to our AI ecosystem</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <Check size={28} />
            </div>
            <h4 className="text-lg font-bold text-white">Application Received</h4>
            <p className="text-xs text-[#A5A5A5] max-w-xs mx-auto">
              Our partner relations team will review your details and reach out within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">Partner Category</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171722] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
              >
                <option value="Hotels & Resorts">Hotels & Resorts</option>
                <option value="Airlines & Air Mobility">Airlines & Air Mobility</option>
                <option value="Tour & Experience Operators">Tour & Experience Operators</option>
                <option value="Dining & Michelin Venues">Dining & Michelin Venues</option>
                <option value="Travel Technology / API">Travel Technology / API</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">Company / Organization Name</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Aman Resorts, Swiss Air, Viator..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="corporate@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-teal-500 shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              Submit Partnership Application
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
