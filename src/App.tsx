/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition, useRef, Suspense, lazy } from 'react';
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
import {
  CharactersPageLazy,
  GalleryPageLazy,
  TrailerGalleryLazy,
  NewsSectionLazy,
  TimelineSectionLazy,
  FaqSectionLazy,
  ReleaseInformationLazy,
  prefetchRoute,
  scheduleIdleRoutePrefetch,
  resolveRouteKey,
} from './utils/routeLoaders';

const CountrySelectorModal = lazy(() =>
  import('./components/CountrySelectorModal').then((m) => ({ default: m.CountrySelectorModal }))
);

function normalizePath(rawPath: string): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const withoutBase =
    basePath !== '/' && rawPath.startsWith(basePath)
      ? `/${rawPath.slice(basePath.length)}`
      : rawPath;
  const clean =
    withoutBase.toLowerCase().split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
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

function getSectionIdForPath(path: string): string {
  if (path === '/characters') return 'characters';
  if (path === '/gallery') return 'gallery';
  if (path === '/videos') return 'videos';
  if (path === '/newswire') return 'newswire';
  if (path === '/timeline') return 'timeline';
  if (path === '/faq') return 'faq';
  if (path === '/details') return 'specifications';
  return 'overview';
}

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[70vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8" aria-busy="true">
    <div className="space-y-3 border-b border-white/10 pb-8">
      <div className="h-3 w-36 rounded-full bg-white/10 animate-pulse" />
      <div className="h-10 w-80 max-w-full rounded-xl bg-white/10 animate-pulse" />
      <div className="h-4 w-[32rem] max-w-full rounded-lg bg-white/5 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="h-56 rounded-2xl bg-[#090C10]/80 border border-white/10 animate-pulse" />
      ))}
    </div>
  </div>
);

const MobileSectionFallback: React.FC<{ title: string }> = ({ title }) => (
  <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10" aria-busy="true">
    <div className="space-y-3 mb-8">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="h-8 w-56 rounded-lg bg-white/10 animate-pulse" />
    </div>
    <div className="h-48 rounded-2xl bg-[#090C10]/80 border border-white/10 animate-pulse" />
  </div>
);

interface DesktopRouteState {
  currentPath: string;
  outgoingPath: string | null;
  transitionSeq: number;
  visitedPaths: string[];
}

