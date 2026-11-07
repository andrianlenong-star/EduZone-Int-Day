import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  QrCode,
  Globe,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Link2,
  Loader2,
  Film,
  Info,
} from 'lucide-react';
import { DocumentaryScene } from '../data/peruScenesData';
import { getAllCountryVideosFromIndexedDB } from '../utils/videoStorageDB';
import { uploadVideoToCloud, getSyncConfig } from '../services/crossDeviceSync';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneNumber: number;
  countryName: string;
  language: 'id' | 'en';
  isDarkMode: boolean;
  scenes?: DocumentaryScene[];
  onVideoUploadedToCloud?: (sceneNumber: number, publicUrl: string, fileName: string) => void;
  onOpenSyncModal?: () => void;
}

/**
 * Bulletproof copy utility that works in any browser, iframe, or restricted context
 */
export async function copyTextSafely(text: string): Promise<boolean> {
  // Method 1: Modern navigator.clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Method 2: Fallback using document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch {
    // ignore
  }

  return false;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  sceneNumber,
  countryName,
  language,
  isDarkMode,
  scenes = [],
  onVideoUploadedToCloud,
  onOpenSyncModal,
}) => {
  const isEn = language === 'en';

  const [copied, setCopied] = useState<boolean>(false);
  const [selectedScene, setSelectedScene] = useState<number>(sceneNumber);
  const [selectedLang, setSelectedLang] = useState<'id' | 'en'>(language);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  // External URL input for teacher video
  const [externalUrlInput, setExternalUrlInput] = useState<string>('');
  const [showExternalInput, setShowExternalInput] = useState<boolean>(false);

  // Cloud upload in progress state
  const [isUploadingToCloud, setIsUploadingToCloud] = useState<boolean>(false);
  const [uploadNotice, setUploadNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local state for overridden public video URL
  const [customPublicUrl, setCustomPublicUrl] = useState<string | null>(null);
  const [customPublicFileName, setCustomPublicFileName] = useState<string | null>(null);

  // Sync selectedScene when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedScene(sceneNumber);
      setSelectedLang(language);
      setCustomPublicUrl(null);
      setCustomPublicFileName(null);
      setUploadNotice(null);
      setShowExternalInput(false);
    }
  }, [isOpen, sceneNumber, language]);

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

  // Find data for currently selected scene
  const activeSceneData = scenes.find((s) => s.number === selectedScene) || scenes[0];

  // Determine active video source for teacher video
  const rawVideoUrl = customPublicUrl || (activeSceneData?.isCustomVideo ? activeSceneData.customVideoUrl : '');
  const rawVideoName = customPublicFileName || activeSceneData?.customFileName || `Video_Guru_Scene_${selectedScene}.mp4`;

  // Check if video is already hosted on a public web/cloud URL (accessible to students)
  const isPublicWebUrl = Boolean(
    rawVideoUrl && (rawVideoUrl.startsWith('http://') || rawVideoUrl.startsWith('https://'))
  );

  // Check if video is only saved locally in IndexedDB / Blob URL (not accessible to students over the internet)
  const isLocalIndexedDbOnly = Boolean(
    activeSceneData?.isCustomVideo && !isPublicWebUrl
  );

  // Resolve public accessible URL for students
  const getPublicBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const { origin, hostname } = window.location;
      // If viewed inside developer studio or on aistudio.google.com, use public shared app domain
      if (hostname.includes('aistudio.google.com') || origin.includes('google.com/applet')) {
        return 'https://ais-pre-n5pn4ytraybjp4nfwkg4i6-496673436177.asia-southeast1.run.app';
      }
      return origin;
    }
    return 'https://ais-pre-n5pn4ytraybjp4nfwkg4i6-496673436177.asia-southeast1.run.app';
  };

  const baseUrl = getPublicBaseUrl().replace(/\/+$/, '');
  const cfg = getSyncConfig();

  // Build the complete student share URL with embedded video data
  const buildShareUrl = () => {
    const url = new URL(baseUrl);
    url.searchParams.set('country', countryName);
    url.searchParams.set('scene', selectedScene.toString());
    url.searchParams.set('lang', selectedLang);

    // If teacher video is hosted publicly, embed it directly into the student's link!
    if (isPublicWebUrl && rawVideoUrl) {
      url.searchParams.set('video_url', rawVideoUrl);
      url.searchParams.set('video_name', rawVideoName);
      url.searchParams.set('video_scene', selectedScene.toString());
    }

    // Embed Supabase sync config if configured so students connect automatically
    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      url.searchParams.set('sync_url', cfg.supabaseUrl);
      url.searchParams.set('sync_key', cfg.supabaseAnonKey);
    }

    return url.toString();
  };

  const shareUrl = buildShareUrl();

  const handleCopy = async () => {
    await copyTextSafely(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Handler: Upload local IndexedDB video to Supabase Cloud Storage right from ShareModal
  const handleUploadLocalVideoToCloud = async () => {
    setIsUploadingToCloud(true);
    setUploadNotice(null);

    try {
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
        throw new Error(
          isEn
            ? 'Supabase Cloud is not configured yet. Please open "Cloud Settings" to enter your Project URL & Key.'
            : 'Cloud Supabase belum diatur. Silakan klik tombol "Buka Pengaturan Cloud" untuk memasukkan Project URL & Key Anda.'
        );
      }

      // 1. Ambil blob video dari IndexedDB admin
      const allVideos = await getAllCountryVideosFromIndexedDB(countryName);
      const storedItem = allVideos[selectedScene];

      if (!storedItem || !storedItem.record.blob) {
        throw new Error(
          isEn
            ? `No local video found for Scene ${selectedScene} in this browser's memory.`
            : `File video untuk Scene ${selectedScene} tidak ditemukan di memori perangkat ini.`
        );
      }

      const fileName = storedItem.record.fileName || `Scene_${selectedScene}.mp4`;
      const sizeText = storedItem.record.fileSize || '';

      // 2. Upload ke Supabase Cloud
      const cloudRes = await uploadVideoToCloud(
        countryName,
        selectedScene,
        storedItem.record.blob,
        fileName,
        sizeText
      );

      if (cloudRes && cloudRes.videoUrl) {
        setCustomPublicUrl(cloudRes.videoUrl);
        setCustomPublicFileName(fileName);
        if (onVideoUploadedToCloud) {
          onVideoUploadedToCloud(selectedScene, cloudRes.videoUrl, fileName);
        }

        setUploadNotice({
          type: 'success',
          text: isEn
            ? `Success! Video uploaded to Cloud Storage. The student link below now contains the video and can be viewed anywhere!`
            : `Berhasil! Video telah terunggah ke Cloud. Tautan siswa di bawah ini otomatis memuat video dan kini bisa dibuka di gawai siswa mana pun!`,
        });
      }
    } catch (err: any) {
      setUploadNotice({
        type: 'error',
        text: err.message || (isEn ? 'Failed to upload video to cloud' : 'Gagal mengunggah video ke cloud'),
      });
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  // Handler: Apply external direct video URL (Google Drive, YouTube, Cloudinary, direct MP4)
  const handleApplyExternalUrl = () => {
    if (!externalUrlInput.trim()) return;

    let clean = externalUrlInput.trim();
    // Convert Google Drive share link to direct stream
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = clean.match(driveRegex);
    if (match && match[1]) {
      clean = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    setCustomPublicUrl(clean);
    const label = isEn ? `Cloud Video (Scene ${selectedScene})` : `Video Cloud (Scene ${selectedScene})`;
    setCustomPublicFileName(label);

    if (onVideoUploadedToCloud) {
      onVideoUploadedToCloud(selectedScene, clean, label);
    }

    setUploadNotice({
      type: 'success',
      text: isEn
        ? 'Public video link applied! Student link updated.'
        : 'Tautan video publik berhasil diterapkan! Tautan siswa telah diperbarui.',
    });

    setExternalUrlInput('');
    setShowExternalInput(false);
  };

  const shareText = isEn
    ? `Hello students! Open the interactive learning module for ${countryName} (Scene ${selectedScene}) on EduZone: ${shareUrl}`
    : `Halo siswa! Buka modul pembelajaran interaktif negara ${countryName} (Scene ${selectedScene}) di EduZone: ${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDarkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-amber-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-stone-800 bg-stone-950/70' : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white shadow">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isEn ? 'Share Module with Students' : 'Bagikan Modul ke Siswa'}
              </h3>
              <p className="text-xs text-stone-400">
                {isEn
                  ? `Interactive link for ${countryName} with instant teacher video playback`
                  : `Tautan belajar negara ${countryName} dengan pemutaran otomatis video guru`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Share Modal"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Quick Scene & Language Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                {isEn ? 'Start at Scene:' : 'Pilih Scene Materi:'}
              </label>
              <select
                value={selectedScene}
                onChange={(e) => {
                  setSelectedScene(parseInt(e.target.value, 10));
                  setCustomPublicUrl(null);
                  setCustomPublicFileName(null);
                  setUploadNotice(null);
                }}
                className="w-full p-2.5 rounded-xl border border-stone-700 bg-stone-950 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Scene {s}: {scenes.find((sc) => sc.number === s)?.titleId || `Scene ${s}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                {isEn ? 'Language:' : 'Bahasa Tampilan Siswa:'}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as 'id' | 'en')}
                className="w-full p-2.5 rounded-xl border border-stone-700 bg-stone-950 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* STATUS PEMERIKSAAN VIDEO GURU */}
          {isPublicWebUrl ? (
            /* KASUS A: Video Sudah Berada di Cloud / Web Publik */
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {isEn ? 'Teacher Video Embedded in Link!' : 'Video Materi Guru Telah Disematkan di Link!'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed pl-6">
                {isEn
                  ? `The video "${rawVideoName}" is securely hosted in cloud storage and embedded into the student URL. Students can view it on their phones, laptops, and iPads without logging in!`
                  : `Video "${rawVideoName}" tersimpan di Cloud Storage dan otomatis tersemat di tautan siswa. Begitu siswa membuka link, Layar 2 langsung memutar video ini!`}
              </p>
            </div>
          ) : isLocalIndexedDbOnly ? (
            /* KASUS B: Video Masih Tersimpan Offline di IndexedDB Admin (Akar Masalah Gawai Siswa Tidak Bisa Buka) */
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/50 text-amber-200 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs text-amber-300">
                    {isEn ? 'Video is currently stored only in Admin Offline Memory' : 'Video Masih Berada di Memori Lokal HP/Laptop Guru (Offline)'}
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {isEn
                      ? `Video "${rawVideoName}" is saved in this browser's IndexedDB. Student devices cannot view files directly from your device's memory. To let students watch:`
                      : `Video "${rawVideoName}" saat ini tersimpan di memori HP admin (Saved Offline/IndexedDB). Gawai siswa tidak dapat membaca memori HP guru secara langsung. Pilih salah satu cara berikut agar siswa bisa menonton:`}
                  </p>
                </div>
              </div>

              {/* Tombol Tindakan Cepat */}
              <div className="flex flex-wrap gap-2 pt-1 pl-6">
                <button
                  onClick={handleUploadLocalVideoToCloud}
                  disabled={isUploadingToCloud}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow"
                >
                  {isUploadingToCloud ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isUploadingToCloud
                      ? (isEn ? 'Uploading to Cloud...' : 'Mengunggah ke Cloud...')
                      : (isEn ? '1-Click Upload to Supabase Cloud' : '1-Klik Unggah ke Cloud Supabase')}
                  </span>
                </button>

                <button
                  onClick={() => setShowExternalInput((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition border border-stone-700 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Use Drive / YouTube Link' : 'Gunakan Link Google Drive / YouTube'}</span>
                </button>

                {onOpenSyncModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSyncModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-semibold transition border border-stone-800 cursor-pointer"
                  >
                    <span>{isEn ? 'Cloud Settings' : 'Buka Pengaturan Cloud'}</span>
                  </button>
                )}
              </div>

              {/* Form Input URL Google Drive / External */}
              {showExternalInput && (
                <div className="mt-2 pl-6 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={externalUrlInput}
                      onChange={(e) => setExternalUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... atau https://youtube.com/..."
                      className="flex-1 p-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      onClick={handleApplyExternalUrl}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
                    >
                      {isEn ? 'Apply' : 'Terapkan'}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {isEn
                      ? 'Tip: Paste any Google Drive (public view), YouTube, or Cloudinary URL.'
                      : 'Tips: Tempel link Google Drive (akses publik) atau link web MP4 langsung.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* KASUS C: Belum ada video tambahan di scene ini */
            <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-400 flex items-center gap-2.5">
              <Film className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                {isEn
                  ? `Scene ${selectedScene} currently plays the official Curriculum Documentary (Screen 1). To add teacher videos, upload in Screen 2.`
                  : `Scene ${selectedScene} akan memutar Video Dokumenter Kurikulum resmi (Layar 1). Jika ingin menyertakan materi guru di Layar 2, unggah video pada panel Layar 2.`}
              </p>
            </div>
          )}

          {/* Notifikasi Status Unggah */}
          {uploadNotice && (
            <div
              className={`p-3 rounded-xl border text-[11px] flex items-center gap-2 ${
                uploadNotice.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                  : 'bg-red-950/40 text-red-300 border-red-800'
              }`}
            >
              {uploadNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span className="leading-relaxed">{uploadNotice.text}</span>
            </div>
          )}

          {/* KOTAK TAUTAN SISWA DENGAN TOMBOL SALIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{isEn ? 'Direct Student Learning Link:' : 'Tautan Pembelajaran Langsung Siswa:'}</span>
              </label>

              <button
                onClick={() => setShowQrCode((prev) => !prev)}
                className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{showQrCode ? (isEn ? 'Hide QR' : 'Tutup QR') : (isEn ? 'Show QR Code' : 'Tampilkan QR Code')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 p-2.5 rounded-xl border border-stone-700 bg-stone-950 text-xs font-mono text-stone-300 focus:outline-none focus:border-amber-500 select-all"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition active:scale-95 shadow shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Link' : 'Salin Tautan')}</span>
              </button>
            </div>

            {copied && (
              <p className="mt-1.5 text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {isEn
                    ? 'Student link copied to clipboard! Ready to share.'
                    : 'Tautan siswa berhasil disalin! Siap dikirim ke grup kelas atau siswa.'}
                </span>
              </p>
            )}
          </div>

          {/* QR CODE POPUP UNTUK TAYANG DI PROYEKTOR KELAS */}
          {showQrCode && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center gap-2 text-center animate-in fade-in">
              <div className="p-2.5 rounded-xl bg-white shadow-xl">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Siswa"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                {isEn
                  ? 'Students can scan this QR code directly with their phone camera to open the lesson.'
                  : 'Siswa dapat langsung memindai QR code ini menggunakan kamera HP untuk membuka modul.'}
              </p>
            </div>
          )}

          {/* Social / Messaging Direct Share Shortcuts */}
          <div className="pt-2 border-t border-stone-800 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              {isEn ? 'Quick Share to Class:' : 'Kirim Cepat ke Kelas:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Grup Kelas</span>
              </a>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 text-xs font-bold transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Classroom / LMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDarkMode ? 'border-stone-800 bg-stone-950/70' : 'border-amber-100 bg-amber-50/70'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
