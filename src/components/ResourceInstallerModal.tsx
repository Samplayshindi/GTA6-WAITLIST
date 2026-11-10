import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Trash2,
  CheckCircle2,
  HardDrive,
  X,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
  StopCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CORE_ESSENTIAL_RESOURCES, getFullImageInventory } from '../utils/resourceInventory';

interface ResourceInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FailedItem {
  url: string;
  reason: string;
}

const CACHE_NAME = 'gtavi-resources-v1.8';
const BATCH_SIZE = 5;

async function fetchAndCacheResource(
  url: string,
  cache: Cache,
  signal: AbortSignal,
  maxRetries = 2
): Promise<{ url: string; success: boolean; errorReason?: string }> {
  let attempt = 0;
  let lastError = '';

  while (attempt <= maxRetries) {
    if (signal.aborted) {
      return { url, success: false, errorReason: 'Aborted by user' };
    }

    try {
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const isSameOrigin = !isExternal || (currentOrigin && url.startsWith(currentOrigin));

      if (isSameOrigin) {
        const res = await fetch(url, { signal, cache: 'reload' });
        if (res.ok) {
          await cache.put(url, res);
          return { url, success: true };
        } else {
          lastError = `HTTP ${res.status}`;
        }
      } else {
        // External Assets (Rockstar CDN, YouTube thumbnails, etc.)
        // Stage 1: Try CORS fetch
        try {
          const corsRes = await fetch(url, { signal, mode: 'cors' });
          if (corsRes.ok) {
            await cache.put(url, corsRes);
            return { url, success: true };
          }
        } catch {
          // CORS fetch restricted, move to no-cors mode
        }

        // Stage 2: Try no-cors fetch (creates valid opaque response for Cache Storage)
        try {
          const noCorsRes = await fetch(url, { signal, mode: 'no-cors' });
          if (noCorsRes.type === 'opaque' || noCorsRes.ok || noCorsRes.status === 0) {
            await cache.put(url, noCorsRes);
            return { url, success: true };
          }
        } catch {
          // Direct fetch failed
        }

        // Stage 3: Try proxy endpoint if available
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const proxyRes = await fetch(proxyUrl, { signal });
          if (proxyRes.ok) {
            const blob = await proxyRes.blob();
            const responseToCache = new Response(blob, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': proxyRes.headers.get('content-type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
            await cache.put(url, responseToCache);
            return { url, success: true };
          }
        } catch {
          // Proxy endpoint unavailable
        }

        lastError = 'Cross-Origin Fetch Failed';
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { url, success: false, errorReason: 'Aborted by user' };
      }
      lastError = err.message || 'Download Error';
    }

    attempt++;
    if (attempt <= maxRetries) {
      await new Promise((r) => setTimeout(r, 150 * attempt));
    }
  }

  return { url, success: false, errorReason: lastError || 'Download Failed' };
}