function MainAppContent() {
  // Desktop smooth scrolling hook
  useSmoothScroll();
  const { isCountryModalOpen, closeCountryModal, motionMode } = useSettings();

  const shouldAnimateTransitions =
    motionMode !== 'low' &&
    (typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Desktop route tracking with atomic outgoing/incoming crossfade state
  const [routeState, setRouteState] = useState<DesktopRouteState>(() => {
    const initial = typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/';
    return {
      currentPath: initial,
      outgoingPath: null,
      transitionSeq: 0,
      visitedPaths: [initial],
    };
  });
  const currentPath = routeState.currentPath;
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isRoutePending, startRouteTransition] = useTransition();

  // Active section for in-page highlighting and mobile anchor jumping
  const [activeSection, setActiveSection] = useState<string>(() =>
    getSectionIdForPath(typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/')
  );

  // Viewport detection: desktop (>= 1024px) vs mobile/tablet (< 1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  const pendingScrollTargetRef = useRef<'top' | 'countdown' | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure current route is tracked in visitedPaths if viewport switches to desktop; clear outgoing on breakpoint flip
  useEffect(() => {
    if (!isDesktop) {
      setRouteState((prev) => (prev.outgoingPath ? { ...prev, outgoingPath: null } : prev));
      return;
    }
    if (!routeState.visitedPaths.includes(currentPath)) {
      startRouteTransition(() => {
        setRouteState((prev) =>
          prev.visitedPaths.includes(prev.currentPath)
            ? prev
            : { ...prev, visitedPaths: [...prev.visitedPaths, prev.currentPath] }
        );
      });
    }
  }, [isDesktop, currentPath, routeState.visitedPaths]);

  // Clear outgoing route panel cleanly after crossfade duration completes
  useEffect(() => {
    if (!routeState.outgoingPath) return;
    const seq = routeState.transitionSeq;
    const timer = setTimeout(() => {
      setRouteState((prev) =>
        prev.transitionSeq === seq ? { ...prev, outgoingPath: null } : prev
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [routeState.transitionSeq, routeState.outgoingPath]);

  // Idle background prefetching for fast subsequent tab navigation without blocking first paint
  useEffect(() => {
    return scheduleIdleRoutePrefetch();
  }, []);

  // Scroll smoothly only after destination route has committed (prevents jumping old page on slow chunks)
  useEffect(() => {
    if (!isDesktop) return;
    const scrollTarget = pendingScrollTargetRef.current;
    if (!scrollTarget) return;
    pendingScrollTargetRef.current = null;

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (scrollTarget === 'countdown' && currentPath === '/') {
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
  }, [currentPath, isDesktop]);

  // Listen to browser Back and Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizePath(window.location.pathname);
      prefetchRoute(normalized);
      setPendingPath(normalized);
      setActiveSection(getSectionIdForPath(normalized));
      pendingScrollTargetRef.current = 'top';
      const canAnimate =
        motionMode !== 'low' &&
        (typeof window.matchMedia !== 'function' ||
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      startRouteTransition(() => {
        setRouteState((prev) => {
          if (prev.currentPath === normalized) return prev;
          return {
            currentPath: normalized,
            outgoingPath: canAnimate ? prev.currentPath : null,
            transitionSeq: prev.transitionSeq + 1,
            visitedPaths: prev.visitedPaths.includes(normalized)
              ? prev.visitedPaths
              : [...prev.visitedPaths, normalized],
          };
        });
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [motionMode]);

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
    const targetPath = resolveRouteKey(sectionId);
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isDesktop) {
      prefetchRoute(targetPath);
      const basePath = import.meta.env.BASE_URL || '/';
      const destination = `${basePath}${targetPath.replace(/^\/+/, '')}`;
      if (normalizePath(window.location.pathname) !== targetPath) {
        window.history.pushState({}, '', destination);
      }

      setActiveSection(sectionId);

      // Already on the target route: perform scroll immediately without re-transitioning
      if (targetPath === currentPath) {
        setPendingPath(null);
        if (sectionId === 'countdown' && targetPath === '/') {
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
        } else {
          window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
        return;
      }

      setPendingPath(targetPath);
      pendingScrollTargetRef.current = sectionId === 'countdown' && targetPath === '/' ? 'countdown' : 'top';

      startRouteTransition(() => {
        setRouteState((prev) => {
          if (prev.currentPath === targetPath) return prev;
          return {
            currentPath: targetPath,
            outgoingPath: shouldAnimateTransitions ? prev.currentPath : null,
            transitionSeq: prev.transitionSeq + 1,
            visitedPaths: prev.visitedPaths.includes(targetPath)
              ? prev.visitedPaths
              : [...prev.visitedPaths, targetPath],
          };
        });
      });
    } else {
      // Mobile Layout: Continuous single-page scroll
      prefetchRoute(sectionId);
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

  const navHighlightPath = isRoutePending && pendingPath ? pendingPath : currentPath;

  const renderDesktopRoute = (routePath: string, isActive: boolean) => {
    switch (routePath) {
      case '/':
        return (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <DesktopHomePreviews onNavigate={handleNavigate} />
          </>
        );
      case '/characters':
        return (
          <>
            <PageHeaderBanner
              category="State of Leonida Dossier"
              title="Official Character Profiles"
              description="Detailed criminal dossiers, verified backstories, and rotating key art collections for the key figures shaping Vice City and the Keys."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <CharactersPageLazy onNavigateHome={() => handleNavigate('overview')} isActive={isActive} />
          </>
        );
      case '/gallery':
        return (
          <>
            <PageHeaderBanner
              category="Rockstar Media Archive"
              title="Official Artwork &amp; Screenshots"
              description="Comprehensive high-resolution key art, character portraits, and in-engine screenshots captured directly from PlayStation 5 and Xbox Series X|S."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <GalleryPageLazy onNavigateHome={() => handleNavigate('overview')} isActive={isActive} />
          </>
        );
      case '/videos':
        return (
          <>
            <PageHeaderBanner
              category="Official Broadcasts"
              title="Official Videos &amp; Trailers"
              description="In-engine 4K UHD reveal trailers, official broadcasts, and gameplay deep-dives captured directly on PlayStation 5 and Xbox Series X|S."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <TrailerGalleryLazy />
          </>
        );
      case '/newswire':
        return (
          <>
            <PageHeaderBanner
              category="Live Intelligence"
              title="GTA VI Newswire Feed"
              description="Authoritative updates directly synchronized with Rockstar Games official feeds, Take-Two financial disclosures, and verified industry reports."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <NewsSectionLazy isActive={isActive} />
          </>
        );
      case '/timeline':
        return (
          <>
            <PageHeaderBanner
              category="Production History"
              title="Development &amp; Reveal Timeline"
              description="A chronological timeline archiving key announcements, official teaser drops, record-shattering debuts, and launch milestones."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <TimelineSectionLazy />
          </>
        );
      case '/faq':
        return (
          <>
            <PageHeaderBanner
              category="Knowledgebase"
              title="Frequently Asked Questions"
              description="Verified answers regarding platform launch windows, digital pre-loading schedules, game editions, cross-play expectations, and PC release details."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <FaqSectionLazy />
          </>
        );
      case '/details':
        return (
          <>
            <PageHeaderBanner
              category="Technical Specifications & Details"
              title="System Specs &amp; Preload Details"
              description="Confirmed console hardware targets, pre-load unlock schedules, storage allocation requirements, and verified platform support."
              onNavigateHome={() => handleNavigate('overview')}
            />
            <ReleaseInformationLazy />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#08090D] text-slate-100 selection:bg-white selection:text-black relative w-full max-w-full overflow-x-hidden">
      {/* 1. Subtle Cinematic Atmospheric Video Background */}
      <AtmosphericBackground />

      {/* 2. Editorial Top Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        currentPath={isDesktop ? navHighlightPath : undefined}
        isNavigating={isRoutePending}
        onNavigate={handleNavigate}
      />

      {/* 3. Main Content Flow */}
      <main className="flex-1 relative z-10 w-full max-w-full overflow-x-hidden pt-16">
        {isDesktop ? (
          /* DESKTOP ROUTED PAGES: Transition keeps previous route visible while loading, then crossfades smoothly */
          <Suspense fallback={<RouteLoadingFallback />}>
            <div className="relative w-full overflow-clip">
              {routeState.visitedPaths.map((routePath) => {
                const isActive = currentPath === routePath;
                const animateCrossfade = shouldAnimateTransitions && routeState.outgoingPath !== null;
                const isOutgoing = animateCrossfade && !isActive && routeState.outgoingPath === routePath;

                let panelClass = 'hidden';
                if (isActive) {
                  panelClass = animateCrossfade ? 'relative z-[2] route-crossfade-in' : 'relative z-[2]';
                } else if (isOutgoing) {
                  panelClass =
                    'absolute inset-x-0 top-0 z-[1] pointer-events-none select-none route-crossfade-out';
                }

                return (
                  <div
                    key={routePath}
                    className={panelClass}
                    aria-hidden={!isActive}
                  >
                    {renderDesktopRoute(routePath, isActive)}
                  </div>
                );
              })}
            </div>
          </Suspense>
        ) : (
          /* MOBILE LAYOUT: Continuous single-page scroll with isolated section Suspense boundaries */
          <>
            {/* Hero & Countdowns rendered immediately outside Suspense */}
            <HeroSection onNavigate={handleNavigate} />

            {/* Dedicated Characters Section */}
            <div id="characters">
              <Suspense fallback={<MobileSectionFallback title="Official Characters" />}>
                <CharactersPageLazy onNavigateHome={() => handleNavigate('overview')} isPrimaryRoute={false} />
              </Suspense>
            </div>

            {/* Dedicated Gallery Section */}
            <div id="gallery">
              <Suspense fallback={<MobileSectionFallback title="Official Media Gallery" />}>
                <GalleryPageLazy onNavigateHome={() => handleNavigate('overview')} isPrimaryRoute={false} />
              </Suspense>
            </div>

            {/* Official Videos */}
            <div id="videos">
              <Suspense fallback={<MobileSectionFallback title="Official Videos" />}>
                <TrailerGalleryLazy isPrimaryRoute={false} />
              </Suspense>
            </div>

            {/* Live Newswire Intelligence */}
            <div id="newswire">
              <Suspense fallback={<MobileSectionFallback title="GTA VI Newswire" />}>
                <NewsSectionLazy isPrimaryRoute={false} />
              </Suspense>
            </div>

            {/* Development Timeline */}
            <div id="timeline">
              <Suspense fallback={<MobileSectionFallback title="Development Timeline" />}>
                <TimelineSectionLazy />
              </Suspense>
            </div>

            {/* FAQ */}
            <div id="faq">
              <Suspense fallback={<MobileSectionFallback title="FAQ & Knowledgebase" />}>
                <FaqSectionLazy />
              </Suspense>
            </div>

            {/* Specifications */}
            <div id="specifications">
              <Suspense fallback={<MobileSectionFallback title="Production Details" />}>
                <ReleaseInformationLazy />
              </Suspense>
            </div>
          </>
        )}
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
