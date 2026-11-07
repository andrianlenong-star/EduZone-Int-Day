import React, { useState, useMemo } from 'react';
import {
  Box,
  BookOpen,
  Share2,
  Copy,
  Check,
  Upload,
  FileType,
  Sparkles,
  ExternalLink,
  Compass,
  Hash,
  Layers,
  Ruler,
  Mountain,
  Maximize,
  Landmark,
  Languages,
  Shirt,
  Music2,
  UtensilsCrossed,
  Subtitles,
  Code2,
  Download,
} from 'lucide-react';
import { DocumentaryScene } from '../data/peruScenesData';
import {
  getSceneSubtitles,
  exportSubtitlesAsJson,
  generateSynchronizedSubtitles,
  detectLanguage,
  SubtitleCue,
} from '../utils/closedCaptionEngine';

interface SceneDetailsPanelProps {
  scene: DocumentaryScene;
  countryName: string;
  language: 'id' | 'en';
  isDarkMode: boolean;
  onOpenTrivia: () => void;
  onOpenShare: () => void;
}

export const SceneDetailsPanel: React.FC<SceneDetailsPanelProps> = ({
  scene,
  countryName,
  language,
  isDarkMode,
  onOpenTrivia,
  onOpenShare,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'narration' | 'project' | 'upload'>('metrics');
  const [mockUploadedFile, setMockUploadedFile] = useState<string | null>(null);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMockUploadedFile(e.target.files[0].name);
    }
  };

  const [copiedSubJson, setCopiedSubJson] = useState<boolean>(false);
  const [activeSubLang, setActiveSubLang] = useState<'en' | 'id'>(language);
  const [customTranscriptInput, setCustomTranscriptInput] = useState<string>('');
  const [customGeneratedCues, setCustomGeneratedCues] = useState<SubtitleCue[] | null>(null);
  const [copiedCustomJson, setCopiedCustomJson] = useState<boolean>(false);

  // Sync activeSubLang when language prop changes
  React.useEffect(() => {
    setActiveSubLang(language);
  }, [language]);

  const isEn = language === 'en';
  const m = isEn && scene.metricsEn ? scene.metricsEn : scene.metrics;
  const factual = isEn && scene.factualDataEn ? scene.factualDataEn : scene.factualDataId;

  const currentNarrationForSubtitles =
    activeSubLang === 'id' ? scene.fullNarrationId : scene.fullNarrationEn;

  const sceneSubtitles: SubtitleCue[] = useMemo(() => {
    return getSceneSubtitles(countryName, scene.number, activeSubLang, currentNarrationForSubtitles);
  }, [countryName, scene.number, activeSubLang, currentNarrationForSubtitles]);

  const handleCopySubtitleJson = () => {
    const jsonStr = exportSubtitlesAsJson(sceneSubtitles);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedSubJson(true);
      setTimeout(() => setCopiedSubJson(false), 2200);
    }).catch(() => {});
  };

  const handleProcessCustomTranscript = () => {
    if (!customTranscriptInput.trim()) return;
    const cues = generateSynchronizedSubtitles(customTranscriptInput, 45.0, 1.2);
    setCustomGeneratedCues(cues);
  };

  const handleCopyCustomJson = () => {
    if (!customGeneratedCues) return;
    const jsonStr = exportSubtitlesAsJson(customGeneratedCues);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedCustomJson(true);
      setTimeout(() => setCopiedCustomJson(false), 2200);
    }).catch(() => {});
  };

  // Render the specific 6 factual parameter groups requested by user
  const renderExactFactualGroup = () => {
    switch (scene.number) {
      case 1: {
        const geo = factual?.geografi;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>{isEn ? 'Continent / Geographic Zone:' : 'Benua / Kawasan Geografis:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {geo?.benua || m.jenis || (isEn ? 'Continent Data' : 'Data Benua')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5" />
                <span>{isEn ? 'Land Area:' : 'Luas Daratan:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {geo?.luasDaratan || m.luas || (isEn ? 'Territorial Area' : 'Luas Wilayah')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>{isEn ? 'Coastline Length:' : 'Garis Pantai:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {geo?.garisPantai || m.panjang || (isEn ? 'Coastline Length' : 'Panjang Garis Pantai')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" />
                <span>{isEn ? 'Highest Point / Elevation:' : 'Titik Tertinggi / Elevasi:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {geo?.titikTertinggi || m.ketinggian || (isEn ? 'Highest Elevation Peak' : 'Puncak Tertinggi')}
              </p>
            </div>
          </div>
        );
      }

      case 2: {
        const hist = factual?.sejarah;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                <span>{isEn ? 'Heritage Site:' : 'Situs Warisan:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {hist?.situsWarisan || m.nama}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>{isEn ? 'Civilization Age:' : 'Usia Peradaban:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {hist?.usiaPeradaban || m.jumlah}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>{isEn ? 'Monument Dimensions:' : 'Dimensi Monumen:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {hist?.dimensiMonumen || `${m.panjang || ''} ${m.ketinggian || ''}`}
              </p>
            </div>
          </div>
        );
      }

      case 3: {
        const lang = factual?.bahasa;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                <span>{isEn ? 'Official Language:' : 'Bahasa Resmi:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {lang?.bahasaResmi || m.nama}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>{isEn ? 'Native Speakers:' : 'Penutur Asli:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {lang?.penuturAsli || m.jumlah}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Dialect Varieties:' : 'Ragam Dialek:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {lang?.ragamDialek || m.jenis}
              </p>
            </div>
          </div>
        );
      }

      case 4: {
        const cl = factual?.pakaian;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5" />
                <span>{isEn ? 'Traditional Attire:' : 'Kain Adat:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cl?.kainAdat || m.nama}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Weaving Technique:' : 'Teknik Tenun:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cl?.teknikTenun || m.jenis}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Natural Fibers:' : 'Bahan Serat Alami:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cl?.bahanSeratAlami || m.jenis}
              </p>
            </div>
          </div>
        );
      }

      case 5: {
        const mus = factual?.musikTarian;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Traditional Instruments:' : 'Alat Musik Tradisional:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {mus?.alatMusikTradisional || m.nama}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>{isEn ? 'String / Pipe Count:' : 'Jumlah Dawai / Tabung:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {mus?.jumlahDawaiTabung || m.jumlah}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Dance Varieties:' : 'Ragam Tarian:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {mus?.ragamTarian || m.jenis}
              </p>
            </div>
          </div>
        );
      }

      case 6: {
        const cul = factual?.makanan;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{isEn ? 'Iconic Cuisine:' : 'Kuliner Ikonik:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cul?.kulinerIkonik || m.nama}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" />
                <span>{isEn ? 'Cultivation Altitude:' : 'Ketinggian Bahan Tanam:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cul?.ketinggianBahanTanam || m.ketinggian}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Depth / Cooking Technique:' : 'Kedalaman / Teknik Masak:'}</span>
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {cul?.kedalamanTeknikMasak || `${m.kedalaman || ''} ${m.jenis || ''}`}
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 transition-colors ${
        isDarkMode
          ? 'bg-stone-900/60 border-stone-800 text-stone-100'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      {/* Chapter Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-4 border-stone-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            {isEn ? `CHAPTER ${scene.number} • ${countryName.toUpperCase()}` : `BAB ${scene.number} • ${countryName.toUpperCase()}`}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-500">
            {isEn ? scene.titleEn : scene.titleId}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            {isEn ? scene.taglineEn : scene.taglineId}
          </p>
        </div>

        {/* Share Button Block */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShare}
            aria-label={isEn ? 'Share with Students' : 'Bagikan ke Siswa'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 shadow transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{isEn ? '[Button: Share with Students (Copy Link)]' : '[Tombol: Bagikan ke Siswa (Salin Tautan)]'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'metrics'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isEn ? 'Factual Parameter Summary' : 'Ringkasan Parameter Faktual'}</span>
        </button>

        <button
          onClick={() => setActiveTab('narration')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'narration'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isEn ? 'Voiceover Script' : 'Naskah Narasi Penutur'}</span>
        </button>

        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'project'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isEn ? 'Student Mini Project' : 'Mini Proyek Siswa'}</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <FileType className="w-3.5 h-3.5" />
          <span>{isEn ? 'Upload Compatibility' : 'Kompatibilitas Unggah Berkas'}</span>
        </button>
      </div>

      {/* Tab 1: Ringkasan Parameter Faktual (Exact 6 Groups) */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {renderExactFactualGroup()}

          {/* Archival Provenance & Verified Repository Badge */}
          {scene.archivalSource && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Archival Provenance & Verified Repository' : 'Sumber Arsip Digital & Institusi Terverifikasi'}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900 text-stone-300 border border-stone-700">
                  {scene.archivalSource.license}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    {isEn ? 'Source Archive / Digital Library:' : 'Sumber Arsip Digital:'}
                  </span>
                  <span className="font-semibold text-stone-200">{scene.archivalSource.archiveName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    {isEn ? 'Holding Institution / Curator:' : 'Institusi Kurator:'}
                  </span>
                  <span className="font-semibold text-stone-200">{scene.archivalSource.institution}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    {isEn ? 'Accession & Collection Record:' : 'Nomor Arsip & Rekor Koleksi:'}
                  </span>
                  <span className="font-mono text-[11px] text-amber-300/90">{scene.archivalSource.collectionRecord}</span>
                </div>
              </div>
            </div>
          )}

          {/* Verified Archival Gallery Images with Captions */}
          {scene.galleryImages && scene.galleryImages.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Archival Photographic Gallery' : 'Galeri Fotografi Arsip Digital'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scene.galleryImages.map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-stone-800 bg-stone-900">
                    <img
                      src={img.url}
                      alt={isEn ? img.captionEn : img.captionId}
                      className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-2.5 text-[11px]">
                      <p className="font-medium text-stone-200 line-clamp-2">
                        {isEn ? img.captionEn : img.captionId}
                      </p>
                      {img.sourceArchive && (
                        <span className="mt-1 block text-[10px] text-amber-400/90 font-mono">
                          🏛️ {img.sourceArchive}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Quiz Callout */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 mt-4">
            <div>
              <h4 className="text-sm font-bold text-amber-400">
                {isEn ? 'Test Factual Mastery: Trivia Quiz' : 'Uji Pemahaman Materi: Kuis Trivia Faktual'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {isEn
                  ? 'Factual quiz based on metrics, dimensions, and names with >= 70% passing grade.'
                  : '3 soal berbasis angka, dimensi, dan nama entitas dengan passing grade >= 70%.'}
              </p>
            </div>
            <button
              onClick={onOpenTrivia}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition shadow"
            >
              {isEn ? 'Open Trivia Quiz' : 'Buka Kuis Trivia'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Naskah Narasi Penutur Padat & Singkat */}
      {activeTab === 'narration' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                {isEn ? 'Voiceover Narration Script (English)' : 'Naskah Narasi Penutur (Bahasa Indonesia)'}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {isEn ? 'Duration: 1 Minute' : 'Durasi: 1 Menit'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
              &ldquo;{isEn ? scene.fullNarrationEn : scene.fullNarrationId}&rdquo;
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              {isEn ? 'Indonesian Alternate Script' : 'Naskah Versi Bahasa Inggris'}
            </span>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              &ldquo;{isEn ? scene.fullNarrationId : scene.fullNarrationEn}&rdquo;
            </p>
          </div>

          {/* Synchronized Closed Captions (CC) & Precision Timestamps */}
          <div className="p-4 sm:p-5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Subtitles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-1.5">
                    <span>{isEn ? 'Synchronized Closed Captions (CC Engine)' : 'Subtitle Tersegmentasi & Tersinkronisasi'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {isEn ? 'BROADCAST JSON' : 'FORMAT JSON RESMI'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {isEn
                      ? 'Native language matching, <= 50 chars/line, non-overlapping timestamps.'
                      : 'Deteksi bahasa otomatis, maks 40-50 karakter/baris, stempel waktu non-overlapping.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-stone-900 border border-stone-800 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setActiveSubLang('en')}
                    className={`px-2.5 py-1 rounded transition ${
                      activeSubLang === 'en'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setActiveSubLang('id')}
                    className={`px-2.5 py-1 rounded transition ${
                      activeSubLang === 'id'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    ID
                  </button>
                </div>

                <button
                  onClick={handleCopySubtitleJson}
                  aria-label="Copy Subtitle JSON Array"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition shadow"
                >
                  {copiedSubJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{isEn ? 'Copied JSON!' : 'Tersalin!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Copy Subtitle JSON' : 'Salin JSON Subtitle'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of segmented cues */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sceneSubtitles.map((cue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-900/60 border border-stone-800/60 text-xs font-mono"
                >
                  <span className="shrink-0 px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-bold text-[11px]">
                    {cue.start.toFixed(2)}s - {cue.end.toFixed(2)}s
                  </span>
                  <span className="text-stone-200 font-sans text-xs pt-0.5 leading-snug">
                    {cue.text}
                  </span>
                  <span className="ml-auto text-[10px] text-stone-400 font-mono shrink-0">
                    {cue.text.length} ch
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mini Proyek Siswa */}
      {activeTab === 'project' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {isEn ? '[MINI PROJECT] ' : '[MINI PROYEK] '}{isEn ? scene.miniProject.titleEn : scene.miniProject.titleId}
            </span>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {isEn ? scene.miniProject.descriptionEn : scene.miniProject.descriptionId}
            </p>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {isEn ? 'Project Procedure Steps:' : 'Langkah Kerja Proyek:'}
              </h5>
              <ol className="space-y-2 text-xs sm:text-sm">
                {(isEn ? scene.miniProject.stepsEn : scene.miniProject.stepsId).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-stone-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs mt-3">
              <span className="text-stone-400 font-medium">{isEn ? 'Target Output:' : 'Target Luaran:'}</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-bold">
                {isEn ? scene.miniProject.outputLabelEn : scene.miniProject.outputLabelId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Kompatibilitas Unggah Berkas */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {isEn ? '[UPLOAD ARCHITECTURE METADATA]' : '[METADATA KOMPATIBILITAS FORMAT UNGGAH]'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase">
                  {isEn ? 'Slide Presentation' : 'Presentasi Slide'}
                </span>
                <h5 className="text-sm font-bold text-white mt-1">PowerPoint (.pptx)</h5>
                <p className="text-xs text-stone-400 mt-1">
                  {isEn
                    ? 'Compatible for student project worksheets and teacher lesson slides.'
                    : 'Kompatibel untuk mengunggah lembar kerja tugas siswa dan slide materi ajar guru.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] font-bold text-red-400 uppercase">
                  {isEn ? 'Documentary Video Streams' : 'Media Video Dokumenter'}
                </span>
                <h5 className="text-sm font-bold text-white mt-1">Video Streams (.mp4, .mpeg, .mkv, .mov)</h5>
                <p className="text-xs text-stone-400 mt-1">
                  {isEn
                    ? 'Compatible for student independent video documentary recordings.'
                    : 'Kompatibel untuk rekaman proyek dokumenter siswa mandiri.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-stone-700 bg-stone-900/40 text-center">
              <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-200">
                {isEn
                  ? 'Simulate File Upload (.pptx, .mp4, .mkv, .mov)'
                  : 'Uji Coba Unggah Berkas Materi (.pptx, .mp4, .mkv, .mov)'}
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow transition">
                <span>{isEn ? 'Select File' : 'Pilih Berkas'}</span>
                <input
                  type="file"
                  accept=".pptx,.mp4,.mpeg,.mkv,.mov"
                  onChange={handleSimulateUpload}
                  className="hidden"
                />
              </label>

              {mockUploadedFile && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isEn
                      ? `File "${mockUploadedFile}" verified 100% compatible!`
                      : `Berkas "${mockUploadedFile}" terverifikasi kompatibel 100%!`}
                  </span>
                </div>
              )}
            </div>

            {/* Automated Closed Captions Engine (CC Engine) Interactive Processor */}
            <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Automated Closed Captions Engine Processor' : 'Sistem Pemroses Subtitle Video Otomatis'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  PRECISION JSON
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {isEn
                  ? 'Input audio/video transcript to auto-detect native language, segment into <= 50 chars, allocate synchronized non-overlapping timestamps, and export structured JSON.'
                  : 'Masukkan naskah audio/video untuk deteksi bahasa asli otomatis, segmentasi maks 40-50 karakter, sinkronisasi waktu akurat, dan ekspor JSON Array.'}
              </p>

              <div className="space-y-2">
                <textarea
                  value={customTranscriptInput}
                  onChange={(e) => setCustomTranscriptInput(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Paste or type narration script here (e.g., Halo, selamat datang di petualangan hutan liar! / Peru is a nation in western South America...)'
                      : 'Ketik atau tempel naskah narasi di sini...'
                  }
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleProcessCustomTranscript}
                    disabled={!customTranscriptInput.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
                  >
                    {isEn ? 'Generate Precision Subtitle JSON' : 'Proses Subtitle Otomatis'}
                  </button>

                  {customGeneratedCues && (
                    <button
                      onClick={handleCopyCustomJson}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-stone-800 hover:bg-stone-700 transition"
                    >
                      {copiedCustomJson ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isEn ? 'Copied JSON!' : 'JSON Tersalin!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEn ? 'Copy Processed JSON' : 'Salin JSON Hasil'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {customGeneratedCues && (
                  <div className="mt-3 p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>Detected Native Lang: <strong className="text-amber-400 uppercase">{detectLanguage(customTranscriptInput)}</strong></span>
                      <span>Total Cues: {customGeneratedCues.length}</span>
                    </div>
                    <pre className="p-2.5 rounded bg-black text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-stone-800">
                      {exportSubtitlesAsJson(customGeneratedCues)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Footer */}
      <div className="mt-6 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>
            {isEn
              ? `Direct Student Link (${countryName} • Scene ${scene.number})`
              : `Tautan Langsung Siswa (${countryName} • Scene ${scene.number})`}
          </span>
        </div>

        <button
          onClick={onOpenShare}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1"
        >
          <span>{isEn ? '[Button: Share with Students (Copy Link)]' : '[Tombol: Bagikan ke Siswa (Salin Tautan)]'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
