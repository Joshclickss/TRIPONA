import React from 'react';
import { Camera, Instagram, Heart, MapPin } from 'lucide-react';

export default function TravelMemoriesSection() {
  const memories = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=600&q=80',
      title: 'Twilight Over Manhattan',
      location: 'New York, USA',
      author: '@elena_voyage',
      likes: '1.4k',
      aspect: 'aspect-[3/4]',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      title: 'Skógafoss Roar',
      location: 'South Coast, Iceland',
      author: '@markus.trek',
      likes: '2.8k',
      aspect: 'aspect-[3/4]',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      title: 'Turquoise Solitude',
      location: 'Bora Bora, French Polynesia',
      author: '@chloe_travels',
      likes: '3.1k',
      aspect: 'aspect-[3/4]',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      title: 'Cappadocia Sunrise',
      location: 'Göreme, Turkey',
      author: '@wander_alex',
      likes: '4.2k',
      aspect: 'aspect-[3/4]',
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
      
      {/* Background Scenic Nature Overlay with subtle green and amber glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80"
          alt="Atmospheric Mountain Backdrop"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* Atmospheric lighting spots */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 mb-2">
            <Instagram size={12} className="text-pink-400" />
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/80 uppercase">
              #TOURIJOURNEY
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
            Don't Forget To Tag Your Journey
          </h2>
          
          <p className="text-base sm:text-[17px] text-[#A5A5A5] leading-relaxed">
            Capture your favourite moments and keep your travel memories alive.
          </p>
        </div>

        {/* Horizontal Photo Gallery Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {memories.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] border border-white/10 hover:border-purple-400/50 bg-[#121218] transition-all duration-500 shadow-xl"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Likes floating tag */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                <Heart size={12} className="text-pink-400 fill-pink-400" />
                <span>{item.likes}</span>
              </div>

              {/* Caption at bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <div className="text-[11px] font-medium text-purple-300">
                  {item.author}
                </div>
                <div className="text-sm font-bold text-white group-hover:text-purple-100 transition-colors">
                  {item.title}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#A5A5A5]">
                  <MapPin size={11} className="text-white/50" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
