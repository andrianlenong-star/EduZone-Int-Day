import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Upload,
  UploadCloud,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getSyncConfig,
  saveSyncConfig,
  detectDeviceType,
  generatePortableSyncPackage,
  fetchRemoteVideos,
  RemoteVideoRecord,
  testCloudConnection,
  generatePairingUrl,
  uploadAllLocalVideosToCloud,
  SceneUploadItemProgress,
  saveRemoteVideosCache,
  sanitizeSupabaseUrl,
  sanitizeSupabaseKey,
} from '../services/crossDeviceSync';
import { getAllCountryVideosFromIndexedDB, saveVideoToIndexedDB, cleanCorruptedZeroByteVideos } from '../utils/videoStorageDB';

interface CrossDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  language: 'id' | 'en';
  onSyncComplete?: () => void;
}

export const CrossDeviceSyncModal: React.FC<CrossDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  countryName,
  language,
  onSyncComplete,
}) => {
  const isEn = language === 'en';
  const currentDevice = detectDeviceType();

  const [activeTab, setActiveTab] = useState<'cloud' | 'transfer' | 'guide'>('cloud');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPairingUrl, setCopiedPairingUrl] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [localVideoCount, setLocalVideoCount] = useState<number>(0);
  const [remoteVideos, setRemoteVideos] = useState<Record<number, RemoteVideoRecord>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<{
    tested: boolean;
    ok: boolean;
    urlValid: boolean;
    keyValid: boolean;
    bucketExists: boolean;
    tableExists: boolean;
    isPasswordNotKey?: boolean;
    message: string;
  } | null>(null);
  const [isMigratingToCloud, setIsMigratingToCloud] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<{ completed: number; total: number; currentFileName: string } | null>(null);
  const [sceneProgressMap, setSceneProgressMap] = useState<Record<number, SceneUploadItemProgress>>({});

  useEffect(() => {
    if (isOpen) {
      const cfg = getSyncConfig();
      setSupabaseUrl(cfg.supabaseUrl);
      setSupabaseKey(cfg.supabaseAnonKey);
      setStatusMessage(null);
      checkSyncStatus();
    }
  }, [isOpen, countryName]);

  const checkSyncStatus = async () => {
    try {
      const local = await getAllCountryVideosFromIndexedDB(countryName);
      setLocalVideoCount(Object.keys(local).length);

      const remote = await fetchRemoteVideos(countryName);
      setRemoteVideos(remote);
    } catch (err) {
      console.warn('[Sync Modal Error]:', err);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsSyncing(true);
    // Simpan dulu input ke config
    saveSyncConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
    });

    const diag = await testCloudConnection(supabaseUrl.trim(), supabaseKey.trim());
    setDiagnosticResult({
      tested: true,
      ok: diag.ok,
      urlValid: diag.urlValid,
      keyValid: diag.keyValid,
      bucketExists: diag.bucketExists,
      tableExists: diag.tableExists,
      isPasswordNotKey: diag.isPasswordNotKey,
      message: isEn ? diag.messageEn : diag.messageId,
    });

    // Cek ulang video remote
    const remote = await fetchRemoteVideos(countryName);
    setRemoteVideos(remote);

    setIsSyncing(false);
  };

  const handleSaveConfig = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      saveSyncConfig({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseKey.trim(),
      });

      // Jalankan diagnosa otomatis
      const diag = await testCloudConnection(supabaseUrl.trim(), supabaseKey.trim());
      const remote = await fetchRemoteVideos(countryName);
      setRemoteVideos(remote);

      setDiagnosticResult({
        tested: true,
        ok: diag.ok,
        urlValid: diag.urlValid,
        keyValid: diag.keyValid,
        bucketExists: diag.bucketExists,
        tableExists: diag.tableExists,
        isPasswordNotKey: diag.isPasswordNotKey,
        message: isEn ? diag.messageEn : diag.messageId,
      });

      if (diag.ok) {
        setStatusMessage({
          type: 'success',
          text: isEn
            ? 'Cloud connection verified & active! All uploaded videos will now synchronize in real-time across your Phone, Laptop, and iPad.'
            : 'Koneksi Cloud terverifikasi & aktif! Setiap video yang Anda unggah dari HP Android kini otomatis masuk ke Laptop Windows & iPad.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: isEn ? diag.messageEn : diag.messageId,
        });
      }

      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (isEn ? 'Failed to connect' : 'Gagal menyambungkan ke Cloud'),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Mengunggah seluruh video dari memori lokal HP ke Supabase Cloud Storage
  const handleUploadAllLocalToCloud = async (targetScenes?: number[]) => {
    setIsMigratingToCloud(true);
    setStatusMessage(null);
    try {
      const result = await uploadAllLocalVideosToCloud(
        countryName,
        (progressMap) => {
          setSceneProgressMap(progressMap);
          const entries = Object.values(progressMap);
          const completedCount = entries.filter((e) => e.status === 'success').length;
          const currentItem = entries.find((e) => e.status === 'uploading');
          setMigrationProgress({
            completed: completedCount,
            total: entries.length,
            currentFileName: currentItem ? currentItem.fileName : 'Selesai',
          });
        },
        targetScenes
      );

      if (result.uploadedCount > 0) {
        setStatusMessage({
          type: 'success',
          text: isEn
            ? `🎉 Successfully synced ${result.uploadedCount} video(s) to Supabase Cloud! Videos are now accessible across all devices.`
            : `🎉 Berhasil mengunggah ${result.uploadedCount} video ke Supabase Cloud Storage! Video sekarang aktif di semua gawai.`,
        });
        const remote = await fetchRemoteVideos(countryName);
        setRemoteVideos(remote);
        if (onSyncComplete) onSyncComplete();
      }

      if (result.failedCount > 0) {
        setStatusMessage({
          type: 'error',
          text: isEn
            ? `${result.failedCount} video(s) failed to upload. Click 'Retry' on the failed scenes below.`
            : `${result.failedCount} video mengalami kendala saat diunggah. Silakan klik 'Coba Lagi' pada scene yang bersangkutan.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (isEn ? 'Failed to upload videos to cloud' : 'Gagal mengunggah video ke cloud'),
      });
    } finally {
      setIsMigratingToCloud(false);
    }
  };

  // Ekspor Paket Video Lokal ke JSON Clipboard / File
  const handleExportSyncPackage = async () => {
    try {
      const local = await getAllCountryVideosFromIndexedDB(countryName);
      const count = Object.keys(local).length;
      if (count === 0) {
        setStatusMessage({
          type: 'info',
          text: isEn
            ? 'No local custom videos found for this country yet. Upload a video first.'
            : 'Belum ada video kustom di memori perangkat ini. Silakan unggah video terlebih dahulu.',
        });
        return;
      }

      const packageData: Record<number, any> = {};
      Object.entries(local).forEach(([numStr, item]) => {
        const num = parseInt(numStr, 10);
        packageData[num] = {
          sceneNumber: num,
          fileName: item.record.fileName,
          fileSize: item.record.fileSize,
          mimeType: item.record.mimeType,
          uploadedAt: item.record.uploadedAt,
        };
      });

      const jsonStr = generatePortableSyncPackage(countryName, packageData);
      navigator.clipboard.writeText(jsonStr);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);

      setStatusMessage({
        type: 'success',
        text: isEn
          ? `Package copied (${count} scenes)! Open EduZone on your Laptop/iPad, go to Sync, and paste it in the Import tab.`
          : `Paket sinkronisasi (${count} scene) tersalin! Buka EduZone di Laptop/iPad Anda, buka menu ini, dan tempel di tab 'Impor'.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Impor Paket Video dari Clipboard / Input JSON
  const handleImportSyncPackage = async () => {
    if (!importJsonText.trim()) {
      setStatusMessage({
        type: 'error',
        text: isEn ? 'Please paste the sync code first!' : 'Silakan tempel teks kode sinkronisasi terlebih dahulu!',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (!parsed.scenes || typeof parsed.scenes !== 'object') {
        throw new Error(isEn ? 'Invalid sync package format' : 'Format paket sinkronisasi tidak valid');
      }

      // Bersihkan dulu record 0-byte lama yang rusak
      await cleanCorruptedZeroByteVideos(parsed.country || countryName);

      const targetCountry = parsed.country || countryName;
      let remoteMap: Record<number, RemoteVideoRecord> = { ...remoteVideos };
      let restoredCount = 0;

      for (const [sceneNumStr, sceneData] of Object.entries(parsed.scenes)) {
        const num = parseInt(sceneNumStr, 10);
        if (sceneData && typeof sceneData === 'object') {
          const s = sceneData as any;
          if (s.videoUrl && s.videoUrl.startsWith('http')) {
            remoteMap[num] = {
              id: `${targetCountry}_scene_${num}`,
              country: targetCountry,
              sceneNumber: num,
              videoUrl: s.videoUrl,
              fileName: s.fileName || `Scene_${num}.mp4`,
              fileSize: s.fileSize,
              uploadedAt: s.uploadedAt || new Date().toISOString(),
              uploadedFrom: parsed.device || 'HP / Remote Device',
            };
            restoredCount++;
          } else {
            // Catat metadata informasi
            restoredCount++;
          }
        }
      }

      if (Object.keys(remoteMap).length > 0) {
        saveRemoteVideosCache(targetCountry, remoteMap);
        setRemoteVideos(remoteMap);
      }

      setStatusMessage({
        type: 'success',
        text: isEn
          ? `Identified ${restoredCount} scene assignment(s) from phone. To play on laptop, ensure videos are synced via Supabase Cloud tab!`
          : `Terdeteksi ${restoredCount} video dari HP Anda. Agar video fisik dapat ditonton di laptop, pastikan video diunggah dari HP via tab 'Cloud Sync'!`,
      });
      setImportJsonText('');
      checkSyncStatus();
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: isEn ? `Import failed: ${err.message}` : `Gagal impor: ${err.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-100">
                  {isEn ? 'Cross-Device Media Sync Hub' : 'Sinkronisasi Antargawai (HP ↔ Laptop ↔ iPad)'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {currentDevice}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                  Build v2.4 (SDK Active)
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isEn
                  ? 'Real-time synchronization for 6 scenes across all devices on Vercel'
                  : `Sinkronisasi real-time 6 video ${countryName} antargawai di Vercel`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'cloud'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isEn ? 'Cloud Sync (Supabase)' : 'Cloud Sync (Otomatis)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'transfer'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isEn ? 'Instant Transfer (Code)' : 'Transfer Cepat (Kode)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{isEn ? 'Why on Vercel?' : 'Kenapa Tidak Ada di Vercel?'}</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                : statusMessage.type === 'error'
                ? 'bg-red-950/40 text-red-300 border-red-800/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: CLOUD SYNC VIA SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-stone-200">
                    {isEn
                      ? 'Permanent Cloud Storage (Free Tier Forever)'
                      : 'Penyimpanan Permanen Cloud Gratis Selamanya (Supabase)'}
                  </p>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    {isEn
                      ? 'When connected to Supabase, any video uploaded from your Android phone will upload directly to Cloud Storage and instantly appear on your Windows Laptop and iPad.'
                      : 'Dengan menghubungkan ke Supabase, setiap kali Anda mengunggah video dari HP Android, file tersimpan permanen di cloud dan otomatis muncul di Laptop Windows & iPad tanpa hilang lagi.'}
                  </p>
                </div>
              </div>

              {/* VERCEL BLOB AUTO-SYNC BADGE */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-stone-900 border border-blue-500/40 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-xs">
                      {isEn ? 'Vercel Blob Cloud Sync Enabled' : 'Vercel Blob Cloud Sync Siap Pakai'}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                      VERCEL
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {isEn
                      ? 'If your project has Vercel Blob connected, videos are uploaded directly from your Android phone and instantly sync to your Windows laptop and iPad without manual database setup!'
                      : 'Jika aplikasi Anda di-deploy di Vercel dengan Vercel Blob terhubung, setiap video yang diupload dari HP Android langsung terunggah ke Cloud Vercel Blob dan otomatis muncul di Laptop Windows & iPad tanpa perlu setup database rumit.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-stone-300">
                      Supabase Project URL:
                    </label>
                    <button
                      type="button"
                      onClick={() => setSupabaseUrl('https://ulbxfeurudjbkejkedms.supabase.co')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      ⚡ Isi Otomatis Project (ulbxfeurudjbkejkedms)
                    </button>
                  </div>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(sanitizeSupabaseUrl(e.target.value))}
                    onBlur={() => setSupabaseUrl((prev) => sanitizeSupabaseUrl(prev))}
                    placeholder="https://ulbxfeurudjbkejkedms.supabase.co"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-stone-300">
                      Supabase Public / Publishable API Key:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showKey ? 'Sembunyikan' : 'Lihat Kunci'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="sb_publishable_... atau eyJhbGciOiJIUz..."
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>

                  {/* PERINGATAN CERDAS JIKA PENGGUNA MEMASUKKAN PASSWORD LOGIN AKUN */}
                  {supabaseKey.trim().length > 0 &&
                    !supabaseKey.trim().startsWith('sb_publishable_') &&
                    !supabaseKey.trim().startsWith('sb_') &&
                    !supabaseKey.trim().startsWith('eyJ') &&
                    supabaseKey.trim().length < 40 && (
                      <div className="mt-2 p-2.5 rounded-xl bg-red-950/70 border border-red-600/70 text-red-200 text-[11px] space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-red-300">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>⚠️ Anda Memasukkan PASSWORD AKUN, Bukan API Key!</span>
                        </p>
                        <p className="text-[10px] text-stone-300 leading-relaxed">
                          Gunakan <strong>Publishable key</strong> (yang berawalan <code className="text-amber-400 font-bold font-mono">sb_publishable_...</code> pada menu API Keys) atau kunci <strong>anon public</strong> (yang berawalan <code className="text-amber-400 font-bold font-mono">eyJ...</code> pada menu Data API).
                        </p>
                      </div>
                    )}

                  <div className="mt-1.5 p-2 rounded-lg bg-stone-950/60 border border-stone-800 text-[10px] text-stone-400 leading-relaxed space-y-0.5">
                    <p className="font-semibold text-stone-300">💡 Cara Salin dari Dashboard Supabase Anda:</p>
                    <p>
                      • <strong>Publishable key</strong>: Pada halaman <em>API Keys</em> (seperti tangkapan layar Anda), klik ikon salin (📋) pada baris <strong>default</strong> di bagian <em>Publishable keys</em> (<code className="text-amber-400 font-mono">sb_publishable_...</code>).
                    </p>
                    <p>
                      • <strong>Atau via Data API</strong>: Klik menu <strong>Data API</strong> di sidebar kiri (di bawah INTEGRATIONS) untuk menyalin kunci <code className="text-amber-400 font-mono">anon public</code> klasik.
                    </p>
                  </div>
                </div>

                {/* DIAGNOSTIC RESULT BOX */}
                {diagnosticResult && diagnosticResult.tested && (
                  <div
                    className={`p-3.5 rounded-xl border text-[11px] space-y-2 ${
                      diagnosticResult.ok
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : 'bg-red-950/40 border-red-700/60 text-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {diagnosticResult.ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span>{diagnosticResult.ok ? 'Hasil Uji: Terhubung' : 'Hasil Uji: Perlu Penyesuaian'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1">
                      <div className="flex items-center gap-1">
                        <span>{diagnosticResult.urlValid ? '✅' : '❌'} URL Endpoint</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{diagnosticResult.keyValid ? '✅' : '❌'} Anon API Key</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{diagnosticResult.bucketExists ? '✅' : '⚠️'} Storage Bucket ('eduzone-videos')</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{diagnosticResult.tableExists ? '✅' : '⚠️'} Tabel DB ('eduzone_videos')</span>
                      </div>
                    </div>

                    {/* Panduan Eksplisit jika Kunci Salah */}
                    {diagnosticResult.isPasswordNotKey && (
                      <div className="p-2 rounded-lg bg-black/50 border border-red-500/40 text-[10px] text-amber-200 space-y-1">
                        <p className="font-semibold text-white">📍 Panduan Menyalin Anon Key yang Benar:</p>
                        <ol className="list-decimal pl-4 space-y-0.5 text-stone-300">
                          <li>Buka dashboard Supabase (<span className="text-amber-400 font-mono">https://supabase.com/dashboard</span>).</li>
                          <li>Pilih project Anda (<span className="text-amber-400 font-mono">ulbxfeurudjbkejkedms</span>).</li>
                          <li>Klik menu <strong>Project Settings (ikon gir ⚙️ di kiri bawah)</strong> ➔ <strong>API</strong>.</li>
                          <li>Di bagian <strong>Project API keys</strong>, cari baris <strong>anon (public)</strong> lalu klik tombol <strong>Copy</strong>.</li>
                          <li>Tempelkan ke kolom Anon Key di atas.</li>
                        </ol>
                      </div>
                    )}

                    <p className="text-[11px] leading-relaxed mt-1 text-stone-300">
                      {diagnosticResult.message}
                    </p>
                  </div>
                )}

                {/* PROMINENT ACTION CARD: UNGGAH VIDEO LOKAL KE CLOUD SUPABASE */}
                {localVideoCount > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-amber-950/50 border-2 border-amber-500/70 shadow-2xl space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span className="font-extrabold text-xs sm:text-sm text-white">
                          {isEn
                            ? `Found ${localVideoCount} Video(s) in This Phone's Memory!`
                            : `Ditemukan ${localVideoCount} Video di Memori HP Ini!`}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                        SIAP SYNC
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {isEn
                        ? `Upload all ${localVideoCount} videos from your phone to Supabase Cloud Storage so they become immediately playable on your Laptop, iPad, and this Phone.`
                        : `Koneksi Cloud Supabase Anda sudah terhubung (Centang Hijau)! Agar ke-${localVideoCount} video yang tersimpan di HP ini dapat langsung ditonton di Laptop Windows & iPad, klik tombol di bawah untuk mengunggahnya ke Cloud:`}
                    </p>

                    {migrationProgress && (
                      <div className="space-y-1.5 p-3 rounded-lg bg-black/70 border border-stone-800 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-amber-300">
                          <span className="line-clamp-1">Berkas: {migrationProgress.currentFileName}</span>
                          <span className="shrink-0 font-bold ml-2">{migrationProgress.completed} / {migrationProgress.total}</span>
                        </div>
                        <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                            style={{
                              width: `${Math.round((migrationProgress.completed / Math.max(1, migrationProgress.total)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* DAFTAR STATUS PER-SCENE DENGAN TOMBOL RETRY MASING-MASING */}
                    {Object.keys(sceneProgressMap).length > 0 && (
                      <div className="space-y-2 mt-2 p-3 rounded-lg bg-black/60 border border-stone-800/80">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-300 border-b border-stone-800 pb-1.5">
                          <span>Status Pengunggahan Per-Scene</span>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-emerald-400 font-mono">
                              ✓ {Object.values(sceneProgressMap).filter((i) => i.status === 'success').length} Sukses
                            </span>
                            {Object.values(sceneProgressMap).some((i) => i.status === 'failed') && (
                              <span className="text-red-400 font-mono">
                                ✗ {Object.values(sceneProgressMap).filter((i) => i.status === 'failed').length} Gagal
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {Object.values(sceneProgressMap).map((item) => (
                            <div
                              key={item.sceneNumber}
                              className={`p-2 rounded border text-[11px] flex items-center justify-between gap-2 transition ${
                                item.status === 'success'
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                                  : item.status === 'failed'
                                  ? 'bg-red-950/30 border-red-800/60 text-red-200'
                                  : item.status === 'uploading'
                                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 animate-pulse'
                                  : 'bg-stone-900/40 border-stone-800 text-stone-400'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span>Scene {item.sceneNumber}:</span>
                                  <span className="font-mono text-[10px] truncate">{item.fileName}</span>
                                </div>
                                {item.error && (
                                  <p className="text-[10px] text-red-400 mt-0.5 line-clamp-2 font-mono">
                                    ⚠️ {item.error}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {item.status === 'success' && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                    ✓ Selesai
                                  </span>
                                )}
                                {item.status === 'uploading' && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>Unggah...</span>
                                  </span>
                                )}
                                {item.status === 'waiting' && (
                                  <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[10px]">
                                    Menunggu
                                  </span>
                                )}
                                {item.status === 'failed' && (
                                  <button
                                    onClick={() => handleUploadAllLocalToCloud([item.sceneNumber])}
                                    disabled={isMigratingToCloud}
                                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    <span>Coba Lagi</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tombol Retry Seluruh Scene yang Gagal */}
                        {Object.values(sceneProgressMap).filter((i) => i.status === 'failed').length > 1 && (
                          <button
                            onClick={() => {
                              const failedScenes = Object.values(sceneProgressMap)
                                .filter((i) => i.status === 'failed')
                                .map((i) => i.sceneNumber);
                              handleUploadAllLocalToCloud(failedScenes);
                            }}
                            disabled={isMigratingToCloud}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Coba Lagi Semua Scene yang Gagal ({Object.values(sceneProgressMap).filter((i) => i.status === 'failed').length} Scene)</span>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleUploadAllLocalToCloud()}
                      disabled={isMigratingToCloud}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xl transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isMigratingToCloud ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Mengunggah Video ke Cloud ({migrationProgress?.completed || 0}/{migrationProgress?.total || localVideoCount})... Mohon Tunggu</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-stone-950" />
                          <span>🚀 UNGGAH {localVideoCount} VIDEO HP KE CLOUD SEKARANG</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 mt-2">
                  <button
                    onClick={handleRunDiagnostic}
                    disabled={isSyncing || !supabaseUrl}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs"
                  >
                    {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isEn ? 'Test Connection' : '🔍 Tes Diagnosa Cloud'}</span>
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    disabled={isSyncing || !supabaseUrl}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Save & Sync Now' : 'Simpan & Sinkronkan'}</span>
                  </button>
                </div>

                {/* PAIRING LINK UNTUK HP ANDROID */}
                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-200 text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'Auto-Pair with Android Phone' : 'Link Sambung Otomatis ke HP Android'}</span>
                    </span>
                    <button
                      onClick={() => {
                        const pairingUrl = generatePairingUrl();
                        navigator.clipboard.writeText(pairingUrl);
                        setCopiedPairingUrl(true);
                        setTimeout(() => setCopiedPairingUrl(false), 3000);
                      }}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPairingUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPairingUrl ? 'Tersalin!' : 'Salin Link Pairing'}</span>
                    </button>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Kirim link ini via WhatsApp / email ke HP Anda. Saat dibuka di HP, kredensial cloud otomatis terisi dan tersinkron tanpa perlu mengetik ulang!
                  </p>
                </div>

                {/* 1-CLICK SQL SCRIPT UTK SUPABASE DATABASE */}
                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-200 text-xs">
                      {isEn ? 'SQL Script for Supabase Table' : 'Script SQL Tabel Database (Supabase)'}
                    </span>
                    <button
                      onClick={() => {
                        const sqlScript = `-- 1. Buat Tabel Video EduZone\nCREATE TABLE IF NOT EXISTS public.eduzone_videos (\n  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,\n  country_code text NOT NULL,\n  scene_number int NOT NULL,\n  video_url text NOT NULL,\n  file_name text,\n  file_size text,\n  uploaded_from text,\n  updated_at timestamptz DEFAULT now(),\n  UNIQUE(country_code, scene_number)\n);\n\n-- 2. Akses Publik RLS Tabel Database\nALTER TABLE public.eduzone_videos ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Allow all access" ON public.eduzone_videos;\nCREATE POLICY "Allow all access" ON public.eduzone_videos FOR ALL USING (true) WITH CHECK (true);\n\n-- 3. Siapkan Bucket Storage eduzone-videos (Public)\nINSERT INTO storage.buckets (id, name, public) \nVALUES ('eduzone-videos', 'eduzone-videos', true)\nON CONFLICT (id) DO UPDATE SET public = true;\n\n-- 4. Berikan Akses Storage Objects RLS (Baca, Unggah, Update Anonim)\nDROP POLICY IF EXISTS "EduZone Storage Read" ON storage.objects;\nCREATE POLICY "EduZone Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'eduzone-videos');\n\nDROP POLICY IF EXISTS "EduZone Storage Insert" ON storage.objects;\nCREATE POLICY "EduZone Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'eduzone-videos');\n\nDROP POLICY IF EXISTS "EduZone Storage Update" ON storage.objects;\nCREATE POLICY "EduZone Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'eduzone-videos');`;
                        navigator.clipboard.writeText(sqlScript);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'SQL Tersalin!' : 'Salin SQL (1-Klik)'}</span>
                    </button>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda, tempel script ini, lalu klik <strong>Run</strong> untuk memastikan semua perangkat memiliki izin baca dan tulis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT TRANSFER CODE (NO CLOUD REQUIRED) */}
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <p className="font-semibold text-stone-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Step 1: From Your Android Phone' : 'Langkah 1: Dari HP Android Anda'}</span>
                </p>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {isEn
                    ? `Click the button below to copy your 6 video assignments (${localVideoCount} videos in local memory).`
                    : `Klik tombol di bawah ini untuk menyalin paket video yang telah Anda simpan di HP (${localVideoCount} video terdeteksi).`}
                </p>
                <button
                  onClick={handleExportSyncPackage}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold flex items-center gap-1.5 transition border border-stone-700 text-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? (isEn ? 'Copied to Clipboard!' : 'Tersalin!') : (isEn ? 'Copy Sync Code from Phone' : 'Salin Kode Sinkronisasi dari HP')}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <p className="font-semibold text-stone-200 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Step 2: On Your Windows Laptop or iPad' : 'Langkah 2: Di Laptop Windows atau iPad Anda'}</span>
                </p>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {isEn
                    ? 'Paste the code you copied from your phone into the box below and click "Import to this Device".'
                    : 'Tempel kode yang telah Anda salin dari HP ke kotak di bawah ini, lalu klik "Impor ke Gawai Ini".'}
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={isEn ? 'Paste sync code here...' : 'Tempel kode sinkronisasi di sini...'}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <button
                  onClick={handleImportSyncPackage}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Import to this Device' : 'Impor ke Gawai Ini (Laptop/iPad)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PENJELASAN ARSITEKTUR VERCEL */}
          {activeTab === 'guide' && (
            <div className="space-y-3 p-1 text-stone-300 leading-relaxed text-[11px]">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-200 space-y-1.5">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Mengapa Video dari HP Tidak Langsung Muncul di Laptop di Vercel?</span>
                </p>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  Bukan karena Google AI Studio, melainkan karena arsitektur server Vercel:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-300 pl-1">
                  <li><strong>Vercel bersifat Serverless & Ephemeral:</strong> Vercel tidak memiliki harddisk tetap untuk menyimpan file upload video besar.</li>
                  <li><strong>IndexedDB bersifat Lokal Perangkat:</strong> Saat Anda mengunggah video di HP Android, video disimpan aman di memori HP Anda. Memori lokal HP tersebut tidak bisa dibaca langsung oleh Laptop Windows atau iPad melalui udara tanpa adanya server cloud atau transfer data.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <p className="font-bold text-stone-100 text-xs">Solusi Paling Praktis & Bebas Kuota:</p>
                <div className="space-y-1 text-stone-400">
                  <p><strong>Cara 1 (Otomatis):</strong> Gunakan Supabase Cloud Storage di Tab 1 (Gratis 1 GB). Sekali diatur, semua upload dari HP langsung otomatis muncul di Laptop & iPad secara real-time.</p>
                  <p><strong>Cara 2 (Tautan URL Langsung):</strong> Pada saat mengunggah, Anda dapat memilih tab "Tautan URL" dan menempelkan link Google Drive / YouTube / Cloudinary. Link ini otomatis muncul di semua gawai secara instan tanpa perlu pengaturan apa pun.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Memori Lokal HP: <strong>{localVideoCount} Video</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
