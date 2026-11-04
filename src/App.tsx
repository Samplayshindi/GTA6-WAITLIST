/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrailerGallery } from './components/TrailerGallery';
import { NewsSection } from './components/NewsSection';
import { TimelineSection } from './components/TimelineSection';
import { FaqSection } from './components/FaqSection';
import { ReleaseInformation } from './components/ReleaseInformation';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import {
  calculateTimeRemainingFromDate,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  formatTabTitle,
  subscribeToTimeSync,
  TimeRemaining,
} from './utils/time';

export default function App() {
  const globalReleaseDate = useMemo(() => getGlobalReleaseLocalDate(), []);
  const preloadDate = useMemo(() => getPreloadLocalDate(), []);

  // Real-time Countdown states (computed with tamper-proof server-synced time)
  const [releaseRemaining, setReleaseRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(globalReleaseDate)
  );
  const [preloadRemaining, setPreloadRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(preloadDate)
  );

  // Active Navigation state
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Update countdown every second & sync browser tab title
  useEffect(() => {
    const updateCountdown = () => {
      const rel = calculateTimeRemainingFromDate(globalReleaseDate);
      const pre = calculateTimeRemainingFromDate(preloadDate);
      setReleaseRemaining(rel);
      setPreloadRemaining(pre);

      // Update browser tab title dynamically
      document.title = formatTabTitle(rel);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Re-evaluate immediately when authoritative server time sync arrives
    const unsubscribeSync = subscribeToTimeSync(() => {
      updateCountdown();
    });

    return () => {
      clearInterval(interval);
      unsubscribeSync();
    };
  }, [globalReleaseDate, preloadDate]);

  // Track active section on scroll
  useEffect(() => {
    const sections = [
      'overview',
      'countdown',
      'videos',
      'newswire',
      'timeline',
      'faq',
      'specifications',
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 260;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 selection:bg-white selection:text-black relative pb-20 sm:pb-24 md:pb-28 w-full max-w-full overflow-x-hidden">
      {/* Editorial Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content Flow */}
      <main className="relative z-10 w-full max-w-full overflow-x-hidden">
        
        {/* 1. Hero & Countdowns */}
        <HeroSection
          releaseRemaining={releaseRemaining}
          preloadRemaining={preloadRemaining}
          onNavigate={handleNavigate}
        />

        {/* 2. Official Videos & Broadcasts */}
        <TrailerGallery />

        {/* 3. Live GTA VI Newswire Intelligence */}
        <NewsSection />

        {/* 4. History & Development Timeline */}
        <TimelineSection />

        {/* 5. FAQ & Knowledgebase */}
        <FaqSection />

        {/* 6. Production Specifications & Preload Details */}
        <ReleaseInformation />

      </main>

      {/* Editorial Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Fixed Spotify-Style GTA VI Soundtrack Bottom Player (Fluid Mobile & Desktop) */}
      <MusicPlayer />
    </div>
  );
}
