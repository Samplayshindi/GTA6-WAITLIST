import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Disc3, ChevronDown, ChevronUp } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

const YOUTUBE_TRACK_ID = '-fW1M17EVdE';
const TRACK_TITLE = 'Flower in a Hurricane';
const TRACK_ARTIST = 'Justice feat. Tame Impala, SZA, King Gizzard';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(230); // ~3:50 standard track duration
  const [isBlocked, setIsBlocked] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const playerRef = useRef<any>(null);
  const manualPauseRef = useRef<boolean>(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Iframe Player
  useEffect(() => {
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
              // Attempt audible autoplay
              event.target.playVideo();
            } catch {
              setIsBlocked(true);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING === 1
            if (event.data === 1) {
              setIsPlaying(true);
              setIsBlocked(false);
            }
            // YT.PlayerState.PAUSED === 2
            else if (event.data === 2) {
              setIsPlaying(false);
            }
            // YT.PlayerState.ENDED === 0
            else if (event.data === 0) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      // Check if tag already exists
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

    // Polling progress timer
    checkInterval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (curr) setCurrentTime(curr);
          if (dur && dur > 0) setDuration(dur);
        } catch {
          // ignore transient iframe access error
        }
      }
    }, 500);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Global user gesture unlock listener:
  // If browser policy blocked audible autoplay, unlock on the first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (manualPauseRef.current) return;
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.setVolume(volume);
          playerRef.current.playVideo();
          setIsBlocked(false);
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
  }, [volume]);

  // Play / Pause toggle
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
      setIsBlocked(false);
    }
  };

  // Volume slider change
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

  // Mute / Unmute toggle
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

  // Seek on progress bar click
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden YouTube Iframe Audio Engine */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50" aria-hidden="true">
        <div id="yt-audio-element" />
      </div>

      {/* Floating Bottom-Right Soundtrack Player */}
      <aside
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-5 right-5 z-40 max-w-[340px] sm:max-w-[380px] w-full transition-all duration-300"
      >
        <div className="rounded-2xl bg-[#0D0E14]/95 border border-white/15 backdrop-blur-xl shadow-2xl p-4 overflow-hidden border-l-4 border-l-[#FF4FA3]">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2">
                {isPlaying ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4FA3] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4FA3]" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500" />
                )}
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#FF4FA3] truncate">
                GTA VI SOUNDTRACK
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isBlocked && !isPlaying && (
                <button
                  onClick={togglePlay}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FF4FA3] text-black hover:bg-white transition-colors animate-pulse"
                >
                  PLAY MUSIC
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                title={isExpanded ? 'Collapse Player' : 'Expand Player'}
                aria-label={isExpanded ? 'Collapse Player' : 'Expand Player'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Main Track Info & Primary Controls */}
          <div className="flex items-center gap-3">
            {/* Spinning Disc / Cover Icon */}
            <div
              onClick={togglePlay}
              className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF4FA3]/20 via-[#36B9E9]/20 to-white/10 border border-white/15 flex items-center justify-center shrink-0 cursor-pointer group"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <Disc3 className={`w-6 h-6 text-slate-200 transition-transform ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:scale-110'}`} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                {isPlaying ? <Pause className="w-4 h-4 text-white fill-white" /> : <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />}
              </div>
            </div>

            {/* Song Meta */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white tracking-wide truncate">
                {TRACK_TITLE}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {TRACK_ARTIST}
              </p>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-transform active:scale-90 shrink-0 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Expandable Extended Controls: Progress bar & Volume slider */}
          {isExpanded && (
            <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2.5">
              {/* Progress Bar */}
              <div>
                <div
                  ref={progressContainerRef}
                  onClick={handleSeek}
                  className="w-full h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all group"
                  title="Click to seek"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#FF4FA3] to-[#36B9E9] rounded-full transition-[width] duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Slider & Sound Wave */}
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={toggleMute}
                    className="text-slate-400 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : volume < 50 ? (
                      <Volume1 className="w-3.5 h-3.5 text-slate-300" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-white/20 accent-[#FF4FA3] rounded-lg cursor-pointer appearance-none"
                    title={`Volume: ${isMuted ? 0 : volume}%`}
                    aria-label="Volume slider"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-7">
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>

                {/* Animated Equalizer Visualizer */}
                <div className="flex items-end gap-0.5 h-3 shrink-0" aria-hidden="true">
                  <span className={`w-0.5 bg-[#FF4FA3] rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} />
                  <span className={`w-0.5 bg-[#36B9E9] rounded-full transition-all duration-200 ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-[#FF9B54] rounded-full transition-all duration-300 ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
                  <span className={`w-0.5 bg-white rounded-full transition-all duration-150 ${isPlaying ? 'h-1.5 animate-bounce' : 'h-1'}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
