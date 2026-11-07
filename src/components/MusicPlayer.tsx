import React, { useRef } from 'react';
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
} from 'lucide-react';
import { useSoundtrack } from '../context/SoundtrackContext';
import { OFFICIAL_ALBUM_ARTWORK_URL } from '../config/soundtrack';

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

  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const desktopProgressRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef<boolean>(false);

  const performSeek = (clientX: number, targetRef: React.RefObject<HTMLDivElement | null>) => {
    if (!targetRef.current || duration <= 0) return;
    const rect = targetRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  const createSeekHandler = (targetRef: React.RefObject<HTMLDivElement | null>) => {
    return (e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if ('cancelable' in e && e.cancelable) {
        e.preventDefault();
      }

      isSeekingRef.current = true;
      const initialX =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientX
          : (e as React.PointerEvent).clientX;

      performSeek(initialX, targetRef);

      const handleMove = (moveEvent: PointerEvent | TouchEvent) => {
        moveEvent.stopPropagation();
        if ('cancelable' in moveEvent && moveEvent.cancelable) {
          moveEvent.preventDefault();
        }
        if (!isSeekingRef.current) return;
        const currentX =
          'touches' in moveEvent && moveEvent.touches.length > 0
            ? moveEvent.touches[0].clientX
            : (moveEvent as PointerEvent).clientX;
        performSeek(currentX, targetRef);
      };

      const handleEnd = (endEvent: Event) => {
        endEvent.stopPropagation();
        isSeekingRef.current = false;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
      };

      window.addEventListener('pointermove', handleMove, { passive: false });
      window.addEventListener('pointerup', handleEnd, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd, { passive: false });
      window.addEventListener('touchcancel', handleEnd, { passive: false });
    };
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentTrackLiked = likedTrackIds.has(currentTrack.id);

  if (isDismissed) {
    return (
      <button
        onClick={restorePlayer}
        className="fixed bottom-3 right-3 sm:right-6 z-40 px-3.5 py-1.5 rounded-full bg-[#121318]/90 hover:bg-[#1C1D24] border border-[#24262B] text-slate-300 hover:text-white shadow-xl backdrop-blur-md text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
        title="Open GTA VI Soundtrack Player"
        aria-label="Restore Soundtrack Player"
      >
        <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--theme-primary, #FF4FA3)' }} />
        <span className="truncate max-w-[140px] sm:max-w-none">{currentTrack.title}</span>
      </button>
    );
  }

  return (
    <>
      {/* Spotify-Inspired Tracklist / Queue Drawer Modal */}
      {isQueueOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Soundtrack Queue"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsQueueOpen(false)}
        >
          <div
            className="bg-[#08090D] border border-[#24262B] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[82vh] sm:max-h-[74vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090D]">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0 border border-white/10"
                  style={{ color: 'var(--theme-primary, #FF4FA3)' }}
                >
                  <Music2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5] tracking-tight truncate">
                    Play Queue &middot; Grand Theft Auto VI
                  </h3>
                  <p className="text-xs text-[#A1A1AA] truncate">
                    Official Soundtrack &middot; {tracks.length} Tracks
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
              {tracks
                .filter((t) => t.isPlayable)
                .map((track, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  const isLiked = likedTrackIds.has(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(idx)}
                      className={`group px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-[#18191E] border cursor-pointer'
                          : 'hover:bg-[#121318] border border-transparent cursor-pointer'
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--theme-primary, #FF4FA3)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Track Number / Equalizer Animation */}
                        <span className="text-xs font-mono text-[#A1A1AA] w-5 text-center shrink-0">
                          {isSelected && isPlaying ? (
                            <span className="inline-flex items-end justify-center gap-0.5 h-3.5">
                              <span
                                className="w-0.5 h-3 animate-pulse"
                                style={{ backgroundColor: 'var(--theme-primary, #FF4FA3)' }}
                              />
                              <span
                                className="w-0.5 h-4 animate-pulse delay-75"
                                style={{ backgroundColor: 'var(--theme-primary, #FF4FA3)' }}
                              />
                              <span
                                className="w-0.5 h-2 animate-pulse delay-150"
                                style={{ backgroundColor: 'var(--theme-primary, #FF4FA3)' }}
                              />
                            </span>
                          ) : (
                            idx + 1
                          )}
                        </span>

                        {/* Square Sharp 1:1 Album Art */}
                        <div className="w-10 h-10 aspect-square rounded-sm overflow-hidden bg-black shrink-0 border border-[#24262B] relative">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = OFFICIAL_ALBUM_ARTWORK_URL;
                            }}
                          />
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
                          <h4
                            className="text-xs sm:text-sm font-semibold truncate"
                            style={{
                              color: isSelected ? 'var(--theme-primary, #FF4FA3)' : '#F5F5F5',
                            }}
                          >
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                          {track.sourceLabel.replace('Grand Theft Auto VI: ', '')}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                            isLiked ? '' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                          }`}
                          style={{
                            color: isLiked ? 'var(--theme-primary, #FF4FA3)' : undefined,
                          }}
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
                Now Selected: <strong className="text-[#F5F5F5]">{currentTrack.title}</strong>
              </span>
              <span
                className="font-mono shrink-0 ml-2"
                style={{ color: 'var(--theme-primary, #FF4FA3)' }}
              >
                Official Audio Engine
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spotify-Inspired Bottom Playback Bar */}
      <footer
        aria-label="GTA VI Soundtrack Player"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090D] border-t border-[#24262B] select-none shadow-[0_-8px_24px_rgba(0,0,0,0.85)] max-w-full overflow-hidden"
      >
        {/* Mobile Mini-Progress Top Bar (Scrubbable with Prominent Circular Thumb Knob) */}
        <div
          ref={mobileProgressRef}
          onPointerDown={createSeekHandler(mobileProgressRef)}
          onTouchStart={createSeekHandler(mobileProgressRef)}
          className="sm:hidden w-full h-4 bg-[#08090D] border-b border-[#24262B] cursor-pointer relative touch-none select-none flex items-center px-2 z-10"
          title="Seek playback"
        >
          <div className="w-full h-2 bg-[#1C1D24] border border-white/10 rounded-full relative overflow-visible">
            {/* Filled Progress Line */}
            <div
              className="h-full rounded-full relative"
              style={{
                width: `${progressPercent}%`,
                background: 'var(--theme-gradient, linear-gradient(to right, #F15A24, #FF4FA3))',
              }}
            />
            {/* Always-Visible Circular Thumb Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 shadow-lg cursor-grab active:cursor-grabbing pointer-events-none"
              style={{
                left: `calc(${progressPercent}% - 8px)`,
                borderColor: 'var(--theme-primary, #FF4FA3)',
              }}
            />
          </div>
        </div>

        {/* Player Layout Container */}
        <div className="max-w-7xl mx-auto h-[62px] sm:h-[80px] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* =========================================
              LEFT SECTION: Album Artwork & Track Details
             ========================================= */}
          <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-[260px] md:max-w-[300px] shrink-0">
            {/* Square Sharp 1:1 Album Art */}
            <div
              onClick={() => setIsQueueOpen(true)}
              className="w-11 h-11 sm:w-14 sm:h-14 aspect-square rounded-none sm:rounded-sm overflow-hidden bg-black shrink-0 border border-[#24262B] cursor-pointer relative group shadow-md"
              title="Click to view full GTA VI tracklist"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = OFFICIAL_ALBUM_ARTWORK_URL;
                }}
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
              onClick={() => toggleLike(currentTrack.id)}
              className={`hidden md:block p-1.5 transition-colors cursor-pointer shrink-0 ${
                isCurrentTrackLiked ? '' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
              }`}
              style={{
                color: isCurrentTrackLiked ? 'var(--theme-primary, #FF4FA3)' : undefined,
              }}
              title={isCurrentTrackLiked ? 'Remove from favorites' : 'Save to favorites'}
              aria-label="Save track"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* =========================================
              CENTER SECTION: Playback Controls (No Shuffle / No Repeat)
             ========================================= */}
          <div className="hidden sm:flex flex-col items-center flex-1 max-w-xl mx-auto px-2 min-w-0">
            {/* Control Buttons Row */}
            <div className="flex items-center gap-5 sm:gap-6 mb-1.5">
              {/* Previous Track */}
              <button
                onClick={playPrevTrack}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Play / Pause Button (Standard 34px) */}
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
                onClick={playNextTrack}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Desktop Minimal Progress Bar & Timestamps */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#A1A1AA] w-9 text-right tabular-nums shrink-0">
                {formatTime(currentTime)}
              </span>

              <div
                ref={desktopProgressRef}
                onPointerDown={createSeekHandler(desktopProgressRef)}
                onTouchStart={createSeekHandler(desktopProgressRef)}
                className="flex-1 h-2 bg-[#1C1D24] border border-white/10 group hover:bg-[#2A2C38] rounded-full cursor-pointer relative transition-all touch-none select-none my-1"
                title="Seek"
              >
                <div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'var(--theme-gradient, linear-gradient(to right, #F15A24, #FF4FA3))',
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 transition-transform group-hover:scale-110 active:scale-125 cursor-grab active:cursor-grabbing pointer-events-none"
                  style={{
                    left: `calc(${progressPercent}% - 7px)`,
                    borderColor: 'var(--theme-primary, #FF4FA3)',
                  }}
                />
              </div>

              <span className="text-[11px] font-mono text-[#A1A1AA] w-9 text-left tabular-nums shrink-0">
                {formatTime(duration)}
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
                toggleLike(currentTrack.id);
              }}
              className={`p-1.5 transition-colors cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center ${
                isCurrentTrackLiked ? '' : 'text-[#A1A1AA]'
              }`}
              style={{
                color: isCurrentTrackLiked ? 'var(--theme-primary, #FF4FA3)' : undefined,
              }}
              aria-label="Save track"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Compact Mobile Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                playNextTrack();
              }}
              className="text-[#A1A1AA] p-1.5 cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQueueOpen(!isQueueOpen);
              }}
              className={`p-1.5 rounded-lg cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center ${
                isQueueOpen ? '' : 'text-[#A1A1AA]'
              }`}
              style={{
                color: isQueueOpen ? 'var(--theme-primary, #FF4FA3)' : undefined,
              }}
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
                  ? 'bg-white/5'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
              style={{
                color: isQueueOpen ? 'var(--theme-primary, #FF4FA3)' : undefined,
              }}
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

            {/* Dismiss Button */}
            <button
              onClick={dismissPlayer}
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
