/**
 * Web Audio API synthwave ambient soundscape for GTA VI Cinematic Experience.
 * Synthesizes warm analog synth pad and subtle sub-bass pulse with zero external file dependencies.
 */

class SynthwaveAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.oscillators = [];

    // Master gain with smooth fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3);

    // Warm low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.masterGain.connect(filter);
    filter.connect(this.ctx.destination);

    // Cinematic chord notes (F minor / Vice City vibe: F2, C3, Eb3, Ab3)
    const frequencies = [87.31, 130.81, 155.56, 207.65];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for lush chorus effect
      osc.detune.setValueAtTime((idx - 1.5) * 8, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.12 / frequencies.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start();
      this.oscillators.push(osc);
    });
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    
    // Smooth fade out
    this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 850);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new SynthwaveAudioEngine();
