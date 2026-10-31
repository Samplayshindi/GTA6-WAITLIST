import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

const YOUTUBE_TRACK_ID = '-fW1M17EVdE';
const TRACK_TITLE = 'Flower in a Hurricane';
const TRACK_ARTIST = 'Justice feat. Tame Impala, SZA, King Gizzard & The Lizard Wizard';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(230); // ~3:50 standard track duration
  const [isShuffleOn, setIsShuffleOn] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const manualPauseRef = useRef<boolean>(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Iframe Player
  useEffect(() => {
    if (isDismissed) return;
    let checkInterval: any = null;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player('yt-audio-element', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_TRACK_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          loop: 1,
          playlist: YOUTUBE_TRACK_ID,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            try {
              event.target.setVolume(20);
              event.target.playVideo();
            } catch {
              // autoplay blocked
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              event.target.playVideo();
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
          if (curr) setCurrentTime(curr);
          if (dur && dur > 0) setDuration(dur);
        } catch {
          // ignore
        }
      }
    }, 500);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isDismissed]);

  // Global user gesture unlock listener
  useEffect(() => {
    if (isDismissed) return;
    const handleFirstInteraction = () => {
      if (manualPauseRef.current) return;
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.setVolume(volume);
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
  }, [volume, isDismissed]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      manualPauseRef.current = true;
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      manualPauseRef.current = false;
      playerRef.current.setVolume(isMuted ? 0 : volume);
      playerRef.current.playVideo();
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
      playerRef.current.setVolume(val);
      if (val > 0 && typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      setIsMuted(false);
      playerRef.current.setVolume(volume > 0 ? volume : 20);
      if (volume === 0) setVolume(20);
      if (typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
    } else {
      setIsMuted(true);
      if (typeof playerRef.current.mute === 'function') {
        playerRef.current.mute();
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
    playerRef.current.seekTo(seekTime, true);
  };

  const formatTime = (secs: number) => {
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

      {/* Spotify Desktop Bottom Playback Bar */}
      <footer
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#08090D]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.7)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Side: Artwork & Track Meta */}
          <div className="flex items-center gap-3 min-w-[200px] sm:min-w-[240px] max-w-[300px]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-black shrink-0 border border-white/10">
              <img
                src="/images/hero-4k.jpg"
                alt={TRACK_TITLE}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate hover:underline cursor-pointer">
                {TRACK_TITLE}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 hover:underline cursor-pointer">
                {TRACK_ARTIST}
              </p>
            </div>
          </div>

          {/* Center: Controls & Progress Bar */}
          <div className="flex flex-col items-center max-w-xl w-full mx-auto px-2">
            {/* Top Control Buttons */}
            <div className="flex items-center gap-4 sm:gap-6 mb-2">
              <button
                onClick={() => setIsShuffleOn(!isShuffleOn)}
                className={`transition-colors hidden sm:block ${isShuffleOn ? 'text-[#FF4FA3]' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle"
                aria-label="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                    playerRef.current.seekTo(0, true);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors hidden sm:block"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                    playerRef.current.seekTo(0, true);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors hidden sm:block"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
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
          <div className="flex items-center gap-3 sm:gap-4 min-w-[140px] sm:min-w-[180px] justify-end">
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
                className="w-20 sm:w-24 h-1 bg-white/20 accent-[#FF4FA3] rounded-lg cursor-pointer appearance-none"
                title={`Volume: ${isMuted ? 0 : volume}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Close Button (X) */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
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
