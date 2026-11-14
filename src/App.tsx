/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { DesktopHomePreviews } from './components/DesktopHomePreviews';
import { PageHeaderBanner } from './components/PageHeaderBanner';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { BackToTopButton } from './components/BackToTopButton';
import { LaunchStateProvider } from './context/LaunchStateContext';
import { SoundtrackProvider } from './context/SoundtrackContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';

const CountrySelectorModal = lazy(() =>
  import('./components/CountrySelectorModal').then((m) => ({ default: m.CountrySelectorModal }))
);

const CharactersPage = lazy(() =>
  import('./components/CharactersPage').then((m) => ({ default: m.CharactersPage }))
);
const GalleryPage = lazy(() =>
  import('./components/GalleryPage').then((m) => ({ default: m.GalleryPage }))
);
const TrailerGallery = lazy(() =>
  import('./components/TrailerGallery').then((m) => ({ default: m.TrailerGallery }))
);
const NewsSection = lazy(() =>
  import('./components/NewsSection').then((m) => ({ default: m.NewsSection }))
);
const TimelineSection = lazy(() =>
  import('./components/TimelineSection').then((m) => ({ default: m.TimelineSection }))
);
const FaqSection = lazy(() =>
  import('./components/FaqSection').then((m) => ({ default: m.FaqSection }))
);
const ReleaseInformation = lazy(() =>
  import('./components/ReleaseInformation').then((m) => ({ default: m.ReleaseInformation }))
);

function normalizePath(rawPath: string): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const withoutBase = basePath !== '/' && rawPath.startsWith(basePath)
    ? `/${rawPath.slice(basePath.length)}`
    : rawPath;
  const clean = withoutBase.toLowerCase().split('?')[0].split('#')[0];
  if (clean === '/specifications' || clean === '/specs') return '/details';
  if (
    clean === '/characters' ||
    clean === '/gallery' ||
    clean === '/videos' ||
    clean === '/newswire' ||
    clean === '/timeline' ||
    clean === '/faq' ||
    clean === '/details'
  ) {
    return clean;
  }
  return '/';
}

