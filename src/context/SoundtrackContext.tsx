import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  SOUNDTRACK_LIBRARY,
  SoundtrackTrack,
  VERIFIED_PLAYABLE_TRACKS,
} from '../config/soundtrack';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface SoundtrackContextValue {
  tracks: SoundtrackTrack[];
  currentTrackIndex: number;
  currentTrack: SoundtrackTrack;
  isPlaying: boolean;
  isReady: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isQueueOpen: boolean;
  isDismissed: boolean;
  likedTrackIds: Set<string>;
  selectTrack: (index: number) => void;
  togglePlay: () => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (volume: number) => void;
  toggleMute: () => void;
  toggleLike: (trackId: string) => void;
  setIsQueueOpen: (open: boolean) => void;
  dismissPlayer: () => void;
  restorePlayer: () => void;
}

const SoundtrackContext = createContext<SoundtrackContextValue | undefined>(undefined);

export const SoundtrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<SoundtrackTrack[]>(SOUNDTRACK_LIBRARY);

  // Restore saved track index from localStorage if valid
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedIdx = localStorage.getItem('gta_soundtrack_track_idx');
      if (savedIdx !== null) {
        const parsed = parseInt(savedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < SOUNDTRACK_LIBRARY.length) {
          // If the saved track is playable, use it
          if (SOUNDTRACK_LIBRARY[parsed].isPlayable) return parsed;
        }
      }
    }
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Restore saved volume
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('gta_soundtrack_volume');
      if (savedVol !== null) {
        const parsed = parseInt(savedVol, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
      }
    }
    return 30;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SOUNDTRACK_LIBRARY[0].durationSec);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('gta_soundtrack_dismissed') === 'true';
    }
    return false;
  });

  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gta_soundtrack_likes');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {}
      }
    }
    return new Set(['flower-in-a-hurricane']);
  });

  const playerRef = useRef<any>(null);
  const manualPauseRef = useRef<boolean>(false);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);

  // Fetch dynamically discovered tracks from /api/soundtrack on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/soundtrack')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch soundtrack API');
      })
      .then((data) => {
        if (isMounted && Array.isArray(data.tracks) && data.tracks.length > 0) {
          setTracks((prevTracks) => {
            const merged = [...prevTracks];
            const existingIds = new Set(prevTracks.map((t) => t.id));
            for (const incomingTrack of data.tracks) {
              if (!existingIds.has(incomingTrack.id)) {
                merged.push(incomingTrack);
                existingIds.add(incomingTrack.id);
              }
            }
            return merged;
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to base static library
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gta_soundtrack_track_idx', currentTrackIndex.toString());
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gta_soundtrack_volume', volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gta_soundtrack_likes', JSON.stringify(Array.from(likedTrackIds)));
    }
  }, [likedTrackIds]);

  const currentTrack: SoundtrackTrack = tracks[currentTrackIndex] || tracks[0];

  // Automatic progression when track finishes
  const handleTrackEnded = () => {
    const curIdx = currentTrackIndexRef.current;
    // Find next playable track in order
    let nextIdx = (curIdx + 1) % tracks.length;
    let attempts = 0;
    while (!tracks[nextIdx].isPlayable && attempts < tracks.length) {
      nextIdx = (nextIdx + 1) % tracks.length;
      attempts++;
    }

    if (tracks[nextIdx].isPlayable) {
      selectTrack(nextIdx);
    } else {
      setIsPlaying(false);
    }
  };

  // Initialize Persistent YouTube Audio Engine once
  useEffect(() => {
    if (isDismissed) return;
    let checkInterval: any = null;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      const initialTrack = tracks[currentTrackIndex] || tracks[0];
      const videoId = initialTrack.youtubeId || '-fW1M17EVdE';

      playerRef.current = new window.YT.Player('persistent-yt-audio-element', {
        height: '0',
        width: '0',
        videoId: videoId,
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
              event.target.setVolume(volume);
              event.target.playVideo();
            } catch {
              // Browser policy may defer until user gesture
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              // PLAYING
              setIsPlaying(true);
            } else if (event.data === 2) {
              // PAUSED
              setIsPlaying(false);
            } else if (event.data === 0) {
              // ENDED
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

  // Unlock audio on first global user interaction if autoplay was blocked
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

  // Support external triggers (e.g. from Desktop Previews)
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
  }, [tracks]);

  const selectTrack = (index: number) => {
    const nextTrack = tracks[index];
    if (!nextTrack) return;

    // If track is not playable (e.g. announced), do not attempt audio load
    if (!nextTrack.isPlayable || !nextTrack.youtubeId) {
      return;
    }

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

  const playNextTrack = () => {
    let nextIdx = (currentTrackIndexRef.current + 1) % tracks.length;
    let attempts = 0;
    while (!tracks[nextIdx].isPlayable && attempts < tracks.length) {
      nextIdx = (nextIdx + 1) % tracks.length;
      attempts++;
    }
    if (tracks[nextIdx].isPlayable) {
      selectTrack(nextIdx);
    }
  };

  const playPrevTrack = () => {
    if (currentTime > 3 && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      return;
    }
    let prevIdx = (currentTrackIndexRef.current - 1 + tracks.length) % tracks.length;
    let attempts = 0;
    while (!tracks[prevIdx].isPlayable && attempts < tracks.length) {
      prevIdx = (prevIdx - 1 + tracks.length) % tracks.length;
      attempts++;
    }
    if (tracks[prevIdx].isPlayable) {
      selectTrack(prevIdx);
    }
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

  const seekTo = (seconds: number) => {
    if (!playerRef.current || duration <= 0) return;
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(clamped, true);
      }
    } catch {
      // ignore
    }
  };

  const setVolumeLevel = (newVol: number) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolume(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(clamped);
        if (clamped > 0 && typeof playerRef.current.unMute === 'function') {
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

  const toggleLike = (trackId: string) => {
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

  const dismissPlayer = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      try {
        playerRef.current.stopVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gta_soundtrack_dismissed', 'true');
    }
  };

  const restorePlayer = () => {
    setIsDismissed(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('gta_soundtrack_dismissed');
    }
  };

  return (
    <SoundtrackContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        isReady,
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
      }}
    >
      {/* Global persistent YouTube audio engine in DOM */}
      {!isDismissed && (
        <div
          className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50"
          aria-hidden="true"
        >
          <div id="persistent-yt-audio-element" />
        </div>
      )}
      {children}
    </SoundtrackContext.Provider>
  );
};

export function useSoundtrack(): SoundtrackContextValue {
  const context = useContext(SoundtrackContext);
  if (!context) {
    throw new Error('useSoundtrack must be used within a SoundtrackProvider');
  }
  return context;
}
