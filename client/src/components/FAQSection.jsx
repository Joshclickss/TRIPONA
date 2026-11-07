import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How does TRIPONA AI trip planning work?',
      answer:
        'Simply tell TRIPONA your dream destination, travel dates, and pace. Our AI models analyze millions of flight routes, boutique hotels, and verified local recommendations to deliver a tailored day-by-day itinerary in seconds.',
    },
    {
      question: 'Can I customize and edit the generated itinerary?',
      answer:
        'Yes. Every stop, day, hotel, and activity is fully flexible. You can swap activities, reorder days, adjust budgets, or ask the AI assistant to refine specific segments like romantic viewpoints or kid-friendly dining.',
    },
    {
      question: 'Can I book hotels, flights, and activities in one place?',
      answer:
        'Yes. TRIPONA integrates verified partner booking for flights, curated accommodations, local transportation, and unique guided experiences with seamless one-click reservation.',
    },
    {
      question: 'Does TRIPONA support group travel and offline access?',
      answer:
        'Yes. Share a collaborative trip link with friends to plan together in real time. Itineraries also sync offline on mobile so you can access maps, tickets, and reservations anywhere without Wi-Fi.',
    },
  ];

  return (
    <section id="faq" className="relative py-14 sm:py-20 bg-[#050505] overflow-hidden border-t border-white/[0.06]">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono tracking-widest text-[#A9DDF0] uppercase">
            <HelpCircle size={11} className="text-[#A9DDF0]" />
            <span>FAQ</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
          
          <p className="text-xs sm:text-sm text-[#A5A5A5] max-w-md mx-auto">
            Quick answers about planning, customizing, and booking your journeys with TRIPONA.
          </p>
        </div>

        {/* Short Accordion List */}
        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl transition-all duration-300 border ${
                  isOpen
                    ? 'bg-[#0E1015]/90 border-[#A855F7]/40 shadow-[0_4px_20px_rgba(168,85,247,0.12)]'
                    : 'bg-[#090B0E]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-left px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-[15px] font-semibold text-white tracking-tight">
                    {faq.question}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-[#A855F7]/20 text-[#A855F7]' : 'bg-white/5 text-white/50'
                  }`}>
                    {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-0 text-xs sm:text-[13px] text-[#A5A5A5] leading-relaxed border-t border-white/[0.05] mt-1 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
