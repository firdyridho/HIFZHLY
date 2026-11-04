/**
 * Web Audio API synthesizer for acoustic 'deng' error alert.
 * Generates a warm, resonant, deep bass chime (similar to a cinematic/Netflix intro 'deng' thud)
 * rather than a harsh high-pitch chime, ensuring khusyu' and comfort during murojaah.
 */
export function playDengSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Deep fundamental tone (115Hz decaying to 55Hz)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(115, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.85);

    // Warm resonant overtone (triangle wave for analog warmth)
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(165, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.55);

    // Smooth envelope with subtle punch and exponential decay
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.85);
    osc2.stop(ctx.currentTime + 0.85);

    // Haptic vibration feedback on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(90);
    }
  } catch (e) {
    console.warn('Chime sound warning:', e);
  }
}

// Backward compatibility alias
export const playTengChime = playDengSound;

/**
 * Web Audio API synthesizer for pleasant, affirmative Islamic acoustic harmonic chime.
 * Used when user selects correct answer or achieves milestone in Tajwid Academy.
 */
export function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pentatonic ascending chime notes: E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz)
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
  } catch (e) {
    console.warn('Success chime warning:', e);
  }
}

/**
 * Subtle soft acoustic tap tone for UI feedback during quiz stepper.
 */
export function playClickTone() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Click tone warning:', e);
  }
}

/**
 * Celebration harmonic chime for 100% / high score completion.
 */
export function playCelebrationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Majestically tuned chord (C# minor pentatonic shimmer)
    const freqs = [554.37, 659.25, 830.61, 987.77, 1108.73];
    freqs.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 80, 100, 150]);
    }
  } catch (e) {
    console.warn('Celebration chime warning:', e);
  }
}
