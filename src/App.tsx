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
import { DesktopHomePreviews } from './components/DesktopHomePreviews';
import { PageHeaderBanner } from './components/PageHeaderBanner';
import {
  calculateTimeRemainingFromDate,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  formatTabTitle,
  subscribeToTimeSync,
  TimeRemaining,
} from './utils/time';

function normalizePath(rawPath: string): string {
  const clean = rawPath.toLowerCase().split('?')[0].split('#')[0];
  if (clean === '/specifications') return '/specs';
  if (clean === '/videos' || clean === '/newswire' || clean === '/timeline' || clean === '/faq' || clean === '/specs') {
    return clean;
  }
  return '/';
}

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

  // Desktop route tracking (e.g. '/', '/videos', '/newswire', '/timeline', '/faq', '/specs')
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/'
  );

  // Active section for in-page highlighting and mobile anchor jumping
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Viewport detection: desktop (>= 1024px) vs mobile/tablet (< 1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to browser Back and Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizePath(window.location.pathname);
      setCurrentPath(normalized);
      // Map path to activeSection
      if (normalized === '/videos') setActiveSection('videos');
      else if (normalized === '/newswire') setActiveSection('newswire');
      else if (normalized === '/timeline') setActiveSection('timeline');
      else if (normalized === '/faq') setActiveSection('faq');
      else if (normalized === '/specs') setActiveSection('specifications');
      else setActiveSection('overview');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Mobile & Single-page scroll spy
  useEffect(() => {
    if (isDesktop && currentPath !== '/') return;

    const sections = [
      'overview',
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
  }, [isDesktop, currentPath]);

  // Handle direct link landing on mobile (smooth scroll to section if mobile loads e.g. /videos)
  useEffect(() => {
    if (!isDesktop && currentPath !== '/') {
      const targetId = currentPath === '/specs' ? 'specifications' : currentPath.replace('/', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isDesktop]);

  // Unified navigation handler
  const handleNavigate = (sectionId: string) => {
    // Map sectionId to route path
    let targetPath = '/';
    if (sectionId === 'videos' || sectionId === '/videos') targetPath = '/videos';
    else if (sectionId === 'newswire' || sectionId === '/newswire') targetPath = '/newswire';
    else if (sectionId === 'timeline' || sectionId === '/timeline') targetPath = '/timeline';
    else if (sectionId === 'faq' || sectionId === '/faq') targetPath = '/faq';
    else if (sectionId === 'specifications' || sectionId === 'specs' || sectionId === '/specs' || sectionId === '/specifications') targetPath = '/specs';
    else if (sectionId === 'overview' || sectionId === '/') targetPath = '/';
    else if (sectionId === 'countdown') targetPath = '/';

    if (isDesktop) {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      setCurrentPath(targetPath);
      setActiveSection(sectionId);

      if (sectionId === 'countdown' && targetPath === '/') {
        setTimeout(() => {
          const el = document.getElementById('countdown');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else {
      // Mobile Layout: Continuous single-page scroll
      setActiveSection(sectionId);
      const targetElementId = sectionId === 'specs' ? 'specifications' : sectionId;
      const el = document.getElementById(targetElementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 selection:bg-white selection:text-black relative pb-20 sm:pb-24 md:pb-28 w-full max-w-full overflow-x-hidden">
      {/* Editorial Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        currentPath={isDesktop ? currentPath : undefined}
        onNavigate={handleNavigate}
      />

      {/* Main Content Flow */}
      <main className="relative z-10 w-full max-w-full overflow-x-hidden">
        {isDesktop ? (
          /* DESKTOP ROUTED PAGES */
          <>
            {currentPath === '/' && (
              <>
                {/* 1. Hero & Countdowns */}
                <HeroSection
                  releaseRemaining={releaseRemaining}
                  preloadRemaining={preloadRemaining}
                  onNavigate={handleNavigate}
                />
                {/* 2. Compact Desktop Previews (Videos, Newswire, Soundtrack) */}
                <DesktopHomePreviews onNavigate={handleNavigate} />
              </>
            )}

            {currentPath === '/videos' && (
              <>
                <PageHeaderBanner
                  category="Official Broadcasts"
                  title="Official Videos &amp; Trailers"
                  description="In-engine 4K UHD reveal trailers, official broadcasts, and gameplay deep-dives captured directly on PlayStation 5 and Xbox Series X|S."
                  onNavigateHome={() => handleNavigate('overview')}
                />
                <TrailerGallery />
              </>
            )}

            {currentPath === '/newswire' && (
              <>
                <PageHeaderBanner
                  category="Live Intelligence"
                  title="GTA VI Newswire Feed"
                  description="Authoritative updates directly synchronized with Rockstar Games official feeds, Take-Two financial disclosures, and verified industry reports."
                  onNavigateHome={() => handleNavigate('overview')}
                />
                <NewsSection />
              </>
            )}

            {currentPath === '/timeline' && (
              <>
                <PageHeaderBanner
                  category="Production History"
                  title="Development &amp; Reveal Timeline"
                  description="A chronological timeline archiving key announcements, official teaser drops, record-shattering debuts, and launch milestones."
                  onNavigateHome={() => handleNavigate('overview')}
                />
                <TimelineSection />
              </>
            )}

            {currentPath === '/faq' && (
              <>
                <PageHeaderBanner
                  category="Knowledgebase"
                  title="Frequently Asked Questions"
                  description="Verified answers regarding platform launch windows, digital pre-loading schedules, game editions, cross-play expectations, and PC release details."
                  onNavigateHome={() => handleNavigate('overview')}
                />
                <FaqSection />
              </>
            )}

            {currentPath === '/specs' && (
              <>
                <PageHeaderBanner
                  category="Technical Specifications"
                  title="System Specs &amp; Preload Details"
                  description="Confirmed console hardware targets, pre-load unlock schedules, storage allocation requirements, and verified platform support."
                  onNavigateHome={() => handleNavigate('overview')}
                />
                <ReleaseInformation />
              </>
            )}
          </>
        ) : (
          /* MOBILE LAYOUT: CONTINUOUS SINGLE-PAGE SCROLL (UNCHANGED) */
          <>
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
          </>
        )}
      </main>

      {/* Editorial Footer (With SAMAR attribution preserved) */}
      <Footer onNavigate={handleNavigate} />

      {/* Fixed Spotify-Style GTA VI Soundtrack Bottom Player */}
      <MusicPlayer />
    </div>
  );
}
