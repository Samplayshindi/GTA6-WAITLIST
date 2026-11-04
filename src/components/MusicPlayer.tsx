import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  X,
  ListMusic,
  Heart,
  Music2,
} from 'lucide-react';
import { SOUNDTRACK_LIBRARY, SoundtrackTrack } from '../config/soundtrack';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(30);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SOUNDTRACK_LIBRARY[0].durationSec);
  const [isShuffleOn, setIsShuffleOn] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => new Set(['flower-in-a-hurricane']));

  const currentTrack: SoundtrackTrack = SOUNDTRACK_LIBRARY[currentTrackIndex] || SOUNDTRACK_LIBRARY[0];

  const playerRef = useRef<any>(null);
  const manualPauseRef = useRef<boolean>(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>(repeatMode);
  const isShuffleOnRef = useRef<boolean>(isShuffleOn);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    isShuffleOnRef.current = isShuffleOn;
  }, [isShuffleOn]);

  // Handle Track Completion based on Repeat and Shuffle rules
  const handleTrackEnded = () => {
    const curIdx = currentTrackIndexRef.current;
    const mode = repeatModeRef.current;
    const shuffle = isShuffleOnRef.current;

    if (mode === 'one') {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * SOUNDTRACK_LIBRARY.length);
      if (nextIdx === curIdx && SOUNDTRACK_LIBRARY.length > 1) {
        nextIdx = (curIdx + 1) % SOUNDTRACK_LIBRARY.length;
      }
      selectTrack(nextIdx);
      return;
    }

    if (curIdx < SOUNDTRACK_LIBRARY.length - 1) {
      selectTrack(curIdx + 1);
    } else if (mode === 'all') {
      selectTrack(0);
    } else {
      setIsPlaying(false);
    }
  };

  // Initialize YouTube Iframe Player
  useEffect(() => {
    if (isDismissed) return;
    let checkInterval: any = null;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-audio-element', {
        height: '0',
        width: '0',
        videoId: SOUNDTRACK_LIBRARY[0].youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          loop: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            try {
              event.target.setVolume(30);
              event.target.playVideo();
            } catch {
              // autoplay gesture restriction handled below
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) { // PLAYING
              setIsPlaying(true);
            } else if (event.data === 2) { // PAUSED
              setIsPlaying(false);
            } else if (event.data === 0) { // ENDED
              handleTrackEnded();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    }

    checkInterval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (typeof curr === 'number' && !isNaN(curr) && curr >= 0) {
            setCurrentTime(curr);
          }
          if (typeof dur === 'number' && dur > 0 && !isNaN(dur)) {
            setDuration(dur);
          }
        } catch {
          // ignore
        }
      }
    }, 400);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isDismissed]);

  // Global user gesture unlock for browser autoplay policy
  useEffect(() => {
    if (isDismissed) return;
    const handleFirstInteraction = () => {
      if (manualPauseRef.current) return;
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.setVolume(isMuted ? 0 : volume);
          playerRef.current.playVideo();
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [volume, isMuted, isDismissed]);

  // Support external triggers (e.g. from Compact Soundtrack Preview on Desktop Homepage)
  useEffect(() => {
    const handleExternalPlay = (e: any) => {
      if (typeof e.detail?.index === 'number') {
        selectTrack(e.detail.index);
      }
    };
    const handleExternalQueue = () => {
      setIsQueueOpen(true);
    };

    window.addEventListener('gta-play-track', handleExternalPlay as EventListener);
    window.addEventListener('gta-open-queue', handleExternalQueue as EventListener);

    return () => {
      window.removeEventListener('gta-play-track', handleExternalPlay as EventListener);
      window.removeEventListener('gta-open-queue', handleExternalQueue as EventListener);
    };
  }, []);

  const selectTrack = (index: number) => {
    const nextTrack = SOUNDTRACK_LIBRARY[index];
    if (!nextTrack) return;

    if (index === currentTrackIndexRef.current) {
      togglePlay();
      return;
    }

    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(nextTrack.durationSec);
    manualPauseRef.current = false;

    if (playerRef.current) {
      try {
        if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById({
            videoId: nextTrack.youtubeId,
            startSeconds: 0,
          });
          playerRef.current.setVolume(isMuted ? 0 : volume);
          playerRef.current.playVideo();
          setIsPlaying(true);
        } else if (typeof playerRef.current.cueVideoById === 'function') {
          playerRef.current.cueVideoById(nextTrack.youtubeId);
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Error switching track:', err);
      }
    }
  };

  const handleNextTrack = () => {
    let nextIdx: number;
    if (isShuffleOn) {
      nextIdx = Math.floor(Math.random() * SOUNDTRACK_LIBRARY.length);
      if (nextIdx === currentTrackIndexRef.current && SOUNDTRACK_LIBRARY.length > 1) {
        nextIdx = (currentTrackIndexRef.current + 1) % SOUNDTRACK_LIBRARY.length;
      }
    } else {
      nextIdx = (currentTrackIndexRef.current + 1) % SOUNDTRACK_LIBRARY.length;
    }
    selectTrack(nextIdx);
  };

  const handlePrevTrack = () => {
    if (currentTime > 3 && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      return;
    }
    const prevIdx = (currentTrackIndexRef.current - 1 + SOUNDTRACK_LIBRARY.length) % SOUNDTRACK_LIBRARY.length;
    selectTrack(prevIdx);
  };

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      manualPauseRef.current = true;
      try {
        playerRef.current.pauseVideo();
      } catch {
        // ignore
      }
      setIsPlaying(false);
    } else {
      manualPauseRef.current = false;
      try {
        playerRef.current.setVolume(isMuted ? 0 : volume);
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(val);
        if (val > 0 && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
      } catch {
        // ignore
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      setIsMuted(false);
      const targetVol = volume > 0 ? volume : 30;
      if (volume === 0) setVolume(30);
      try {
        playerRef.current.setVolume(targetVol);
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
      } catch {
        // ignore
      }
    } else {
      setIsMuted(true);
      try {
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !playerRef.current || duration <= 0) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = ratio * duration;
    setCurrentTime(seekTime);
    try {
      playerRef.current.seekTo(seekTime, true);
    } catch {
      // ignore
    }
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const toggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setIsDismissed(true);
  };

  if (isDismissed) {
    return (
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50" aria-hidden="true">
        <div id="yt-audio-element" />
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentTrackLiked = likedTrackIds.has(currentTrack.id);

  return (
    <>
      {/* Hidden YouTube Iframe Audio Engine */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50" aria-hidden="true">
        <div id="yt-audio-element" />
      </div>

      {/* Spotify-Inspired Queue / Tracklist Drawer Modal */}
      {isQueueOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Soundtrack Queue"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsQueueOpen(false)}
        >
          <div
            className="bg-[#08090C] border border-[#24262B] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[82vh] sm:max-h-[74vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090C]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[#FF4FA3] shrink-0 border border-white/10">
                  <Music2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5] tracking-tight truncate">
                    Play Queue &middot; Grand Theft Auto VI
                  </h3>
                  <p className="text-xs text-[#A1A1AA] truncate">
                    Rockstar Games Official Soundtrack &middot; {SOUNDTRACK_LIBRARY.length} Tracks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-2 rounded-full text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close track list"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Track Rows */}
            <div className="p-2 sm:p-3 overflow-y-auto space-y-1">
              {SOUNDTRACK_LIBRARY.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                const isLiked = likedTrackIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => selectTrack(idx)}
                    className={`group px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#18191E] border border-[#FF4FA3]/30'
                        : 'hover:bg-[#121318] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Track Number / Equalizer Animation */}
                      <span className="text-xs font-mono text-[#A1A1AA] w-5 text-center shrink-0">
                        {isSelected && isPlaying ? (
                          <span className="inline-flex items-end justify-center gap-0.5 h-3.5">
                            <span className="w-0.5 h-3 bg-[#FF4FA3] animate-pulse" />
                            <span className="w-0.5 h-4 bg-[#FF4FA3] animate-pulse delay-75" />
                            <span className="w-0.5 h-2 bg-[#FF4FA3] animate-pulse delay-150" />
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      {/* Square Sharp Album Art */}
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-black shrink-0 border border-[#24262B] relative">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-white text-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Title & Artist */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? 'text-[#FF4FA3]' : 'text-[#F5F5F5]'
                            }`}
                          >
                            {track.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                        {track.sourceLabel.replace('Grand Theft Auto VI: ', '')}
                      </span>

                      <button
                        onClick={(e) => toggleLike(track.id, e)}
                        className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                          isLiked ? 'text-[#FF4FA3]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                        }`}
                        aria-label="Save to favorite"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <span className="text-xs font-mono text-[#A1A1AA] w-10 text-right">
                        {track.durationText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3 border-t border-[#24262B] bg-[#08090C] flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="truncate">
                Now Playing: <strong className="text-[#F5F5F5]">{currentTrack.title}</strong>
              </span>
              <span className="font-mono text-[#FF4FA3] shrink-0 ml-2">Official Audio</span>
            </div>
          </div>
        </div>
      )}

      {/* Spotify-Inspired Bottom Playback Bar */}
      <footer
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090C] border-t border-[#24262B] select-none shadow-[0_-8px_24px_rgba(0,0,0,0.85)] max-w-full overflow-hidden"
      >
        {/* Mobile Mini-Progress Top Bar */}
        <div
          ref={progressContainerRef}
          onClick={handleSeek}
          className="sm:hidden w-full h-[3px] bg-[#24262B] cursor-pointer relative"
          title="Seek playback"
        >
          <div
            className="h-full bg-[#FF4FA3] transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Player Layout Container */}
        <div className="max-w-7xl mx-auto h-[62px] sm:h-[80px] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* =========================================
              LEFT SECTION: Album Artwork & Track Details
             ========================================= */}
          <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-[260px] md:max-w-[300px] shrink-0">
            {/* Square Sharp Album Art (52-56px desktop, 44px mobile) */}
            <div
              onClick={() => setIsQueueOpen(true)}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-none sm:rounded-sm overflow-hidden bg-black shrink-0 border border-[#24262B] cursor-pointer relative group shadow-md"
              title="Click to view full GTA VI tracklist"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ListMusic className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Title & Artist */}
            <div className="min-w-0 flex-1">
              <h4
                onClick={() => setIsQueueOpen(true)}
                className="text-xs sm:text-sm font-semibold text-[#F5F5F5] tracking-tight truncate hover:underline cursor-pointer"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>
              <p
                className="text-[10px] sm:text-[11px] text-[#A1A1AA] truncate mt-0.5"
                title={currentTrack.artist}
              >
                {currentTrack.artist}
              </p>
            </div>

            {/* Heart / Favorite Button */}
            <button
              onClick={(e) => toggleLike(currentTrack.id, e)}
              className={`hidden md:block p-1.5 transition-colors cursor-pointer shrink-0 ${
                isCurrentTrackLiked ? 'text-[#FF4FA3]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
              }`}
              title={isCurrentTrackLiked ? 'Remove from favorites' : 'Save to favorites'}
              aria-label="Save track"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* =========================================
              CENTER SECTION: Controls & Timeline (Desktop)
             ========================================= */}
          <div className="hidden sm:flex flex-col items-center flex-1 max-w-xl mx-auto px-2 min-w-0">
            {/* Control Buttons Row */}
            <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
              {/* Shuffle Button */}
              <button
                onClick={() => setIsShuffleOn(!isShuffleOn)}
                className={`relative transition-colors p-1 cursor-pointer ${
                  isShuffleOn ? 'text-[#FF4FA3]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                }`}
                title={isShuffleOn ? 'Shuffle enabled' : 'Shuffle disabled'}
                aria-label="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
                {isShuffleOn && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF4FA3]" />
                )}
              </button>

              {/* Previous Track */}
              <button
                onClick={handlePrevTrack}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Compact Play / Pause Button (34px, NOT oversized) */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                ) : (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black translate-x-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={handleNextTrack}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Repeat Mode Toggle */}
              <button
                onClick={cycleRepeatMode}
                className={`relative transition-colors p-1 cursor-pointer ${
                  repeatMode !== 'off' ? 'text-[#FF4FA3]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                }`}
                title={`Repeat: ${repeatMode}`}
                aria-label="Repeat mode"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
                {repeatMode !== 'off' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF4FA3]" />
                )}
              </button>
            </div>

            {/* Desktop Minimal Progress Bar & Timestamps */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#A1A1AA] w-9 text-right tabular-nums shrink-0">
                {formatTime(currentTime)}
              </span>

              <div
                ref={progressContainerRef}
                onClick={handleSeek}
                className="flex-1 h-1 hover:h-1.5 bg-[#24262B] group hover:bg-[#3E4048] rounded-full cursor-pointer relative transition-all"
                title="Seek"
              >
                <div
                  className="h-full bg-[#F5F5F5] group-hover:bg-[#FF4FA3] rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Subtle Thumb indicator on hover */}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <span className="text-[11px] font-mono text-[#A1A1AA] w-9 text-left tabular-nums shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* =========================================
              MOBILE COMPACT CONTROLS (< sm)
             ========================================= */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => toggleLike(currentTrack.id, e)}
              className={`p-2 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
                isCurrentTrackLiked ? 'text-[#FF4FA3]' : 'text-[#A1A1AA]'
              }`}
              aria-label="Save track"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Compact Mobile Play/Pause Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-black" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={handleNextTrack}
              className="text-[#A1A1AA] p-2 cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-lg cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
                isQueueOpen ? 'text-[#FF4FA3]' : 'text-[#A1A1AA]'
              }`}
              aria-label="Open queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

          {/* =========================================
              RIGHT SECTION: Queue, Volume & Dismiss (Desktop)
             ========================================= */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Queue Button */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded transition-colors cursor-pointer relative ${
                isQueueOpen
                  ? 'text-[#FF4FA3] bg-white/5'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
              title="Tracklist Queue"
              aria-label="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume Icon & Slider */}
            <div className="hidden md:flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
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
                className="w-20 lg:w-24 h-1 bg-[#24262B] group-hover:bg-[#3E4048] accent-[#F5F5F5] rounded-full cursor-pointer appearance-none transition-all"
                title={`Volume: ${isMuted ? 0 : volume}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Subtle Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5 transition-colors cursor-pointer"
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
