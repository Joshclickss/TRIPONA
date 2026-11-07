// Cinematic ambient soundscape generator using Web Audio API
// Produces a warm, ethereal cinematic travel drone with subtle harmonic resonance.

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.oscillators = [];
    this.isPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
  }

  play() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop existing oscillators if any
    this.stopOscillators();

    // Notes: C3, G3, C4, E4, G4 (Warm travel ambient harmony)
    const freqs = [130.81, 196.00, 261.63, 329.63, 392.00];

    // Filter for warm cinematic analog feeling
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.connect(this.gainNode);

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx.currentTime);
      
      // Gentle subtle detuning
      oscGain.gain.setValueAtTime(0.08 / freqs.length, this.ctx.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start();
      this.oscillators.push(osc);
    });

    // Smooth fade in over 1.5 seconds
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 1.5);
    this.isPlaying = true;
  }

  pause() {
    if (!this.ctx || !this.isPlaying) return;
    // Smooth fade out over 1.0 seconds
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
    setTimeout(() => {
      this.stopOscillators();
      this.isPlaying = false;
    }, 1000);
  }

  stopOscillators() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];
  }
}

export const ambientSound = new AmbientSoundEngine();
