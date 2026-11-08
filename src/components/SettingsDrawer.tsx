import React, { useEffect } from 'react';
import {
  X,
  Sliders,
  Palette,
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
            
            {/* 1. APPEARANCE SECTION (7 Coordinated Palettes) */}
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

            {/* 2. AUDIO SETTINGS SECTION */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Audio Engine</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                {/* Music Mute Toggle */}
                <div className="flex items-center justify-between pt-1">
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
              </div>
            </section>

            {/* DESKTOP & TABLET PREFERENCES (hidden md:block) */}
            <div className="hidden md:block space-y-7 pt-2 border-t border-white/10">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                Desktop Controls
              </div>

              {/* 3. BACKGROUND SLIDESHOW CONTROL */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Background Slideshow</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Desktop Background Motion</p>
                    <p className="text-[11px] text-slate-400">Pause or resume sequential transitions</p>
                  </div>
                  <button
                    onClick={() => setSlideshowPaused(!isSlideshowPaused)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      isSlideshowPaused
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {isSlideshowPaused ? 'Paused' : 'Active'}
                  </button>
                </div>
              </section>

              {/* 4. MOTION & TRANSITIONS CONTROL */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Motion &amp; Transitions</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-2">
                  {[
                    { id: 'high', label: 'Full Animations', desc: 'Smooth zooms & cinematic fades' },
                    { id: 'low', label: 'Reduced Motion', desc: 'Minimal transitions & static frames' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setMotionMode(mode.id as 'high' | 'low')}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        motionMode === mode.id
                          ? 'bg-white/10 border-white/40 text-white'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] text-slate-400">{mode.desc}</div>
                      </div>
                      {motionMode === mode.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. PERFORMANCE MODE CONTROL */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>Performance Mode</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-2">
                  {[
                    { enabled: false, label: 'High Fidelity', desc: 'Maximum visual fidelity' },
                    { enabled: true, label: 'Performance Mode', desc: 'Optimized battery & rendering' },
                  ].map((perf) => (
                    <button
                      key={String(perf.enabled)}
                      onClick={() => setPerformanceMode(perf.enabled)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        performanceMode === perf.enabled
                          ? 'bg-white/10 border-white/40 text-white'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{perf.label}</div>
                        <div className="text-[10px] text-slate-400">{perf.desc}</div>
                      </div>
                      {performanceMode === perf.enabled && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </section>
            </div>
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
