import React, { useState, useEffect } from 'react';
import { Menu, X, Video, Calendar, Newspaper, HelpCircle, Cpu, Clock } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
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
            ? 'bg-[#08090C]/95 backdrop-blur-md border-b border-[#24262B] shadow-2xl'
            : 'bg-[#08090C]/80 backdrop-blur-sm border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 w-full">
          
          {/* Official GTA VI Logo */}
          <button
            onClick={() => handleLinkClick('overview')}
            className="flex items-center gap-2 group shrink-0 focus:outline-none cursor-pointer p-1"
            aria-label="Grand Theft Auto VI Home"
          >
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </button>

          {/* Desktop Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.18em] uppercase">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`py-1.5 transition-colors cursor-pointer min-h-[36px] ${
                  activeSection === link.id
                    ? 'text-[#F5F5F5] border-b-2 border-[#F15A24]'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#F15A24]" /> : <Menu className="w-5 h-5 text-[#F4F1ED]" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile & Tablet Full-Width Responsive Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#24262B] bg-[#08090C]">
            <img
              src="/gta-vi-logo.svg"
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
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-sm font-semibold tracking-wider uppercase transition-colors min-h-[48px] ${
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

          <div className="p-4 border-t border-[#24262B] bg-[#08090C] text-center">
            <p className="text-[11px] font-mono text-slate-500">
              Grand Theft Auto VI &middot; November 19, 2026
            </p>
          </div>
        </div>
      )}
    </>
  );
};
