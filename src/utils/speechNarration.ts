/**
 * Cheerful, Highly Natural Voiceover Engine for Elementary School Audiovisual Encyclopedia
 * Features dedicated voices for:
 * 1. Suara Anak Perempuan SD (Ceria, Ramah, Nada Terang)
 * 2. Suara Anak Laki-Laki SD (Semangat, Bersahabat, Nada Ceria)
 * 3. Suara Guru Ramah / Pemandu Ceria (Hangat, Lembut, Mengedukasi)
 */

import { andeanAudio } from './andeanAudio';
import { VoicePersona } from '../types/encyclopedia';

class NarrationEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isEnabled: boolean = true;
  private language: 'id' | 'en' = 'en';
  private persona: VoicePersona = 'anak-perempuan'; // default cheerful elementary school girl
  private speechSpeedMultiplier: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onStatusChangeCallback: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      this.voices = v;
    }
    this.resolveVoice();
  }

  public setOnStatusChange(cb: (speaking: boolean) => void) {
    this.onStatusChangeCallback = cb;
  }

  public setLanguage(lang: 'id' | 'en') {
    this.language = lang;
    this.loadVoices();
  }

  public setPersona(persona: VoicePersona) {
    this.persona = persona;
    this.loadVoices();
  }

  public getLanguage(): 'id' | 'en' {
    return this.language;
  }

  public getPersona(): VoicePersona {
    return this.persona;
  }

  public setSpeedMultiplier(mult: number) {
    this.speechSpeedMultiplier = mult;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Intelligently selects the best matching vocal profile for the selected child/teacher persona
   */
  private resolveVoice() {
    this.selectedVoice = null;
    if (this.voices.length === 0) return;

    if (this.language === 'id') {
      const idVoices = this.voices.filter((v) => v.lang.startsWith('id') || v.lang.startsWith('ms'));
      if (idVoices.length === 0) {
        this.selectedVoice = null;
        return;
      }
      const fallbackFemale = idVoices.find((v) => /female|gadis|zira|samantha|jenny|victoria/i.test(v.name));
      const fallbackMale = idVoices.find((v) => /male|ardi|david|george|mark|guy/i.test(v.name));

      if (this.persona === 'anak-perempuan') {
        this.selectedVoice =
          idVoices.find((v) => /gadis|female|cewek|perempuan|standard-a/i.test(v.name)) ||
          idVoices.find((v) => !/male|ardi|pria/i.test(v.name)) ||
          fallbackFemale ||
          idVoices[0] ||
          null;
      } else if (this.persona === 'anak-laki-laki') {
        this.selectedVoice =
          idVoices.find((v) => /ardi|male|cowok|laki|pria|standard-b/i.test(v.name)) ||
          fallbackMale ||
          idVoices.find((v) => /google/i.test(v.name)) ||
          idVoices[0] ||
          null;
      } else {
        // guru-ramah
        this.selectedVoice =
          idVoices.find((v) => /indonesian|standard|google/i.test(v.name)) ||
          idVoices[0] ||
          null;
      }
    } else {
      const enVoices = this.voices.filter((v) => v.lang.startsWith('en'));
      if (enVoices.length === 0) {
        this.selectedVoice = null;
        return;
      }
      if (this.persona === 'anak-perempuan') {
        this.selectedVoice =
          enVoices.find((v) => /jenny|samantha|zira|victoria|karen|female/i.test(v.name)) ||
          enVoices.find((v) => !/male|guy|david|george/i.test(v.name)) ||
          enVoices[0] ||
          null;
      } else if (this.persona === 'anak-laki-laki') {
        this.selectedVoice =
          enVoices.find((v) => /guy|george|david|mark|male/i.test(v.name)) ||
          enVoices.find((v) => /google us english/i.test(v.name)) ||
          enVoices[0] ||
          null;
      } else {
        // guru-ramah
        this.selectedVoice =
          enVoices.find((v) => /aria|natural|standard|google/i.test(v.name)) ||
          enVoices[0] ||
          null;
      }
    }
  }

  /**
   * Distinct Web Audio acoustic signature to immediately differentiate vocal persona
   */
  public playPersonaChime(persona: VoicePersona) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      if (persona === 'anak-perempuan') {
        // High, bright double glockenspiel chime (E6: 1318Hz, G6: 1568Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1318, now);
        osc1.frequency.exponentialRampToValueAtTime(1568, now + 0.15);
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);
      } else if (persona === 'anak-laki-laki') {
        // Energetic bright brassy triple bounce (C5: 523Hz -> E5: 659Hz -> G5: 784Hz)
        [523, 659, 784].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } else {
        // Calm warm singing bowl harmonic for educator (A4: 440Hz with warm envelope)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Audio context error ignored
    }
  }

  /**
   * Speak continuous factual narrative with cheerful, lively prosody
   */
  public speakText(text: string, onEnd?: () => void) {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    if (!text || text.trim().length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.loadVoices();
    this.resolveVoice();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.lang = this.language === 'id' ? 'id-ID' : 'en-US';

      // DRAMATICALLY DIFFERENT PROSODY FOR EACH PERSONA:
      if (this.persona === 'anak-perempuan') {
        // 👧 Anak Perempuan: Bright, high-pitch, joyful, cheerful primary school girl
        utterance.pitch = 1.48; // Very bright, high child pitch
        utterance.rate = 1.08 * this.speechSpeedMultiplier; // Cheerful, bouncy cadence
      } else if (this.persona === 'anak-laki-laki') {
        // 👦 Anak Laki-Laki: Energetic, enthusiastic, spirited boy
        // If the selected voice is male, pitch 1.15 produces a crisp youthful boy timbre;
        // If selected voice is female fallback, pitch 0.88 shifts timbre down to boyish resonance
        const isMaleVoice = this.selectedVoice && /male|ardi|david|george|guy|mark/i.test(this.selectedVoice.name);
        utterance.pitch = isMaleVoice ? 1.18 : 0.88;
        utterance.rate = 1.14 * this.speechSpeedMultiplier; // Fast, enthusiastic boy tempo
      } else {
        // 👩‍🏫 Guru Ramah: Calm, warm, clear, articulated pedagogical cadence
        utterance.pitch = 0.96; // Calm mature warm tone
        utterance.rate = 0.88 * this.speechSpeedMultiplier; // Measured pedagogical speed
      }

      utterance.volume = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        andeanAudio.duckMusic(true);
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        andeanAudio.duckMusic(false);
        this.currentUtterance = null;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        andeanAudio.duckMusic(false);
        this.currentUtterance = null;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      andeanAudio.duckMusic(false);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    andeanAudio.duckMusic(false);
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const narrationEngine = new NarrationEngine();
