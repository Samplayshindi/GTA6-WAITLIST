import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, Clock, Settings2 } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenConfig,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Live clock
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'countdown', label: 'COUNTDOWN' },
    { id: 'news', label: 'NEWS' },
    { id: 'release-info', label: 'RELEASE INFO' },
    { id: 'trailers', label: 'TRAILERS' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const toggleSound = () => {
    const active = audioEngine.toggle();
    setIsAudioActive(active);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08090D]/90 backdrop-blur-md border-b border-pink-500/15 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.7)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#171025] border border-pink-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,79,163,0.3)] group-hover:border-pink-500 transition-colors">
            <span className="text-sm font-black italic tracking-tighter gta-gradient-text">VI</span>
          </div>
          <span className="text-lg font-black tracking-wider uppercase text-white whitespace-nowrap">
            GTA <span className="text-neon-pink">VI</span> <span className="text-xs font-semibold tracking-widest text-slate-400 font-sans uppercase">COUNTDOWN</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative py-1 whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_8px_rgba(255,79,163,0.8)] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Live Clock & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span className="tabular-nums font-medium">{currentTime || '12:00:00 PM'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle ambient soundscape"
            className="p-2 rounded-full text-slate-300 bg-white/5 border border-white/10 hover:border-pink-500/40 hover:text-white transition-colors"
            title={isAudioActive ? 'Mute ambient soundscape' : 'Play ambient soundscape'}
          >
            {isAudioActive ? (
              <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Target Date Config Button */}
          <button
            onClick={onOpenConfig}
            aria-label="Configure countdown dates"
            className="p-2 rounded-full text-slate-300 bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:text-white transition-colors"
            title="Edit Countdown Target Dates"
          >
            <Settings2 className="w-4 h-4 text-slate-400 hover:text-cyan-400 transition-colors" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090D]/95 border-b border-pink-500/20 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="py-2 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>LOCAL TIME</span>
            <span className="text-pink-400 tabular-nums">{currentTime}</span>
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-colors ${
                activeSection === link.id
                  ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
