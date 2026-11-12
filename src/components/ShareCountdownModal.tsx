import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Palette as PaletteIcon,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSettings, PALETTES, ColorPalette } from '../context/SettingsContext';
import { useLaunchState } from '../context/LaunchStateContext';
import { GALLERY_IMAGES, GalleryImage } from '../data/galleryData';
import { getResponsiveImageUrl } from '../utils/imageUtils';
import { apiUrl } from '../services/api';

interface ShareCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type CardAspect = '16:9' | '1:1' | '4:5';

export const ShareCountdownModal: React.FC<ShareCountdownModalProps> = ({ isOpen, onClose }) => {
  const { selectedCountry, effectiveTimeZone } = useSettings();
  const { releaseRemaining, launchState } = useLaunchState();

  const [selectedPaletteId, setSelectedPaletteId] = useState<ColorPalette>('vice-city');
  const [aspectRatio, setAspectRatio] = useState<CardAspect>('16:9');

  // Background artwork selection state
  const [selectedBgImage, setSelectedBgImage] = useState<GalleryImage | null>(null);
  const [loadedBgImgEl, setLoadedBgImgEl] = useState<HTMLImageElement | null>(null);
  const [isBgLoading, setIsBgLoading] = useState<boolean>(false);
  const [bgError, setBgError] = useState<string | null>(null);

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePalette = PALETTES.find((p) => p.id === selectedPaletteId) || PALETTES[0];

  // Pre-load official GTA VI logo for canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${import.meta.env.BASE_URL}gta-vi-logo.svg`;
    img.onload = () => {
      setLogoImage(img);
    };
  }, []);

  // Robust CORS-safe custom background image loader
  useEffect(() => {
    if (!selectedBgImage) {
      setLoadedBgImgEl(null);
      setBgError(null);
      setIsBgLoading(false);
      return;
    }

    setIsBgLoading(true);
    setBgError(null);

    // Primary: Route through server proxy with CORS headers & target resolution
    const proxiedUrl = apiUrl(
      `/api/proxy-image?url=${encodeURIComponent(getResponsiveImageUrl(selectedBgImage.url, 1200))}`
    );

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setLoadedBgImgEl(img);
      setIsBgLoading(false);
      setBgError(null);
    };

    img.onerror = () => {
      // Secondary Fallback: Try raw URL directly
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        setLoadedBgImgEl(fallbackImg);
        setIsBgLoading(false);
        setBgError(null);
      };
      fallbackImg.onerror = () => {
        setLoadedBgImgEl(null);
        setIsBgLoading(false);
        setBgError(`Unable to load background "${selectedBgImage.title}". Try selecting another image or Default Vice City.`);
      };
      fallbackImg.src = getResponsiveImageUrl(selectedBgImage.url, 1200);
    };

    img.src = proxiedUrl;
  }, [selectedBgImage]);

  // Programmatic Vector Palm Trees & Skyline (for Default Vice City Background)
  const drawPalmTree = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    angleOffset: number = 0
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate((angleOffset * Math.PI) / 180);

    ctx.strokeStyle = '#04050A';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-25, -120, -50, -220);
    ctx.stroke();

    const topX = -50;
    const topY = -220;
    const leafAngles = [-140, -100, -60, -20, 20, 60, 100, 140];

    ctx.fillStyle = '#04050A';
    leafAngles.forEach((angle) => {
      ctx.save();
      ctx.translate(topX, topY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(40, -20, 90, 15);
      ctx.quadraticCurveTo(40, 5, 0, 0);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  };

  const drawSkylineSilhouettes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = '#04050A';
    const baseY = height * 0.95;

    const buildings = [
      { x: width * 0.04, w: width * 0.08, h: height * 0.16 },
      { x: width * 0.11, w: width * 0.06, h: height * 0.22 },
      { x: width * 0.16, w: width * 0.05, h: height * 0.14 },
      { x: width * 0.79, w: width * 0.07, h: height * 0.20 },
      { x: width * 0.85, w: width * 0.06, h: height * 0.15 },
      { x: width * 0.90, w: width * 0.07, h: height * 0.23 },
    ];

    buildings.forEach((b) => {
      ctx.fillRect(b.x, baseY - b.h, b.w, b.h + height * 0.1);
      ctx.fillRect(b.x + b.w * 0.45, baseY - b.h - height * 0.03, b.w * 0.1, height * 0.03);
    });
  };

  // Main Canvas Render Engine (Strictly Logo + 4 Countdown Values only)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1200;
    let height = 675; // 16:9

    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '4:5') {
      width = 1080;
      height = 1350;
    }

    canvas.width = width;
    canvas.height = height;

    // ==========================================
    // 1. BACKGROUND LAYER (Custom Selected Image OR Default Sunset)
    // ==========================================
    if (selectedBgImage && loadedBgImgEl && loadedBgImgEl.complete && loadedBgImgEl.naturalWidth > 0) {
      // Intelligent Aspect-Fill Cover (no stretching or distortion)
      const imgAspect = loadedBgImgEl.naturalWidth / loadedBgImgEl.naturalHeight;
      const canvasAspect = width / height;

      let renderW = width;
      let renderH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        renderW = height * imgAspect;
        offsetX = (width - renderW) / 2;
      } else {
        renderH = width / imgAspect;
        offsetY = (height - renderH) / 2;
      }

      ctx.drawImage(loadedBgImgEl, offsetX, offsetY, renderW, renderH);

      // Dark Overlay Gradient for maximum contrast
      const darkOverlay = ctx.createLinearGradient(0, 0, 0, height);
      darkOverlay.addColorStop(0, 'rgba(6, 8, 14, 0.58)');
      darkOverlay.addColorStop(0.5, 'rgba(6, 8, 14, 0.65)');
      darkOverlay.addColorStop(1, 'rgba(6, 8, 14, 0.88)');
      ctx.fillStyle = darkOverlay;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Default Vice City Sunset Sky
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, width, height);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#060812');
      skyGrad.addColorStop(0.35, '#0E0F1D');
      skyGrad.addColorStop(0.68, activePalette.secondaryHex + '48');
      skyGrad.addColorStop(0.9, activePalette.primaryHex + '68');
      skyGrad.addColorStop(1, '#06070B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.85;
      const sunGrad = ctx.createRadialGradient(
        width / 2,
        horizonY,
        10,
        width / 2,
        horizonY,
        width * 0.55
      );
      sunGrad.addColorStop(0, activePalette.primaryHex + '90');
      sunGrad.addColorStop(0.4, activePalette.tertiaryHex + '40');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      drawSkylineSilhouettes(ctx, width, height);
      if (aspectRatio === '16:9') {
        drawPalmTree(ctx, width * 0.05, height * 0.98, width * 0.0018, 15);
        drawPalmTree(ctx, width * 0.12, height * 1.02, width * 0.0014, 5);
        drawPalmTree(ctx, width * 0.94, height * 0.98, width * 0.0018, -15);
        drawPalmTree(ctx, width * 0.88, height * 1.02, width * 0.0014, -8);
      } else {
        drawPalmTree(ctx, width * 0.06, height * 0.98, width * 0.002, 12);
        drawPalmTree(ctx, width * 0.94, height * 0.98, width * 0.002, -12);
      }
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.35,
      width / 2,
      height / 2,
      width * 0.72
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(4, 5, 10, 0.82)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 2. ELEGANT FRAMING
    // ==========================================
    const margin = width * 0.035;
    ctx.strokeStyle = activePalette.primaryHex + '66';
    ctx.lineWidth = width * 0.002;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    const cornerLength = width * 0.025;
    ctx.strokeStyle = activePalette.primaryHex;
    ctx.lineWidth = width * 0.004;

    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerLength);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerLength, margin);

    ctx.moveTo(width - margin - cornerLength, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerLength);

    ctx.moveTo(margin, height - margin - cornerLength);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerLength, height - margin);

    ctx.moveTo(width - margin - cornerLength, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerLength);
    ctx.stroke();

    // ==========================================
    // 3. ELEMENT 1: PROMINENT OFFICIAL GTA VI LOGO ONLY
    // ==========================================
    let logoCenterY = height * 0.32;
    let logoHeight = height * 0.24;

    if (aspectRatio === '1:1') {
      logoCenterY = height * 0.33;
      logoHeight = height * 0.22;
    } else if (aspectRatio === '4:5') {
      logoCenterY = height * 0.32;
      logoHeight = height * 0.20;
    }

    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      const aspect = logoImage.naturalWidth / logoImage.naturalHeight;
      const drawWidth = logoHeight * aspect;
      ctx.drawImage(logoImage, width / 2 - drawWidth / 2, logoCenterY - logoHeight / 2, drawWidth, logoHeight);
    } else {
      ctx.font = `700 ${Math.round(width * 0.07)}px 'Space Grotesk', system-ui, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = activePalette.primaryHex;
      ctx.shadowBlur = 25;
      ctx.fillText('GRAND THEFT AUTO VI', width / 2, logoCenterY);
      ctx.shadowBlur = 0;
    }

    // ==========================================
    // 4. ELEMENT 2: COUNTDOWN VALUES ONLY (DAYS, HOURS, MINUTES, SECONDS)
    // ==========================================
    let countdownCenterY = height * 0.70;
    if (aspectRatio === '1:1') {
      countdownCenterY = height * 0.72;
    } else if (aspectRatio === '4:5') {
      countdownCenterY = height * 0.72;
    }

    const isReleased = launchState === 'released' || (releaseRemaining.days === 0 && releaseRemaining.hours === 0 && releaseRemaining.minutes === 0 && releaseRemaining.seconds === 0);

    if (isReleased) {
      ctx.font = `700 ${Math.round(width * 0.05)}px 'Space Grotesk', system-ui, sans-serif`;
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 25;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AVAILABLE NOW', width / 2, countdownCenterY);
      ctx.shadowBlur = 0;
    } else {
      const days = releaseRemaining.days.toString().padStart(2, '0');
      const hours = releaseRemaining.hours.toString().padStart(2, '0');
      const mins = releaseRemaining.minutes.toString().padStart(2, '0');
      const secs = releaseRemaining.seconds.toString().padStart(2, '0');

      const units = [
        { val: days, label: 'DAYS' },
        { val: hours, label: 'HOURS' },
        { val: mins, label: 'MINUTES' },
        { val: secs, label: 'SECONDS' },
      ];

      const tileWidth = aspectRatio === '16:9' ? width * 0.17 : width * 0.19;
      const tileHeight = aspectRatio === '16:9' ? height * 0.26 : height * 0.18;
      const gap = width * 0.025;
      const totalWidth = 4 * tileWidth + 3 * gap;
      const startX = (width - totalWidth) / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      units.forEach((u, idx) => {
        const x = startX + idx * (tileWidth + gap);
        const y = countdownCenterY - tileHeight / 2;

        // Translucent Glass Box
        ctx.fillStyle = 'rgba(8, 10, 18, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = width * 0.0025;
        ctx.beginPath();
        ctx.roundRect(x, y, tileWidth, tileHeight, width * 0.015);
        ctx.fill();
        ctx.stroke();

        // Top Accent Neon Line
        ctx.strokeStyle = activePalette.primaryHex;
        ctx.lineWidth = width * 0.004;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.015, y);
        ctx.lineTo(x + tileWidth - width * 0.015, y);
        ctx.stroke();

        // Large Space Grotesk Digits
        ctx.font = `700 ${Math.round(tileHeight * 0.48)}px 'Space Grotesk', system-ui, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(u.val, x + tileWidth / 2, y + tileHeight * 0.42);

        // Clearly Separated Inter Label Below
        ctx.font = `600 ${Math.round(tileHeight * 0.15)}px 'Inter', system-ui, sans-serif`;
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(u.label, x + tileWidth / 2, y + tileHeight * 0.80);
      });
    }

    // STRICT: NO OTHER TEXT ELEMENTS ARE DRAWN ON THE CARD!
  }, [
    aspectRatio,
    selectedPaletteId,
    releaseRemaining,
    launchState,
    activePalette,
    logoImage,
    selectedBgImage,
    loadedBgImgEl,
  ]);

  // Ensure fonts and canvas re-render when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          renderCanvas();
        });
      } else {
        setTimeout(renderCanvas, 100);
      }
    }
  }, [isOpen, renderCanvas]);

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [
    isOpen,
    aspectRatio,
    selectedPaletteId,
    selectedBgImage,
    loadedBgImgEl,
    releaseRemaining,
    renderCanvas,
  ]);

  // Download Image PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `gtavi-countdown-${aspectRatio.replace(':', 'x')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share Card via Web Share API or Copy Clipboard Text
  const handleShare = async () => {
    const canvas = canvasRef.current;
    const shareText = `Counting down to Grand Theft Auto VI in ${selectedCountry.name} (${effectiveTimeZone})! 🎮🔥 Check your local launch time: ${window.location.origin}`;

    if (canvas && navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `gtavi-countdown.png`, {
            type: 'image/png',
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'GTA VI Countdown Poster',
              text: shareText,
              url: window.location.origin,
            });
            return;
          }
        });
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  // Gallery Images selection list
  const selectableGallery = useMemo(() => {
    return GALLERY_IMAGES;
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generate & Share Personalised GTA VI Countdown Poster"
      onClick={onClose}
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#08090D] border border-[#24262B] text-slate-100 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090D] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: activePalette.primaryHex }}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                Simplified Countdown Poster
              </h3>
              <p className="text-xs text-slate-400">
                Official GTA VI logo and live countdown values with custom background artwork
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#0A0C12]" data-lenis-prevent>
          {/* Live Canvas Preview Box */}
          <div className="flex flex-col items-center justify-center bg-[#05060A] rounded-xl p-3 sm:p-5 border border-white/10 relative shadow-inner">
            {isBgLoading && (
              <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl text-cyan-300 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono">Loading selected artwork...</span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="max-w-full h-auto max-h-[420px] object-contain rounded-lg shadow-2xl border border-white/15"
            />

            {bgError && (
              <div className="mt-2 text-xs font-mono text-rose-400 flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bgError}</span>
              </div>
            )}
          </div>

          {/* CUSTOM BACKGROUND IMAGE SELECTION GALLERY */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Select Background Artwork ({GALLERY_IMAGES.length} Available):</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400 font-bold truncate max-w-[200px]">
                {selectedBgImage ? selectedBgImage.title : 'Default Vice City Sunset'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar p-1">
              {/* Default Vice City Option */}
              <button
                onClick={() => {
                  setSelectedBgImage(null);
                  setLoadedBgImgEl(null);
                  setBgError(null);
                }}
                className={`relative shrink-0 w-24 h-16 rounded-xl border overflow-hidden transition-all cursor-pointer ${
                  selectedBgImage === null
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 opacity-100 shadow-lg'
                    : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-800 to-amber-600 flex items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-mono font-bold text-white leading-tight">
                    Default Vice City
                  </span>
                </div>
                {selectedBgImage === null && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Gallery Image Choices (Optimized thumbnails) */}
              {selectableGallery.map((item) => {
                const isSelected = selectedBgImage?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedBgImage(item);
                    }}
                    className={`relative shrink-0 w-24 h-16 rounded-xl border overflow-hidden transition-all cursor-pointer bg-black/50 ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 opacity-100 shadow-lg'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={item.title}
                  >
                    <img
                      src={getResponsiveImageUrl(item.url, 240)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md z-10">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Aspect Ratio & Theme Palette Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Aspect Ratio Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Card Format:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: 'Landscape 16:9', sub: 'X / Twitter' },
                  { id: '1:1', label: 'Square 1:1', sub: 'Instagram Post' },
                  { id: '4:5', label: 'Portrait 4:5', sub: 'Instagram / Story' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id as CardAspect)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      aspectRatio === item.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-bold ring-1 ring-cyan-500/30'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colour Palette Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <PaletteIcon className="w-4 h-4 theme-text-primary" />
                <span>Theme Accent Glow:</span>
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-[110px] overflow-y-auto pr-1">
                {PALETTES.map((p) => {
                  const isSelected = selectedPaletteId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPaletteId(p.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 border-white/60 ring-1 ring-white/40 shadow-md'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                      title={p.name}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: p.primaryHex }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: p.secondaryHex }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-300 truncate w-full text-center">
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#24262B] bg-[#08090D] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Link to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Card / Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#F4F1ED] hover:bg-white transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Rendering Card...' : 'Download High-Res PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
