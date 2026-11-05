import React, { useState, useEffect, useRef } from 'react';

interface VideoClip {
  id: string;
  src: string;
  poster: string;
  title: string;
}

const VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'skyline',
    src: '/videos/vice-city-skyline.mp4',
    poster: '/images/hero-4k.jpg',
    title: 'Vice City Skyline',
  },
  {
    id: 'nightlife',
    src: '/videos/neon-nightlife.mp4',
    poster: '/images/vice-city-style-4k.jpg',
    title: 'Vice City Neon Nightlife',
  },
  {
    id: 'coastal',
    src: '/videos/coastal-sunset.mp4',
    poster: '/images/squalo-speedboat-4k.jpg',
    title: 'Leonida Coastal Sunset',
  },
  {
    id: 'highway',
    src: '/videos/highway-coastal.mp4',
    poster: '/images/grotti-cheetah-4k.jpg',
    title: 'Highways & Coastal Drive',
  },
];

const ROTATION_INTERVAL_MS = 20000; // Switch clips every 20 seconds

export const AtmosphericBackground: React.FC = () => {
  // Default videoSupported to true unless reduced-motion or saveData is active
  const [videoSupported, setVideoSupported] = useState<boolean>(true);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [isSlotAActive, setIsSlotAActive] = useState<boolean>(true);
  const [slotALoaded, setSlotALoaded] = useState<boolean>(false);
  const [slotBLoaded, setSlotBLoaded] = useState<boolean>(false);

  const slotARef = useRef<HTMLVideoElement>(null);
  const slotBRef = useRef<HTMLVideoElement>(null);

  // Check hardware/browser support, reduced motion, and data saver settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setVideoSupported(false);
        return;
      }

      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      if (connection && connection.saveData) {
        setVideoSupported(false);
        return;
      }
    }
  }, []);

  // Ensure initial video plays immediately on mount
  useEffect(() => {
    if (!videoSupported) return;

    const playActive = () => {
      const activeEl = isSlotAActive ? slotARef.current : slotBRef.current;
      if (activeEl) {
        activeEl.muted = true;
        activeEl.playsInline = true;
        activeEl
          .play()
          .then(() => {
            if (isSlotAActive) setSlotALoaded(true);
            else setSlotBLoaded(true);
          })
          .catch(() => {
            // Browser autoplay restrictions fallback on user gesture
          });
      }
    };

    playActive();

    // Attach user interaction listener to trigger play if browser blocked muted autoplay
    const handleUserGesture = () => {
      playActive();
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('scroll', handleUserGesture);
    };

    window.addEventListener('click', handleUserGesture);
    window.addEventListener('touchstart', handleUserGesture);
    window.addEventListener('scroll', handleUserGesture);

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('scroll', handleUserGesture);
    };
  }, [videoSupported, activeClipIndex, isSlotAActive]);

  // Rotation logic: crossfade between Slot A and Slot B every 20 seconds
  useEffect(() => {
    if (!videoSupported) return;

    const interval = setInterval(() => {
      const nextIndex = (activeClipIndex + 1) % VIDEO_CLIPS.length;

      if (isSlotAActive) {
        // Slot A is current. Load and play Slot B with next clip.
        if (slotBRef.current) {
          slotBRef.current.src = VIDEO_CLIPS[nextIndex].src;
          slotBRef.current.muted = true;
          slotBRef.current.playsInline = true;
          slotBRef.current.load();
          slotBRef.current
            .play()
            .then(() => {
              setSlotBLoaded(true);
              setIsSlotAActive(false);
              setActiveClipIndex(nextIndex);
            })
            .catch(() => {
              // If failed to load/play, advance index anyway
              setActiveClipIndex(nextIndex);
            });
        }
      } else {
        // Slot B is current. Load and play Slot A with next clip.
        if (slotARef.current) {
          slotARef.current.src = VIDEO_CLIPS[nextIndex].src;
          slotARef.current.muted = true;
          slotARef.current.playsInline = true;
          slotARef.current.load();
          slotARef.current
            .play()
            .then(() => {
              setSlotALoaded(true);
              setIsSlotAActive(true);
              setActiveClipIndex(nextIndex);
            })
            .catch(() => {
              setActiveClipIndex(nextIndex);
            });
        }
      }
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [videoSupported, isSlotAActive, activeClipIndex]);

  // Pause video playback when browser tab is hidden to save power
  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeVideo = isSlotAActive ? slotARef.current : slotBRef.current;
      if (!activeVideo) return;

      if (document.visibilityState === 'hidden') {
        activeVideo.pause();
      } else if (document.visibilityState === 'visible') {
        activeVideo.muted = true;
        activeVideo.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSlotAActive]);

  const activePoster = VIDEO_CLIPS[activeClipIndex].poster;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#08090D]"
      aria-hidden="true"
    >
      {/* 1. Official High-Resolution Static Artwork Fallback */}
      <img
        src={activePoster}
        alt=""
        loading="eager"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
          slotALoaded || slotBLoaded
            ? 'opacity-20 scale-100'
            : 'opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite]'
        }`}
      />

      {/* 2. Dual Crossfading Video Layers */}
      {videoSupported && (
        <>
          {/* Video Slot A */}
          <video
            ref={slotARef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src={VIDEO_CLIPS[0].src}
            onCanPlay={() => {
              setSlotALoaded(true);
              if (slotARef.current && isSlotAActive) {
                slotARef.current.muted = true;
                slotARef.current.play().catch(() => {});
              }
            }}
            onLoadedData={() => {
              setSlotALoaded(true);
            }}
            onError={() => {
              setSlotALoaded(false);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
              isSlotAActive && slotALoaded ? 'opacity-60 scale-105' : 'opacity-0 scale-100'
            }`}
          />

          {/* Video Slot B */}
          <video
            ref={slotBRef}
            muted
            loop
            playsInline
            preload="auto"
            src={VIDEO_CLIPS[1].src}
            onCanPlay={() => {
              setSlotBLoaded(true);
              if (slotBRef.current && !isSlotAActive) {
                slotBRef.current.muted = true;
                slotBRef.current.play().catch(() => {});
              }
            }}
            onLoadedData={() => {
              setSlotBLoaded(true);
            }}
            onError={() => {
              setSlotBLoaded(false);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
              !isSlotAActive && slotBLoaded ? 'opacity-60 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        </>
      )}

      {/* 3. Measured Contrast Scrims for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/75 to-[#08090D]/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08090D]/80 via-transparent to-[#08090D]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FF4FA3]/10 via-transparent to-black/50" />
    </div>
  );
};
