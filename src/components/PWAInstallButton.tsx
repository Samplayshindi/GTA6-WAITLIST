import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'nav' | 'footer' }> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow with beforeinstallprompt
  if (isInstallable) {
    if (variant === 'footer') {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F4F1ED] border border-white/10 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#FF4FA3]" />
          <span>Install App (PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase text-[#F4F1ED] bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer min-h-[32px] shrink-0"
        title="Install GTA VI App to your device"
        aria-label="Install App"
      >
        <Download className="w-3.5 h-3.5 text-[#FF4FA3]" />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  // iOS Safari flow (no beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        {variant === 'footer' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F4F1ED] border border-white/10 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FF4FA3]" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase text-[#F4F1ED] bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer min-h-[32px] shrink-0"
            title="Install on iPhone / iPad"
            aria-label="Install on iOS"
          >
            <Download className="w-3.5 h-3.5 text-[#FF4FA3]" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install on iOS instructions"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-xl bg-[#121318] border border-[#24262B] p-6 shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F4F1ED] tracking-tight">Install on iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-[#A1A1AA] hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-5">
                <span>1. Tap the <strong>Share</strong> icon in the Safari bottom bar.</span>
                <br />
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                <br />
                <span>3. Launch GTA VI directly from your home screen.</span>
              </p>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
