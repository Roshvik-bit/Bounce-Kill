/**
 * ==============================================================================
 * Bounce Kill - Procedural Audio Synthesizer (SoundManager.js)
 * High-performance Web Audio API sound generator.
 * Features:
 * - Low-pass filter time dilation & pitch-bending for Focus Bullet Time mode
 * - Procedural synthesized gunshots, ricochets, duds, damage, and tactical slides
 * - Zero external audio files required: runs instantly in any modern browser!
 * ==============================================================================
 */

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
        this.focusFilter = null;
        this.currentTimeScale = 1.0;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                    this._initMasterChain();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        } catch (e) {
            console.warn('[SoundManager] Audio initialization error:', e);
        }
    }

    _initMasterChain() {
        if (!this.ctx) return;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        this.focusFilter = this.ctx.createBiquadFilter();
        this.focusFilter.type = 'lowpass';
        this.focusFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
        this.focusFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        this.masterGain.connect(this.focusFilter);
        this.focusFilter.connect(this.ctx.destination);
    }

    _output() {
        if (this.masterGain) return this.masterGain;
        return this.ctx ? this.ctx.destination : null;
    }

    /**
     * Dilates the master audio graph with a low-pass filter:
     * Dips from 20000Hz (crystal clear) down to 520Hz (deep, muffled slow-mo bass).
     */
    setFocusDilation(timeScale) {
        this.currentTimeScale = timeScale;
        if (!this.ctx || !this.focusFilter) return;
        const clampedScale = Math.max(0.2, Math.min(1.0, timeScale));
        const targetFreq = 520 + Math.pow(clampedScale, 2.2) * 19480;
        this.focusFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.04);
    }

    playFocusEnter() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.38);

        gain.gain.setValueAtTime(0.42, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.4);
    }

    playFocusExit() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.25);
    }

    playShoot() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const pitchMul = (this.currentTimeScale < 0.95) ? (0.65 + 0.35 * this.currentTimeScale) : 1.0;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880 * pitchMul, t);
        osc.frequency.exponentialRampToValueAtTime(120 * pitchMul, t + 0.12);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.15);
    }

    /**
     * Pitch and harmonics scale dynamically with each bounce tier!
     * Tier 1 (1 bounce): Sharp metallic ping
     * Tier 2 (2 bounces): Resonant amber harmonic ping
     * Tier 3+ (3+ bounces): Supersonic singularity shockwave chime
     */
    playRicochet(bounces = 1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.7 + 0.3 * this.currentTimeScale) : 1.0;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (bounces <= 1) {
            const baseFreq = 950 * pitchMul;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.22);
            gain.gain.setValueAtTime(0.38, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
        } else if (bounces === 2) {
            const baseFreq = 1450 * pitchMul;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.3);
            gain.gain.setValueAtTime(0.44, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        } else {
            const baseFreq = 2200 * pitchMul;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, t + 0.38);
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        }

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.4);
    }

    /**
     * Dull, low-frequency deflection "dud" thud when direct shot hits enemy.
     */
    playDeflect() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.18);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.2);
    }

    /**
     * Heavy bass impact with noise punch for lethal ricochet kills.
     * Scales in bass weight and resonance based on bounce count.
     */
    playLethalHit(bounces = 1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';

        const baseFreq = Math.max(65, 240 - bounces * 35);
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

        const volume = Math.min(0.65, 0.42 + bounces * 0.08);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.38);
    }

    playRankUp() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = t + idx * 0.055;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.2, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(noteStart);
            osc.stop(noteStart + 0.2);
        });
    }

    playPlayerDamage() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(45, t + 0.25);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.25);
    }

    playReload() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.setValueAtTime(800, t + 0.1);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.22);
    }

    playSlide() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + 0.45);
        filter.Q.setValueAtTime(3.0, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._output());

        noise.start(t);
        noise.stop(t + 0.45);
    }

    /**
     * Procedural Glass Shatter Sound:
     * Highpass noise snap burst + cascading crystalline resonant tinkles.
     */
    playGlassShatter() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.68 + 0.32 * this.currentTimeScale) : 1.0;

        // 1. Initial sharp impact / glass fracture snap (white noise with highpass filter)
        const snapLen = Math.floor(this.ctx.sampleRate * 0.28);
        const snapBuffer = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
        const snapData = snapBuffer.getChannelData(0);
        for (let i = 0; i < snapLen; i++) {
            snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.22));
        }
        const snapSource = this.ctx.createBufferSource();
        snapSource.buffer = snapBuffer;

        const hpFilter = this.ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(3200 * pitchMul, t);

        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.55, t);
        snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

        snapSource.connect(hpFilter);
        hpFilter.connect(snapGain);
        snapGain.connect(this._output());

        snapSource.start(t);
        snapSource.stop(t + 0.28);

        // 2. Cascading crystalline shards tinkling
        const frequencies = [2800, 3600, 4400, 5200];
        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = t + 0.02 + idx * 0.038;
            const dur = 0.22 + Math.random() * 0.12;

            osc.type = 'sine';
            const f = freq * pitchMul * (0.9 + Math.random() * 0.2);
            osc.frequency.setValueAtTime(f, noteStart);
            osc.frequency.exponentialRampToValueAtTime(f * 0.6, noteStart + dur);

            gain.gain.setValueAtTime(0.18, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(noteStart);
            osc.stop(noteStart + dur);
        });
    }

    /**
     * Procedural Industrial Grate / Mesh Impact Sound:
     * Resonant hollow dual metallic ping + high-friction metal wire buzz.
     */
    playGrateImpact() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.7 + 0.3 * this.currentTimeScale) : 1.0;

        // 1. Dual detuned hollow metal oscillators (metallic resonance)
        const tones = [580 * pitchMul, 860 * pitchMul];
        tones.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = idx === 0 ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.42, t + 0.2);

            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(t);
            osc.stop(t + 0.22);
        });

        // 2. Friction buzz across wire mesh (bandpass noise)
        const buzzLen = Math.floor(this.ctx.sampleRate * 0.18);
        const buzzBuffer = this.ctx.createBuffer(1, buzzLen, this.ctx.sampleRate);
        const buzzData = buzzBuffer.getChannelData(0);
        for (let i = 0; i < buzzLen; i++) {
            buzzData[i] = Math.random() * 2 - 1;
        }
        const buzzSource = this.ctx.createBufferSource();
        buzzSource.buffer = buzzBuffer;

        const bpFilter = this.ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(1450 * pitchMul, t);
        bpFilter.Q.setValueAtTime(4.5, t);

        const buzzGain = this.ctx.createGain();
        buzzGain.gain.setValueAtTime(0.28, t);
        buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        buzzSource.connect(bpFilter);
        bpFilter.connect(buzzGain);
        buzzGain.connect(this._output());

        buzzSource.start(t);
        buzzSource.stop(t + 0.18);
    }
}
