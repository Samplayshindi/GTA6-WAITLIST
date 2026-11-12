import React from 'react';
import { AlertTriangle, BatteryCharging, Zap, X, Check } from 'lucide-react';

interface MobileSlideshowWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const MobileSlideshowWarningModal: React.FC<MobileSlideshowWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Background Motion Warning"
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0B0C10] border border-amber-500/40 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-white">
                Mobile Performance Notice
              </h3>
              <p className="text-[11px] font-mono text-amber-400 font-semibold">
                Background Motion & Battery Saver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-6">
          <p>
            Enabling high-definition background artwork slideshow on mobile devices increases GPU rendering activity and battery drain, especially on lower-end or thermal-throttled mobile phones.
          </p>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Higher Battery Drain</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Requires Hardware Acceleration</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            You can disable this setting anytime in the Preferences panel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors cursor-pointer"
          >
            Keep Off
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Enable Anyway</span>
          </button>
        </div>
      </div>
    </div>
  );
};
