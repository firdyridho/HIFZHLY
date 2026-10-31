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
