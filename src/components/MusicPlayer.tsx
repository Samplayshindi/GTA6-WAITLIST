import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Shuffle, SkipBack, SkipForward, X, ListMusic, Music2 } from 'lucide-react';
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
  const [volume, setVolume] = useState<number>(25);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SOUNDTRACK_LIBRARY[0].durationSec);
  const [isShuffleOn, setIsShuffleOn] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  const currentTrack: SoundtrackTrack = SOUNDTRACK_LIBRARY[currentTrackIndex] || SOUNDTRACK_LIBRARY[0];

  const playerRef = useRef<any>(null);
  const manualPauseRef = useRef<boolean>(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

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
              event.target.setVolume(25);
              event.target.playVideo();
            } catch {
              // autoplay gesture restriction
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) { // PLAYING
              setIsPlaying(true);
            } else if (event.data === 2) { // PAUSED
              setIsPlaying(false);
            } else if (event.data === 0) { // ENDED -> Play Next Track
              handleNextTrack();
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
    }, 500);

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

  // Select track and immediately switch audio source directly in-website
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
      const targetVol = volume > 0 ? volume : 25;
      if (volume === 0) setVolume(25);
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

  return (
    <>
      {/* Hidden YouTube Iframe Audio Engine */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50" aria-hidden="true">
        <div id="yt-audio-element" />
      </div>

      {/* Track Selection Library Modal / Drawer */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B0D14] border border-white/10 w-full max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] sm:max-h-[75vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4FA3]/20 flex items-center justify-center text-[#FF4FA3]">
                  <Music2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">GTA VI Soundtrack Collection</h3>
                  <p className="text-xs text-slate-400">Official Rockstar Games &amp; Atlantic Records Catalogue ({SOUNDTRACK_LIBRARY.length} Tracks)</p>
                </div>
              </div>

              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Close track list"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Track List */}
            <div className="p-4 overflow-y-auto space-y-2 divide-y divide-white/5">
              {SOUNDTRACK_LIBRARY.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => selectTrack(idx)}
                    className={`pt-2 first:pt-0 p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FF4FA3]/15 to-transparent border border-[#FF4FA3]/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-mono text-slate-500 w-4 text-center shrink-0">
                        {isSelected && isPlaying ? (
                          <span className="inline-flex items-center gap-0.5 text-[#FF4FA3] font-bold">
                            <span className="w-1 h-3 bg-[#FF4FA3] animate-pulse" />
                            <span className="w-1 h-4 bg-[#FF4FA3] animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-[#FF4FA3] animate-pulse delay-150" />
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10 relative group">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isSelected && isPlaying ? (
                            <Pause className="w-4 h-4 fill-white text-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#FF4FA3]' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 hidden sm:inline-block">
                            {track.sourceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">{track.durationText}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-slate-400">
              <span>Selected Track: <strong className="text-white">{currentTrack.title}</strong></span>
              <span className="font-mono text-[#FF4FA3]">Direct In-Website Playback Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Spotify Desktop Bottom Playback Bar */}
      <footer
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090D]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.7)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Side: Artwork & Track Meta */}
          <div className="flex items-center gap-3 min-w-[200px] sm:min-w-[240px] max-w-[320px]">
            <div
              onClick={() => setIsLibraryOpen(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-black shrink-0 border border-white/10 cursor-pointer relative group"
              title="Click to view full GTA VI Soundtrack Collection"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ListMusic className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h4
                onClick={() => setIsLibraryOpen(true)}
                className="text-xs sm:text-sm font-bold text-white tracking-wide truncate hover:underline cursor-pointer"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {currentTrack.artist}
              </p>
              <span className="inline-block text-[9px] text-[#FF4FA3] font-mono tracking-wider uppercase mt-0.5 truncate">
                {currentTrack.sourceLabel}
              </span>
            </div>
          </div>

          {/* Center: Controls & Progress Bar */}
          <div className="flex flex-col items-center max-w-xl w-full mx-auto px-2">
            {/* Top Control Buttons */}
            <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
              <button
                onClick={() => setIsShuffleOn(!isShuffleOn)}
                className={`transition-colors hidden sm:block ${isShuffleOn ? 'text-[#FF4FA3]' : 'text-slate-400 hover:text-white'}`}
                title={isShuffleOn ? 'Shuffle On' : 'Shuffle Off'}
                aria-label="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevTrack}
                className="text-slate-400 hover:text-white transition-colors hidden sm:block"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="text-slate-400 hover:text-white transition-colors hidden sm:block"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Track Selector Toggle */}
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className={`transition-colors relative p-1.5 rounded-lg ${isLibraryOpen ? 'bg-[#FF4FA3]/20 text-[#FF4FA3]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="View Soundtrack Library"
                aria-label="Soundtrack Library"
              >
                <ListMusic className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF4FA3] text-black text-[9px] font-bold flex items-center justify-center">
                  {SOUNDTRACK_LIBRARY.length}
                </span>
              </button>
            </div>

            {/* Progress Bar & Timestamps */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {formatTime(currentTime)}
              </span>

              <div
                ref={progressContainerRef}
                onClick={handleSeek}
                className="flex-1 h-1 bg-white/15 hover:h-1.5 rounded-full cursor-pointer relative overflow-hidden transition-all group"
                title="Seek"
              >
                <div
                  className="h-full bg-white group-hover:bg-[#FF4FA3] rounded-full transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <span className="text-[10px] font-mono text-slate-400 w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Side: Volume & Close Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[180px] justify-end">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4 text-slate-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-300" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-white/20 accent-[#FF4FA3] rounded-lg cursor-pointer appearance-none"
                title={`Volume: ${isMuted ? 0 : volume}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Close Button (X) */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors ml-1"
              title="Close Soundtrack Player"
              aria-label="Close Soundtrack Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </footer>
    </>
  );
};
