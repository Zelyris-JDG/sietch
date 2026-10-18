/**
 * Ambiance sonore générée en direct (Web Audio API) : une nappe grave, un souffle de vent qui suit la vitesse
 * de défilement, un grondement profond (long-courrier, ver). Aucun fichier audio. Jamais créée avant un geste.
 */
export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private rumbleGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  running = false;

  private noiseBuffer(kind: "white" | "brown"): AudioBuffer {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w;
      else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return buf;
  }

  async start(): Promise<void> {
    if (this.running) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      const ctx = new Ctx();
      this.ctx = ctx;
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      this.master = master;

      // Nappe grave : deux oscillateurs légèrement désaccordés, filtrés, qui respirent lentement.
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.16;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 180;
      lp.Q.value = 0.8;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 70;
      lfo.connect(lfoGain).connect(lp.frequency);
      for (const f of [55, 55.4, 82.4]) {
        const o = ctx.createOscillator();
        o.type = f > 60 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = f > 60 ? 0.35 : 0.6;
        o.connect(g).connect(lp);
        o.start();
        this.nodes.push(o);
      }
      lfo.start();
      lp.connect(droneGain).connect(master);
      this.droneGain = droneGain;
      this.nodes.push(lfo);

      // Vent : bruit blanc filtré, dont l'ouverture et le niveau suivent la vitesse de défilement.
      const wind = ctx.createBufferSource();
      wind.buffer = this.noiseBuffer("white");
      wind.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 420;
      bp.Q.value = 0.9;
      const windGain = ctx.createGain();
      windGain.gain.value = 0;
      const wlfo = ctx.createOscillator();
      wlfo.frequency.value = 0.21;
      const wlfoGain = ctx.createGain();
      wlfoGain.gain.value = 160;
      wlfo.connect(wlfoGain).connect(bp.frequency);
      wlfo.start();
      wind.connect(bp).connect(windGain).connect(master);
      wind.start();
      this.windGain = windGain;
      this.windFilter = bp;
      this.nodes.push(wind, wlfo);

      // Grondement : bruit brun très filtré.
      const rumble = ctx.createBufferSource();
      rumble.buffer = this.noiseBuffer("brown");
      rumble.loop = true;
      const rlp = ctx.createBiquadFilter();
      rlp.type = "lowpass";
      rlp.frequency.value = 70;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0;
      rumble.connect(rlp).connect(rumbleGain).connect(master);
      rumble.start();
      this.rumbleGain = rumbleGain;
      this.nodes.push(rumble);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(t);
    this.master!.gain.setValueAtTime(this.master!.gain.value, t);
    this.master!.gain.linearRampToValueAtTime(0.9, t + 2.2);
    this.running = true;
  }

  stop(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + 0.9);
    this.running = false;
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (!this.running && ctx.state === "running") void ctx.suspend();
    }, 1000);
  }

  /** v : 0 → 1, vitesse de défilement normalisée. */
  setWind(v: number): void {
    if (!this.ctx || !this.windGain || !this.windFilter || !this.running) return;
    const t = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(0.03 + v * 0.26, t, 0.12);
    this.windFilter.frequency.setTargetAtTime(380 + v * 1100, t, 0.18);
  }

  /** v : 0 → 1, présence du long-courrier ou du ver. */
  setRumble(v: number): void {
    if (!this.ctx || !this.rumbleGain || !this.running) return;
    this.rumbleGain.gain.setTargetAtTime(v * 0.8, this.ctx.currentTime, 0.35);
  }

  /** Teinte prescience : la nappe monte d'une quinte, plus douce. */
  setPrescience(on: boolean): void {
    if (!this.ctx || !this.droneGain || !this.running) return;
    this.droneGain.gain.setTargetAtTime(on ? 0.1 : 0.16, this.ctx.currentTime, 0.5);
  }
}

export const ambience = new Ambience();
