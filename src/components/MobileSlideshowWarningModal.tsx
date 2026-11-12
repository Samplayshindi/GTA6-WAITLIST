import React from 'react';
import { Smartphone, X } from 'lucide-react';

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
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0B0C10] border border-amber-500/40 rounded-2xl p-5 text-slate-100 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Battery Saver Warning</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Enabling background slideshow motion on mobile devices consumes additional battery power and cellular data.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Enable Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
