import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { ambientSound } from '../utils/ambientAudio';

const SCENES = [
  {
    id: 1,
    name: 'Alpine Canyon & Emerald River',
    video: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Drone_footage_from_Matka_Canyon%2C_Skopje%2C_Macedonia..webm',
    fallback: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85'
  },
  {
    id: 2,
    name: 'Azores Coastal Cliffs',
    video: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Drone_video_of_Santa_Maria_Island%2C_Azores%2C_Portugal_Julesvernex2.webm',
    fallback: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85'
  },
  {
    id: 3,
    name: 'Nordic Coastal Beach & Pines',
    video: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Drone_video_of_Kaberneeme_beach_in_Estonia_%28June_2022%29.webm',
    fallback: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2400&q=85'
  },
  {
    id: 4,
    name: 'Mount Pinatubo Crater Lake',
    video: 'https://upload.wikimedia.org/wikipedia/commons/0/07/The_Mount_Pinatubo_today%21_Drone_footage.webm',
    fallback: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85'
  },
  {
    id: 5,
    name: 'Emerald Forest Spring Sanctuary',
    video: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Drone_video_of_Saula_sacrificial_spring_in_Estonia_%28January_2022%29.webm',
    fallback: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2400&q=85'
  }
];

export default function CinematicHero({ onStartPlanning, onExploreDestinations }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  
  const videoRef = useRef(null);

  const scene = SCENES[currentScene];

  // Handle scene change with crossfade
  const handleSceneChange = (nextIndex) => {
    setIsCrossfading(true);
    setTimeout(() => {
      setCurrentScene(nextIndex);
      setIsCrossfading(false);
    }, 400);
  };

  const handlePrev = () => {
    const prev = (currentScene - 1 + SCENES.length) % SCENES.length;
    handleSceneChange(prev);
  };

  const handleNext = () => {
    const next = (currentScene + 1) % SCENES.length;
    handleSceneChange(next);
  };

  // Video play/pause control
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Ambient sound toggle
  const toggleSound = () => {
    if (isMuted) {
      ambientSound.play();
      setIsMuted(false);
    } else {
      ambientSound.pause();
      setIsMuted(true);
    }
  };

  // Keep playback state synced across scene switches
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentScene]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      ambientSound.pause();
    };
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[640px] overflow-hidden bg-black select-none">
      
      {/* 1. Full-Screen Cinematic Video Background with Crossfade & Fallback */}
      <div className="absolute inset-0 z-0">
        
        {/* Responsive Image Fallback for mobile / preloading */}
        <img
          src={scene.fallback}
          alt="Cinematic Destination Fallback"
          className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* 4K/HD Cinematic Video Loop */}
        <video
          ref={videoRef}
          key={scene.video}
          playsInline
          autoPlay
          muted
          loop
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover scale-105 animate-subtleKenBurns transition-opacity duration-700 ${
            isCrossfading ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <source src={scene.video} type="video/webm" />
          <source src={scene.fallback} type="image/jpeg" />
        </video>

        {/* Subtle Cinematic Vignette overlays to ensure UI button clarity without altering visual fidelity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      </div>

      {/* 2. Floating Action Controls (Strict Visual Rules: ZERO headings, ZERO descriptions, ZERO text overlays) */}
      <div className="relative z-20 w-full h-full flex flex-col justify-end items-center pb-12 sm:pb-16 px-6 pointer-events-none">
        
        <div className="flex flex-col items-center gap-5 pointer-events-auto">
          
          {/* PRIMARY BUTTONS: Start Planning & Explore Destinations */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            
            {/* Start Planning Button */}
            <button
              onClick={onStartPlanning}
              className="group relative inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold text-white glass-panel border border-cyan-400/40 hover:border-cyan-300 hover:bg-white/15 backdrop-blur-2xl shadow-[0_0_35px_rgba(34,211,238,0.35)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all duration-300 active:scale-95"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="tracking-wide">Start Planning</span>
              <Sparkles size={16} className="text-cyan-300 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Explore Destinations Button */}
            <button
              onClick={onExploreDestinations}
              className="group relative inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold text-white glass-panel border border-white/20 hover:border-white/50 hover:bg-white/15 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300 active:scale-95"
            >
              <Compass size={16} className="text-sky-300 group-hover:rotate-45 transition-transform" />
              <span className="tracking-wide">Explore Destinations</span>
            </button>

          </div>

          {/* SECONDARY CONTROLS: Scene Navigation, Sound, Play/Pause */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/15 backdrop-blur-2xl shadow-2xl">
            
            {/* Previous Scene */}
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Scene"
              aria-label="Previous Scene"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Play / Pause Video */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? "Pause Video" : "Play Video"}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            {/* Sound On / Off */}
            <button
              onClick={toggleSound}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                !isMuted 
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isMuted ? "Turn Sound On" : "Mute Sound"}
              aria-label={isMuted ? "Turn Sound On" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Next Scene */}
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Scene"
              aria-label="Next Scene"
            >
              <ChevronRight size={16} />
            </button>

            {/* Scene dots indicator */}
            <div className="flex items-center gap-1.5 pl-2 pr-1 border-l border-white/10">
              {SCENES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSceneChange(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentScene ? 'w-4 bg-cyan-400' : 'bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to scene ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
