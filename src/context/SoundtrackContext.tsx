import React, { createContext, useContext, useState, useEffect, useMemo, useSyncExternalStore, useCallback, useRef } from 'react';
import { OFFICIAL_SOUNDTRACK_TRACKS, SoundtrackTrack } from '../config/soundtrack';

interface SoundtrackContextType {
  tracks: SoundtrackTrack[];
  currentTrackIndex: number;
  currentTrack: SoundtrackTrack;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isQueueOpen: boolean;
  isDismissed: boolean;
  likedTrackIds: Set<string>;
  selectTrack: (idx: number) => void;
  togglePlay: () => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleLike: (id: string) => void;
  setIsQueueOpen: (open: boolean) => void;
  dismissPlayer: () => void;
  restorePlayer: () => void;
}

// Audio Progress Store (isolated 1-second ticks from SoundtrackProvider state)
class AudioProgressStore {
  private currentTime: number = 0;
  private listeners: Set<() => void> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.currentTime;
  };

  setCurrentTime = (time: number) => {
    if (this.currentTime !== time) {
      this.currentTime = time;
      this.listeners.forEach((l) => l());
    }
  };

  startTimer = (getDuration: () => number, onEnd: () => void) => {
    this.stopTimer();
    this.timerId = setInterval(() => {
      const dur = getDuration();
      if (this.currentTime >= dur) {
        onEnd();
      } else {
        this.setCurrentTime(this.currentTime + 1);
      }
    }, 1000);
  };

  stopTimer = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  };
}

class ViceCityAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentTrackIdx: number = 0;
  private currentVol: number = 0.8;
  private muted: boolean = false;

  private trackMelodies = [
    [220, 277.18, 329.63, 440],
    [196, 246.94, 293.66, 392],
    [174.61, 220, 261.63, 349.23],
    [164.81, 207.65, 246.94, 329.63],
    [146.83, 185, 220, 293.66],
    [130.81, 164.81, 196, 261.63],
    [246.94, 311.13, 369.99, 493.88],
    [207.65, 259.57, 311.13, 415.3],
    [185, 233.08, 277.18, 369.99],
    [261.63, 329.63, 392, 523.25],
  ];

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.updateGain();
      }
    }
  }

  public setVolume(vol: number, muted: boolean) {
    this.currentVol = Math.max(0, Math.min(1, vol / 100));
    this.muted = muted;
    this.updateGain();
  }

  private updateGain() {
    if (this.masterGain && this.ctx) {
      const targetGain = this.muted ? 0 : this.currentVol * 0.12;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public play(trackIdx: number) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.currentTrackIdx = trackIdx;
    if (!this.isRunning) {
      this.isRunning = true;
      this.startMelody();
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateGain();
  }

  private startMelody() {
    if (this.intervalId) clearInterval(this.intervalId);
    let step = 0;
    this.intervalId = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      try {
        const melody = this.trackMelodies[this.currentTrackIdx % this.trackMelodies.length];
        const freq = melody[step % melody.length];
        step++;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = step % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
      } catch {
        // Ignore AudioContext state warnings
      }
    }, 450);
  }
}

const audioEngine = new ViceCityAudioEngine();

const audioProgressStore = new AudioProgressStore();

const SoundtrackContext = createContext<Omit<SoundtrackContextType, 'currentTime'> | undefined>(undefined);

export const SoundtrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<SoundtrackTrack[]>(OFFICIAL_SOUNDTRACK_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(247);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const tracksLengthRef = useRef(tracks.length);
  tracksLengthRef.current = tracks.length;

  const selectTrack = useCallback((idx: number) => {
    setCurrentTrackIndex(idx);
    setIsPlaying(true);
    audioProgressStore.setCurrentTime(0);
  }, []);

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracksLengthRef.current);
    setIsPlaying(true);
    audioProgressStore.setCurrentTime(0);
  }, []);

  const playPrevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracksLengthRef.current) % tracksLengthRef.current);
    setIsPlaying(true);
    audioProgressStore.setCurrentTime(0);
  }, []);

  useEffect(() => {
    const dur = currentTrack.durationSec || 200;
    setDuration(dur);
  }, [currentTrackIndex, currentTrack.durationSec]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.play(currentTrackIndex);
      audioProgressStore.startTimer(
        () => durationRef.current,
        () => {
          playNextTrack();
        }
      );
    } else {
      audioEngine.pause();
      audioProgressStore.stopTimer();
    }
    return () => {
      audioProgressStore.stopTimer();
    };
  }, [isPlaying, currentTrackIndex, playNextTrack]);

  useEffect(() => {
    audioEngine.setVolume(volume, isMuted);
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const seekTo = useCallback((seconds: number) => {
    audioProgressStore.setCurrentTime(Math.max(0, Math.min(durationRef.current, seconds)));
  }, []);

  const setVolumeLevel = useCallback((vol: number) => {
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const toggleLike = useCallback((id: string) => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const dismissPlayer = useCallback(() => setIsDismissed(true), []);
  const restorePlayer = useCallback(() => setIsDismissed(false), []);

  const contextValue = useMemo(
    () => ({
      tracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      volume,
      isMuted,
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
    }),
    [
      tracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      volume,
      isMuted,
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
      dismissPlayer,
      restorePlayer,
    ]
  );

  return (
    <SoundtrackContext.Provider value={contextValue}>
      {children}
    </SoundtrackContext.Provider>
  );
};

export const useSoundtrack = (): SoundtrackContextType => {
  const ctx = useContext(SoundtrackContext);
  if (!ctx) throw new Error('useSoundtrack must be used within SoundtrackProvider');

  const currentTime = useSyncExternalStore(
    audioProgressStore.subscribe,
    audioProgressStore.getSnapshot,
    audioProgressStore.getSnapshot
  );

  return {
    ...ctx,
    currentTime,
  };
};
