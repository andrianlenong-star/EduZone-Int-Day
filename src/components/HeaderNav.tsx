import React, { useState } from 'react';
import {
  Globe,
  Moon,
  Sun,
  Settings,
  Share2,
  BookOpen,
  Plus,
  MapPin,
  Check,
  Search,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { VoicePersona } from '../types/encyclopedia';
import { COUNTRY_NAME_MAPPING } from '../data/countryRegistry';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderNavProps {
  countryName: string;
  onCountryChange: (newCountry: string) => void;
  availableCountries: string[];
  onAddCountry: (newCountry: string) => void;
  language: 'id' | 'en';
  onLanguageChange: (lang: 'id' | 'en') => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onOpenSettings: () => void;
  onOpenFinalEvaluation: () => void;
  completedScenesCount: number;
  onOpenShare: () => void;
  isSearchingWiki?: boolean;
  onOpenSyncModal?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  countryName,
  onCountryChange,
  availableCountries,
  onAddCountry,
  language,
  onLanguageChange,
  isDarkMode,
  onThemeToggle,
  onOpenSettings,
  onOpenFinalEvaluation,
  completedScenesCount,
  onOpenShare,
  isSearchingWiki = false,
  onOpenSyncModal,
}) => {
  const [isEditingCountry, setIsEditingCountry] = useState<boolean>(false);
  const [inputCountry, setInputCountry] = useState<string>(countryName);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCountryInput, setNewCountryInput] = useState<string>('');

  const handleSaveCountry = () => {
    if (inputCountry.trim()) {
      onCountryChange(inputCountry.trim());
      setIsEditingCountry(false);
    }
  };

  const handleCreateNewCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCountryInput.trim()) {
      onAddCountry(newCountryInput.trim());
      setNewCountryInput('');
      setShowAddModal(false);
    }
  };

  return (
    <header
      className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-md ${
        isDarkMode
          ? 'bg-stone-950/95 border-stone-800 text-stone-100'
          : 'bg-white/95 border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Left Side: EduZone Logo & Teacher Country Manager */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* User's uploaded EduZone logo & Branding */}
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt="EduZone Logo"
              className="h-9 sm:h-11 w-auto rounded-xl object-contain shadow-md hover:scale-105 transition-transform bg-stone-900 border border-stone-800"
              onError={(e) => {
                // Sembunyikan jika gagal muat agar tidak muncul ikon patah
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
                  Edu<span className="text-[#FFB800]">Z</span><span className="text-[#C4B5FD]">one</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider hidden sm:inline">
                  World
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium hidden md:inline">
                MPI Ensiklopedia Audiovisual Interaktif SD
              </span>
            </div>
          </div>

          {/* Teacher Country Input & Quick Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 border border-stone-700/80 p-1 sm:p-1.5 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-amber-500 ml-1.5 shrink-0" />
            <span className="text-[11px] font-bold text-stone-400 uppercase hidden md:inline">
              {language === 'id' ? 'Negara:' : 'Country:'}
            </span>

            {isEditingCountry ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={inputCountry}
                  onChange={(e) => setInputCountry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCountry()}
                  autoFocus
                  placeholder={language === 'id' ? 'Ketik nama negara...' : 'Type country name...'}
                  className="w-28 sm:w-36 px-2 py-0.5 rounded text-xs font-bold bg-stone-950 text-amber-300 border border-amber-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveCountry}
                  className="p-1 rounded bg-amber-500 text-stone-950 text-xs hover:bg-amber-400 font-bold cursor-pointer"
                  title={language === 'id' ? 'Simpan & Cari Data Ensiklopedia' : 'Save & Fetch Encyclopedia Data'}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <select
                  value={countryName}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddModal(true);
                    } else {
                      onCountryChange(e.target.value);
                      setInputCountry(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer pr-1"
                >
                  {availableCountries.map((c) => {
                    const mapping = COUNTRY_NAME_MAPPING[c.toLowerCase()];
                    const label =
                      language === 'id'
                        ? (mapping ? mapping.id : c)
                        : (mapping ? mapping.en : c);
                    return (
                      <option key={c} value={c} className="bg-stone-900 text-stone-100">
                        {label}
                      </option>
                    );
                  })}
                  <option value="__add_new__" className="bg-stone-900 text-amber-400 font-bold">
                    {language === 'id' ? '+ Tambah Negara Baru...' : '+ Add New Country...'}
                  </option>
                </select>

                <button
                  onClick={() => {
                    setInputCountry(countryName);
                    setIsEditingCountry(true);
                  }}
                  className="text-[10px] text-stone-400 hover:text-amber-400 underline font-medium px-1 cursor-pointer"
                  title={language === 'id' ? 'Ketik Nama Negara Manual' : 'Type Country Name Manually'}
                >
                  {language === 'id' ? 'Ubah' : 'Edit'}
                </button>
              </div>
            )}

            {/* Quick Add Country Button */}
            <button
              onClick={() => setShowAddModal(true)}
              title={language === 'id' ? 'Tambah Negara Baru' : 'Add New Country'}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition text-xs flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isSearchingWiki && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium animate-pulse">
              <Search className="w-3 h-3 animate-spin" />
              <span>{language === 'id' ? 'Menghubungkan ke Wikipedia...' : 'Fetching Wikipedia Data...'}</span>
            </span>
          )}
        </div>

        {/* Right Side: Language, Theme, Evaluation, and Share Controls */}
        <div className="flex items-center gap-2">
          {/* Cross-Device Sync Modal Shortcut */}
          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              aria-label={language === 'id' ? 'Sinkronisasi Antargawai' : 'Cross-Device Sync'}
              title={language === 'id' ? 'Sinkronisasi video ke HP, Laptop, dan iPad' : 'Sync videos across Phone, Laptop, and iPad'}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isDarkMode
                  ? 'bg-amber-950/30 text-amber-300 border-amber-600/40 hover:bg-amber-900/40 shadow-sm'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">{language === 'id' ? 'Sync Gawai' : 'Device Sync'}</span>
              <span className="sm:hidden">{language === 'id' ? 'Sync' : 'Sync'}</span>
            </button>
          )}

          {/* Final Evaluation Shortcut */}
          <button
            onClick={onOpenFinalEvaluation}
            aria-label={language === 'id' ? 'Evaluasi Akhir' : 'Final Assessment'}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isDarkMode
                ? 'bg-amber-950/20 text-amber-400 border-amber-800/40 hover:bg-amber-900/30'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Evaluasi Akhir' : 'Final Assessment'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'id' ? 'en' : 'id')}
            aria-label={language === 'id' ? 'Ganti Bahasa' : 'Switch Language'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isDarkMode
                ? 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800'
                : 'bg-stone-100 border-stone-200 text-stone-800 hover:bg-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onThemeToggle}
            aria-label={isDarkMode ? (language === 'id' ? 'Ganti ke Mode Terang' : 'Switch to Light Mode') : (language === 'id' ? 'Ganti ke Mode Gelap' : 'Switch to Dark Mode')}
            className={`p-2 rounded-xl border transition ${
              isDarkMode
                ? 'bg-stone-900 border-stone-800 text-amber-400 hover:bg-stone-800'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            aria-label={language === 'id' ? 'Pengaturan' : 'Settings'}
            className={`p-2 rounded-xl border transition ${
              isDarkMode
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* PWA Install Button (Offline App Installation) */}
          <PWAInstallButton language={language} />

          {/* Direct Share Button */}
          <button
            onClick={onOpenShare}
            aria-label={language === 'id' ? 'Bagikan ke Siswa' : 'Share to Students'}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 shadow-md transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Bagikan ke Siswa' : 'Share to Students'}</span>
          </button>
        </div>
      </div>

      {/* Teacher Add New Country Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-5 text-stone-100 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-amber-400">
                {language === 'id' ? 'Tambah Negara Baru (Sinkronisasi AI & Wiki)' : 'Add New Country (AI & Wiki Sync)'}
              </h4>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              {language === 'id'
                ? 'Ketik nama negara (misal: Mesir, Jerman, Australia, Korea Selatan). Sistem akan otomatis mencari data geografis, sejarah, bahasa, pakaian, musik, dan kulinernya:'
                : 'Type the country name. The system will retrieve geographical, historical, linguistic, attire, and culinary facts:'}
            </p>
            <form onSubmit={handleCreateNewCountry} className="space-y-3">
              <input
                type="text"
                value={newCountryInput}
                onChange={(e) => setNewCountryInput(e.target.value)}
                placeholder="Contoh: Mesir, Australia, Korea Selatan"
                autoFocus
                className="w-full p-2.5 rounded-xl border border-stone-700 bg-stone-950 text-xs font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newCountryInput.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-40 cursor-pointer"
                >
                  {language === 'id' ? 'Tambahkan & Eksplorasi' : 'Add & Explore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
