import React from 'react';
import {
  Globe2,
  Users,
  Maximize2,
  Coins,
  MapPin,
  Sparkles,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { CountryProfile, VoicePersona } from '../types/encyclopedia';
import { narrationEngine } from '../utils/speechNarration';

interface CountryOverviewCardProps {
  country: CountryProfile;
  currentPersona: VoicePersona;
  onPersonaChange: (persona: VoicePersona) => void;
  language: 'id' | 'en';
  isDarkMode: boolean;
  onTestVoice: () => void;
  availableCountries: string[];
  onSelectCountry: (name: string) => void;
  isLoadingWiki: boolean;
}

export const CountryOverviewCard: React.FC<CountryOverviewCardProps> = ({
  country,
  currentPersona,
  onPersonaChange,
  language,
  isDarkMode,
  onTestVoice,
  availableCountries,
  onSelectCountry,
  isLoadingWiki,
}) => {
  const isEn = language === 'en';
  const countryNameDisplay = isEn ? (country.nameEn || country.name) : country.name;
  const officialNameDisplay = isEn ? (country.officialNameEn || country.officialName || countryNameDisplay) : (country.officialName || country.name);
  const capitalDisplay = isEn ? (country.capitalEn || country.capital || 'Capital City') : (country.capital || 'Ibu Kota');
  const continentDisplay = isEn ? (country.continentEn || country.continent || 'Global Continent') : (country.continent || 'Dunia');
  const populationDisplay = isEn ? (country.populationEn || country.population || 'Official Census Data') : (country.population || 'Data Sensus');
  const currencyDisplay = isEn ? (country.currencyEn || country.currency || 'National Currency') : (country.currency || 'Mata Uang Resmi');
  const wikiExtractDisplay = isEn ? country.wikiExtractEn : country.wikiExtractId;

  const handlePersonaSwitch = (p: VoicePersona) => {
    onPersonaChange(p);
    narrationEngine.playPersonaChime(p);
    onTestVoice();
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isDarkMode
          ? 'bg-stone-900/80 border-stone-800 text-stone-100 shadow-xl'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Country Header & Live Wikipedia Badge */}
        <div className="flex items-center gap-3.5">
          <div className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-stone-950/70 border border-stone-800 shadow flex items-center justify-center">
            {country.flag || '🌍'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{officialNameDisplay}</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                <Globe2 className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{isEn ? 'Wikipedia Live Encyclopedia' : 'Wikipedia Live Ensiklopedia'}</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-xl">
              {wikiExtractDisplay}
            </p>
          </div>
        </div>

        {/* Voice Persona Selector (Elementary School Girl / Boy / Teacher) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950/80 border border-stone-800 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 px-2 flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            <span>{isEn ? 'Narrator Voice:' : 'Suara Penutur:'}</span>
          </span>

          <button
            onClick={() => handlePersonaSwitch('anak-perempuan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentPersona === 'anak-perempuan'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md scale-105'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>{isEn ? '👧 Schoolgirl (Cheerful)' : '👧 Anak Perempuan SD (Ceria)'}</span>
          </button>

          <button
            onClick={() => handlePersonaSwitch('anak-laki-laki')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentPersona === 'anak-laki-laki'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>{isEn ? '👦 Schoolboy (Spirited)' : '👦 Anak Laki-Laki SD (Semangat)'}</span>
          </button>

          <button
            onClick={() => handlePersonaSwitch('guru-ramah')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentPersona === 'guru-ramah'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md scale-105'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>{isEn ? '👩‍🏫 Educator (Calm)' : '👩‍🏫 Guru Ramah'}</span>
          </button>
        </div>
      </div>

      {/* Quick Encyclopedic Parameter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-stone-800/60 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/40 border border-stone-800/70">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="block text-[10px] text-stone-500 font-bold uppercase">
              {isEn ? 'Capital' : 'Ibu Kota'}
            </span>
            <span className="font-semibold text-stone-200">{capitalDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/40 border border-stone-800/70">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="block text-[10px] text-stone-500 font-bold uppercase">
              {isEn ? 'Continent' : 'Benua'}
            </span>
            <span className="font-semibold text-stone-200">{continentDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/40 border border-stone-800/70">
          <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="truncate">
            <span className="block text-[10px] text-stone-500 font-bold uppercase">
              {isEn ? 'Census Population' : 'Populasi Sensus'}
            </span>
            <span className="font-semibold text-stone-200">{populationDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/40 border border-stone-800/70">
          <Coins className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <div className="truncate">
            <span className="block text-[10px] text-stone-500 font-bold uppercase">
              {isEn ? 'Currency' : 'Mata Uang'}
            </span>
            <span className="font-semibold text-stone-200">{currencyDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
