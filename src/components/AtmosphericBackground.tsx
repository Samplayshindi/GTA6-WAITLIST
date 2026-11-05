import React, { useState, useEffect, useRef } from 'react';

interface AtmosphericBackgroundProps {
  videoSrc?: string;
  posterSrc?: string;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  videoSrc = '/videos/vice-city-ambient.mp4',
  posterSrc = '/images/hero-4k.jpg',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSupported, setVideoSupported] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setVideoSupported(false);
        return;
      }

      // Check for low-data saving mode
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      if (connection && connection.saveData) {
        setVideoSupported(false);
        return;
      }

      // Detect video playback support
      const videoTest = document.createElement('video');
      const canPlay = !!(videoTest.canPlayType && videoTest.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/no/, ''));
      setVideoSupported(canPlay);
    }
  }, []);

  // Pause video when tab is hidden to save GPU/CPU and battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.visibilityState === 'hidden') {
        videoRef.current.pause();
      } else if (document.visibilityState === 'visible' && videoLoaded) {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [videoLoaded]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#08090D]"
      aria-hidden="true"
    >
      {/* 1. Official High-Resolution Static Artwork Layer (Always present as baseline & instant fallback) */}
      <img
        src={posterSrc}
        srcSet={`${posterSrc} 3840w, /official-gta-vi-hero.jpg 1920w`}
        sizes="100vw"
        alt=""
        loading="eager"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-20 scale-100' : 'opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite]'
        }`}
      />

      {/* 2. Authentic Looping Video Layer (Activated when supported & available) */}
      {videoSupported && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => {
            setVideoLoaded(true);
            if (videoRef.current) {
              videoRef.current.play().catch(() => {
                setVideoLoaded(false);
              });
            }
          }}
          onError={() => {
            // Graceful fallback to static high-resolution artwork
            setVideoLoaded(false);
            setVideoSupported(false);
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-35 scale-105' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* 3. Measured Contrast Scrims (Ensures WCAG AA text legibility across all viewport frames) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/85 to-[#08090D]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08090D] via-transparent to-[#08090D]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FF4FA3]/5 via-transparent to-black/60" />
    </div>
  );
};
