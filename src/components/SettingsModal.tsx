import React, { useEffect } from 'react';
import {
  X,
  Sliders,
  Globe,
  Music,
  Mic,
  Sparkles,
  Check,
  Smile,
  Subtitles,
} from 'lucide-react';
import { PlayerSettings } from './VideoPlayer';
import { narrationEngine } from '../utils/speechNarration';
import { VoicePersona } from '../types/encyclopedia';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: Partial<PlayerSettings>) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isDarkMode,
  onToggleTheme,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const testVoicePersona = (persona: VoicePersona) => {
    narrationEngine.setLanguage(settings.language);
    narrationEngine.setPersona(persona);
    narrationEngine.playPersonaChime(persona);
    let sample = '';
    if (persona === 'anak-perempuan') {
      sample =
        settings.language === 'id'
          ? 'Halo teman-teman! Aku anak perempuan sekolah dasar. Senang sekali bisa belajar fakta seru ensiklopedia ini bersamamu!'
          : 'Hi everyone! I am an elementary school girl. I am so excited to explore fun facts with you!';
    } else if (persona === 'anak-laki-laki') {
      sample =
        settings.language === 'id'
          ? 'Hai kawan-kawan! Aku anak laki-laki sekolah dasar. Ayo kita jelajahi angka, panjang, dan ketinggian tempat ini dengan semangat!'
          : 'Hey friends! I am an elementary school boy. Let us discover lengths, heights, and numbers with high energy!';
    } else {
      sample =
        settings.language === 'id'
          ? 'Selamat datang anak-anak pintar. Ibu guru akan memandu penjelajahan ensiklopedia audio visual ini dengan santai dan ramah.'
          : 'Welcome bright students. I will warmly guide our audiovisual encyclopedia journey.';
    }
    narrationEngine.speakText(sample);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-stone-800 bg-stone-950/60' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {settings.language === 'id' ? 'Pengaturan Suara Penutur Ceria' : 'Cheerful Voiceover & Audio Settings'}
              </h3>
              <p className="text-xs text-stone-400">
                {settings.language === 'id' ? 'Pilih suara anak SD perempuan, laki-laki, atau guru' : 'Select cheerful girl, boy, or teacher voice persona'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Voice Personas */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{settings.language === 'id' ? 'Karakter Suara Penutur (Ceria & Ramah):' : 'Voiceover Persona (Cheerful & Natural):'}</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'anak-perempuan',
                  badge: settings.language === 'id' ? '👧 Rekomendasi Siswa SD' : '👧 Elementary Recommended',
                  title: settings.language === 'id' ? 'Suara Anak Perempuan SD (Ceria & Ramah)' : 'Primary School Girl (Cheerful & Friendly)',
                  desc: settings.language === 'id' ? 'Nada bicara tinggi, ceria, bersahabat, sangat cocok untuk pelajar sekolah dasar.' : 'Bright high pitch, joyful, energetic and warm cadence for primary education.',
                },
                {
                  id: 'anak-laki-laki',
                  badge: settings.language === 'id' ? '👦 Rekomendasi Siswa SD' : '👦 Elementary Recommended',
                  title: settings.language === 'id' ? 'Suara Anak Laki-Laki SD (Semangat & Bersahabat)' : 'Primary School Boy (Spirited & Dynamic)',
                  desc: settings.language === 'id' ? 'Irama riang, bersemangat, ingin tahu, santai dan tidak kaku.' : 'Enthusiastic, curious, spirited tempo with boyish vocal resonance.',
                },
                {
                  id: 'guru-ramah',
                  badge: settings.language === 'id' ? '👩‍🏫 Gaya Pendidik' : '👩‍🏫 Educator Persona',
                  title: settings.language === 'id' ? 'Suara Guru Ramah / Pemandu Ceria' : 'Friendly Educator / Cheerful Guide',
                  desc: settings.language === 'id' ? 'Penyampaian hangat, lembut, membimbing dengan intonasi jelas.' : 'Warm, reassuring, articulate pedagogical tone with clear articulation.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-left text-xs transition flex flex-col gap-2 ${
                    settings.voicePersona === item.id
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold ring-1 ring-amber-500'
                      : 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-0.5">
                        {item.badge}
                      </span>
                      <h5 className="font-bold text-stone-100 text-sm">{item.title}</h5>
                      <p className="text-[11px] text-stone-400 mt-0.5">{item.desc}</p>
                    </div>
                    {settings.voicePersona === item.id && <Check className="w-5 h-5 text-amber-400 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-stone-800/60">
                    <button
                      onClick={() => onUpdateSettings({ voicePersona: item.id as VoicePersona })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        settings.voicePersona === item.id
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {settings.voicePersona === item.id
                        ? (settings.language === 'id' ? 'Sedang Dipakai' : 'Active Voice')
                        : (settings.language === 'id' ? 'Gunakan Suara Ini' : 'Select Voice')}
                    </button>

                    <button
                      onClick={() => testVoicePersona(item.id as VoicePersona)}
                      className="px-2.5 py-1 rounded-lg border border-stone-700 bg-stone-900 text-stone-300 hover:text-white text-xs flex items-center gap-1"
                    >
                      <Mic className="w-3 h-3 text-emerald-400" />
                      <span>{settings.language === 'id' ? 'Uji Suara' : 'Test Voice'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>{settings.language === 'id' ? 'Bahasa Narasi' : 'Language'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ language: 'id' })}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  settings.language === 'id'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                    : 'border-stone-800 bg-stone-950/50 text-stone-300'
                }`}
              >
                <span>🇮🇩 Bahasa Indonesia</span>
                {settings.language === 'id' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  settings.language === 'en'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                    : 'border-stone-800 bg-stone-950/50 text-stone-300'
                }`}
              >
                <span>🇬🇧 English</span>
                {settings.language === 'en' && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* 3. Audio & Pacing */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1 text-stone-300">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kecepatan Bicara Suara Anak SD:</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">{settings.speechSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.speechSpeed}
                onChange={(e) => onUpdateSettings({ speechSpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1 text-stone-300">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Volume Musik Latar:</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* 4. Closed Caption (CC) & Subtitles */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Subtitles className="w-4 h-4 text-amber-400" />
                <span>{settings.language === 'id' ? 'Tampilan Subtitle & Closed Caption (CC)' : 'Closed Caption (CC) & Subtitles'}</span>
              </span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showSubtitles: !settings.showSubtitles })}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                  settings.showSubtitles !== false
                    ? 'bg-amber-400 text-stone-950 shadow'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {settings.showSubtitles !== false ? 'AKTIF (ON)' : 'MATI (OFF)'}
              </button>
            </label>

            {/* Subtitle Language Switch */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-300 block">
                {settings.language === 'id' ? 'Bahasa Teks Subtitle:' : 'Subtitle Text Language:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ subtitleLanguage: 'en' })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    settings.subtitleLanguage === 'en' || (!settings.subtitleLanguage && settings.language === 'en')
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                      : 'border-stone-800 bg-stone-950/50 text-stone-300'
                  }`}
                >
                  <span>🇬🇧 English Subtitles</span>
                  {(settings.subtitleLanguage === 'en' || (!settings.subtitleLanguage && settings.language === 'en')) && (
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ subtitleLanguage: 'id' })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    settings.subtitleLanguage === 'id' || (!settings.subtitleLanguage && settings.language === 'id')
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                      : 'border-stone-800 bg-stone-950/50 text-stone-300'
                  }`}
                >
                  <span>🇮🇩 Subtitle Indonesia</span>
                  {(settings.subtitleLanguage === 'id' || (!settings.subtitleLanguage && settings.language === 'id')) && (
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Subtitle Contrast & Styling */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { id: 'high-contrast', label: 'Amber Contrast' },
                { id: 'solid-black', label: 'Solid Black' },
                { id: 'soft-frosted', label: 'Soft Frosted' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onUpdateSettings({ subtitleContrast: style.id as PlayerSettings['subtitleContrast'] })}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium text-center transition ${
                    settings.subtitleContrast === style.id
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDarkMode ? 'border-stone-800 bg-stone-950/60' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition shadow"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
