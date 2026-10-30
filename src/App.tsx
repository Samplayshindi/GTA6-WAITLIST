/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { AtmosphericBackdrop } from './components/AtmosphericBackdrop';
import { CinematicIntro } from './components/CinematicIntro';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { NewsSection } from './components/NewsSection';
import { ReleaseInformation } from './components/ReleaseInformation';
import { TrailerGallery } from './components/TrailerGallery';
import { Footer } from './components/Footer';
import { DateConfigModal } from './components/DateConfigModal';
import { COUNTDOWN_CONFIG } from './config/countdown';
import { calculateTimeRemaining, formatTabTitle, TimeRemaining } from './utils/time';

export default function App() {
  // Session-based Cinematic Intro state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const seen = sessionStorage.getItem('gta6_intro_seen');
      return !seen;
    } catch {
      return true;
    }
  });

  // Configurable Countdown Target Dates
  const [officialDate, setOfficialDate] = useState<string>(() => {
    try {
      return localStorage.getItem('gta6_official_target') || COUNTDOWN_CONFIG.officialReleaseDate;
    } catch {
      return COUNTDOWN_CONFIG.officialReleaseDate;
    }
  });

  const [preloadDate, setPreloadDate] = useState<string>(() => {
    try {
      return localStorage.getItem('gta6_preload_target') || COUNTDOWN_CONFIG.preloadEstimatedDate;
    } catch {
      return COUNTDOWN_CONFIG.preloadEstimatedDate;
    }
  });

  // Real-time Countdown states
  const [releaseRemaining, setReleaseRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(officialDate)
  );
  const [preloadRemaining, setPreloadRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(preloadDate)
  );

  // Active Navigation & Modals
  const [activeSection, setActiveSection] = useState<string>('home');
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [activeTrailerModal, setActiveTrailerModal] = useState<string | null>(null);

  // Mouse Parallax Coordinates
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Update countdowns every second & sync browser tab title
  useEffect(() => {
    const updateCountdown = () => {
      const rel = calculateTimeRemaining(officialDate);
      const pre = calculateTimeRemaining(preloadDate);
      setReleaseRemaining(rel);
      setPreloadRemaining(pre);

      // Update browser tab title dynamically
      document.title = formatTabTitle(rel);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [officialDate, preloadDate]);

  // Subtle Mouse Parallax Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const sections = ['hero', 'countdown', 'news', 'release-info', 'trailers'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id === 'hero' ? 'home' : id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('gta6_intro_seen', 'true');
    } catch {
      // ignore
    }
  }, []);

  const handleReplayIntro = () => {
    setShowIntro(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const targetId = sectionId === 'home' ? 'hero' : sectionId;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveDates = (newOfficial: string, newPreload: string) => {
    setOfficialDate(newOfficial);
    setPreloadDate(newPreload);
    try {
      localStorage.setItem('gta6_official_target', newOfficial);
      localStorage.setItem('gta6_preload_target', newPreload);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 selection:bg-pink-500 selection:text-white relative">
      {/* Cinematic Starting Animation Overlay */}
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Atmospheric Background & Parallax Vector Art */}
      <AtmosphericBackdrop parallaxX={parallax.x} parallaxY={parallax.y} />

      {/* Fixed Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenConfig={() => setConfigModalOpen(true)}
      />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <HeroSection
          releaseRemaining={releaseRemaining}
          preloadRemaining={preloadRemaining}
          officialReleaseDate={officialDate}
          preloadDate={preloadDate}
          timezoneDisplay={COUNTDOWN_CONFIG.timezoneDisplay}
          onNavigate={handleNavigate}
          onOpenTrailerModal={() => setActiveTrailerModal('QdBZY2fkU-0')}
        />

        <NewsSection />

        <ReleaseInformation officialReleaseDate={officialDate} />

        <TrailerGallery
          activeTrailerModal={activeTrailerModal}
          onOpenTrailer={(id) => setActiveTrailerModal(id)}
          onCloseTrailer={() => setActiveTrailerModal(null)}
        />
      </main>

      {/* Footer & Credits */}
      <Footer onReplayIntro={handleReplayIntro} onNavigate={handleNavigate} />

      {/* Configuration Modal for Target Dates */}
      <DateConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        officialDate={officialDate}
        preloadDate={preloadDate}
        onSave={handleSaveDates}
      />
    </div>
  );
}
