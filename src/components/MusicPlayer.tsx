import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  SkipBack,
  SkipForward,
  X,
  ListMusic,
  Heart,
  Music2,
  Radio,
  Disc3,
} from 'lucide-react';
import { useSoundtrack } from '../context/SoundtrackContext';
import { OFFICIAL_ALBUM_ARTWORK_URL } from '../config/soundtrack';
import { OptimizedImage } from './OptimizedImage';

export const MusicPlayer: React.FC = () => {
  const {
    tracks,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isQueueOpen,
    isDismissed,
    likedTrackIds,
    selectTrack,
    togglePlay,
    playNextTrack,
    playPrevTrack,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleLike,
    setIsQueueOpen,
    dismissPlayer,
    restorePlayer,
  } = useSoundtrack();

  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const activeTrackElRef = useRef<HTMLDivElement | null>(null);
  const scrubSecondsRef = useRef<number>(0);
  const windowCleanupRef = useRef<(() => void) | null>(null);

  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : currentTrack.durationSec || 0;

  useEffect(() => {
    windowCleanupRef.current?.();
    windowCleanupRef.current = null;
    isSeekingRef.current = false;
    activePointerIdRef.current = null;
    activeTrackElRef.current = null;
    setScrubTime(null);
  }, [currentTrack.id]);

  useEffect(() => {
    return () => {
      windowCleanupRef.current?.();
      windowCleanupRef.current = null;
    };
  }, []);

  const getSecondsFromClientX = (clientX: number, trackEl: HTMLDivElement | null): number | null => {
    if (!trackEl || safeDuration <= 0) return null;
    const rect = trackEl.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * safeDuration;
  };

  const finishSeek = (commit: boolean, finalClientX?: number) => {
    if (!isSeekingRef.current) return;
    const trackEl = activeTrackElRef.current;
    const pointerSeconds =
      typeof finalClientX === 'number' ? getSecondsFromClientX(finalClientX, trackEl) : null;
    const commitSeconds = pointerSeconds !== null ? pointerSeconds : scrubSecondsRef.current;

    isSeekingRef.current = false;
    activePointerIdRef.current = null;
    activeTrackElRef.current = null;
    windowCleanupRef.current?.();
    windowCleanupRef.current = null;

    if (commit) {
      seekTo(commitSeconds);
    }
    setScrubTime(null);
  };

  const handleSeekPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    trackRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();

    const seconds = getSecondsFromClientX(e.clientX, trackRef.current);
    if (seconds === null) return;

    windowCleanupRef.current?.();
    isSeekingRef.current = true;
    activePointerIdRef.current = e.pointerId;
    activeTrackElRef.current = trackRef.current;
    scrubSecondsRef.current = seconds;
    setScrubTime(seconds);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback handled by window listeners below
    }

    const onWindowPointerMove = (moveEvent: PointerEvent) => {
      if (!isSeekingRef.current || moveEvent.pointerId !== activePointerIdRef.current) return;
      const nextSeconds = getSecondsFromClientX(moveEvent.clientX, activeTrackElRef.current);
      if (nextSeconds === null) return;
      scrubSecondsRef.current = nextSeconds;
      setScrubTime(nextSeconds);
    };

    const onWindowPointerUp = (upEvent: PointerEvent) => {
      if (!isSeekingRef.current || upEvent.pointerId !== activePointerIdRef.current) return;
      finishSeek(true, upEvent.clientX);
    };

    const onWindowPointerCancel = (cancelEvent: PointerEvent) => {
      if (!isSeekingRef.current || cancelEvent.pointerId !== activePointerIdRef.current) return;
      finishSeek(false);
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerCancel);

    windowCleanupRef.current = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerCancel);
    };
  };

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current || activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    const seconds = getSecondsFromClientX(e.clientX, activeTrackElRef.current);
    if (seconds === null) return;
    scrubSecondsRef.current = seconds;
    setScrubTime(seconds);
  };

  const handleSeekPointerEnd = (
    e: React.PointerEvent<HTMLDivElement>,
    shouldCommit: boolean
  ) => {
    if (!isSeekingRef.current || activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    finishSeek(shouldCommit, e.clientX);
  };

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (safeDuration <= 0) return;
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      seekTo(Math.min(safeDuration, displayedTime + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      seekTo(Math.max(0, displayedTime - step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      seekTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      seekTo(safeDuration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setVolumeLevel(Number(e.target.value));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayedTime =
    scrubTime !== null ? scrubTime : Math.max(0, Math.min(currentTime, safeDuration || currentTime));
  const progressPercent =
    safeDuration > 0 ? Math.max(0, Math.min(100, (displayedTime / safeDuration) * 100)) : 0;
  const isScrubbing = scrubTime !== null;
  const isCurrentTrackLiked = likedTrackIds.has(currentTrack.id);

  if (isDismissed) {
    return (
      <button
        onClick={restorePlayer}
        className="fixed bottom-3 right-3 sm:right-6 z-40 px-3.5 py-2 rounded-full bg-[#0d131d]/90 hover:bg-[#161f2f] border border-[#232b3b] text-slate-200 hover:text-white shadow-2xl backdrop-blur-xl text-xs font-mono flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Restore GTA VI Soundtrack Player"
        aria-label="Restore Soundtrack Player"
      >
        <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-[#FF4FA3]' : 'text-slate-400'}`} />
        <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
          {currentTrack.title}
        </span>
        <span className={`text-[10px] font-mono ${isPlaying ? 'text-cyan-400' : 'text-slate-400'}`}>
          {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
        </span>
      </button>
    );
  }

  return (
    <>
      {/* Tracklist Queue Drawer Modal */}
      {isQueueOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Soundtrack Queue"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 pb-24 sm:pb-4"
          onClick={() => setIsQueueOpen(false)}
        >
          <div
            className="bg-[#0b0e17] border border-[#1e2738] w-full max-w-2xl mx-auto rounded-2xl max-h-[75vh] sm:max-h-[74vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#1e2738] flex items-center justify-between bg-[#0b0e17]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/40 text-cyan-400">
                  <Music2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase truncate">
                    Vice City Airwaves &middot; Official Soundtrack
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {tracks.filter((t) => t.isPlayable).length} Track Library &middot;{' '}
                    {formatTime(
                      tracks
                        .filter((t) => t.isPlayable)
                        .reduce((acc, t) => acc + (t.durationSec || 0), 0)
                    )}{' '}
                    Total Duration
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close track list"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Track Rows */}
            <div className="p-3 overflow-y-auto space-y-1.5">
              {tracks
                .filter((t) => t.isPlayable)
                .map((track, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  const isLiked = likedTrackIds.has(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(idx)}
                      className={`group px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/40 shadow-sm'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                          <OptimizedImage
                            src={track.coverUrl}
                            alt={track.title}
                            maxWidth={375}
                            sizes="40px"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = OFFICIAL_ALBUM_ARTWORK_URL;
                            }}
                          />
                          {isSelected && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Disc3 className="w-5 h-5 text-cyan-400 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
                            }`}
                          >
                            {track.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {track.artist}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1.5 transition-colors cursor-pointer ${
                            isLiked ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                          aria-label="Save track"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-xs font-mono text-slate-400 tabular-nums">
                          {formatTime(track.durationSec)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Rockstar Official Compact Horizontal Bottom Player Container */}
      <footer
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-2.5 sm:bottom-4 left-2.5 right-2.5 sm:left-6 sm:right-6 max-w-6xl mx-auto z-40 bg-[#0d131d]/95 backdrop-blur-xl border border-[#232b3b] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] select-none overflow-hidden transition-all"
      >
        {/* Mobile Scrubbable Progress Bar */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek playback"
          aria-valuemin={0}
          aria-valuemax={Math.round(safeDuration)}
          aria-valuenow={Math.round(displayedTime)}
          onPointerDown={(e) => handleSeekPointerDown(e, mobileTrackRef)}
          onPointerMove={handleSeekPointerMove}
          onPointerUp={(e) => handleSeekPointerEnd(e, true)}
          onPointerCancel={(e) => handleSeekPointerEnd(e, false)}
          onKeyDown={handleSeekKeyDown}
          className="sm:hidden w-full h-4 bg-[#0a0d14] cursor-pointer relative touch-none select-none flex items-center px-2.5 border-b border-[#1e2738] focus:outline-none"
          title="Seek playback"
        >
          <div ref={mobileTrackRef} className="w-full h-1.5 bg-slate-800 rounded-full relative overflow-visible">
            <div
              className="h-full rounded-full theme-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 theme-progress-thumb transition-transform pointer-events-none ${
                isScrubbing ? 'scale-125' : ''
              }`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Horizontal Player Layout */}
        <div className="h-[58px] sm:h-[68px] px-3 sm:px-5 flex items-center justify-between gap-3 sm:grid sm:grid-cols-[165px_minmax(0,1fr)_165px] md:grid-cols-[220px_minmax(0,1fr)_220px] lg:grid-cols-[290px_minmax(0,1fr)_290px] sm:items-center sm:gap-4 lg:gap-6">
          {/* =========================================
              LEFT SECTION: Track Artwork, Name & Artist
             ========================================= */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-full overflow-hidden">
            <div
              onClick={() => setIsQueueOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 cursor-pointer relative group shadow-md"
              title="Click to view Vice City Airwaves tracklist"
            >
              <OptimizedImage
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                maxWidth={375}
                sizes="48px"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-200 block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = OFFICIAL_ALBUM_ARTWORK_URL;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ListMusic className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <h4
                onClick={() => setIsQueueOpen(true)}
                className="text-xs sm:text-sm font-bold text-white tracking-tight truncate hover:text-cyan-300 transition-colors cursor-pointer"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>
              <p
                className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5"
                title={currentTrack.artist}
              >
                {currentTrack.artist}
              </p>
            </div>

            {/* Favorite Button (Desktop) */}
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className={`hidden md:flex p-1.5 transition-colors cursor-pointer shrink-0 rounded-lg hover:bg-white/5 ${
                isCurrentTrackLiked ? 'text-pink-400' : 'text-slate-400 hover:text-white'
              }`}
              title={isCurrentTrackLiked ? 'Remove from favorites' : 'Save to favorites'}
              aria-label="Save track"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* =========================================
              CENTER SECTION: Controls & Progress Bar
             ========================================= */}
          <div className="hidden sm:flex flex-col items-center w-full max-w-lg mx-auto px-2 min-w-0">
            {/* Controls Row */}
            <div className="flex items-center justify-center gap-5 mb-1 shrink-0">
              <button
                onClick={playPrevTrack}
                className="text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 p-1 cursor-pointer shrink-0"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={playNextTrack}
                className="text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 p-1 cursor-pointer shrink-0"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Timestamps & Scrub Bar */}
            <div className="w-full flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] font-mono text-slate-400 w-9 text-right tabular-nums shrink-0">
                {formatTime(displayedTime)}
              </span>

              <div
                role="slider"
                tabIndex={0}
                aria-label="Seek playback"
                aria-valuemin={0}
                aria-valuemax={Math.round(safeDuration)}
                aria-valuenow={Math.round(displayedTime)}
                onPointerDown={(e) => handleSeekPointerDown(e, desktopTrackRef)}
                onPointerMove={handleSeekPointerMove}
                onPointerUp={(e) => handleSeekPointerEnd(e, true)}
                onPointerCancel={(e) => handleSeekPointerEnd(e, false)}
                onKeyDown={handleSeekKeyDown}
                className="flex-1 min-w-0 h-5 flex items-center cursor-pointer relative touch-none select-none group focus:outline-none"
                title="Seek"
              >
                <div
                  ref={desktopTrackRef}
                  className="w-full h-1.5 bg-slate-800/80 group-hover:bg-slate-700/90 rounded-full relative transition-colors"
                >
                  <div
                    className="h-full rounded-full theme-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 theme-progress-thumb transition-transform pointer-events-none ${
                      isScrubbing ? 'scale-125 cursor-grabbing' : 'group-hover:scale-125 cursor-grab'
                    }`}
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 w-9 text-left tabular-nums shrink-0">
                {formatTime(safeDuration)}
              </span>
            </div>
          </div>

          {/* =========================================
              MOBILE COMPACT CONTROLS (< sm)
             ========================================= */}
          <div className="flex sm:hidden items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playNextTrack();
              }}
              className="text-slate-400 hover:text-white p-1.5 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQueueOpen(!isQueueOpen);
              }}
              className={`p-1.5 rounded-lg cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                isQueueOpen ? 'text-cyan-400 bg-white/5' : 'text-slate-400'
              }`}
              aria-label="Open queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

          {/* =========================================
              RIGHT SECTION: Volume, Queue & Dismiss (Desktop)
             ========================================= */}
          <div className="hidden sm:flex items-center justify-end gap-2.5 shrink-0 sm:w-full">
            {/* Volume Icon & Slider */}
            <div className="hidden md:flex items-center gap-2 group p-1 rounded-lg hover:bg-white/5 transition-colors">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 lg:w-20 h-1 bg-slate-800 group-hover:bg-slate-700 accent-cyan-400 rounded-full cursor-pointer appearance-none transition-all"
                title={`Volume: ${isMuted ? 0 : volume}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Queue Toggle Button */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isQueueOpen
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Tracklist Queue"
              aria-label="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Dismiss Player Button */}
            <button
              onClick={dismissPlayer}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Close player"
              aria-label="Close soundtrack player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