export const ResourceInstallerModal: React.FC<ResourceInstallerModalProps> = ({ isOpen, onClose }) => {
  const [cacheMode, setCacheMode] = useState<'essential' | 'full'>('full');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [totalResources, setTotalResources] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to cache website resources');
  const [isFullyInstalled, setIsFullyInstalled] = useState<boolean>(false);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [showFailedList, setShowFailedList] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<{ usedMb: string; quotaMb: string } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fullInventory = useRef<string[]>([]);

  const refreshStorageEstimate = async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        const usedMb = ((usage || 0) / (1024 * 1024)).toFixed(1);
        const quotaMb = ((quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
        setStorageUsage({ usedMb, quotaMb: `${quotaMb} GB` });
      }
    } catch {
      // ignore
    }
  };

  // Check initial cache status and storage quota
  useEffect(() => {
    if (!isOpen) return;

    fullInventory.current = getFullImageInventory();
    setTotalResources(fullInventory.current.length);

    const checkCacheAndStorage = async () => {
      try {
        if ('caches' in window) {
          const hasCache = await caches.has(CACHE_NAME);
          if (hasCache) {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            setCompletedCount(keys.length);
            const targetTotal = fullInventory.current.length;
            if (keys.length >= targetTotal * 0.9) {
              setIsFullyInstalled(true);
              setStatusText(`Complete media library cached (${keys.length} of ${targetTotal} saved)`);
            }
          }
        }
        await refreshStorageEstimate();
      } catch (e) {
        console.warn('Storage estimate error:', e);
      }
    };

    checkCacheAndStorage();
  }, [isOpen]);

  const handleInstall = async (
    targetMode: 'essential' | 'full' = cacheMode,
    retryList?: string[]
  ) => {
    if (!('caches' in window)) {
      setStatusText('Cache API not supported in this browser');
      return;
    }

    const resourcesToFetch =
      retryList || (targetMode === 'essential' ? CORE_ESSENTIAL_RESOURCES : fullInventory.current);

    setIsInstalling(true);
    if (!retryList) {
      setCompletedCount(0);
      setFailedCount(0);
      setFailedItems([]);
      setIsFullyInstalled(false);
    }
    setTotalResources(resourcesToFetch.length);
    setStatusText(`Downloading ${resourcesToFetch.length} resources in controlled batches...`);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const cache = await caches.open(CACHE_NAME);
      let successCounter = retryList ? completedCount : 0;
      let failCounter = 0;
      const currentFailedList: FailedItem[] = retryList ? [] : [];

      for (let i = 0; i < resourcesToFetch.length; i += BATCH_SIZE) {
        if (abortController.signal.aborted) {
          setStatusText('Installation cancelled by user');
          setIsInstalling(false);
          await refreshStorageEstimate();
          return;
        }

        const batch = resourcesToFetch.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map((url) => fetchAndCacheResource(url, cache, abortController.signal))
        );

        for (const res of batchResults) {
          if (res.success) {
            successCounter++;
          } else {
            failCounter++;
            currentFailedList.push({
              url: res.url,
              reason: res.errorReason || 'Network Download Error',
            });
          }
        }

        setCompletedCount(successCounter);
        setFailedCount(failCounter);
        setFailedItems([...currentFailedList]);
        const processed = Math.min(i + BATCH_SIZE, resourcesToFetch.length);
        setStatusText(`Caching resource ${processed} of ${resourcesToFetch.length}...`);
      }

      await refreshStorageEstimate();

      if (failCounter === 0) {
        setIsFullyInstalled(true);
        setStatusText(`All ${successCounter} resources successfully cached!`);
      } else {
        setIsFullyInstalled(false);
        setStatusText(`Cached ${successCounter} resources (${failCounter} failed items)`);
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

  const handleRetryFailed = () => {
    if (failedItems.length === 0) return;
    const retryUrls = failedItems.map((f) => f.url);
    handleInstall(cacheMode, retryUrls);
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
      setFailedItems([]);
      setStatusText('All cached resources purged successfully.');
      await refreshStorageEstimate();
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
                Offline Pre-Caching &amp; Proxy Acceleration Engine
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
            Pre-cache application assets and high-resolution media directly into your browser's Cache Storage via server-assisted image proxy for instant offline loading.
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
                  Cached: <strong className="text-emerald-400">{completedCount}</strong> / {totalResources}
                </span>
                {failedCount > 0 && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{failedCount} failed</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Failed Items Details List (Requirement 3) */}
          {failedItems.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
              <button
                onClick={() => setShowFailedList(!showFailedList)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <span>View {failedItems.length} Failed Resources</span>
                {showFailedList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFailedList && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-amber-500/20 text-[10px] font-mono">
                  {failedItems.map((item, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-black/40 flex items-center justify-between gap-2 text-slate-300">
                      <span className="truncate max-w-[240px]" title={item.url}>
                        {item.url.split('/').pop() || item.url}
                      </span>
                      <span className="text-amber-400 shrink-0">{item.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

              {failedItems.length > 0 ? (
                <button
                  onClick={handleRetryFailed}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry {failedItems.length} Failed Items</span>
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(cacheMode)}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Start Download</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