function MainAppContent() {
  // Desktop smooth scrolling hook
  useSmoothScroll();
  const { isCountryModalOpen, closeCountryModal } = useSettings();

  // Desktop route tracking (e.g. '/', '/gallery', '/videos', '/newswire', '/timeline', '/faq', '/details')
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
      if (normalized === '/characters') setActiveSection('characters');
      else if (normalized === '/gallery') setActiveSection('gallery');
      else if (normalized === '/videos') setActiveSection('videos');
      else if (normalized === '/newswire') setActiveSection('newswire');
      else if (normalized === '/timeline') setActiveSection('timeline');
      else if (normalized === '/faq') setActiveSection('faq');
      else if (normalized === '/details') setActiveSection('specifications');
      else setActiveSection('overview');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Mobile & Single-page scroll spy
  useEffect(() => {
    if (isDesktop && currentPath !== '/') return;

    const sections = [
      'overview',
      'characters',
      'gallery',
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

  // Handle direct link landing on mobile
  useEffect(() => {
    if (!isDesktop && currentPath !== '/') {
      const targetId = (currentPath === '/details' || currentPath === '/specs') ? 'specifications' : currentPath.replace('/', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: prefersReduced ? 'auto' : 'smooth',
          });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isDesktop, currentPath]);

  // Unified navigation handler
  const handleNavigate = (sectionId: string) => {
    let targetPath = '/';
    if (sectionId === 'characters' || sectionId === '/characters') targetPath = '/characters';
    else if (sectionId === 'gallery' || sectionId === '/gallery') targetPath = '/gallery';
    else if (sectionId === 'videos' || sectionId === '/videos') targetPath = '/videos';
    else if (sectionId === 'newswire' || sectionId === '/newswire') targetPath = '/newswire';
    else if (sectionId === 'timeline' || sectionId === '/timeline') targetPath = '/timeline';
    else if (sectionId === 'faq' || sectionId === '/faq') targetPath = '/faq';
    else if (
      sectionId === 'specifications' ||
      sectionId === 'details' ||
      sectionId === '/details' ||
      sectionId === 'specs' ||
      sectionId === '/specs' ||
      sectionId === '/specifications'
    )
      targetPath = '/details';
    else if (sectionId === 'overview' || sectionId === '/') targetPath = '/';
    else if (sectionId === 'countdown') targetPath = '/';

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isDesktop) {
      const basePath = import.meta.env.BASE_URL || '/';
      const destination = `${basePath}${targetPath.replace(/^\/+/, '')}`;
      if (normalizePath(window.location.pathname) !== targetPath) {
        window.history.pushState({}, '', destination);
      }
      setCurrentPath(targetPath);
      setActiveSection(sectionId);

      if (sectionId === 'countdown' && targetPath === '/') {
        setTimeout(() => {
          const el = document.getElementById('countdown');
          if (el) {
            const headerOffset = 80;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: prefersReduced ? 'auto' : 'smooth',
            });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    } else {
      // Mobile Layout: Continuous single-page scroll
      setActiveSection(sectionId);
      const targetElementId = sectionId === 'specs' ? 'specifications' : sectionId;
      const el = document.getElementById(targetElementId);
      if (el) {
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: prefersReduced ? 'auto' : 'smooth',
        });
      } else if (sectionId === 'overview') {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#08090D] text-slate-100 selection:bg-white selection:text-black relative w-full max-w-full overflow-x-hidden">
      {/* 1. Subtle Cinematic Atmospheric Video Background */}
      <AtmosphericBackground />

      {/* 2. Editorial Top Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        currentPath={isDesktop ? currentPath : undefined}
        onNavigate={handleNavigate}
      />

      {/* 3. Main Content Flow */}
      <main className="flex-1 relative z-10 w-full max-w-full overflow-x-hidden pt-16">
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          {isDesktop ? (
            /* DESKTOP ROUTED PAGES */
            <>
              {currentPath === '/' && (
                <>
                  {/* Hero & Dynamic Launch State Countdowns */}
                  <HeroSection onNavigate={handleNavigate} />
                  {/* Compact Previews including Gallery */}
                  <DesktopHomePreviews onNavigate={handleNavigate} />
                </>
              )}

              {currentPath === '/characters' && (
                <>
                  <PageHeaderBanner
                    category="State of Leonida Dossier"
                    title="Official Character Profiles"
                    description="Detailed criminal dossiers, verified backstories, and rotating key art collections for the key figures shaping Vice City and the Keys."
                    onNavigateHome={() => handleNavigate('overview')}
                  />
                  <CharactersPage onNavigateHome={() => handleNavigate('overview')} />
                </>
              )}

              {currentPath === '/gallery' && (
                <>
                  <PageHeaderBanner
                    category="Rockstar Media Archive"
                    title="Official Artwork &amp; Screenshots"
                    description="Comprehensive high-resolution key art, character portraits, and in-engine screenshots captured directly from PlayStation 5 and Xbox Series X|S."
                    onNavigateHome={() => handleNavigate('overview')}
                  />
                  <GalleryPage onNavigateHome={() => handleNavigate('overview')} />
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

              {currentPath === '/details' && (
                <>
                  <PageHeaderBanner
                    category="Technical Specifications & Details"
                    title="System Specs &amp; Preload Details"
                    description="Confirmed console hardware targets, pre-load unlock schedules, storage allocation requirements, and verified platform support."
                    onNavigateHome={() => handleNavigate('overview')}
                  />
                  <ReleaseInformation />
                </>
              )}
            </>
          ) : (
            /* MOBILE LAYOUT: CONTINUOUS SINGLE-PAGE SCROLL */
            <>
              {/* Hero & Countdowns */}
              <HeroSection onNavigate={handleNavigate} />
              {/* Dedicated Characters Section */}
              <div id="characters">
                <CharactersPage onNavigateHome={() => handleNavigate('overview')} />
              </div>
              {/* Dedicated Gallery Section */}
              <div id="gallery">
                <GalleryPage onNavigateHome={() => handleNavigate('overview')} />
              </div>
              {/* Official Videos */}
              <div id="videos">
                <TrailerGallery />
              </div>
              {/* Live Newswire Intelligence */}
              <div id="newswire">
                <NewsSection />
              </div>
              {/* Development Timeline */}
              <div id="timeline">
                <TimelineSection />
              </div>
              {/* FAQ */}
              <div id="faq">
                <FaqSection />
              </div>
              {/* Specifications */}
              <div id="specifications">
                <ReleaseInformation />
              </div>
            </>
          )}
        </Suspense>
      </main>

      {/* Editorial Footer (With SAMAR attribution preserved) */}
      <Footer onNavigate={handleNavigate} />

      {/* Persistent Spotify-Style GTA VI Soundtrack Bottom Player */}
      <MusicPlayer />

      {/* Clean Minimal Back to Top Button */}
      <BackToTopButton />

      {/* Global Country & Time Zone Selection Modal (Single lazy instance outside <main> stacking context) */}
      {isCountryModalOpen && (
        <Suspense fallback={null}>
          <CountrySelectorModal isOpen={isCountryModalOpen} onClose={closeCountryModal} />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <LaunchStateProvider>
        <SoundtrackProvider>
          <MainAppContent />
        </SoundtrackProvider>
      </LaunchStateProvider>
    </SettingsProvider>
  );
}
