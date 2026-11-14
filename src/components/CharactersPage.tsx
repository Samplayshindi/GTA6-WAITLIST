import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Users, ChevronLeft, ChevronRight, BookOpen, Award, Sparkles } from 'lucide-react';
import { CHARACTERS_DATA } from '../data/charactersData';
import { getPreferredPreloadUrl, pickClosestWidth } from '../utils/imageUtils';
import { OptimizedImage } from './OptimizedImage';
import { RevealOnScroll } from './RevealOnScroll';

interface CharactersPageProps {
  onNavigateHome?: () => void;
}

type TransitionPhase = 'VISIBLE' | 'FADING_OUT' | 'HOLDING_BLACK' | 'FADING_IN';

export const CharactersPage: React.FC<CharactersPageProps> = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('jason-duval');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('VISIBLE');

  const selectedCharacter =
    CHARACTERS_DATA.find((c) => c.id === selectedCharacterId) || CHARACTERS_DATA[0];

  const rotationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTransitionTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(clearTimeout);
    transitionTimeoutsRef.current = [];
  }, []);

  // Preload target image and execute sequential fade-to-black transition sequence
  const transitionToNextImage = useCallback(
    (nextIdx: number) => {
      clearTransitionTimeouts();

      // Preload target image using matching format & viewport-appropriate width
      const rawNextUrl = selectedCharacter.images[nextIdx] || selectedCharacter.images[0];
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      const stageWidth = vw <= 1023 ? vw * 0.94 * dpr : Math.min(vw * 0.56, 710) * dpr;
      const targetWidth = pickClosestWidth([375, 768, 1280, 1920], stageWidth);
      const img = new Image();
      getPreferredPreloadUrl(rawNextUrl, targetWidth).then((url) => {
        if (url) img.src = url;
      });

      // Phase 1: Fade Out to Black (1.5s)
      setTransitionPhase('FADING_OUT');

      // Phase 2: Hold Solid Black (300ms)
      const t1 = setTimeout(() => {
        setTransitionPhase('HOLDING_BLACK');
        setActiveImageIndex(nextIdx);

        // Phase 3: Fade In from Black (1.5s)
        const t2 = setTimeout(() => {
          setTransitionPhase('FADING_IN');

          // Phase 4: Fully Visible & Subtle Zoom
          const t3 = setTimeout(() => {
            setTransitionPhase('VISIBLE');
          }, 1500);
          transitionTimeoutsRef.current.push(t3);
        }, 300);
        transitionTimeoutsRef.current.push(t2);
      }, 1500);
      transitionTimeoutsRef.current.push(t1);
    },
    [selectedCharacter.images, clearTransitionTimeouts]
  );

  // Reset image sequence state when switching selected character profile
  useEffect(() => {
    clearTransitionTimeouts();
    setActiveImageIndex(0);
    setTransitionPhase('VISIBLE');
  }, [selectedCharacterId, clearTransitionTimeouts]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTransitionTimeouts();
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [clearTransitionTimeouts]);

  // Automatic character artwork slideshow loop
  useEffect(() => {
    if (selectedCharacter.images.length <= 1) return;

    rotationTimerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && transitionPhase === 'VISIBLE') {
        const nextIdx = (activeImageIndex + 1) % selectedCharacter.images.length;
        transitionToNextImage(nextIdx);
      }
    }, 8000); // 8s interval allows full 3.3s transition + 4.7s resting display

    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [selectedCharacter.images.length, activeImageIndex, transitionPhase, transitionToNextImage]);

  const handleManualPrevImage = () => {
    if (transitionPhase !== 'VISIBLE') return;
    const prevIdx =
      (activeImageIndex - 1 + selectedCharacter.images.length) % selectedCharacter.images.length;
    transitionToNextImage(prevIdx);
  };

  const handleManualNextImage = () => {
    if (transitionPhase !== 'VISIBLE') return;
    const nextIdx = (activeImageIndex + 1) % selectedCharacter.images.length;
    transitionToNextImage(nextIdx);
  };

  const currentRawImageUrl =
    selectedCharacter.images[activeImageIndex] || selectedCharacter.images[0];

  const isImageVisible = transitionPhase === 'VISIBLE' || transitionPhase === 'FADING_IN';

  return (
    <div className="min-h-screen py-8 lg:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      {/* 1. Page Header */}
      <RevealOnScroll>
        <div className="mb-6 pb-6 border-b border-white/10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight font-display">
            Grand Theft Auto VI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-primary,#FF4FA3)] to-[var(--theme-tertiary,#00F5D4)]">
              Characters
            </span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
            In-depth criminal profiles, verified backstories, personality traits, and key art collections for the key players shaping Vice City and the Keys.
          </p>
        </div>
      </RevealOnScroll>

      {/* 2. Character Selector Pills (Static wrapping flex layout) */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 bg-[#090C10]/80 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {CHARACTERS_DATA.map((char) => {
            const isSelected = selectedCharacterId === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelectedCharacterId(char.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 min-h-[40px] font-display ${
                  isSelected
                    ? 'text-white shadow-lg font-extrabold'
                    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--theme-primary, #FF4FA3)' : undefined,
                  borderColor: isSelected ? 'var(--theme-primary, #FF4FA3)' : undefined,
                }}
              >
                {char.id === 'real-dimez' ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Character Profile Display Stage (60% Artwork / 40% Complete Dossier Information Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#090C10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Column: Large Landscape Official Artwork Stage (60% width = col-span-7) */}
        <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[460px] lg:min-h-[560px] bg-black overflow-hidden flex items-center justify-center group">
          {/* Image Stage Container */}
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
            <OptimizedImage
              src={currentRawImageUrl}
              alt={selectedCharacter.name}
              maxWidth={1920}
              sizes="(max-width: 1023px) 94vw, (max-width: 1279px) 56vw, 710px"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-[1500ms] ease-in-out ${
                isImageVisible ? 'opacity-100' : 'opacity-0'
              } ${
                transitionPhase === 'VISIBLE' ? 'scale-105 transition-transform duration-[10000ms]' : 'scale-100'
              }`}
            />
          </div>

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090C10] via-transparent to-black/30 pointer-events-none" />

          {/* Carousel Navigation Arrow Buttons Only */}
          {selectedCharacter.images.length > 1 && (
            <>
              <button
                onClick={handleManualPrevImage}
                disabled={transitionPhase !== 'VISIBLE'}
                aria-label="Previous character image"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-[var(--theme-primary,#FF4FA3)] text-white border border-white/20 shadow-xl transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleManualNextImage}
                disabled={transitionPhase !== 'VISIBLE'}
                aria-label="Next character image"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-[var(--theme-primary,#FF4FA3)] text-white border border-white/20 shadow-xl transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Right Column: Complete Character Dossier Information (40% width = col-span-5) */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col space-y-4 max-h-[560px] overflow-y-auto">
          {/* Section 1: Subtitle & Character Name */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[var(--theme-primary,#FF4FA3)] font-display">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedCharacter.subtitle}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#F4F1ED] tracking-tight font-display">
              {selectedCharacter.name}
            </h2>
          </div>

          {/* Section 2: Who They Are */}
          <div className="pt-3 border-t border-white/10 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider theme-text-primary font-display">
              {selectedCharacter.whoAreTheyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {selectedCharacter.whoAreThey}
            </p>
          </div>

          {/* Section 3: Backstory */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white font-display">
              <BookOpen className="w-3.5 h-3.5 theme-text-primary" />
              <span>Backstory</span>
            </div>

            <div className="space-y-2">
              {selectedCharacter.backstory.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full theme-bg-primary inline-block" />
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-3">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Special Section for Real Dimez Members */}
            {selectedCharacter.members && selectedCharacter.members.length > 0 && (
              <div className="pt-2 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider theme-text-primary font-display">
                  The Members
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCharacter.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#12141C] border border-white/10 space-y-0.5"
                    >
                      <h5 className="text-[11px] font-bold text-white uppercase font-display">
                        {member.name}
                      </h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {member.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Personality & Traits */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white font-display">
              <Award className="w-3.5 h-3.5 text-[var(--theme-secondary,#A855F7)]" />
              <span>Personality &amp; Traits</span>
            </div>

            <div className="space-y-2">
              {selectedCharacter.personalityTraits.map((trait, idx) => (
                <div key={idx} className="space-y-0.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: 'var(--theme-secondary, #A855F7)' }}
                    />
                    <span>{trait.title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-3">
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: The Turning Point / Role */}
          <div className="pt-3 border-t border-white/10 p-3.5 rounded-xl bg-[#12141C] border border-white/10 space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-tertiary,#00F5D4)] font-display">
              {selectedCharacter.roleHeading}
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedCharacter.roleDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
