import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Menu, X, Video, Calendar, Newspaper, HelpCircle, Cpu, Clock, Image as ImageIcon, Sliders, Users } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useSettings } from '../context/SettingsContext';
import { prefetchRoute } from '../utils/routeLoaders';

const SettingsDrawer = lazy(() =>
  import('./SettingsDrawer').then((m) => ({ default: m.SettingsDrawer }))
);

interface NavbarProps {
  activeSection: string;
  currentPath?: string;
  isNavigating?: boolean;
  onNavigate: (sectionId: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  currentPath,
  isNavigating = false,
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activePalette } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'newswire', label: 'Newswire', icon: Newspaper },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'specifications', label: 'Details', icon: Cpu },
  ];

  const isLinkActive = (id: string) => {
    if (currentPath !== undefined) {
      if (id === 'overview') return currentPath === '/';
      if (id === 'characters') return currentPath === '/characters';
      if (id === 'gallery') return currentPath === '/gallery';
      if (id === 'videos') return currentPath === '/videos';
      if (id === 'newswire') return currentPath === '/newswire';
      if (id === 'timeline') return currentPath === '/timeline';
      if (id === 'faq') return currentPath === '/faq';
      if (id === 'specifications') return currentPath === '/details' || currentPath === '/specs' || currentPath === '/specifications';
    }
    return activeSection === id;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 sm:py-3.5 ${
          isScrolled
            ? 'bg-[#08090D]/95 backdrop-blur-md border-b border-[#24262B] shadow-2xl'
            : 'bg-[#08090D]/80 backdrop-blur-sm border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 w-full">
          
          {/* Zone 1: Official GTA VI Logo */}
          <button
            onClick={() => handleLinkClick('overview')}
            className="flex items-center gap-2 group shrink-0 focus:outline-none cursor-pointer p-1"
            aria-label="Grand Theft Auto VI Home"
          >
            <img
              src={`${import.meta.env.BASE_URL}gta-vi-logo.svg`}
              alt="Grand Theft Auto VI"
              width={160}
              height={36}
              decoding="async"
              fetchPriority="high"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </button>

          {/* Zone 2: Desktop Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.18em] uppercase">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                onMouseEnter={() => prefetchRoute(link.id)}
                onFocus={() => prefetchRoute(link.id)}
                onPointerDown={() => prefetchRoute(link.id)}
                className={`py-1.5 transition-colors cursor-pointer min-h-[36px] whitespace-nowrap shrink-0 ${
                  isLinkActive(link.id)
                    ? 'text-[#F5F5F5] border-b-2'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                }`}
                style={{
                  borderColor: isLinkActive(link.id) ? activePalette.primaryHex : 'transparent',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Hamburger Settings Menu Button */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <PWAInstallButton variant="nav" />

            {/* Premium Hamburger Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Open website preferences and menu"
              title="Website Settings & Menu"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer text-xs font-bold tracking-wider uppercase min-h-[38px] hover:scale-105 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-[var(--theme-primary,#F15A24)]" />
              <span>Menu</span>
            </button>
          </div>

          {/* Mobile Right Controls: Install Button + Settings + Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <PWAInstallButton variant="nav" />

            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings drawer"
              className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Sliders className="w-4 h-4 text-[var(--theme-primary,#F15A24)]" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[var(--theme-primary,#F15A24)]" /> : <Menu className="w-5 h-5 text-[#F4F1ED]" />}
            </button>
          </div>

        </div>

        {/* Subtle non-blocking transition bar shown only while a lazy chunk is loading on slow networks */}
        {isNavigating && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-white/10 pointer-events-none"
          >
            <div className="h-full w-1/2 theme-progress-fill animate-lightbox-progress" />
          </div>
        )}
      </header>

      {/* Mobile & Tablet Full-Width Responsive Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#24262B] bg-[#08090D]">
            <img
              src={`${import.meta.env.BASE_URL}gta-vi-logo.svg`}
              alt="Grand Theft Auto VI"
              className="h-8 w-auto object-contain"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isLinkActive(link.id);
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    onPointerDown={() => prefetchRoute(link.id)}
                    onFocus={() => prefetchRoute(link.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-sm font-semibold tracking-wider uppercase transition-colors min-h-[48px] ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isActive ? activePalette.primaryHex : undefined,
                    }}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--theme-primary,#F15A24)]'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-sm font-semibold tracking-wider uppercase transition-colors min-h-[48px] bg-white/5 hover:bg-white/10 text-slate-200"
              >
                <Sliders className="w-4 h-4 text-[var(--theme-primary,#F15A24)]" />
                <span>Preferences &amp; Settings</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[#24262B] bg-[#08090D] text-center space-y-2">
            <div className="flex justify-center">
              <PWAInstallButton variant="footer" />
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Grand Theft Auto VI &middot; November 19, 2026
            </p>
          </div>
        </div>
      )}

      {/* Hamburger Settings Drawer (Lazy-loaded & mounted only when open) */}
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Suspense>
      )}
    </>
  );
};
