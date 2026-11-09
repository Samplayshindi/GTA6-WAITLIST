import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Palette,
  Volume2,
  VolumeX,
  Gauge,
  RotateCcw,
  Check,
  Globe,
  HardDrive,
  Smartphone,
  Monitor,
  AlertCircle,
} from 'lucide-react';
import { useSettings, PALETTES, TIME_ZONES } from '../context/SettingsContext';
import { useSoundtrack } from '../context/SoundtrackContext';
import { MobileSlideshowWarningModal } from './MobileSlideshowWarningModal';
import { ResourceInstallerModal } from './ResourceInstallerModal';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    isSlideshowPaused,
    mobileSlideshowEnabled,
    colorPalette,
    motionMode,
    performanceMode,
    selectedTimeZone,
    effectiveTimeZone,
    isResourceInstallerOpen,
    activePalette,
    setSlideshowPaused,
    setMobileSlideshowEnabled,
    setColorPalette,
    setMotionMode,
    setPerformanceMode,
    setSelectedTimeZone,
    openResourceInstaller,
    closeResourceInstaller,
    resetPreferences,
  } = useSettings();

  const { isMuted, toggleMute } = useSoundtrack();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);

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

  const handleMobileSlideshowToggle = () => {
    if (mobileSlideshowEnabled) {
      setMobileSlideshowEnabled(false);
    } else {
      setIsWarningModalOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Website Preferences & Settings"
        onClick={onClose}
        className="fixed inset-0 z-[120] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg h-full bg-[#08090D] border-l border-[#24262B] text-slate-100 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right-8 duration-300"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: activePalette.primaryHex }}
                >
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">
                    Preferences
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400">
                    GTA VI Waitlist Experience v1.7.5
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
            <div className="space-y-6">
              {/* 1. COLOUR PALETTE SECTION (Visual Grid Redesign) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    <Palette className="w-4 h-4 theme-text-primary" />
                    <span>Colour Palette</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    7 Custom Themes
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                  <p className="text-xs text-slate-400">
                    Select a theme palette to dynamically customize accents, headings, borders, and button gradients across the application.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PALETTES.map((p) => {
                      const isSelected = colorPalette === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setColorPalette(p.id)}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-white/10 border-white/40 text-white shadow-lg ring-1 ring-white/20'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-xs font-bold truncate max-w-[110px]">{p.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.primaryHex }}
                            />
                            <span
                              className="w-4 h-4 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.secondaryHex }}
                            />
                            <span
                              className="w-4 h-4 rounded-full shadow-inner inline-block"
                              style={{ backgroundColor: p.tertiaryHex }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 2. AUTOMATIC TIME ZONE DETECTION SECTION */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Time Zone Detection</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automatically detect your local region or manually select a custom time zone to display launch and pre-load schedules.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                      Target Time Zone Region:
                    </label>
                    <select
                      value={selectedTimeZone}
                      onChange={(e) => setSelectedTimeZone(e.target.value)}
                      className="w-full bg-[#08090D] border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                    >
                      {TIME_ZONES.map((tz) => (
                        <option key={tz.value} value={tz.value} className="bg-[#08090D] text-white">
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Active Zone:</span>
                    <span className="text-cyan-400 font-bold truncate max-w-[200px]">
                      {effectiveTimeZone}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. BACKGROUND SLIDESHOW (Desktop & Mobile Options) */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span>Background Slideshow</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                  {/* Desktop Background Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-purple-400" />
                        <p className="text-xs font-semibold text-slate-200">Desktop Background</p>
                      </div>
                      <p className="text-[10px] text-slate-400">Sequential fade-to-black transitions</p>
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

                  {/* Mobile Background Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <p className="text-xs font-semibold text-slate-200">Mobile Background Motion</p>
                      </div>
                      <p className="text-[10px] text-slate-400">Off by default to conserve battery</p>
                    </div>
                    <button
                      onClick={handleMobileSlideshowToggle}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                        mobileSlideshowEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {mobileSlideshowEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </section>

              {/* 4. MOTION & PERFORMANCE MODES */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>Performance & Motion</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                  {/* Motion Mode Toggle */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-300 font-semibold block mb-2">
                      Motion &amp; Transitions:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'high', label: 'Full Motion', desc: 'Cinematic fades & smooth zooms' },
                        { id: 'low', label: 'Reduced Motion', desc: 'Static frames & minimal motion' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setMotionMode(mode.id as 'high' | 'low')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            motionMode === mode.id
                              ? 'bg-white/10 border-white/40 text-white'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{mode.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Performance Mode Toggle */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-mono text-slate-300 font-semibold block mb-2">
                      Rendering Fidelity:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { enabled: false, label: 'High Fidelity', desc: 'Maximum quality' },
                        { enabled: true, label: 'Performance Mode', desc: 'Battery saver' },
                      ].map((perf) => (
                        <button
                          key={String(perf.enabled)}
                          onClick={() => setPerformanceMode(perf.enabled)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            performanceMode === perf.enabled
                              ? 'bg-white/10 border-white/40 text-white'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{perf.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{perf.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. AUDIO & MUSIC PLAYER */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Audio Engine</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 flex items-center justify-between">
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
              </section>

              {/* 6. WEBSITE RESOURCE INSTALLATION (BETA) */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Offline Storage</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1015] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Install Website Resources</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                          BETA
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pre-cache application bundles for instant offline access
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={openResourceInstaller}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Manage Cached Resources</span>
                  </button>
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
              <span>Reset All Preferences to Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal for Mobile Background Slideshow */}
      <MobileSlideshowWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        onConfirm={() => setMobileSlideshowEnabled(true)}
      />

      {/* Resource Installer BETA Modal */}
      <ResourceInstallerModal
        isOpen={isResourceInstallerOpen}
        onClose={closeResourceInstaller}
      />
    </>
  );
};
