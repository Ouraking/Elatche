/**
 * Completion cue: a pure 880Hz sine with a fast attack and ~0.9s exponential
 * decay, synthesized on the fly with the Web Audio API. No assets, no deps.
 */
/* ---------- Ambient sound engine: looping brown noise, fully synthesized ---------- */

interface AmbientEngine {
  ctx: AudioContext;
  gain: GainNode;
}

let ambient: AmbientEngine | null = null;

export const isAmbientOn = (): boolean => ambient !== null;

/** Toggle the ambient deep-noise bed. Returns the new on/off state. */
export function toggleAmbient(): boolean {
  if (ambient) {
    const { ctx, gain } = ambient;
    ambient = null;
    try {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => void ctx.close(), 700);
    } catch {
      void ctx.close();
    }
    return false;
  }
  try {
    type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();

    // 4s of brown noise (integrated white noise), looped seamlessly
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 1.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    ambient = { ctx, gain };
    return true;
  } catch {
    return false;
  }
}

export function playCompletionTone(): void {
  try {
    type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    osc.start();
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // Audio blocked or unsupported — stay silent rather than fail.
  }
}
