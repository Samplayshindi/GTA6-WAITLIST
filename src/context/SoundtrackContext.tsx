import { apiUrl } from '../services/api';
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

export function formatDurationText(seconds: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) {
    return '--:--';
  }
  const rounded = Math.round(seconds);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const getInitialTracks = (): SoundtrackTrack[] => {
  let cached: Record<string, number> = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('gtavi_track_durations');
      if (saved) {
        cached = JSON.parse(saved);
      }
    } catch {
      // localStorage unavailable
    }
  }
  return SOUNDTRACK_LIBRARY.map((track) => {
    const cachedSec = cached[track.id];
    if (typeof cachedSec === 'number' && cachedSec > 0 && isFinite(cachedSec)) {
      return {
        ...track,
        durationSec: cachedSec,
        durationText: formatDurationText(cachedSec),
      };
    }
    return track;
  });
};

const SoundtrackContext = createContext<SoundtrackContextValue | undefined>(undefined);

export const SoundtrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<SoundtrackTrack[]>(getInitialTracks);

  // Helper to update track duration in state & localStorage cache
  const updateTrackDuration = (trackId: string, durationSec: number) => {
    if (!durationSec || isNaN(durationSec) || durationSec <= 0 || !isFinite(durationSec)) return;
    const roundedSec = Math.round(durationSec);
    const formattedText = formatDurationText(roundedSec);

    setTracks((prevTracks) =>
      prevTracks.map((t) => {
        if (t.id === trackId) {
          if (t.durationSec === roundedSec && t.durationText === formattedText) {
            return t;
          }
          return {
            ...t,
            durationSec: roundedSec,
            durationText: formattedText,
          };
        }
        return t;
      })
    );

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gtavi_track_durations');
        const cached = saved ? JSON.parse(saved) : {};
        if (cached[trackId] !== roundedSec) {
          cached[trackId] = roundedSec;
          localStorage.setItem('gtavi_track_durations', JSON.stringify(cached));
        }
      } catch {
        // Storage restricted
      }
    }
  };

  // Pre-fetch exact audio metadata for MP3 / audioUrl tracks on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    tracks.forEach((track) => {
      if (track.audioUrl) {
        const audio = new Audio();
        audio.preload = 'metadata';

        const onLoaded = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
            updateTrackDuration(track.id, audio.duration);
          }
          cleanup();
        };

        const onError = () => {
          cleanup();
        };

        const cleanup = () => {
          audio.removeEventListener('loadedmetadata', onLoaded);
          audio.removeEventListener('error', onError);
        };

        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('error', onError);
        audio.src = track.audioUrl;
      }
    });
  }, []);

  // Restore saved track index from localStorage if valid; default to Flower in a Hurricane on initial visit
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => {
    const flowerIdx = SOUNDTRACK_LIBRARY.findIndex((t) => t.id === 'flower-in-a-hurricane');
    const defaultIdx = flowerIdx !== -1 ? flowerIdx : 1;

    if (typeof window !== 'undefined') {
      try {
        const savedIdx = localStorage.getItem('gta_soundtrack_track_idx');
        if (savedIdx !== null) {
          const parsed = parseInt(savedIdx, 10);
          if (!isNaN(parsed) && parsed > 0 && parsed < SOUNDTRACK_LIBRARY.length) {
            if (SOUNDTRACK_LIBRARY[parsed].isPlayable) return parsed;
          }
        }
      } catch {
        // Storage restricted or unavailable
      }
    }
    return defaultIdx;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Restore saved volume
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('gta_soundtrack_volume');
        if (savedVol !== null) {
          const parsed = parseInt(savedVol, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
        }
      } catch {
        // Storage restricted
      }
    }
    return 30;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => {
    const initial = getInitialTracks();
    const flowerIdx = initial.findIndex((t) => t.id === 'flower-in-a-hurricane');
    const defaultTrack = initial[flowerIdx !== -1 ? flowerIdx : 1] || initial[1] || initial[0];
    return defaultTrack?.durationSec || 224;
  });
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('gta_soundtrack_dismissed') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gta_soundtrack_likes');
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch {
        // Storage restricted
      }
    }
    return new Set(['flower-in-a-hurricane']);
  });

  const playerRef = useRef<any>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const manualPauseRef = useRef<boolean>(false);
  const hasUnlockedAudioRef = useRef<boolean>(false);
  const tracksRef = useRef<SoundtrackTrack[]>(tracks);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const isDismissedRef = useRef<boolean>(isDismissed);
  const lastSeekAtRef = useRef<number>(0);
  const pendingAudioSeekRef = useRef<number | null>(null);
  const handleTrackEndedRef = useRef<() => void>(() => {});
  const selectTrackRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isDismissedRef.current = isDismissed;
  }, [isDismissed]);

  const syncAudioOutputState = (vol: number, muted: boolean) => {
    const safeVol = Math.max(0, Math.min(100, vol));
    const effectiveMuted = muted || safeVol === 0;

    if (audioElRef.current) {
      audioElRef.current.volume = safeVol / 100;
      audioElRef.current.muted = effectiveMuted;
    }

    if (playerRef.current) {
      try {
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(safeVol);
        }
        if (effectiveMuted) {
          if (typeof playerRef.current.mute === 'function') {
            playerRef.current.mute();
          }
        } else if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
      } catch {
        // ignore
      }
    }
  };

  // Initialize HTML5 Audio element instance once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audioElRef.current = audio;
    syncAudioOutputState(volumeRef.current, isMutedRef.current);

    const handleTimeUpdate = () => {
      if (
        audioElRef.current &&
        !audioElRef.current.seeking &&
        typeof audioElRef.current.currentTime === 'number' &&
        !isNaN(audioElRef.current.currentTime) &&
        Date.now() - lastSeekAtRef.current > 250
      ) {
        setCurrentTime(audioElRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioElRef.current && audioElRef.current.duration) {
        const dur = audioElRef.current.duration;
        setDuration(dur);
        const activeTrack = tracksRef.current[currentTrackIndexRef.current];
        if (activeTrack) {
          updateTrackDuration(activeTrack.id, dur);
        }
        if (pendingAudioSeekRef.current !== null) {
          const target = Math.max(0, Math.min(dur, pendingAudioSeekRef.current));
          pendingAudioSeekRef.current = null;
          audioElRef.current.currentTime = target;
          setCurrentTime(target);
        }
      }
    };

    const handlePlay = () => {
      const activeTrack = tracksRef.current[currentTrackIndexRef.current];
      if (activeTrack?.audioUrl) {
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      const activeTrack = tracksRef.current[currentTrackIndexRef.current];
      if (activeTrack?.audioUrl && !audio.ended) {
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      handleTrackEndedRef.current();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioElRef.current = null;
    };
  }, []);

  // Fetch dynamically discovered tracks from /api/soundtrack on mount
  useEffect(() => {
    let isMounted = true;
    fetch(apiUrl('/api/soundtrack'))
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
              if (
                !existingIds.has(incomingTrack.id) &&
                incomingTrack.isPlayable &&
                (incomingTrack.youtubeId || incomingTrack.audioUrl || incomingTrack.status === 'playable')
              ) {
                merged.push(incomingTrack);
                existingIds.add(incomingTrack.id);
              }
            }
            return merged.filter((t) => t.isPlayable);
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
      try {
        localStorage.setItem('gta_soundtrack_track_idx', currentTrackIndex.toString());
      } catch {
        // ignore
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gta_soundtrack_volume', volume.toString());
      } catch {
        // ignore
      }
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gta_soundtrack_likes', JSON.stringify(Array.from(likedTrackIds)));
      } catch {
        // ignore
      }
    }
  }, [likedTrackIds]);

  const currentTrack: SoundtrackTrack = tracks[currentTrackIndex] || tracks[0];

  // Automatic progression when track finishes
  const handleTrackEnded = () => {
    const activeTracks = tracksRef.current;
    const curIdx = currentTrackIndexRef.current;
    let nextIdx = (curIdx + 1) % activeTracks.length;
    let attempts = 0;
    while (!activeTracks[nextIdx]?.isPlayable && attempts < activeTracks.length) {
      nextIdx = (nextIdx + 1) % activeTracks.length;
      attempts++;
    }

    if (activeTracks[nextIdx]?.isPlayable) {
      selectTrackRef.current(nextIdx);
    } else {
      setIsPlaying(false);
    }
  };
  handleTrackEndedRef.current = handleTrackEnded;

  // Initialize Persistent YouTube Audio Engine once for the app lifetime
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;
      const mountEl = document.getElementById('persistent-yt-audio-element');
      if (!mountEl) return;

      const activeTracks = tracksRef.current;
      const initialTrack = activeTracks[currentTrackIndexRef.current] || activeTracks[0];
      const videoId = initialTrack.youtubeId || '5dPwBWvmcbQ';
      const shouldAutoplay = !isDismissedRef.current && !manualPauseRef.current && !!initialTrack.youtubeId;

      playerRef.current = new window.YT.Player('persistent-yt-audio-element', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: shouldAutoplay ? 1 : 0,
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
              syncAudioOutputState(volumeRef.current, isMutedRef.current);
              const track = tracksRef.current[currentTrackIndexRef.current];
              if (track && track.youtubeId && !isDismissedRef.current && !manualPauseRef.current) {
                event.target.playVideo();
              }
            } catch {
              // Browser policy may defer until user gesture
            }
          },
          onStateChange: (event: any) => {
            const activeTrack = tracksRef.current[currentTrackIndexRef.current];
            if (event.data === 1) {
              // PLAYING
              if (activeTrack?.youtubeId) {
                setIsPlaying(true);
              }
            } else if (event.data === 2) {
              // PAUSED
              if (activeTrack?.youtubeId) {
                setIsPlaying(false);
              }
            } else if (event.data === 0) {
              // ENDED
              if (activeTrack?.youtubeId) {
                handleTrackEndedRef.current();
              }
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

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') prevReady();
        setupPlayer();
      };
    }

    checkInterval = setInterval(() => {
      if (!isPlayingRef.current) return;
      const activeTrack = tracksRef.current[currentTrackIndexRef.current];
      if (activeTrack && activeTrack.youtubeId && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (
            typeof curr === 'number' &&
            !isNaN(curr) &&
            curr >= 0 &&
            Date.now() - lastSeekAtRef.current > 1000
          ) {
            setCurrentTime((prev) => (Math.abs(prev - curr) >= 0.25 ? curr : prev));
          }
          if (typeof dur === 'number' && dur > 0 && !isNaN(dur)) {
            setDuration((prev) => (prev !== dur ? dur : prev));
          }
        } catch {
          // ignore
        }
      }
    }, 400);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Unlock audio once on first global user interaction if initial autoplay was blocked
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    const handleFirstInteraction = () => {
      if (hasUnlockedAudioRef.current) {
        cleanupListeners();
        return;
      }
      hasUnlockedAudioRef.current = true;
      cleanupListeners();

      if (manualPauseRef.current || isDismissedRef.current || isPlayingRef.current) return;

      const activeTrack = tracksRef.current[currentTrackIndexRef.current];
      syncAudioOutputState(volumeRef.current, isMutedRef.current);

      if (activeTrack && activeTrack.audioUrl && audioElRef.current) {
        if (!audioElRef.current.src) {
          audioElRef.current.src = activeTrack.audioUrl;
        }
        audioElRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else if (activeTrack?.youtubeId && playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.playVideo();
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return cleanupListeners;
  }, []);

  // Support external triggers (e.g. from Desktop Previews)
  useEffect(() => {
    const handleExternalPlay = (e: any) => {
      if (typeof e.detail?.index === 'number') {
        selectTrackRef.current(e.detail.index);
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
    const activeTracks = tracksRef.current;
    const nextTrack = activeTracks[index];
    if (!nextTrack) return;

    if (!nextTrack.isPlayable || (!nextTrack.youtubeId && !nextTrack.audioUrl)) {
      return;
    }

    if (index === currentTrackIndexRef.current) {
      togglePlay();
      return;
    }

    currentTrackIndexRef.current = index;
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(nextTrack.durationSec);
    manualPauseRef.current = false;
    hasUnlockedAudioRef.current = true;
    syncAudioOutputState(volumeRef.current, isMutedRef.current);

    // Direct MP3 Audio URL Track
    if (nextTrack.audioUrl && audioElRef.current) {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
      audioElRef.current.src = nextTrack.audioUrl;
      audioElRef.current.currentTime = 0;
      syncAudioOutputState(volumeRef.current, isMutedRef.current);
      audioElRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio playback deferred:', err);
      });
      return;
    }

    // YouTube Stream Track
    if (nextTrack.youtubeId) {
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.loadVideoById === 'function') {
            playerRef.current.loadVideoById({
              videoId: nextTrack.youtubeId,
              startSeconds: 0,
            });
            syncAudioOutputState(volumeRef.current, isMutedRef.current);
            playerRef.current.playVideo();
            setIsPlaying(true);
          } else if (typeof playerRef.current.cueVideoById === 'function') {
            playerRef.current.cueVideoById(nextTrack.youtubeId);
            syncAudioOutputState(volumeRef.current, isMutedRef.current);
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        } catch (err) {
          console.error('Error switching track:', err);
        }
      }
    }
  };
  selectTrackRef.current = selectTrack;

  const playNextTrack = () => {
    const activeTracks = tracksRef.current;
    let nextIdx = (currentTrackIndexRef.current + 1) % activeTracks.length;
    let attempts = 0;
    while (!activeTracks[nextIdx]?.isPlayable && attempts < activeTracks.length) {
      nextIdx = (nextIdx + 1) % activeTracks.length;
      attempts++;
    }
    if (activeTracks[nextIdx]?.isPlayable) {
      selectTrack(nextIdx);
    }
  };

  const playPrevTrack = () => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const activeTracks = tracksRef.current;
    let prevIdx = (currentTrackIndexRef.current - 1 + activeTracks.length) % activeTracks.length;
    let attempts = 0;
    while (!activeTracks[prevIdx]?.isPlayable && attempts < activeTracks.length) {
      prevIdx = (prevIdx - 1 + activeTracks.length) % activeTracks.length;
      attempts++;
    }
    if (activeTracks[prevIdx]?.isPlayable) {
      selectTrack(prevIdx);
    }
  };

  const togglePlay = () => {
    hasUnlockedAudioRef.current = true;
    const activeTrack = tracksRef.current[currentTrackIndexRef.current];
    if (activeTrack && activeTrack.audioUrl && audioElRef.current) {
      if (isPlayingRef.current) {
        manualPauseRef.current = true;
        audioElRef.current.pause();
        setIsPlaying(false);
      } else {
        manualPauseRef.current = false;
        if (!audioElRef.current.src) {
          audioElRef.current.src = activeTrack.audioUrl;
        }
        syncAudioOutputState(volumeRef.current, isMutedRef.current);
        audioElRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

    if (!playerRef.current || !isReady) return;

    if (isPlayingRef.current) {
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
        syncAudioOutputState(volumeRef.current, isMutedRef.current);
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    const activeTrack = tracksRef.current[currentTrackIndexRef.current];
    const maxDur = duration > 0 ? duration : (activeTrack?.durationSec || 180);
    const clamped = Math.max(0, Math.min(maxDur, seconds));
    lastSeekAtRef.current = Date.now();
    setCurrentTime(clamped);

    if (activeTrack && activeTrack.audioUrl && audioElRef.current) {
      if (!audioElRef.current.src) {
        audioElRef.current.src = activeTrack.audioUrl;
      }
      if (audioElRef.current.readyState >= 1) {
        pendingAudioSeekRef.current = null;
        audioElRef.current.currentTime = clamped;
      } else {
        pendingAudioSeekRef.current = clamped;
      }
      return;
    }

    if (!playerRef.current) return;
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
    const nextMuted = clamped === 0;
    volumeRef.current = clamped;
    isMutedRef.current = nextMuted;
    setVolume(clamped);
    setIsMuted(nextMuted);
    syncAudioOutputState(clamped, nextMuted);
  };

  const toggleMute = () => {
    if (isMutedRef.current) {
      const targetVol = volumeRef.current > 0 ? volumeRef.current : 30;
      if (volumeRef.current === 0) {
        volumeRef.current = targetVol;
        setVolume(targetVol);
      }
      isMutedRef.current = false;
      setIsMuted(false);
      syncAudioOutputState(targetVol, false);
    } else {
      isMutedRef.current = true;
      setIsMuted(true);
      syncAudioOutputState(volumeRef.current, true);
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
    // Only hide the player UI; keep the active audio/YouTube engine, track, position, volume, and play/pause state intact
    setIsQueueOpen(false);
    isDismissedRef.current = true;
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('gta_soundtrack_dismissed', 'true');
      } catch {
        // ignore
      }
    }
  };

  const restorePlayer = () => {
    // Restore the player UI synchronized with current live audio state (no forced autoplay if paused)
    isDismissedRef.current = false;
    setIsDismissed(false);
    syncAudioOutputState(volumeRef.current, isMutedRef.current);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('gta_soundtrack_dismissed');
      } catch {
        // ignore
      }
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
      <div
        className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 -z-50"
        aria-hidden="true"
      >
        <div id="persistent-yt-audio-element" />
      </div>
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
