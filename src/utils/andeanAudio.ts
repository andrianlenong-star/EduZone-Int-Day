/**
 * Cultural Background Music & Soundscape Synthesizer via Web Audio API
 * Generates authentic regional melodies and soundscapes for:
 * - Peru: Andean Zampoña Panpipe & Charango with Bombo Drum
 * - Argentina: Argentine Tango Bandoneón bellows & Criolla Guitar staccato
 * - Colombia (Kolombia): Cumbia & Vallenato syncopated Accordion & Guacharaca
 * - Brazil: Bossa Nova & Samba warm chords with Batucada pulse
 * - Indonesia: Slendro & Pelog Gamelan bronze chimes & Gong Ageng
 * - Japan: In-sen Koto harp plucks & Shakuhachi bamboo flute
 * - Egypt / Middle East: Maqam Bayati Oud plucks & Darbuka rhythm
 * - Global / Others: Harmonious acoustic world music
 * Zero external audio CDN dependencies - 100% resilient procedural Web Audio API.
 */

export type CulturalRegion =
  | 'peru'
  | 'argentina'
  | 'kolombia'
  | 'brasil'
  | 'indonesia'
  | 'jepang'
  | 'mesir'
  | 'india'
  | 'china'
  | 'korea'
  | 'malaysia'
  | 'vietnam'
  | 'filipina'
  | 'thailand'
  | 'italia'
  | 'jerman'
  | 'belanda'
  | 'prancis'
  | 'inggris'
  | 'spanyol'
  | 'rusia'
  | 'portugal'
  | 'usa'
  | 'texas'
  | 'canada'
  | 'mexiko'
  | 'global';

interface NoteStep {
  freq: number | null;
  duration: number;
  instrument: 'flute' | 'reed' | 'pluck' | 'gamelan' | 'percussion' | 'rest';
  accent?: boolean;
}

class CulturalAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private musicVolume: number = 0.35;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private timerId: number | null = null;
  private stepIndex: number = 0;
  private isDucked: boolean = false;
  private currentRegion: CulturalRegion = 'peru';

  // Scales in Hz
  // 1. Peru (Andean Minor Pentatonic: A3, C4, D4, E4, G4, A4, C5, D5, E5)
  private readonly ANDEAN_SCALE: NoteStep[] = [
    { freq: 329.63, duration: 0.8, instrument: 'flute' }, // E4
    { freq: 392.00, duration: 0.6, instrument: 'flute' }, // G4
    { freq: 440.00, duration: 1.2, instrument: 'flute', accent: true }, // A4
    { freq: 523.25, duration: 0.8, instrument: 'pluck' }, // C5
    { freq: 440.00, duration: 0.6, instrument: 'flute' }, // A4
    { freq: 392.00, duration: 1.0, instrument: 'flute' }, // G4
    { freq: 329.63, duration: 1.4, instrument: 'flute', accent: true }, // E4
    { freq: null, duration: 0.4, instrument: 'rest' },
    { freq: 293.66, duration: 0.6, instrument: 'flute' }, // D4
    { freq: 329.63, duration: 0.8, instrument: 'flute' }, // E4
    { freq: 392.00, duration: 1.0, instrument: 'pluck' }, // G4
    { freq: 261.63, duration: 1.4, instrument: 'flute' }, // C4
    { freq: 220.00, duration: 1.8, instrument: 'flute', accent: true }, // A3
    { freq: null, duration: 0.5, instrument: 'rest' },
  ];

  // 2. Argentina (Tango / Milonga - D Minor / A Harmonic Minor with Bandoneon staccato)
  private readonly TANGO_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.4, instrument: 'reed', accent: true }, // D4
    { freq: 329.63, duration: 0.4, instrument: 'reed' }, // E4
    { freq: 349.23, duration: 0.4, instrument: 'reed' }, // F4
    { freq: 440.00, duration: 0.6, instrument: 'reed', accent: true }, // A4
    { freq: 493.88, duration: 0.3, instrument: 'pluck' }, // Bb4 (466.16)
    { freq: 554.37, duration: 0.7, instrument: 'reed', accent: true }, // C#5 (Sensible note)
    { freq: 587.33, duration: 1.1, instrument: 'reed' }, // D5
    { freq: null, duration: 0.3, instrument: 'rest' },
    { freq: 440.00, duration: 0.4, instrument: 'reed', accent: true }, // A4
    { freq: 370.00, duration: 0.4, instrument: 'reed' }, // F#4 / F4
    { freq: 349.23, duration: 0.5, instrument: 'pluck' }, // F4
    { freq: 329.63, duration: 0.5, instrument: 'reed' }, // E4
    { freq: 293.66, duration: 1.4, instrument: 'reed', accent: true }, // D4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 3. Colombia (Cumbia & Vallenato - Bright syncopated Accordion in G/C Major)
  private readonly CUMBIA_SCALE: NoteStep[] = [
    { freq: 392.00, duration: 0.3, instrument: 'reed', accent: true }, // G4
    { freq: 440.00, duration: 0.3, instrument: 'reed' }, // A4
    { freq: 493.88, duration: 0.3, instrument: 'reed' }, // B4
    { freq: 523.25, duration: 0.5, instrument: 'reed', accent: true }, // C5
    { freq: 587.33, duration: 0.3, instrument: 'pluck' }, // D5
    { freq: 659.25, duration: 0.4, instrument: 'reed' }, // E5
    { freq: 587.33, duration: 0.3, instrument: 'reed' }, // D5
    { freq: 523.25, duration: 0.6, instrument: 'reed', accent: true }, // C5
    { freq: null, duration: 0.25, instrument: 'rest' },
    { freq: 392.00, duration: 0.35, instrument: 'pluck' }, // G4
    { freq: 440.00, duration: 0.35, instrument: 'reed' }, // A4
    { freq: 329.63, duration: 0.8, instrument: 'reed', accent: true }, // E4
    { freq: 261.63, duration: 1.2, instrument: 'reed' }, // C4
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 4. Brazil (Bossa Nova / Samba - Warm guitar chords & syncopation)
  private readonly SAMBA_SCALE: NoteStep[] = [
    { freq: 349.23, duration: 0.5, instrument: 'pluck', accent: true }, // F4
    { freq: 440.00, duration: 0.4, instrument: 'pluck' }, // A4
    { freq: 523.25, duration: 0.6, instrument: 'pluck' }, // C5
    { freq: 587.33, duration: 0.5, instrument: 'flute', accent: true }, // D5
    { freq: 523.25, duration: 0.4, instrument: 'pluck' }, // C5
    { freq: 440.00, duration: 0.7, instrument: 'pluck' }, // A4
    { freq: 392.00, duration: 0.9, instrument: 'flute' }, // G4
    { freq: null, duration: 0.3, instrument: 'rest' },
    { freq: 329.63, duration: 0.45, instrument: 'pluck' }, // E4
    { freq: 349.23, duration: 0.45, instrument: 'pluck' }, // F4
    { freq: 440.00, duration: 1.2, instrument: 'pluck', accent: true }, // A4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 5. Indonesia (Gamelan Slendro / Pelog Pentatonic chime bells)
  private readonly GAMELAN_SCALE: NoteStep[] = [
    { freq: 587.33, duration: 0.6, instrument: 'gamelan', accent: true }, // D5
    { freq: 659.25, duration: 0.5, instrument: 'gamelan' }, // E5
    { freq: 783.99, duration: 0.7, instrument: 'gamelan', accent: true }, // G5
    { freq: 880.00, duration: 0.6, instrument: 'gamelan' }, // A5
    { freq: 1046.5, duration: 1.0, instrument: 'gamelan', accent: true }, // C6
    { freq: 880.00, duration: 0.5, instrument: 'gamelan' }, // A5
    { freq: 783.99, duration: 0.8, instrument: 'gamelan' }, // G5
    { freq: 587.33, duration: 1.4, instrument: 'gamelan', accent: true }, // D5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 6. Japan (In-sen / Sakura traditional Koto harp & Shakuhachi)
  private readonly JAPAN_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.6, instrument: 'pluck', accent: true }, // D4
    { freq: 311.13, duration: 0.5, instrument: 'flute' }, // Eb4
    { freq: 392.00, duration: 0.8, instrument: 'pluck', accent: true }, // G4
    { freq: 440.00, duration: 0.6, instrument: 'flute' }, // A4
    { freq: 523.25, duration: 0.9, instrument: 'pluck' }, // C5
    { freq: 440.00, duration: 0.6, instrument: 'flute' }, // A4
    { freq: 392.00, duration: 1.1, instrument: 'pluck', accent: true }, // G4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 7. Egypt / Middle East (Maqam Bayati / Hijaz Oud & flute)
  private readonly ARABIC_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.6, instrument: 'pluck', accent: true }, // D4
    { freq: 311.13, duration: 0.4, instrument: 'pluck' }, // Eb4
    { freq: 369.99, duration: 0.8, instrument: 'flute', accent: true }, // F#4
    { freq: 392.00, duration: 0.5, instrument: 'pluck' }, // G4
    { freq: 440.00, duration: 0.7, instrument: 'pluck' }, // A4
    { freq: 466.16, duration: 0.5, instrument: 'flute' }, // Bb4
    { freq: 369.99, duration: 0.8, instrument: 'pluck' }, // F#4
    { freq: 293.66, duration: 1.4, instrument: 'flute', accent: true }, // D4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 8. India (Sitar Raga Bhairav / Bilawal & Bansuri Flute)
  private readonly INDIA_SCALE: NoteStep[] = [
    { freq: 261.63, duration: 0.6, instrument: 'pluck', accent: true }, // C4 Sa
    { freq: 277.18, duration: 0.4, instrument: 'flute' }, // Db4 Re
    { freq: 329.63, duration: 0.7, instrument: 'pluck', accent: true }, // E4 Ga
    { freq: 349.23, duration: 0.5, instrument: 'flute' }, // F4 Ma
    { freq: 392.00, duration: 0.8, instrument: 'pluck', accent: true }, // G4 Pa
    { freq: 415.30, duration: 0.5, instrument: 'flute' }, // Ab4 Dha
    { freq: 493.88, duration: 0.6, instrument: 'pluck' }, // B4 Ni
    { freq: 523.25, duration: 1.2, instrument: 'pluck', accent: true }, // C5 High Sa
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 9. China (Guzheng & Dizi Chinese Pentatonic)
  private readonly CHINA_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.5, instrument: 'pluck', accent: true }, // D4
    { freq: 329.63, duration: 0.5, instrument: 'flute' }, // E4
    { freq: 392.00, duration: 0.6, instrument: 'pluck', accent: true }, // G4
    { freq: 440.00, duration: 0.6, instrument: 'flute' }, // A4
    { freq: 523.25, duration: 0.8, instrument: 'pluck', accent: true }, // C5
    { freq: 587.33, duration: 1.1, instrument: 'flute', accent: true }, // D5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 10. Spain (Flamenco Guitar Phrygian Cadence)
  private readonly SPAIN_SCALE: NoteStep[] = [
    { freq: 329.63, duration: 0.4, instrument: 'pluck', accent: true }, // E4
    { freq: 349.23, duration: 0.35, instrument: 'pluck' }, // F4
    { freq: 392.00, duration: 0.4, instrument: 'pluck' }, // G4
    { freq: 440.00, duration: 0.5, instrument: 'pluck', accent: true }, // A4
    { freq: 493.88, duration: 0.4, instrument: 'pluck' }, // B4
    { freq: 523.25, duration: 0.5, instrument: 'pluck' }, // C5
    { freq: 329.63, duration: 1.2, instrument: 'pluck', accent: true }, // E4
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 11. Mexico (Mariachi Vihuela & Trumpet Fanfare)
  private readonly MEXICO_SCALE: NoteStep[] = [
    { freq: 523.25, duration: 0.35, instrument: 'reed', accent: true }, // C5
    { freq: 659.25, duration: 0.35, instrument: 'reed' }, // E5
    { freq: 783.99, duration: 0.5, instrument: 'reed', accent: true }, // G5
    { freq: 1046.5, duration: 0.7, instrument: 'reed', accent: true }, // C6
    { freq: 987.77, duration: 0.35, instrument: 'pluck' }, // B5
    { freq: 880.00, duration: 0.4, instrument: 'pluck' }, // A5
    { freq: 783.99, duration: 1.1, instrument: 'pluck', accent: true }, // G5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 12. Texas (Western Honky-Tonk Acoustic Guitar)
  private readonly TEXAS_SCALE: NoteStep[] = [
    { freq: 392.00, duration: 0.4, instrument: 'pluck', accent: true }, // G4
    { freq: 493.88, duration: 0.4, instrument: 'pluck' }, // B4
    { freq: 587.33, duration: 0.5, instrument: 'pluck', accent: true }, // D5
    { freq: 698.46, duration: 0.35, instrument: 'pluck' }, // F5
    { freq: 659.25, duration: 0.45, instrument: 'pluck' }, // E5
    { freq: 587.33, duration: 0.6, instrument: 'pluck' }, // D5
    { freq: 392.00, duration: 1.2, instrument: 'pluck', accent: true }, // G4
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 13. Italy (Mandolin Tarantella in A Minor)
  private readonly ITALY_SCALE: NoteStep[] = [
    { freq: 440.00, duration: 0.3, instrument: 'pluck', accent: true }, // A4
    { freq: 523.25, duration: 0.3, instrument: 'pluck' }, // C5
    { freq: 659.25, duration: 0.4, instrument: 'pluck', accent: true }, // E5
    { freq: 587.33, duration: 0.3, instrument: 'pluck' }, // D5
    { freq: 523.25, duration: 0.3, instrument: 'pluck' }, // C5
    { freq: 493.88, duration: 0.3, instrument: 'pluck' }, // B4
    { freq: 440.00, duration: 0.9, instrument: 'pluck', accent: true }, // A4
    { freq: null, duration: 0.3, instrument: 'rest' },
  ];

  // 14. Russia (Balalaika & Bayan Folk Motif)
  private readonly RUSSIA_SCALE: NoteStep[] = [
    { freq: 587.33, duration: 0.35, instrument: 'pluck', accent: true }, // D5
    { freq: 659.25, duration: 0.35, instrument: 'pluck' }, // E5
    { freq: 698.46, duration: 0.35, instrument: 'pluck' }, // F5
    { freq: 880.00, duration: 0.5, instrument: 'pluck', accent: true }, // A5
    { freq: 783.99, duration: 0.35, instrument: 'reed' }, // G5
    { freq: 698.46, duration: 0.35, instrument: 'pluck' }, // F5
    { freq: 587.33, duration: 1.1, instrument: 'pluck', accent: true }, // D5
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 15. Germany (Bavarian Accordion Folk Waltz)
  private readonly GERMANY_SCALE: NoteStep[] = [
    { freq: 392.00, duration: 0.4, instrument: 'reed', accent: true }, // G4
    { freq: 493.88, duration: 0.4, instrument: 'reed' }, // B4
    { freq: 587.33, duration: 0.4, instrument: 'reed' }, // D5
    { freq: 783.99, duration: 0.6, instrument: 'reed', accent: true }, // G5
    { freq: 739.99, duration: 0.4, instrument: 'reed' }, // F#5
    { freq: 659.25, duration: 0.4, instrument: 'reed' }, // E5
    { freq: 587.33, duration: 1.1, instrument: 'reed', accent: true }, // D5
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 16. France (Musette Accordion Waltz)
  private readonly FRANCE_SCALE: NoteStep[] = [
    { freq: 440.00, duration: 0.35, instrument: 'reed', accent: true }, // A4
    { freq: 523.25, duration: 0.35, instrument: 'reed' }, // C5
    { freq: 659.25, duration: 0.5, instrument: 'reed', accent: true }, // E5
    { freq: 587.33, duration: 0.35, instrument: 'reed' }, // D5
    { freq: 523.25, duration: 0.35, instrument: 'reed' }, // C5
    { freq: 493.88, duration: 0.6, instrument: 'reed' }, // B4
    { freq: 440.00, duration: 1.2, instrument: 'reed', accent: true }, // A4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 17. Netherlands (Carillon Bells & Barrel Organ)
  private readonly NETHERLANDS_SCALE: NoteStep[] = [
    { freq: 523.25, duration: 0.5, instrument: 'gamelan', accent: true }, // C5
    { freq: 783.99, duration: 0.5, instrument: 'gamelan' }, // G5
    { freq: 880.00, duration: 0.6, instrument: 'gamelan', accent: true }, // A5
    { freq: 659.25, duration: 0.5, instrument: 'gamelan' }, // E5
    { freq: 698.46, duration: 0.5, instrument: 'gamelan' }, // F5
    { freq: 783.99, duration: 1.1, instrument: 'gamelan', accent: true }, // G5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 18. United Kingdom (Celtic Harp & Folk Flute)
  private readonly UK_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.6, instrument: 'flute', accent: true }, // D4
    { freq: 349.23, duration: 0.6, instrument: 'flute' }, // F4
    { freq: 392.00, duration: 0.7, instrument: 'flute', accent: true }, // G4
    { freq: 440.00, duration: 0.5, instrument: 'pluck' }, // A4
    { freq: 493.88, duration: 0.5, instrument: 'pluck' }, // B4
    { freq: 523.25, duration: 0.8, instrument: 'flute', accent: true }, // C5
    { freq: 440.00, duration: 1.4, instrument: 'flute', accent: true }, // A4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 19. Canada (Celtic Fiddle & Voyageur Folk Jig)
  private readonly CANADA_SCALE: NoteStep[] = [
    { freq: 392.00, duration: 0.35, instrument: 'pluck', accent: true }, // G4
    { freq: 440.00, duration: 0.35, instrument: 'pluck' }, // A4
    { freq: 493.88, duration: 0.35, instrument: 'pluck' }, // B4
    { freq: 523.25, duration: 0.5, instrument: 'flute', accent: true }, // C5
    { freq: 587.33, duration: 0.35, instrument: 'pluck' }, // D5
    { freq: 659.25, duration: 0.5, instrument: 'flute' }, // E5
    { freq: 783.99, duration: 1.1, instrument: 'pluck', accent: true }, // G5
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 20. Portugal (Fado Guitarra 12-String Plucks)
  private readonly PORTUGAL_SCALE: NoteStep[] = [
    { freq: 293.66, duration: 0.5, instrument: 'pluck', accent: true }, // D4
    { freq: 349.23, duration: 0.45, instrument: 'pluck' }, // F4
    { freq: 440.00, duration: 0.6, instrument: 'pluck', accent: true }, // A4
    { freq: 523.25, duration: 0.5, instrument: 'pluck' }, // C5
    { freq: 587.33, duration: 0.7, instrument: 'pluck', accent: true }, // D5
    { freq: 440.00, duration: 1.3, instrument: 'pluck', accent: true }, // A4
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 21. Korea (Arirang Gayageum & Daegum Flute)
  private readonly KOREA_SCALE: NoteStep[] = [
    { freq: 329.63, duration: 0.6, instrument: 'pluck', accent: true }, // E4
    { freq: 392.00, duration: 0.5, instrument: 'pluck' }, // G4
    { freq: 440.00, duration: 0.7, instrument: 'flute', accent: true }, // A4
    { freq: 493.88, duration: 0.6, instrument: 'pluck' }, // B4
    { freq: 587.33, duration: 0.8, instrument: 'pluck', accent: true }, // D5
    { freq: 659.25, duration: 1.2, instrument: 'flute', accent: true }, // E5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 22. USA (Bluegrass Banjo & Acoustic Guitar)
  private readonly USA_SCALE: NoteStep[] = [
    { freq: 261.63, duration: 0.35, instrument: 'pluck', accent: true }, // C4
    { freq: 329.63, duration: 0.35, instrument: 'pluck' }, // E4
    { freq: 392.00, duration: 0.4, instrument: 'pluck', accent: true }, // G4
    { freq: 440.00, duration: 0.35, instrument: 'pluck' }, // A4
    { freq: 523.25, duration: 0.6, instrument: 'pluck', accent: true }, // C5
    { freq: 392.00, duration: 0.5, instrument: 'pluck' }, // G4
    { freq: 261.63, duration: 1.1, instrument: 'pluck', accent: true }, // C4
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 23. Malaysia (Malay Gamelan & Inang Chimes)
  private readonly MALAYSIA_SCALE: NoteStep[] = [
    { freq: 587.33, duration: 0.5, instrument: 'gamelan', accent: true }, // D5
    { freq: 659.25, duration: 0.4, instrument: 'gamelan' }, // E5
    { freq: 739.99, duration: 0.5, instrument: 'gamelan', accent: true }, // F#5
    { freq: 880.00, duration: 0.6, instrument: 'gamelan' }, // A5
    { freq: 987.77, duration: 0.8, instrument: 'gamelan', accent: true }, // B5
    { freq: 587.33, duration: 1.2, instrument: 'gamelan', accent: true }, // D5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 24. Vietnam (Dan Tranh & Dan Bau Monochord)
  private readonly VIETNAM_SCALE: NoteStep[] = [
    { freq: 261.63, duration: 0.5, instrument: 'pluck', accent: true }, // C4
    { freq: 293.66, duration: 0.4, instrument: 'flute' }, // D4
    { freq: 349.23, duration: 0.6, instrument: 'pluck', accent: true }, // F4
    { freq: 392.00, duration: 0.5, instrument: 'flute' }, // G4
    { freq: 440.00, duration: 0.8, instrument: 'pluck' }, // A4
    { freq: 523.25, duration: 1.2, instrument: 'pluck', accent: true }, // C5
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  // 25. Philippines (Kulintang Gongs & Rondalla String)
  private readonly FILIPINA_SCALE: NoteStep[] = [
    { freq: 587.33, duration: 0.4, instrument: 'gamelan', accent: true }, // D5
    { freq: 739.99, duration: 0.4, instrument: 'gamelan' }, // F#5
    { freq: 880.00, duration: 0.5, instrument: 'pluck', accent: true }, // A5
    { freq: 987.77, duration: 0.4, instrument: 'pluck' }, // B5
    { freq: 1174.6, duration: 0.7, instrument: 'gamelan', accent: true }, // D6
    { freq: 880.00, duration: 1.0, instrument: 'pluck' }, // A5
    { freq: null, duration: 0.35, instrument: 'rest' },
  ];

  // 26. Thailand (Ranat Ek Xylophone & Khlui Flute)
  private readonly THAILAND_SCALE: NoteStep[] = [
    { freq: 523.25, duration: 0.4, instrument: 'gamelan', accent: true }, // C5
    { freq: 587.33, duration: 0.4, instrument: 'gamelan' }, // D5
    { freq: 659.25, duration: 0.5, instrument: 'flute', accent: true }, // E5
    { freq: 783.99, duration: 0.5, instrument: 'gamelan', accent: true }, // G5
    { freq: 880.00, duration: 0.6, instrument: 'flute' }, // A5
    { freq: 1046.5, duration: 1.0, instrument: 'gamelan', accent: true }, // C6
    { freq: null, duration: 0.4, instrument: 'rest' },
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Set active country/region and shift musical soundscape dynamically
   */
  public setCountry(countryName: string) {
    const norm = countryName.toLowerCase().trim();
    let nextRegion: CulturalRegion = 'peru';

    if (norm.includes('argentina')) {
      nextRegion = 'argentina';
    } else if (norm.includes('kolombia') || norm.includes('colombia')) {
      nextRegion = 'kolombia';
    } else if (norm.includes('brasil') || norm.includes('brazil')) {
      nextRegion = 'brasil';
    } else if (norm.includes('indonesia')) {
      nextRegion = 'indonesia';
    } else if (norm.includes('jepang') || norm.includes('japan')) {
      nextRegion = 'jepang';
    } else if (norm.includes('india')) {
      nextRegion = 'india';
    } else if (norm.includes('cina') || norm.includes('china') || norm.includes('tiongkok')) {
      nextRegion = 'china';
    } else if (norm.includes('korea')) {
      nextRegion = 'korea';
    } else if (norm.includes('malaysia')) {
      nextRegion = 'malaysia';
    } else if (norm.includes('vietnam')) {
      nextRegion = 'vietnam';
    } else if (norm.includes('filipina') || norm.includes('philippines')) {
      nextRegion = 'filipina';
    } else if (norm.includes('thailand')) {
      nextRegion = 'thailand';
    } else if (norm.includes('italia') || norm.includes('italy')) {
      nextRegion = 'italia';
    } else if (norm.includes('jerman') || norm.includes('germany')) {
      nextRegion = 'jerman';
    } else if (norm.includes('belanda') || norm.includes('netherlands')) {
      nextRegion = 'belanda';
    } else if (norm.includes('prancis') || norm.includes('france')) {
      nextRegion = 'prancis';
    } else if (norm.includes('inggris') || norm.includes('united kingdom') || norm.includes('britain')) {
      nextRegion = 'inggris';
    } else if (norm.includes('spanyol') || norm.includes('spain')) {
      nextRegion = 'spanyol';
    } else if (norm.includes('rusia') || norm.includes('russia')) {
      nextRegion = 'rusia';
    } else if (norm.includes('portugal')) {
      nextRegion = 'portugal';
    } else if (norm.includes('texas')) {
      nextRegion = 'texas';
    } else if (norm.includes('mexiko') || norm.includes('meksiko') || norm.includes('mexico')) {
      nextRegion = 'mexiko';
    } else if (norm.includes('canada') || norm.includes('kanada')) {
      nextRegion = 'canada';
    } else if (norm.includes('amerika') || norm.includes('united states') || norm.includes('usa')) {
      nextRegion = 'usa';
    } else if (norm.includes('mesir') || norm.includes('egypt') || norm.includes('saudi') || norm.includes('arab')) {
      nextRegion = 'mesir';
    } else if (norm.includes('peru')) {
      nextRegion = 'peru';
    } else {
      nextRegion = 'global';
    }

    if (nextRegion !== this.currentRegion) {
      this.currentRegion = nextRegion;
      this.stepIndex = 0;
    }
  }

  public setVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && !this.isMuted) {
      const target = this.isDucked ? this.musicVolume * 0.25 : this.musicVolume;
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGain && this.ctx) {
      const target = muted ? 0 : this.isDucked ? this.musicVolume * 0.25 : this.musicVolume;
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    }
  }

  /**
   * Duck background music while narrator voiceover is active for crystal-clear narration
   */
  public duckMusic(duck: boolean) {
    this.isDucked = duck;
    if (this.musicGain && this.ctx && !this.isMuted) {
      const target = duck ? this.musicVolume * 0.22 : this.musicVolume;
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    }
  }

  public startMusic() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;
    this.stepIndex = 0;
    this.scheduleNextStep();
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private getCurrentPattern(): NoteStep[] {
    switch (this.currentRegion) {
      case 'argentina':
        return this.TANGO_SCALE;
      case 'kolombia':
        return this.CUMBIA_SCALE;
      case 'brasil':
        return this.SAMBA_SCALE;
      case 'indonesia':
        return this.GAMELAN_SCALE;
      case 'jepang':
        return this.JAPAN_SCALE;
      case 'india':
        return this.INDIA_SCALE;
      case 'china':
        return this.CHINA_SCALE;
      case 'spanyol':
        return this.SPAIN_SCALE;
      case 'mexiko':
        return this.MEXICO_SCALE;
      case 'texas':
        return this.TEXAS_SCALE;
      case 'italia':
        return this.ITALY_SCALE;
      case 'rusia':
        return this.RUSSIA_SCALE;
      case 'jerman':
        return this.GERMANY_SCALE;
      case 'prancis':
        return this.FRANCE_SCALE;
      case 'belanda':
        return this.NETHERLANDS_SCALE;
      case 'inggris':
        return this.UK_SCALE;
      case 'canada':
        return this.CANADA_SCALE;
      case 'portugal':
        return this.PORTUGAL_SCALE;
      case 'korea':
        return this.KOREA_SCALE;
      case 'usa':
        return this.USA_SCALE;
      case 'malaysia':
        return this.MALAYSIA_SCALE;
      case 'vietnam':
        return this.VIETNAM_SCALE;
      case 'filipina':
        return this.FILIPINA_SCALE;
      case 'thailand':
        return this.THAILAND_SCALE;
      case 'mesir':
        return this.ARABIC_SCALE;
      case 'peru':
      case 'global':
      default:
        return this.ANDEAN_SCALE;
    }
  }

  private scheduleNextStep() {
    if (!this.isPlaying || !this.ctx || !this.musicGain) return;

    const pattern = this.getCurrentPattern();
    const step = pattern[this.stepIndex % pattern.length];
    const duration = step.duration;
    const now = this.ctx.currentTime;

    if (step.freq !== null) {
      switch (step.instrument) {
        case 'reed':
          this.playBandoneonReed(step.freq, now, duration * 0.9, step.accent);
          break;
        case 'flute':
          this.playPanFluteTone(step.freq, now, duration * 0.95);
          break;
        case 'pluck':
          this.playAcousticPluck(step.freq, now, duration * 0.85);
          break;
        case 'gamelan':
          this.playGamelanBell(step.freq, now, duration * 1.2);
          break;
        default:
          this.playPanFluteTone(step.freq, now, duration * 0.9);
          break;
      }
    }

    // Regional percussion rhythm:
    if (this.currentRegion === 'argentina') {
      // Tango staccato syncopation on beats 1 and 3
      if (this.stepIndex % 2 === 0) {
        this.playTangoPercussion(now);
      }
    } else if (this.currentRegion === 'kolombia') {
      // Cumbia syncopated guacharaca rasp
      this.playGuacharacaRasp(now);
      if (this.stepIndex % 3 === 0) {
        this.playBomboDrum(now, 75);
      }
    } else if (this.currentRegion === 'indonesia') {
      // Gong Ageng on deep cycle
      if (this.stepIndex % 4 === 0) {
        this.playGongAgeng(now);
      }
    } else {
      // Andean/General heartbeat bombo
      if (this.stepIndex % 3 === 0) {
        this.playBomboDrum(now, 65);
      }
    }

    this.stepIndex = (this.stepIndex + 1) % pattern.length;
    this.timerId = window.setTimeout(() => {
      this.scheduleNextStep();
    }, duration * 1000);
  }

  /**
   * Synthesizes Bandoneón / Accordion double reed with bellows pressure
   */
  private playBandoneonReed(freq: number, startTime: number, duration: number, accent?: boolean) {
    if (!this.ctx || !this.musicGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const reedGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime); // Subtle chorus detune

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, startTime);
    filter.Q.value = 3.0;

    const attack = accent ? 0.02 : 0.06;
    const peakVol = accent ? 0.24 : 0.16;

    reedGain.gain.setValueAtTime(0.0001, startTime);
    reedGain.gain.linearRampToValueAtTime(peakVol, startTime + attack);
    reedGain.gain.linearRampToValueAtTime(peakVol * 0.7, startTime + duration * 0.7);
    reedGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(reedGain);
    reedGain.connect(this.musicGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Synthesizes Panflute / Quena / Shakuhachi breath flute
   */
  private playPanFluteTone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const fluteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.value = 5.2;
    vibratoGain.gain.value = freq * 0.012;
    vibrato.connect(osc1.frequency);
    vibrato.connect(osc2.frequency);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, startTime);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, startTime);
    filter.Q.value = 4.2;

    const attackTime = 0.08;
    const peakVol = 0.2;
    const sustainVol = 0.14;

    fluteGain.gain.setValueAtTime(0.0001, startTime);
    fluteGain.gain.linearRampToValueAtTime(peakVol, startTime + attackTime);
    fluteGain.gain.linearRampToValueAtTime(sustainVol, startTime + attackTime + 0.15);
    fluteGain.gain.setValueAtTime(sustainVol, startTime + duration - 0.12);
    fluteGain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(fluteGain);
    fluteGain.connect(this.musicGain);

    vibrato.start(startTime);
    osc1.start(startTime);
    osc2.start(startTime);

    vibrato.stop(startTime + duration);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Synthesizes acoustic string plucks (Charango, Guitar, Koto, Oud)
   */
  private playAcousticPluck(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + 0.35);

    pluckGain.gain.setValueAtTime(0.15, startTime);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 0.5));

    osc.connect(filter);
    filter.connect(pluckGain);
    pluckGain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + Math.min(duration, 0.5));
  }

  /**
   * Synthesizes authentic Gamelan bronze chime with metallic overtone decay
   */
  private playGamelanBell(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;

    // Bronze physical harmonics: 1.0, 2.76, 5.4
    [1.0, 2.76].forEach((multiplier, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * multiplier, startTime);

      const amp = idx === 0 ? 0.16 : 0.08;
      gain.gain.setValueAtTime(amp, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Synthesizes Bombo Legüero bass drum heartbeat
   */
  private playBomboDrum(startTime: number, baseFreq: number = 65) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(36, startTime + 0.32);

    drumGain.gain.setValueAtTime(0.18, startTime);
    drumGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

    osc.connect(drumGain);
    drumGain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  }

  /**
   * Argentine Tango rhythmic rim/wood block pulse
   */
  private playTangoPercussion(startTime: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, startTime);
    osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.08);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.1);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.11);
  }

  /**
   * Colombian Guacharaca cane scraper rasp
   */
  private playGuacharacaRasp(startTime: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, startTime);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, startTime);

    gain.gain.setValueAtTime(0.04, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.09);
  }

  /**
   * Deep Javanese Gong Ageng resonance
   */
  private playGongAgeng(startTime: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, startTime);
    osc.frequency.linearRampToValueAtTime(45, startTime + 2.0);

    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.2);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 2.3);
  }

  /**
   * Interactive Sound Effect: Quiz Correct Fanfare
   */
  public playSuccessSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const noteStart = now + idx * 0.1;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteStart);
      osc.stop(noteStart + 0.45);
    });
  }

  /**
   * Interactive Sound Effect: Quiz Wrong Answer Feedback
   */
  public playErrorSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Interactive Sound Effect: Scene Switch Wind Chime
   */
  public playSceneTransitionSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.35);
    });
  }

  /**
   * Interactive Sound Effect: Certificate & Badge Unlock
   */
  public playCertificateSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      [440, 554, 659],
      [493, 622, 739],
      [587, 740, 880],
      [880, 1108, 1318],
    ];
    const now = this.ctx.currentTime;

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + step * 0.22;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });
    });
  }
}

export const andeanAudio = new CulturalAudioSynthesizer();
