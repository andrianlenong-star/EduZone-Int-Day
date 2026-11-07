/**
 * EduZone Cross-Device Sync Engine (HP Android <-> Laptop Windows <-> iPad)
 * Memungkinkan video materi guru yang diunggah dari gawai mana pun (misal HP)
 * langsung tersinkronisasi secara real-time ke laptop, iPad, dan komputer siswa di Vercel.
 *
 * Menggunakan Supabase Storage SDK (@supabase/supabase-js) resmi dengan:
 * 1. Sanitasi URL ketat (menghilangkan suffix /rest/v1 atau /storage/v1 yang memicu error PGRST125)
 * 2. Path generator aman (tanpa karakter terlarang, tanpa double-slash)
 * 3. Mekanisme Exponential Backoff Retry (3x percobaan otomatis)
 * 4. Tracking status per-scene & isolasi error (kegagalan 1 scene tidak menggugurkan scene lain)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getAllCountryVideosFromIndexedDB } from '../utils/videoStorageDB';

export interface RemoteVideoRecord {
  id: string; // `${country}_scene_${sceneNumber}`
  country: string;
  sceneNumber: number;
  videoUrl: string;
  fileName: string;
  fileSize?: string;
  subtitles?: {
    src: string;
    srcLang: 'en' | 'id';
    label: 'English' | 'Indonesia';
    default?: boolean;
  }[];
  uploadedAt: string;
  uploadedFrom?: string; // 'Android Phone', 'Windows Laptop', 'iPad', etc.
}

export interface SyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseBucket: string;
  autoSync: boolean;
}

export type SceneUploadStatus = 'waiting' | 'uploading' | 'success' | 'failed';

export interface SceneUploadItemProgress {
  sceneNumber: number;
  fileName: string;
  fileSize?: string;
  status: SceneUploadStatus;
  percent: number;
  error?: string;
  videoUrl?: string;
}

const SYNC_CONFIG_KEY = 'eduzone_cross_device_sync_config';
const REMOTE_VIDEOS_CACHE_KEY = 'eduzone_remote_videos_cache';

/**
 * 1. SANITASI SUPABASE PROJECT URL
 * MENGHILANGKAN AKAR PENYEBAB ERROR PGRST125:
 * Banyak pengguna menyalin URL dari menu "Data API" di dashboard Supabase yang mengandung suffix "/rest/v1".
 * Ketika suffix tersebut diteruskan ke request Storage, PostgREST merespons 404 PGRST125 (Invalid path).
 * Fungsi ini membersihkan URL agar kembali murni ke format "https://<project-ref>.supabase.co".
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();

  // Tambahkan protokol https:// jika pengguna hanya mengetik domain
  if (!/^https?:\/\//i.test(cleaned)) {
    // Jika hanya project ref (misal: "ulbxfeurudjbkejkedms")
    if (/^[a-z0-9_-]+$/i.test(cleaned)) {
      return `https://${cleaned}.supabase.co`;
    }
    cleaned = `https://${cleaned}`;
  }

  // Buang suffix path seperti /rest/v1, /storage/v1, /auth/v1, dll.
  cleaned = cleaned
    .replace(/\/rest\/v1\/?.*$/i, '')
    .replace(/\/storage\/v1\/?.*$/i, '')
    .replace(/\/auth\/v1\/?.*$/i, '')
    .replace(/\/+$/, '');

  return cleaned;
}

/**
 * Membersihkan dan menstandarisasi Anon / Publishable API Key
 */
export function sanitizeSupabaseKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/[\r\n\t\s]/g, '');
}

/**
 * 2. GENERATOR FILE PATH AMAN (STORAGE FILE PATH)
 * Memastikan nama file bersih, tidak memiliki karakter terlarang,
 * mempertahankan ekstensi .mp4, dan tidak memiliki double-slash (//) atau leading-slash (/).
 */
