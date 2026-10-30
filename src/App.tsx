/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrailerGallery } from './components/TrailerGallery';
import { NewsSection } from './components/NewsSection';
import { ReleaseInformation } from './components/ReleaseInformation';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import {
  calculateTimeRemainingFromDate,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  formatTabTitle,
  TimeRemaining,
} from './utils/time';

export default function App() {
  const globalReleaseDate = getGlobalReleaseLocalDate();
  const preloadDate = getPreloadLocalDate();

  // Real-time Countdown states (computed from visitor's local midnight)
  const [releaseRemaining, setReleaseRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(globalReleaseDate)
  );
  const [preloadRemaining, setPreloadRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(preloadDate)
  );

  // Active Navigation & Video Modal
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activeTrailerModal, setActiveTrailerModal] = useState<string | null>(null);

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

    return () => clearInterval(interval);
  }, [globalReleaseDate, preloadDate]);

  // Track active section on scroll
  useEffect(() => {
    const sections = ['overview', 'countdown', 'videos', 'newswire', 'specifications'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 240;
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
    <div className="min-h-screen bg-[#08090D] text-slate-100 selection:bg-white selection:text-black relative">
      {/* Minimal Editorial Navigation Bar */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content Flow — Opens Directly on Homepage */}
      <main className="relative z-10">
        <HeroSection
          releaseRemaining={releaseRemaining}
          preloadRemaining={preloadRemaining}
          onNavigate={handleNavigate}
          onOpenTrailerModal={() => setActiveTrailerModal('launch-trailer')}
        />

        <TrailerGallery
          activeTrailerModal={activeTrailerModal}
          onOpenTrailer={(id) => setActiveTrailerModal(id)}
          onCloseTrailer={() => setActiveTrailerModal(null)}
        />

        <NewsSection />

        <ReleaseInformation />
      </main>

      {/* Clean Editorial Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating Vice City Soundtrack Music Player */}
      <MusicPlayer />
    </div>
  );
}
