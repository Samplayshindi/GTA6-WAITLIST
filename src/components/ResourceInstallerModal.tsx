import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Trash2,
  CheckCircle2,
  HardDrive,
  X,
  RefreshCw,
  ShieldAlert,
  Image as ImageIcon,
  AlertTriangle,
  StopCircle,
} from 'lucide-react';
import { CORE_ESSENTIAL_RESOURCES, getFullImageInventory } from '../utils/resourceInventory';

interface ResourceInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CACHE_NAME = 'gtavi-resources-v1.7';

export const ResourceInstallerModal: React.FC<ResourceInstallerModalProps> = ({ isOpen, onClose }) => {
  const [cacheMode, setCacheMode] = useState<'essential' | 'full'>('full');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [totalResources, setTotalResources] = useState<number>(0);
  const [currentResourceUrl, setCurrentResourceUrl] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Ready to cache website resources');
  const [isFullyInstalled, setIsFullyInstalled] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<{ usedMb: string; quotaMb: string } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fullInventory = useRef<string[]>([]);

  // Check initial cache status and storage quota
  useEffect(() => {
    if (!isOpen) return;

    fullInventory.current = getFullImageInventory();

    const checkCacheAndStorage = async () => {
      try {
        if ('caches' in window) {
          const hasCache = await caches.has(CACHE_NAME);
          if (hasCache) {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            setCompletedCount(keys.length);
            const targetTotal = fullInventory.current.length;
            setTotalResources(targetTotal);
            if (keys.length >= targetTotal * 0.85) {
              setIsFullyInstalled(true);
              setStatusText(`Complete media library cached (${keys.length} resources saved)`);
            }
          }
        }

        if (navigator.storage && navigator.storage.estimate) {
          const { usage, quota } = await navigator.storage.estimate();
          const usedMb = ((usage || 0) / (1024 * 1024)).toFixed(1);
          const quotaMb = ((quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
          setStorageUsage({ usedMb, quotaMb: `${quotaMb} GB` });
        }
      } catch (e) {
        console.warn('Storage estimate error:', e);
      }
    };

    checkCacheAndStorage();
  }, [isOpen]);

  const handleInstall = async (targetMode: 'essential' | 'full' = cacheMode) => {
    if (!('caches' in window)) {
      setStatusText('Cache API not supported in this browser');
      return;
    }

    const resourcesToFetch =
      targetMode === 'essential' ? CORE_ESSENTIAL_RESOURCES : fullInventory.current;

    setIsInstalling(true);
    setCompletedCount(0);
    setFailedCount(0);
    setTotalResources(resourcesToFetch.length);
    setStatusText(`Initializing installation of ${resourcesToFetch.length} resources...`);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const cache = await caches.open(CACHE_NAME);
      let successCounter = 0;
      let failCounter = 0;

      for (let i = 0; i < resourcesToFetch.length; i++) {
        if (abortController.signal.aborted) {
          setStatusText('Installation cancelled by user');
          setIsInstalling(false);
          return;
        }

        const url = resourcesToFetch[i];
        setCurrentResourceUrl(url);

        try {
          const res = await fetch(url, {
            mode: 'cors',
            cache: 'reload',
            signal: abortController.signal,
          });

          if (res.ok || res.type === 'opaque') {
            await cache.put(url, res);
            successCounter++;
          } else {
            failCounter++;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setStatusText('Installation cancelled by user');
            setIsInstalling(false);
            return;
          }
          failCounter++;
        }

        setCompletedCount(successCounter);
        setFailedCount(failCounter);
        await new Promise((r) => setTimeout(r, 15)); // smooth yield
      }

      if (failCounter === 0) {
        setIsFullyInstalled(true);
        setStatusText(`Successfully cached all ${successCounter} resources!`);
      } else {
        setStatusText(`Cached ${successCounter} resources with ${failCounter} failed items.`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusText('Installation encountered network errors.');
      }
    } finally {
      setIsInstalling(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handlePurge = async () => {
    if (!('caches' in window)) return;

    setIsPurging(true);
    setStatusText('Purging cached website resources...');

    try {
      await caches.delete(CACHE_NAME);
      setIsFullyInstalled(false);
      setCompletedCount(0);
      setFailedCount(0);
      setStatusText('All cached resources purged.');
    } catch (err) {
      console.error('Cache purge failed:', err);
      setStatusText('Failed to purge cache.');
    } finally {
      setIsPurging(false);
    }
  };

  if (!isOpen) return null;

  const progressPercent =
    totalResources > 0 ? Math.min(100, Math.round((completedCount / totalResources) * 100)) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install Website Resources BETA"
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0B0C10] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-[#FF4FA3]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide text-white">
                  Offline Media Cache
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  BETA
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Offline Pre-Caching &amp; Instant Load Engine
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

        {/* Modal Body */}
        <div className="space-y-4 mb-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            Pre-cache application assets and high-resolution media directly into your browser's Cache Storage for instant offline loading without network latency.
          </p>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCacheMode('essential')}
              disabled={isInstalling}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cacheMode === 'essential'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Essential Core</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Scripts, CSS, logo &amp; hero (~5 MB)</p>
            </button>

            <button
              onClick={() => setCacheMode('full')}
              disabled={isInstalling}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cacheMode === 'full'
                  ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Full Media Library</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">160+ Gallery &amp; HD images (~150+ MB)</p>
            </button>
          </div>

          {/* Storage Warning for Full Library */}
          {cacheMode === 'full' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Mobile Data Warning:</strong> Caching all 160+ high-definition gallery artwork and character portraits requires downloading ~150+ MB of data.
              </span>
            </div>
          )}

          {/* Storage Quota Card */}
          {storageUsage && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Browser Storage Quota</span>
              <span className="text-cyan-400 font-bold">
                {storageUsage.usedMb} MB used / {storageUsage.quotaMb}
              </span>
            </div>
          )}

          {/* Progress Bar & Status */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 truncate max-w-[280px]">
                {isInstalling && <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />}
                <span className="truncate">{statusText}</span>
              </span>
              <span className="font-bold text-cyan-400 shrink-0">{progressPercent}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-[#FF4FA3] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {totalResources > 0 && (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>
                  Downloaded: {completedCount} / {totalResources}
                </span>
                {failedCount > 0 && <span className="text-amber-400 font-bold">{failedCount} failed</span>}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isInstalling ? (
            <button
              onClick={handleCancel}
              className="w-full py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <StopCircle className="w-4 h-4" />
              <span>Cancel Download</span>
            </button>
          ) : isFullyInstalled ? (
            <>
              <button
                onClick={handlePurge}
                disabled={isPurging}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Cache</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done</span>
              </button>
            </>
          ) : (
            <>
              {completedCount > 0 && (
                <button
                  onClick={handlePurge}
                  disabled={isPurging}
                  className="py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge</span>
                </button>
              )}

              <button
                onClick={() => handleInstall(cacheMode)}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{failedCount > 0 ? 'Retry Downloads' : 'Start Download'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