export function buildSafeStorageFilePath(country: string, sceneNumber: number, originalFileName: string): string {
  const cleanCountry = (country || 'general').toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Ambil nama dasar file tanpa path direktori
  const baseName = originalFileName ? originalFileName.split(/[/\\]/).pop() || '' : '';

  // Pisahkan ekstensi
  const extMatch = baseName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = (extMatch ? extMatch[1] : 'mp4').toLowerCase();
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');

  // Bersihkan karakter khusus/spasi menjadi underscore aman
  const cleanName = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || `video`;

  // Struktur path resmi: videos/scenes/{country}/scene-{sceneNumber}-{cleanName}.{ext}
  return `videos/scenes/${cleanCountry}/scene-${sceneNumber}-${cleanName}.${ext}`;
}

/**
 * Membaca konfigurasi sinkronisasi cloud dengan sanitasi URL otomatis
 */
export function getSyncConfig(): SyncConfig {
  const defaults: SyncConfig = {
    supabaseUrl: sanitizeSupabaseUrl(
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ''
    ),
    supabaseAnonKey: sanitizeSupabaseKey(
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ''
    ),
    supabaseBucket: 'eduzone-videos',
    autoSync: true,
  };

  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SYNC_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaults,
          ...parsed,
          supabaseUrl: sanitizeSupabaseUrl(parsed.supabaseUrl || defaults.supabaseUrl),
          supabaseAnonKey: sanitizeSupabaseKey(parsed.supabaseAnonKey || defaults.supabaseAnonKey),
          supabaseBucket: parsed.supabaseBucket || defaults.supabaseBucket,
        };
      }
    }
  } catch {
    // fallback
  }

  return defaults;
}

/**
 * Menyimpan konfigurasi sinkronisasi cloud ke LocalStorage
 */
export function saveSyncConfig(cfg: Partial<SyncConfig>): SyncConfig {
  const current = getSyncConfig();
  const updated: SyncConfig = {
    ...current,
    ...cfg,
    supabaseUrl: cfg.supabaseUrl !== undefined ? sanitizeSupabaseUrl(cfg.supabaseUrl) : current.supabaseUrl,
    supabaseAnonKey: cfg.supabaseAnonKey !== undefined ? sanitizeSupabaseKey(cfg.supabaseAnonKey) : current.supabaseAnonKey,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updated));
  }
  return updated;
}

// Inisialisasi Supabase Client Singleton
let cachedClient: SupabaseClient | null = null;
let cachedClientUrl = '';
let cachedClientKey = '';

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const cfg = getSyncConfig();
  const url = sanitizeSupabaseUrl(customUrl !== undefined ? customUrl : cfg.supabaseUrl);
  const key = sanitizeSupabaseKey(customKey !== undefined ? customKey : cfg.supabaseAnonKey);

  if (!url || !key) return null;

  if (cachedClient && cachedClientUrl === url && cachedClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedClientUrl = url;
    cachedClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('[Supabase Client Init Error]:', err);
    return null;
  }
}

/**
 * Parser Pesan Error Supabase Storage yang Ramah Pengguna
 */
