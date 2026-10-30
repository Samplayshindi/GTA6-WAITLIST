import React, { useState } from 'react';
import { X, Calendar, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { COUNTDOWN_CONFIG } from '../config/countdown';

interface DateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  officialDate: string;
  preloadDate: string;
  onSave: (officialDate: string, preloadDate: string) => void;
}

export const DateConfigModal: React.FC<DateConfigModalProps> = ({
  isOpen,
  onClose,
  officialDate,
  preloadDate,
  onSave,
}) => {
  const [customOfficial, setCustomOfficial] = useState(officialDate.slice(0, 16));
  const [customPreload, setCustomPreload] = useState(preloadDate.slice(0, 16));
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      new Date(customOfficial).toISOString(),
      new Date(customPreload).toISOString()
    );
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setCustomOfficial(COUNTDOWN_CONFIG.officialReleaseDate.slice(0, 16));
    setCustomPreload(COUNTDOWN_CONFIG.preloadEstimatedDate.slice(0, 16));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg gta-glass rounded-3xl p-6 sm:p-8 border border-pink-500/30 shadow-[0_0_60px_rgba(255,79,163,0.25)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase text-white tracking-tight">
                Countdown Targets
              </h3>
              <p className="text-xs text-slate-400">
                Configure official launch date &amp; preload placeholder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Dates update the countdown in real time. Official currently announced date is November 19, 2026. Preload is estimated.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-pink-400 mb-1.5">
              Global Release Target Date
            </label>
            <input
              type="datetime-local"
              value={customOfficial}
              onChange={(e) => setCustomOfficial(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c18] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 mb-1.5">
              Preload Target Date (Estimated Placeholder)
            </label>
            <input
              type="datetime-local"
              value={customPreload}
              onChange={(e) => setCustomPreload(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c18] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/25 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Dates</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
