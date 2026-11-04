import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Video, Calendar, Newspaper, HelpCircle, Cpu, Clock } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { id: 'countdown', label: 'Countdowns', icon: Clock },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'newswire', label: 'Newswire', icon: Newspaper },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'specifications', label: 'Specs', icon: Cpu },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 sm:py-3.5 ${
          isScrolled
            ? 'bg-[#08090D]/95 backdrop-blur-md border-b border-white/10 shadow-2xl'
            : 'bg-[#08090D]/80 backdrop-blur-sm border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Official GTA VI Logo */}
          <button
            onClick={() => handleLinkClick('overview')}
            className="flex items-center gap-2 group shrink-0 focus:outline-none cursor-pointer"
            aria-label="Grand Theft Auto VI Home"
          >
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </button>

          {/* Desktop Editorial Navigation (Clean, authentic sections) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-bold tracking-[0.18em] uppercase">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`py-1.5 transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#F4F1ED] border-b-2 border-[#F15A24]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Search Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Global GTA VI Search (Cmd+K)"
              aria-label="Search GTA VI database"
            >
              <Search className="w-3.5 h-3.5 text-[#F15A24]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-slate-400 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Mobile / Tablet Menu Trigger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#F15A24]" /> : <Menu className="w-5 h-5 text-[#F4F1ED]" />}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile & Tablet Full-Width Responsive Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-[#08090D]">
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-8 w-auto object-contain"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between p-3.5 mb-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-mono"
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#F15A24]" />
                <span>Search GTA VI Intel...</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-slate-400">
                Cmd+K
              </span>
            </button>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-sm font-semibold tracking-wider uppercase transition-colors ${
                      isActive
                        ? 'bg-[#F15A24] text-white shadow-lg shadow-[#F15A24]/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#F15A24]'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-[#08090D]/80 text-center">
            <p className="text-[11px] font-mono text-slate-500">
              Grand Theft Auto VI &middot; November 19, 2026
            </p>
          </div>
        </div>
      )}
    </>
  );
};