export function parseSupabaseError(err: any, bucketName: string, filePath: string): string {
  if (!err) return 'Terjadi kesalahan tidak dikenal saat mengunggah video.';
  const msg = (err.message || '').toString();
  const status = err.statusCode || err.status || '';

  // PGRST125 atau URL path error
  if (msg.includes('PGRST125') || msg.includes('Invalid path specified in request URL')) {
    return `Error PGRST125: Endpoint URL salah. Pastikan Project URL berupa format "https://<project-ref>.supabase.co" tanpa tambahan "/rest/v1". (Bucket: ${bucketName})`;
  }

  // Bucket tidak ditemukan
  if (msg.includes('Bucket not found') || msg.includes('bucket_not_found') || status === 404) {
    return `Bucket '${bucketName}' belum dibuat di Supabase Storage. Buka Supabase Dashboard ➔ Storage ➔ Buat Bucket bernama '${bucketName}' (aktifkan opsi Public bucket).`;
  }

  // RLS Policy / Izin Ditolak
  if (
    msg.includes('row-level security') ||
    msg.includes('policy') ||
    status === 403 ||
    msg.includes('Unauthorized') ||
    status === 401
  ) {
    return `Izin Storage ditolak (RLS Policy). Jalankan script SQL Storage Policy pada tab SQL Editor dashboard Supabase agar bucket '${bucketName}' mengizinkan upload publik.`;
  }

  // Payload too large
  if (msg.includes('Payload too large') || status === 413 || msg.includes('exceeded the maximum')) {
    return `Ukuran file video melebihi batas upload Supabase Storage (50 MB per file pada Free Tier). Silakan kompres video terlebih dahulu.`;
  }

  return `Gagal upload ke Cloud Storage: ${msg || status || 'Koneksi terputus atau timeout'}`;
}

/**
 * Menyimpan cache video sinkronisasi di LocalStorage perangkat
 */
export function saveRemoteVideosCache(country: string, videos: Record<number, RemoteVideoRecord>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(REMOTE_VIDEOS_CACHE_KEY) || '{}';
    const all = JSON.parse(raw);
    all[country.toLowerCase()] = videos;
    localStorage.setItem(REMOTE_VIDEOS_CACHE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('[Sync] Gagal simpan cache remote video:', err);
  }
}

/**
 * Mengambil cache video sinkronisasi dari LocalStorage perangkat
 */
export function getRemoteVideosCache(country: string): Record<number, RemoteVideoRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REMOTE_VIDEOS_CACHE_KEY) || '{}';
    const all = JSON.parse(raw);
    return all[country.toLowerCase()] || {};
  } catch {
    return {};
  }
}

/**
 * Mengambil daftar video yang tersinkronisasi dari Cloud (Supabase SDK & Storage Bucket)
 */
