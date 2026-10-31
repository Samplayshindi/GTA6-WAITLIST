import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'countdown', label: 'COUNTDOWN' },
    { id: 'videos', label: 'VIDEOS' },
    { id: 'newswire', label: 'NEWSWIRE' },
    { id: 'specifications', label: 'ADDITIONAL DETAILS' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-4 ${
        isScrolled
          ? 'bg-[#08090D]/95 backdrop-blur-md border-b border-white/10 shadow-2xl'
          : 'bg-[#08090D]/40 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Official GTA VI Logo */}
        <button
          onClick={() => handleLinkClick('overview')}
          className="flex items-center gap-3 text-left group shrink-0 focus:outline-none"
          aria-label="Grand Theft Auto VI Home"
        >
          <img
            src="/gta-vi-logo.svg"
            alt="Grand Theft Auto VI"
            className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </button>

        {/* Minimal Editorial Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.2em] uppercase">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative py-1.5 whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090D] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left py-2 text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
                activeSection === link.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
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
