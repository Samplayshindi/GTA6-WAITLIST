import React, { useState, useEffect } from 'react';
import {
  ImageIcon,
  Video,
  Newspaper,
  Calendar,
  HelpCircle,
  Cpu,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { SettingsDrawer } from './SettingsDrawer';

interface NavbarProps {
  activeSection: string;
  currentPath: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, currentPath, onNavigate }) => {
  const { selectedPalette, openSettings, isSettingsOpen, closeSettings } = useSettings();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
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

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 ${
          isScrolled
            ? 'bg-[#08090D]/95 backdrop-blur-md border-b border-[#24262B] shadow-2xl'
            : 'bg-[#08090D]/80 backdrop-blur-sm border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 w-full">
          {/* Zone 1: Logo */}
          <button
            onClick={() => handleLinkClick('overview')}
            className="flex items-center gap-2 group shrink-0 focus:outline-none cursor-pointer"
            aria-label="Grand Theft Auto VI Home"
          >
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.18em] uppercase">
            {navLinks.map((link) => {
              const active = isLinkActive(link.id);
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`py-1.5 transition-colors cursor-pointer min-h-[36px] whitespace-nowrap shrink-0 ${
                    active ? 'text-[#F5F5F5] border-b-2' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                  }`}
                  style={{ borderColor: active ? selectedPalette.primaryHex : 'transparent' }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={openSettings}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-[#F5F5F5] border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              aria-label="Preferences"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Preferences</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-[#F5F5F5] border border-white/10 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#08090D]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.id);
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};
