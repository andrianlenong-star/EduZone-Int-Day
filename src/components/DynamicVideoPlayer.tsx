import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface SubtitleCue {
  start: number; // Detik mulai
  end: number;   // Detik selesai
  text: string;  // Teks subtitle
}

export interface VideoScreenData {
  screenId: number;
  title: string;
  videoUrl: string;
  // Subtitle khusus per screen (misal hasil transkripsi atau file .vtt / cues terverifikasi)
  subtitleCues?: SubtitleCue[];
  vttUrl?: string; 
}

interface DynamicVideoPlayerProps {
  currentScreen: VideoScreenData;
  isSubtitleEnabled?: boolean;
  activeLanguage?: 'en' | 'id';
}

export const DynamicVideoPlayer: React.FC<DynamicVideoPlayerProps> = ({
  currentScreen,
  isSubtitleEnabled = true,
  activeLanguage = 'en',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // State subtitle aktif saat ini
  const [activeCues, setActiveCues] = useState<SubtitleCue[]>([]);
  const activeCuesRef = useRef<SubtitleCue[]>([]); // Ref untuk lookup cepat 60 FPS
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string | null>(null);
  const [isLoadingSubtitles, setIsLoadingSubtitles] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // 1. FUNGSI SINKRONISASI PRESISI TINGGI (AUDIO-SUBTITLE STRICT SYNC)
  // --------------------------------------------------------------------------
  const syncSubtitleWithAudio = useCallback((currentTime: number) => {
    if (!isSubtitleEnabled || activeCuesRef.current.length === 0) {
      setCurrentSubtitleText((prev) => (prev !== null ? null : prev));
      return;
    }

    // Binary / Exact Boundary Check: Subtitle hanya muncul jika currentTime berada di dalam rentang [start, end]
    const matchedCue = activeCuesRef.current.find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );

    const targetText = matchedCue ? matchedCue.text : null;
    
    // Cegah re-render berlebih jika teksnya belum berubah
    setCurrentSubtitleText((prev) => (prev !== targetText ? targetText : prev));
  }, [isSubtitleEnabled]);

  // --------------------------------------------------------------------------
  // 2. DYNAMIC SUBTITLE LOADING & STATE RESET PER SCREEN ID
  // --------------------------------------------------------------------------
  useEffect(() => {
    // LANGKAH PENTING: Reset total state subtitle lama segera saat screen / video berganti
    setActiveCues([]);
    activeCuesRef.current = [];
    setCurrentSubtitleText(null);

    let isSubscribed = true;

    async function loadScreenSubtitles() {
      setIsLoadingSubtitles(true);

      // Prioritas 1: Jika data screen sudah memiliki cues JSON/array langsung
      if (currentScreen.subtitleCues && currentScreen.subtitleCues.length > 0) {
        if (isSubscribed) {
          setActiveCues(currentScreen.subtitleCues);
          activeCuesRef.current = currentScreen.subtitleCues;
          setIsLoadingSubtitles(false);
        }
        return;
      }

      // Prioritas 2: Muat file .vtt dinamis spesifik untuk screen ini
      if (currentScreen.vttUrl) {
        try {
          // Tambahkan cache buster ?t=Date.now() agar browser tidak me-reuse track lama
          const res = await fetch(`${currentScreen.vttUrl}?t=${Date.now()}`);
          if (!res.ok) throw new Error(`Gagal memuat VTT: status ${res.status}`);
          const vttText = await res.text();
          
          if (isSubscribed) {
            const parsed = parseVttToCues(vttText);
            setActiveCues(parsed);
            activeCuesRef.current = parsed;
          }
        } catch (err) {
          console.warn(`[Subtitle] Gagal memuat VTT Screen ${currentScreen.screenId}:`, err);
          if (isSubscribed) {
            setActiveCues([]);
            activeCuesRef.current = [];
          }
        } finally {
          if (isSubscribed) setIsLoadingSubtitles(false);
        }
      } else {
        if (isSubscribed) setIsLoadingSubtitles(false);
      }
    }

    loadScreenSubtitles();

    return () => {
      isSubscribed = false;
    };
  }, [currentScreen.screenId, currentScreen.videoUrl, currentScreen.vttUrl, currentScreen.subtitleCues]);

  // --------------------------------------------------------------------------
  // 3. ZERO-DELAY LOOP MENGGUNAKAN requestAnimationFrame (60 FPS)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;

    const checkAudioTimeLoop = () => {
      if (videoRef.current && !videoRef.current.paused) {
        syncSubtitleWithAudio(videoRef.current.currentTime);
      }
      animationFrameId = requestAnimationFrame(checkAudioTimeLoop);
    };

    animationFrameId = requestAnimationFrame(checkAudioTimeLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [syncSubtitleWithAudio]);

  // --------------------------------------------------------------------------
  // 4. PARSER WEBVTT SEDERHANA & CEPAT (CLIENT-SIDE)
  // --------------------------------------------------------------------------
  function parseVttToCues(vttContent: string): SubtitleCue[] {
    const lines = vttContent.replace(/\r/g, '').split('\n');
    const cues: SubtitleCue[] = [];
    const timeRegex = /(\d{2}:)?(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}:)?(\d{2}):(\d{2})[.,](\d{3})/;

    let currentStart = 0;
    let currentEnd = 0;
    let textBuffer: string[] = [];

    const toSeconds = (h = '00', m: string, s: string, ms: string) =>
      parseInt(h || '00', 10) * 3600 +
      parseInt(m, 10) * 60 +
      parseInt(s, 10) +
      parseInt(ms, 10) / 1000;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const match = line.match(timeRegex);

      if (match) {
        if (textBuffer.length > 0) {
          cues.push({ start: currentStart, end: currentEnd, text: textBuffer.join(' ') });
          textBuffer = [];
        }
        currentStart = toSeconds(match[1]?.replace(':', ''), match[2], match[3], match[4]);
        currentEnd = toSeconds(match[5]?.replace(':', ''), match[6], match[7], match[8]);
      } else if (line && !line.startsWith('WEBVTT') && !line.startsWith('NOTE') && !/^\d+$/.test(line)) {
        textBuffer.push(line);
      }
    }

    if (textBuffer.length > 0 && currentEnd > currentStart) {
      cues.push({ start: currentStart, end: currentEnd, text: textBuffer.join(' ') });
    }

    return cues;
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-stone-800">
      {/* 
        KEY DINAMIS: Menjamin unmount dan mount elemen <video> baru secara bersih 
        saat berpindah Screen atau URL Video berganti. Ini menghapus cache track lama seketika.
      */}
      <video
        key={`video-player-screen-${currentScreen.screenId}-${currentScreen.videoUrl}`}
        ref={videoRef}
        src={currentScreen.videoUrl}
        controls
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) syncSubtitleWithAudio(videoRef.current.currentTime);
        }}
        onSeeked={() => {
          if (videoRef.current) syncSubtitleWithAudio(videoRef.current.currentTime);
        }}
        className="w-full h-full object-cover"
      />

      {/* OVERLAY SUBTITLE NON-INTRUSIF & TAJAM (YOUTUBE-STYLE) */}
      {isSubtitleEnabled && currentSubtitleText && (
        <div className="absolute bottom-16 inset-x-4 flex justify-center pointer-events-none z-30 transition-all">
          <span
            className="text-center font-medium text-white shadow-2xl select-none"
            style={{
              backgroundColor: 'rgba(8, 8, 8, 0.75)',
              borderRadius: '6px',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              padding: '6px 12px',
              maxWidth: '85%',
              lineHeight: '1.4',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {currentSubtitleText}
          </span>
        </div>
      )}
    </div>
  );
};
