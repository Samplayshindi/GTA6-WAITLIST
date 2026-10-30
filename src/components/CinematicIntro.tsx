import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, FastForward } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    // Stage 1: Film grain & soundwave (0ms)
    const t1 = setTimeout(() => setStep(1), 800);
    // Stage 2: "ROCKSTAR GAMES PRESENTS" (1800ms)
    const t2 = setTimeout(() => setStep(2), 2200);
    // Stage 3: Skyline & Grand Theft Auto VI (4400ms)
    const t3 = setTimeout(() => setStep(3), 4400);
    // Stage 4: "THE WAIT IS ALMOST OVER." (6800ms)
    const t4 = setTimeout(() => setStep(4), 6800);
    // Stage 5: Final fade out and complete (9200ms)
    const t5 = setTimeout(() => {
      onComplete();
    }, 9200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const toggleSound = () => {
    const isNowPlaying = audioEngine.toggle();
    setIsMuted(!isNowPlaying);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090D] select-none overflow-hidden"
    >
      {/* Film Grain & Vignette */}
      <div className="absolute inset-0 film-grain opacity-75 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black pointer-events-none" />

      {/* Top Controls: Audio */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:border-pink-500/40 hover:text-white transition-colors"
          title={isMuted ? 'Enable ambient synth sound' : 'Mute sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      {/* Bottom Right: Skip Intro */}
      <div className="absolute bottom-8 right-8 z-50">
        <button
          onClick={handleSkip}
          className="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-300 bg-white/5 border border-white/15 hover:border-pink-500 hover:text-white hover:bg-pink-500/10 transition-all duration-300"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Sequence Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        <AnimatePresence mode="wait">
          {/* Step 1: Subtle Soundwave / Ambient Pulse */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              className="flex items-center justify-center gap-1.5 h-16"
            >
              {[24, 48, 32, 64, 40, 20, 56, 36].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [h * 0.3, h, h * 0.4],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                  className="w-1 rounded-full bg-gradient-to-t from-pink-500 to-cyan-400"
                />
              ))}
            </motion.div>
          )}

          {/* Step 2: "ROCKSTAR GAMES PRESENTS" */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, letterSpacing: '0.25em', y: 10 }}
              animate={{ opacity: 1, letterSpacing: '0.45em', y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.8 } }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs md:text-sm font-semibold tracking-[0.45em] uppercase text-slate-300/90"
            >
              Rockstar Games Presents
            </motion.div>
          )}

          {/* Step 3: Main Title "GRAND THEFT AUTO VI" with zoom and neon glow */}
          {step >= 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Neon Glow Aura */}
              <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/20 via-purple-600/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-[0_0_35px_rgba(255,79,163,0.4)]">
                Grand Theft Auto{' '}
                <span className="gta-gradient-text not-italic">VI</span>
              </h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{
                  opacity: step >= 4 ? 1 : 0,
                  y: step >= 4 ? 0 : 15,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-sm md:text-base font-semibold tracking-[0.35em] text-pink-300/80 uppercase pt-2"
              >
                The wait is almost over.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Atmospheric Skyline Silhouette during intro */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: step >= 3 ? 0.35 : 0, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
      >
        <div className="w-full h-full bg-gradient-to-t from-pink-500/10 via-purple-900/10 to-transparent" />
      </motion.div>
    </motion.div>
  );
};
