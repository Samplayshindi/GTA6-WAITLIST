import React, { useEffect } from 'react';
import {
  X,
  Sliders,
  Film,
  Play,
  Pause,
  Palette,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useSettings, PALETTES } from '../context/SettingsContext';
import { useSoundtrack } from '../context/SoundtrackContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    isSlideshowPaused,
    colorPalette,
    motionMode,
    performanceMode,
    activePalette,
    setSlideshowPaused,
    setColorPalette,
    setMotionMode,
    setPerformanceMode,
    resetPreferences,
  } = useSettings();

  const { isMuted, toggleMute } = useSoundtrack();

  // Escape key listener to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Website Preferences & Settings"
      onClick={onClose}
      className="fixed inset-0 z-[120] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-[#08090D] border-l border-[#24262B] text-slate-100 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right-8 duration-300"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: activePalette.primaryHex }}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Preferences
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  GTA VI Waitlist Experience
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close preferences panel"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Content Sections */}
          <div className="space-y-7">
            
            {/* 1. BACKGROUND SECTION */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                <Film className="w-4 h-4 theme-text-primary" />
                <span>Background Slideshow</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isSlideshowPaused ? (
                    <span className="text-amber-400 font-medium">
                      Paused &mdash; Displaying static Vice City background.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      Active &mdash; Rotating 25 Rockstar Games artworks.
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSlideshowPaused(false)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !isSlideshowPaused
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>

                  <button
                    onClick={() => setSlideshowPaused(true)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSlideshowPaused
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 2. APPEARANCE SECTION (7 Coordinated Palettes) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                <Palette className="w-4 h-4 theme-text-primary" />
                <span>Colour Palette</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                <p className="text-xs text-slate-400">
                  Select a theme palette to dynamically update headings, highlights, borders, and accents across the site.
                </p>

                <div className="space-y-2">
                  {PALETTES.map((p) => {
                    const isSelected = colorPalette === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setColorPalette(p.id)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-white/10 border-white/40 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.primaryHex }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.secondaryHex }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.tertiaryHex }}
                            />
                          </div>
                          <span className="text-xs font-bold">{p.name}</span>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. MOTION SECTION */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                <Zap className="w-4 h-4 theme-text-primary" />
                <span>Motion &amp; Transitions</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                <p className="text-xs text-slate-400">
                  Control visual animation intensity and background pan/zoom scale.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMotionMode('high')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      motionMode === 'high'
                        ? 'text-white shadow-lg theme-bg-primary font-extrabold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    High Motion
                  </button>

                  <button
                    onClick={() => setMotionMode('low')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      motionMode === 'low'
                        ? 'bg-slate-200 text-black shadow-lg font-extrabold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Low Motion
                  </button>
                </div>
              </div>
            </section>

            {/* 4. ADDITIONAL SETTINGS SECTION */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Audio &amp; Performance</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                {/* Music Mute Toggle */}
                <div className="flex items-center justify-between pt-1 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-xs font-semibold text-slate-200">
                      Music Player Audio
                    </span>
                  </div>
                  <button
                    onClick={toggleMute}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      isMuted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Unmuted'}
                  </button>
                </div>

                {/* Performance Mode Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Performance Mode
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Minimizes GPU/CPU load on weaker devices
                    </span>
                  </div>
                  <button
                    onClick={() => setPerformanceMode(!performanceMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      performanceMode
                        ? 'bg-amber-500 text-black font-extrabold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {performanceMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Reset Action */}
        <div className="pt-6 border-t border-white/10 mt-6">
          <button
            onClick={resetPreferences}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Preferences to Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
