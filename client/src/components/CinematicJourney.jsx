import React, { useState, useEffect, useRef } from 'react';
import { THEMATIC_SCENES } from '../data/cinematicThematicScenes';

export default function CinematicJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeShot, setActiveShot] = useState(0); // 0 = Primary, 1 = Secondary
  
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Continuous subtle dissolve animation between Shot 1 and Shot 2
  useEffect(() => {
    setActiveShot(0);
    const shotInterval = setInterval(() => {
      setActiveShot((prev) => (prev === 0 ? 1 : 0));
    }, 5500);

    return () => clearInterval(shotInterval);
  }, [activeIndex]);

  // Automatic cinematic scene glide (every 7 seconds)
  useEffect(() => {
    const sceneInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % THEMATIC_SCENES.length);
    }, 7000);

    return () => clearInterval(sceneInterval);
  }, []);

  const nextScene = () => {
    setActiveIndex((prev) => (prev + 1) % THEMATIC_SCENES.length);
  };

  const prevScene = () => {
    setActiveIndex((prev) => (prev - 1 + THEMATIC_SCENES.length) % THEMATIC_SCENES.length);
  };

  // Smooth Scroll-Controlled Wheel Navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrollingRef.current) return;

      const threshold = 18;
      if (Math.abs(e.deltaY) < threshold) return;

      if (e.deltaY > 0) {
        nextScene();
      } else {
        prevScene();
      }

      isScrollingRef.current = true;
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 650);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Touch Swipe Vertical Scrolling Support
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartYRef.current === null) return;
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;
      touchStartYRef.current = null;

      if (Math.abs(diffY) > 45) {
        if (diffY > 0) {
          nextScene();
        } else {
          prevScene();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextScene();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown');
  }, []);

  return (
    <section id="visual-journey" className="relative w-full h-screen overflow-hidden bg-[#061117] select-none cursor-default">
      
      {/* ============================================================== */}
      {/* 100% PURE VISUAL CINEMATIC ENGINE — ZERO UI / ZERO UX          */}
      {/* Edge-to-edge full-viewport photography with slow Ken Burns zoom */}
      {/* ============================================================== */}
      <div className="absolute inset-0 z-0">
        {THEMATIC_SCENES.map((dest, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={dest.id}
              className={`absolute inset-0 transition-opacity duration-1200 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Shot 1: Primary 4K Visual */}
              <div
                className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                  isActive && activeShot === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={dest.image}
                  alt=""
                  loading={idx < 3 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover animate-subtleKenBurns"
                />
              </div>

              {/* Shot 2: Secondary Visual (Seamless Dissolve Animation) */}
              {dest.secondaryImage && (
                <div
                  className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
                    isActive && activeShot === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={dest.secondaryImage}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover scale-105 animate-subtleKenBurns"
                  />
                </div>
              )}

              {/* Natural Atmospheric Lighting & Deep Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061117]/70 via-transparent to-[#061117]/30 pointer-events-none z-20" />
            </div>
          );
        })}
      </div>

    </section>
  );
}
