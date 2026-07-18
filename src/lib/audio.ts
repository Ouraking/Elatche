/**
 * Fully-synthesized audio — no assets, no deps. A completion cue plus a set of
 * ambient soundscapes for the Focus environment, all generated on the fly with
 * the Web Audio API.
 */

type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** The ambient beds available in the Focus environment. */
export type Soundscape = 'brown' | 'rain' | 'warm';

interface AmbientEngine {
  kind: Soundscape;
  ctx: AudioContext;
  gain: GainNode;
  nodes: AudioScheduledSourceNode[];
}

let ambient: AmbientEngine | null = null;

export const currentAmbient = (): Soundscape | null => (ambient ? ambient.kind : null);
export const isAmbientOn = (): boolean => ambient !== null;

/** A looping noise buffer — integrated (brown) for warmth, or flat white. */
function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (brown) {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  } else {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Build a soundscape engine: pick a noise source + filter chain + target gain. */
function makeAmbient(kind: Soundscape): AmbientEngine | null {
  const Ctx = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.connect(ctx.destination);

  const nodes: AudioScheduledSourceNode[] = [];
  const source = ctx.createBufferSource();
  source.loop = true;

  let target = 0.13;

  if (kind === 'brown') {
    // Deep, enveloping low rumble — the original focus bed.
    source.buffer = noiseBuffer(ctx, 4, true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    source.connect(lp).connect(gain);
    target = 0.14;
  } else if (kind === 'warm') {
    // A brighter, airier bed — brown noise with more presence.
    source.buffer = noiseBuffer(ctx, 4, true);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 140;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 920;
    source.connect(hp).connect(lp).connect(gain);
    target = 0.12;
  } else {
    // Rainfall — band-limited white noise with slow "gusts" modulating the
    // cutoff so it breathes instead of sitting as flat static.
    source.buffer = noiseBuffer(ctx, 4, false);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 450;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6600;
    source.connect(hp).connect(lp).connect(gain);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 1900;
    lfo.connect(lfoDepth).connect(lp.frequency);
    lfo.start();
    nodes.push(lfo);
    target = 0.055;
  }

  source.start();
  nodes.push(source);
  gain.gain.exponentialRampToValueAtTime(target, ctx.currentTime + 1.2);

  return { kind, ctx, gain, nodes };
}

/** Fade out and tear down the current ambient engine, if any. */
function stopAmbient(): void {
  if (!ambient) return;
  const { ctx, gain, nodes } = ambient;
  ambient = null;
  try {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
      void ctx.close();
    }, 650);
  } catch {
    void ctx.close();
  }
}

/**
 * Set the active soundscape. Passing the currently-playing kind (or null)
 * turns ambience off; passing a different kind cross-fades to it. Returns the
 * soundscape now playing, or null if off / unsupported.
 */
export function setAmbient(kind: Soundscape | null): Soundscape | null {
  const prev = ambient ? ambient.kind : null;
  stopAmbient();
  if (kind === null || kind === prev) return null;
  try {
    ambient = makeAmbient(kind);
  } catch {
    ambient = null;
  }
  return ambient ? ambient.kind : null;
}

/** Convenience toggle for the command palette: the default bed on/off. */
export function toggleAmbient(): boolean {
  return setAmbient(currentAmbient() ? null : 'brown') !== null;
}

export function playCompletionTone(): void {
  try {
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
