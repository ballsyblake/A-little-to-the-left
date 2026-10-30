// Synthesised sound with the Web Audio API: no audio files.
// Graph per note: OscillatorNode -> GainNode (volume envelope) -> master -> speakers.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/** Lazily create the context. Browsers start it "suspended" until a gesture. */
function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC() as AudioContext;
    } catch {
      return null; // audio unavailable: the game stays silent, nothing breaks
    }
    master = ctx.createGain();
    master.gain.value = 0.35; // keep everything soft
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, out: master! };
}

/** Call once at startup: the first touch anywhere unlocks audio. */
export function unlockAudioOnFirstGesture(): void {
  window.addEventListener('pointerdown', () => audio(), { once: true });
}

/** One bell-like note: quick attack, long exponential fade. */
function bell(freq: number, start: number, a: { ctx: AudioContext; out: GainNode }): void {
  const osc = a.ctx.createOscillator();
  const gain = a.ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);  // attack
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6); // ring out
  osc.connect(gain).connect(a.out);
  osc.start(start);
  osc.stop(start + 1.7);
}

/** Win chime: a gentle rising arpeggio (C major: C5 E5 G5 C6). */
export function chime(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime + 0.02;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, t + i * 0.11, a));
}

/** Wind: one second of noise through a band-pass filter, swelling and fading. */
export function whoosh(): void {
  const a = audio();
  if (!a) return;
  const { ctx: c } = a;
  const len = c.sampleRate * 1.2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.8;
  const gain = c.createGain();

  const t = c.currentTime;
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.linearRampToValueAtTime(900, t + 0.6); // rising "shh"
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

  src.connect(filter).connect(gain).connect(a.out);
  src.start(t);
}