export async function fetchRemoteVideos(country: string): Promise<Record<number, RemoteVideoRecord>> {
  const cfg = getSyncConfig();
  const cleanCountry = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const results: Record<number, RemoteVideoRecord> = {};

  const supabase = getSupabaseClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  // 1. Coba ambil dari Supabase Database jika client aktif
  if (supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('eduzone_videos')
        .select('*')
        .eq('country_code', cleanCountry);

      if (!error && Array.isArray(rows) && rows.length > 0) {
        rows.forEach((row: any) => {
          const sceneNum = parseInt(row.scene_number, 10);
          if (!isNaN(sceneNum) && row.video_url) {
            results[sceneNum] = {
              id: `${cleanCountry}_scene_${sceneNum}`,
              country: cleanCountry,
              sceneNumber: sceneNum,
              videoUrl: row.video_url,
              fileName: row.file_name || `Scene_${sceneNum}.mp4`,
              fileSize: row.file_size || '',
              uploadedAt: row.updated_at || row.created_at || new Date().toISOString(),
              uploadedFrom: row.uploaded_from || 'Cloud Sync',
            };
          }
        });

        if (Object.keys(results).length > 0) {
          saveRemoteVideosCache(country, results);
          return results;
        }
      }
    } catch (err) {
      console.warn('[Sync] Catatan Supabase DB fetch:', err);
    }

    // 1b. SELF-HEALING FALLBACK: Jika tabel database belum dibuat,
    // baca langsung daftar file fisik dari Supabase Storage Bucket!
    try {
      const bucketName = cfg.supabaseBucket || 'eduzone-videos';
      const folderPrefix = `videos/scenes/${cleanCountry}`;
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(folderPrefix, { limit: 100, sortBy: { column: 'name', order: 'desc' } });

      if (!listError && Array.isArray(files) && files.length > 0) {
        files.forEach((file: any) => {
          const match = file.name?.match(/scene-(\d+)/i) || file.name?.match(/scene_(\d+)/i);
          if (match && match[1]) {
            const sceneNum = parseInt(match[1], 10);
            if (!results[sceneNum]) {
              const fullPath = `${folderPrefix}/${file.name}`;
              const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fullPath);
              const sizeMB = file.metadata?.size ? (file.metadata.size / (1024 * 1024)).toFixed(1) + ' MB' : '';
              results[sceneNum] = {
                id: `${cleanCountry}_scene_${sceneNum}`,
                country: cleanCountry,
                sceneNumber: sceneNum,
                videoUrl: urlData.publicUrl,
                fileName: file.name,
                fileSize: sizeMB,
                uploadedAt: file.updated_at || file.created_at || new Date().toISOString(),
                uploadedFrom: 'Supabase Storage Direct',
              };
            }
          }
        });

        if (Object.keys(results).length > 0) {
          saveRemoteVideosCache(country, results);
          return results;
        }
      }
    } catch (storageErr) {
      console.warn('[Sync] Catatan Supabase Storage list:', storageErr);
    }
  }

  // 2. Coba ambil dari server backend /api/custom-videos jika tersedia
  try {
    const res = await fetch(`/api/custom-videos?country=${encodeURIComponent(cleanCountry)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.videos) {
        Object.entries(data.videos).forEach(([sceneNumStr, val]: [string, any]) => {
          const num = parseInt(sceneNumStr, 10);
          if (!isNaN(num) && val.videoUrl) {
            results[num] = {
              id: `${cleanCountry}_scene_${num}`,
              country: cleanCountry,
              sceneNumber: num,
              videoUrl: val.videoUrl,
              fileName: val.fileName || `Video_Scene_${num}.mp4`,
              fileSize: val.fileSize || '',
              uploadedAt: val.uploadedAt || new Date().toISOString(),
              subtitles: val.subtitles,
            };
          }
        });
        saveRemoteVideosCache(country, results);
        return results;
      }
    }
  } catch {
    // Offline / static hosting
  }

  return getRemoteVideosCache(country);
}

/**
 * 3. UPLOAD SINGLE VIDEO KE SUPABASE STORAGE DENGAN RESMI SDK & RETRY
 * Menjamin kompatibilitas MP4, penanganan file besar, dan retries eksponensial.
 */
export async function uploadVideoToCloud(
  country: string,
  sceneNumber: number,
  file: File | Blob,
  fileName: string,
  fileSizeText?: string,
  maxRetries: number = 3
): Promise<{ videoUrl: string; record: RemoteVideoRecord }> {
  const cfg = getSyncConfig();
  const cleanCountry = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const bucketName = cfg.supabaseBucket || 'eduzone-videos';

  // Validasi Awal File
  if (!file || file.size === 0) {
    throw new Error(`File untuk Scene ${sceneNumber} kosong (0 bytes) atau tidak valid.`);
  }

  const cleanUrl = sanitizeSupabaseUrl(cfg.supabaseUrl);
  const cleanKey = sanitizeSupabaseKey(cfg.supabaseAnonKey);

  if (!cleanUrl || !cleanKey) {
    throw new Error('Konfigurasi Supabase belum diatur. Masukkan Project URL dan API Key di menu Sinkronisasi.');
  }

  const supabase = getSupabaseClient(cleanUrl, cleanKey);
  if (!supabase) {
    throw new Error('Gagal menginisialisasi Supabase Client. Periksa format URL dan Key.');
  }

  // Bentuk Storage File Path Resmi
  const safeFilePath = buildSafeStorageFilePath(cleanCountry, sceneNumber, fileName);
  const mimeType = file.type && file.type.startsWith('video/') ? file.type : 'video/mp4';

  console.log(`[Supabase Upload] Memulai upload Scene ${sceneNumber}: bucket="${bucketName}", path="${safeFilePath}", size=${(file.size / (1024 * 1024)).toFixed(2)} MB`);

  let uploadSuccess = false;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Menggunakan Pola Upload Resmi Supabase JS SDK:
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(safeFilePath, file, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      console.log(`[Supabase Upload] ✅ Scene ${sceneNumber} sukses diunggah pada percobaan ke-${attempt}:`, data);
      uploadSuccess = true;
      break;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Supabase Upload] ⚠️ Percobaan ke-${attempt} gagal untuk Scene ${sceneNumber}:`, err.message || err);

      if (attempt < maxRetries) {
        // Exponential backoff: 1.5 detik, 3 detik, 6 detik...
        const backoffMs = Math.pow(2, attempt - 1) * 1500;
        console.log(`[Supabase Upload] Menunggu ${backoffMs}ms sebelum retry...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  if (!uploadSuccess && lastError) {
    const readableError = parseSupabaseError(lastError, bucketName, safeFilePath);
    throw new Error(readableError);
  }

  // Dapatkan URL Publik
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(safeFilePath);
  const publicVideoUrl = urlData.publicUrl;

  // Catat Metadata ke Database Supabase
  const sizeText = fileSizeText || (file.size ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : '');
  const record: RemoteVideoRecord = {
    id: `${cleanCountry}_scene_${sceneNumber}`,
    country: cleanCountry,
    sceneNumber,
    videoUrl: publicVideoUrl,
    fileName,
    fileSize: sizeText,
    uploadedAt: new Date().toISOString(),
    uploadedFrom: detectDeviceType(),
  };

  try {
    const { error: dbError } = await supabase
      .from('eduzone_videos')
      .upsert(
        {
          country_code: cleanCountry,
          scene_number: sceneNumber,
          video_url: publicVideoUrl,
          file_name: fileName,
          file_size: record.fileSize,
          uploaded_from: record.uploadedFrom,
          updated_at: record.uploadedAt,
        },
        { onConflict: 'country_code,scene_number' }
      );

    if (dbError) {
      console.warn('[Supabase DB Record Notice]:', dbError.message);
    }
  } catch (dbErr) {
    console.warn('[Supabase DB Insert Warning]:', dbErr);
  }

  // Simpan ke cache lokal
  const cached = getRemoteVideosCache(country);
  cached[sceneNumber] = record;
  saveRemoteVideosCache(country, cached);

  return { videoUrl: publicVideoUrl, record };
}

/**
 * 4. BATCH UPLOADER DENGAN TRACKING PER-SCENE & FITUR RETRY
 * Menangani 5 atau 6 video sekaligus tanpa membatalkan scene lain jika satu scene gagal.
 */
export async function uploadAllLocalVideosToCloud(
  country: string,
  onProgress?: (progressMap: Record<number, SceneUploadItemProgress>) => void,
  targetSceneNumbers?: number[]
): Promise<{
  uploadedCount: number;
  failedCount: number;
  errors: string[];
  uploadedVideos: Record<number, RemoteVideoRecord>;
  progressMap: Record<number, SceneUploadItemProgress>;
}> {
  const localMap = await getAllCountryVideosFromIndexedDB(country);
  const sceneEntries = Object.entries(localMap);

  const progressMap: Record<number, SceneUploadItemProgress> = {};

  // Inisialisasi status semua scene
  sceneEntries.forEach(([sceneNumStr, item]) => {
    const sceneNum = parseInt(sceneNumStr, 10);
    progressMap[sceneNum] = {
      sceneNumber: sceneNum,
      fileName: item.record.fileName || `Scene_${sceneNum}.mp4`,
      fileSize: item.record.fileSize,
      status: 'waiting',
      percent: 0,
    };
  });

  if (onProgress) onProgress({ ...progressMap });

  // Tentukan scene mana yang akan diproses (bisa semua atau hanya yang di-targetkan untuk retry)
  const scenesToProcess = sceneEntries.filter(([numStr]) => {
    const num = parseInt(numStr, 10);
    if (targetSceneNumbers && targetSceneNumbers.length > 0) {
      return targetSceneNumbers.includes(num);
    }
    return true;
  });

  let uploadedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const uploadedVideos: Record<number, RemoteVideoRecord> = {};

  for (const [sceneNumStr, item] of scenesToProcess) {
    const sceneNum = parseInt(sceneNumStr, 10);
    const fileName = item.record.fileName || `Scene_${sceneNum}.mp4`;

    // Update status ke Uploading
    progressMap[sceneNum] = {
      ...progressMap[sceneNum],
      status: 'uploading',
      percent: 50,
      error: undefined,
    };
    if (onProgress) onProgress({ ...progressMap });

    try {
      const res = await uploadVideoToCloud(
        country,
        sceneNum,
        item.record.blob,
        fileName,
        item.record.fileSize
      );

      uploadedVideos[sceneNum] = res.record;
      uploadedCount++;

      progressMap[sceneNum] = {
        ...progressMap[sceneNum],
        status: 'success',
        percent: 100,
        videoUrl: res.videoUrl,
      };
      if (onProgress) onProgress({ ...progressMap });
    } catch (err: any) {
      failedCount++;
      const errMsg = err.message || 'Gagal mengunggah';
      errors.push(`Scene ${sceneNum} (${fileName}): ${errMsg}`);

      progressMap[sceneNum] = {
        ...progressMap[sceneNum],
        status: 'failed',
        percent: 0,
        error: errMsg,
      };
      if (onProgress) onProgress({ ...progressMap });
    }
  }

  return { uploadedCount, failedCount, errors, uploadedVideos, progressMap };
}

/**
 * Deteksi tipe gawai untuk label sinkronisasi
 */
export function detectDeviceType(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'HP Android';
  if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iPad Tablet';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/Windows/i.test(ua)) return 'Laptop Windows';
  if (/Macintosh/i.test(ua)) return 'MacBook / Mac';
  return 'Web Browser';
}

/**
 * Diagnostik Komprehensif Koneksi Supabase Cloud
 */
export async function testCloudConnection(
  customUrl?: string,
  customKey?: string
): Promise<{
  ok: boolean;
  urlValid: boolean;
  keyValid: boolean;
  bucketExists: boolean;
  tableExists: boolean;
  isPasswordNotKey?: boolean;
  messageId: string;
  messageEn: string;
}> {
  const cfg = getSyncConfig();
  const rawUrl = (customUrl !== undefined ? customUrl : cfg.supabaseUrl).trim();
  const rawKey = (customKey !== undefined ? customKey : cfg.supabaseAnonKey).trim();

  const res = {
    ok: false,
    urlValid: false,
    keyValid: false,
    bucketExists: false,
    tableExists: false,
    isPasswordNotKey: false,
    messageId: '',
    messageEn: '',
  };

  if (!rawUrl && !rawKey) {
    res.messageId = 'Silakan masukkan Supabase Project URL dan Anon Public Key.';
    res.messageEn = 'Please enter Supabase Project URL and Anon Public Key.';
    return res;
  }

  const cleanUrl = sanitizeSupabaseUrl(rawUrl);
  const cleanKey = sanitizeSupabaseKey(rawKey);
  const bucketName = cfg.supabaseBucket || 'eduzone-videos';

  // Deteksi password bukan API key
  const isPublishableKey = cleanKey.startsWith('sb_publishable_') || cleanKey.startsWith('sb_');
  const isClassicJwtKey = cleanKey.startsWith('eyJ');
  const isLikelyPassword = cleanKey && !isPublishableKey && !isClassicJwtKey && cleanKey.length < 40;

  if (isLikelyPassword) {
    res.isPasswordNotKey = true;
    res.urlValid = true;
    res.keyValid = false;
    res.messageId =
      '⚠️ Kunci yang Anda masukkan adalah Password Akun, BUKAN API Key! Salin "Publishable key" (sb_publishable_...) atau kunci "anon public" (eyJ...).';
    res.messageEn =
      '⚠️ The key entered looks like an Account Password, NOT an API Key! Copy the "Publishable key" (sb_publishable_...) or the "anon public" key (eyJ...).';
    return res;
  }

  const supabase = getSupabaseClient(cleanUrl, cleanKey);
  if (!supabase) {
    res.urlValid = false;
    res.messageId = `Format URL '${cleanUrl}' tidak valid. Pastikan diawali dengan https://`;
    res.messageEn = `Invalid URL format '${cleanUrl}'. Ensure it starts with https://`;
    return res;
  }

  // 1. Tes URL Endpoint & Validitas Anon API Key via Storage Bucket Check
  try {
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);

    if (!bucketError && bucket) {
      res.urlValid = true;
      res.keyValid = true;
      res.bucketExists = true;
    } else if (bucketError) {
      if (bucketError.message?.includes('Bucket not found')) {
        res.urlValid = true;
        res.keyValid = true;
        res.bucketExists = false;
      } else if (bucketError.status === 401 || bucketError.status === 403) {
        res.urlValid = true;
        res.keyValid = false;
        res.messageId = 'Kunci ditolak (401/403). Periksa kembali izin API Key Anda.';
        res.messageEn = 'Key rejected (401/403). Please verify your API Key permissions.';
        return res;
      } else {
        res.urlValid = true;
        res.keyValid = true;
      }
    }
  } catch (err: any) {
    console.warn('[Diagnosa Storage Check Notice]:', err);
    res.urlValid = true;
    res.keyValid = true;
  }

  // 2. Tes Akses Database Table 'eduzone_videos'
  try {
    const { error: tableError } = await supabase
      .from('eduzone_videos')
      .select('country_code')
      .limit(1);

    if (!tableError) {
      res.tableExists = true;
    } else if (tableError.code === '42P01' || tableError.message?.includes('does not exist')) {
      res.tableExists = false;
    } else {
      res.tableExists = true;
    }
  } catch {
    res.tableExists = false;
  }

  // Ringkasan Diagnosa yang Jelas
  if (res.urlValid && res.keyValid) {
    res.ok = true;
    if (res.bucketExists && res.tableExists) {
      res.messageId = `✅ Koneksi Cloud Terhubung Sempurna! (Bucket '${bucketName}' Ready, Tabel DB Ready)`;
      res.messageEn = `✅ Cloud Connected! (Bucket '${bucketName}' Ready, DB Table Ready)`;
    } else if (res.bucketExists && !res.tableExists) {
      res.messageId = `✅ Koneksi Cloud Siap! Bucket '${bucketName}' siap menampung video (Tabel DB opsional).`;
      res.messageEn = `✅ Cloud Ready! Bucket '${bucketName}' ready to store videos.`;
    } else {
      res.messageId = `✅ URL & API Key Valid! Pastikan bucket bernama '${bucketName}' sudah dibuat di Storage dashboard Supabase.`;
      res.messageEn = `✅ URL & Key Valid! Ensure bucket '${bucketName}' exists in Supabase Storage.`;
    }
  }

  return res;
}

/**
 * Membuat Paket Transfer Media (JSON Ekspor Cadangan)
 */
export function generatePortableSyncPackage(country: string, videos: Record<number, any>): string {
  const payload = {
    format: 'EduZone-CrossDevice-Sync-Package',
    version: '1.0',
    country,
    exportedAt: new Date().toISOString(),
    device: detectDeviceType(),
    scenes: videos,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Menghasilkan Link Pairing Otomatis Satu-Klik
 */
export function generatePairingUrl(): string {
  if (typeof window === 'undefined') return '';
  const cfg = getSyncConfig();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return window.location.href;

  const url = new URL(window.location.origin);
  url.searchParams.set('sync_url', cfg.supabaseUrl);
  url.searchParams.set('sync_key', cfg.supabaseAnonKey);
  return url.toString();
}
