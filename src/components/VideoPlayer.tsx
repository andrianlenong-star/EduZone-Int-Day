import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  AlertCircle,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Music,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sliders,
  Check,
  Hash,
  Layers,
  Ruler,
  Mountain,
  Maximize,
  Compass,
  Subtitles,
  MonitorPlay,
  Film,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Split,
  Sparkles,
  Trash2,
  HardDrive,
  Landmark,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { DocumentaryScene } from '../data/peruScenesData';
import { formatTime, formatTotalTime } from '../utils/quizRules';
import { andeanAudio } from '../utils/andeanAudio';
import { narrationEngine } from '../utils/speechNarration';
import { VoicePersona } from '../types/encyclopedia';
import { getSceneSubtitles, SubtitleCue } from '../utils/closedCaptionEngine';
import { VideoUploadDropzone } from './VideoUploadDropzone';
import { isApprovedArchivalSource, getCountryMedia, CountryMedia, SubtitleTrack } from '../data/countryMediaRegistry';
import { parseVtt, VttCue } from '../utils/vttParser';
import { performDualVerificationLoop, containsVisualHallucination } from '../utils/geoCulturalValidator';
import {
  ScreenDisplayMode,
  PlaybackSequence,
  resolveInitialScreenMode,
  resolveNextSequenceAction,
} from '../utils/teacherPlaybackRules';
import { saveVideoToIndexedDB } from '../utils/videoStorageDB';

export interface PlayerSettings {
  language: 'id' | 'en';
  fontSize: 'normal' | 'large' | 'xlarge';
  fontStyle: 'sans' | 'serif' | 'mono';
  subtitleContrast: 'high-contrast' | 'solid-black' | 'soft-frosted';
  speechSpeed: number;
  voicePersona: VoicePersona;
  musicVolume: number;
  showSubtitles?: boolean;
  subtitleLanguage?: 'en' | 'id';
}

interface VideoPlayerProps {
  countryName: string;
  scenes: DocumentaryScene[];
  currentSceneIndex: number;
  onSceneSelect: (index: number) => void;
  onOpenTrivia: () => void;
  completedScenes: Record<number, boolean>;
  settings: PlayerSettings;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  rewatchKey?: number;
  onCustomVideoUploaded?: (sceneNumber: number, videoUrl: string, fileName?: string, fileSize?: string, subtitles?: any[]) => void;
  onDeleteCustomVideo?: (sceneNumber: number) => void;
  onRefreshSync?: () => void;
  onOpenSyncModal?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  countryName,
  scenes,
  currentSceneIndex,
  onSceneSelect,
  onOpenTrivia,
  completedScenes,
  settings,
  onOpenSettings,
  isDarkMode,
  rewatchKey,
  onCustomVideoUploaded,
  onDeleteCustomVideo,
  onRefreshSync,
  onOpenSyncModal,
}) => {
  const currentScene: DocumentaryScene = scenes[currentSceneIndex] || scenes[0];

  // Container refs for fullscreen
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const customContainerRef = useRef<HTMLDivElement | null>(null);

  // Video element refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const customVideoRef = useRef<HTMLVideoElement | null>(null);
  const screen2FileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // 1. TEACHER DUAL SCREEN & SEQUENCE STATE
  // =========================================================================
  // Modes: 'main' (Layar 1: Dokumenter Kurikulum), 'custom' (Layar 2: Video Guru), 'dual' (Mode Berdampingan)
  const [activeScreenMode, setActiveScreenMode] = useState<ScreenDisplayMode>('main');
  // Sequence Preference: 'teacher-first' (Putar Video Guru Terlebih Dahulu) vs 'docu-first' (Putar Dokumenter Terlebih Dahulu)
  const [playbackSequence, setPlaybackSequence] = useState<PlaybackSequence>('teacher-first');
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null);

  // =========================================================================
  // 2. LAYAR 1 (DOKUMENTER KURIKULUM) STATE
  // =========================================================================
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isNarratorEnabled, setIsNarratorEnabled] = useState<boolean>(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [mediaError, setMediaError] = useState<boolean>(false);
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState<boolean>(
    settings.showSubtitles !== undefined ? settings.showSubtitles : true
  );
  const [activeSubtitleLang, setActiveSubtitleLang] = useState<'en' | 'id'>(
    settings.subtitleLanguage || settings.language || 'en'
  );

  // =========================================================================
  // 3. LAYAR 2 (VIDEO UNGGAHAN GURU) STATE
  // =========================================================================
  const [isCustomPlaying, setIsCustomPlaying] = useState<boolean>(false);
  const [customCurrentTime, setCustomCurrentTime] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number>(0);
  const [isCustomMuted, setIsCustomMuted] = useState<boolean>(false);
  const [customSpeed, setCustomSpeed] = useState<number>(1.0);
  const [isCustomFullscreen, setIsCustomFullscreen] = useState<boolean>(false);

  // Subtitle state for Layar 2 (Teacher Uploaded Video)
  const [isCustomSubtitlesEnabled, setIsCustomSubtitlesEnabled] = useState<boolean>(true);
  const [customSubtitleLang, setCustomSubtitleLang] = useState<'off' | 'en' | 'id'>('en');
  const [isCustomSubMenuOpen, setIsCustomSubMenuOpen] = useState<boolean>(false);
  const [customVttCues, setCustomVttCues] = useState<VttCue[]>([]);
  const [activeCustomCueText, setActiveCustomCueText] = useState<string | null>(null);
  const [trackVersionKey, setTrackVersionKey] = useState<number>(Date.now());
  const customVttCuesRef = useRef<VttCue[]>([]);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);
  const [transcriptionNotice, setTranscriptionNotice] = useState<string | null>(null);
  const [customVideoError, setCustomVideoError] = useState<string | null>(null);

  // Dynamic real-time subtitle sync driven by HTML5 video onTimeUpdate event & animation frame
  const syncCustomCue = useCallback(
    (currentTimeSec: number, cues: VttCue[]) => {
      if (!isCustomSubtitlesEnabled || customSubtitleLang === 'off' || !cues || cues.length === 0) {
        setActiveCustomCueText((prev) => (prev !== null ? null : prev));
        return;
      }
      // Strict boundary check: active ONLY during exact vocal onset and offset
      const found = cues.find(
        (cue) => currentTimeSec >= cue.start && currentTimeSec <= cue.end
      );
      const targetText = found ? found.text : null;
      setActiveCustomCueText((prev) => (prev !== targetText ? targetText : prev));
    },
    [isCustomSubtitlesEnabled, customSubtitleLang]
  );

  // Centralized media config for the selected country (Screen 2 routing)
  const countryMediaData: CountryMedia = useMemo(() => {
    return getCountryMedia(countryName);
  }, [countryName]);

  const activeSubtitleTracks: SubtitleTrack[] = useMemo(() => {
    if (currentScene.customSubtitles && currentScene.customSubtitles.length > 0) {
      return currentScene.customSubtitles;
    }
    // Screen 2 is dynamically scoped: if a specific VTT track is uploaded for this scene, return it.
    // Never fall back to static greetings from other scenes.
    return [];
  }, [currentScene.customSubtitles]);

  // Screen 2 (Teacher Uploaded Video Player) is 100% CLEAN and EMPTY by default.
  // It ONLY displays a video if the teacher has actually uploaded or specified a custom video for this scene,
  // preventing any overlap or confusion with hardcoded clips.
  const hasCustomVideo = Boolean(
    currentScene.isCustomVideo && currentScene.customVideoUrl
  );
  const activeCustomVideoSrc = (currentScene.isCustomVideo && currentScene.customVideoUrl) || '';

  // Handler for on-demand Audio-to-Text Analysis
  const handleTriggerAudioSync = async () => {
    if (!activeCustomVideoSrc) return;
    setIsTranscribingAudio(true);
    setTranscriptionNotice(
      settings.language === 'en'
        ? 'Analyzing audio & extracting verbatim cues...'
        : 'Menganalisis audio & mengekstrak transkrip presisi...'
    );
    try {
      let res: Response;
      if (activeCustomVideoSrc.startsWith('blob:')) {
        try {
          const blobRes = await fetch(activeCustomVideoSrc);
          const videoBlob = await blobRes.blob();
          const formData = new FormData();
          formData.append('video', videoBlob, currentScene.customFileName || `${countryName}_scene_${currentScene.number}.mp4`);
          formData.append('countryName', countryName);
          formData.append('sceneNumber', currentScene.number.toString());
          res = await fetch('/api/transcribe-video', {
            method: 'POST',
            body: formData,
          });
        } catch {
          res = await fetch('/api/transcribe-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoUrl: activeCustomVideoSrc,
              countryName,
              sceneNumber: currentScene.number,
            }),
          });
        }
      } else {
        res = await fetch('/api/transcribe-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: activeCustomVideoSrc,
            countryName,
            sceneNumber: currentScene.number,
          }),
        });
      }
      const data = await res.json();
      if (data.success && data.subtitles) {
        if (onCustomVideoUploaded) {
          onCustomVideoUploaded(
            currentScene.number,
            activeCustomVideoSrc,
            currentScene.customFileName,
            currentScene.customFileSize,
            data.subtitles
          );
        }
        const targetTrack =
          data.subtitles.find((s: any) => s.srcLang === customSubtitleLang) || data.subtitles[0];
        setTrackVersionKey(Date.now());
        if (targetTrack) {
          const vttRes = await fetch(`${targetTrack.src}?v=${Date.now()}`);
          if (vttRes.ok) {
            const vttText = await vttRes.text();
            const parsed = parseVtt(vttText);
            setCustomVttCues(parsed);
            customVttCuesRef.current = parsed;
            if (customVideoRef.current) {
              syncCustomCue(customVideoRef.current.currentTime, parsed);
            }
          }
        }
        setTranscriptionNotice(
          settings.language === 'en'
            ? `Audio synchronized! (${data.cues?.length || 0} verbatim cues)`
            : `Audio tersinkronisasi! (${data.cues?.length || 0} baris teks terverifikasi)`
        );
      } else {
        setTranscriptionNotice(
          data.message || (settings.language === 'en' ? 'Sync failed' : 'Gagal sinkronisasi')
        );
      }
    } catch {
      setTranscriptionNotice(
        settings.language === 'en' ? 'Network error during audio sync' : 'Gagal melakukan sinkronisasi audio'
      );
    } finally {
      setIsTranscribingAudio(false);
      setTimeout(() => setTranscriptionNotice(null), 4500);
    }
  };

  // Load and parse WebVTT track for Screen 2 whenever country, scene, or language changes
  useEffect(() => {
    // 1. Reset state completely on any change to avoid stale cues lingering
    setCustomVttCues([]);
    customVttCuesRef.current = [];
    setActiveCustomCueText(null);

    if (!isCustomSubtitlesEnabled || customSubtitleLang === 'off') {
      return;
    }

    const track = activeSubtitleTracks.find((s) => s.srcLang === customSubtitleLang);
    if (track) {
      // Dynamic cache-busting fetch to fetch freshest VTT from server
      fetch(`${track.src}?v=${trackVersionKey}`)
        .then((res) => {
          if (!res.ok) throw new Error('VTT fetch status ' + res.status);
          return res.text();
        })
        .then((vttText) => {
          const parsed = parseVtt(vttText);
          setCustomVttCues(parsed);
          customVttCuesRef.current = parsed;
          if (customVideoRef.current) {
            syncCustomCue(customVideoRef.current.currentTime, parsed);
          }
        })
        .catch((err) => {
          console.warn('[Screen 2 Subtitles] VTT load error, falling back to scene cues:', track.src, err);
          loadSceneSpecificFallback();
        });
      return;
    }

    // 2. DYNAMIC SCENE SUBTITLE MAPPING: If no custom file is uploaded for this scene,
    // load verified scene-specific cues strictly matching the current scene number!
    loadSceneSpecificFallback();

    function loadSceneSpecificFallback() {
      const targetLang = customSubtitleLang === 'id' ? 'id' : 'en';
      const narrationText = targetLang === 'id' ? currentScene.fullNarrationId : currentScene.fullNarrationEn;
      const sceneCues = getSceneSubtitles(countryName, currentScene.number, targetLang, narrationText);
      
      // Auto-scale subtitle timings to video's actual duration if different from default 60s
      const scale = customDuration && customDuration > 10 && Math.abs(customDuration - 60) > 4 
        ? customDuration / 50 
        : 1.0;

      const vttCues: VttCue[] = sceneCues.map((c) => ({
        start: Math.round(c.start * scale * 100) / 100,
        end: Math.round(c.end * scale * 100) / 100,
        text: c.text,
      }));
      setCustomVttCues(vttCues);
      customVttCuesRef.current = vttCues;
      if (customVideoRef.current) {
        syncCustomCue(customVideoRef.current.currentTime, vttCues);
      }
    }
  }, [
    countryName,
    currentScene.number,
    currentScene.fullNarrationId,
    currentScene.fullNarrationEn,
    activeSubtitleTracks,
    customSubtitleLang,
    isCustomSubtitlesEnabled,
    trackVersionKey,
    syncCustomCue,
  ]);

  // High-precision 60fps subtitle sync loop when video is playing (eliminates HTML5 250ms timeupdate lag)
  useEffect(() => {
    let animId: number;
    if (isCustomPlaying) {
      const renderFrame = () => {
        if (customVideoRef.current) {
          syncCustomCue(customVideoRef.current.currentTime, customVttCuesRef.current);
        }
        animId = requestAnimationFrame(renderFrame);
      };
      animId = requestAnimationFrame(renderFrame);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isCustomPlaying, syncCustomCue]);

  const hasUserInteracted = useRef<boolean>(false);
  const hasSpokenThisScene = useRef<boolean>(false);
  const hasAutoOpenedTrivia = useRef<boolean>(false);

  const isArchivalVerified = isApprovedArchivalSource(currentScene.archivalSource);

  // Subtitle synchronization
  useEffect(() => {
    if (settings.showSubtitles !== undefined) {
      setIsSubtitlesEnabled(settings.showSubtitles);
    }
  }, [settings.showSubtitles]);

  useEffect(() => {
    if (settings.subtitleLanguage) {
      setActiveSubtitleLang(settings.subtitleLanguage);
    } else {
      setActiveSubtitleLang(settings.language);
    }
  }, [settings.subtitleLanguage, settings.language]);

  const activeNarrationText =
    activeSubtitleLang === 'id' ? currentScene.fullNarrationId : currentScene.fullNarrationEn;

  const currentCues: SubtitleCue[] = useMemo(() => {
    return getSceneSubtitles(
      countryName,
      currentScene.number,
      activeSubtitleLang,
      activeNarrationText
    );
  }, [countryName, currentScene.number, activeSubtitleLang, activeNarrationText]);

  const activeCue: SubtitleCue | null = useMemo(() => {
    if (!isSubtitlesEnabled) return null;
    return (
      currentCues.find(
        (cue) => currentTime >= cue.start && currentTime <= cue.end
      ) || null
    );
  }, [currentCues, currentTime, isSubtitlesEnabled]);

  // AI Quality Assurance: Dual-Verification Loop & Anti-Mismatch Visual Binding
  const qaResult = useMemo(() => {
    const subText =
      activeCue?.text ||
      (settings.language === 'id' ? currentScene.fullNarrationId : currentScene.fullNarrationEn);

    return performDualVerificationLoop(
      countryName,
      currentScene.number,
      subText,
      currentScene.galleryImages[activePhotoIndex]?.url || currentScene.fallbackPoster,
      currentScene.galleryImages[activePhotoIndex]?.captionId || currentScene.titleId,
      currentScene.galleryImages[activePhotoIndex]?.captionEn || currentScene.titleEn
    );
  }, [countryName, currentScene, activeCue, activePhotoIndex, settings.language]);

  // Sync narration engine settings
  useEffect(() => {
    narrationEngine.setLanguage(settings.language);
    narrationEngine.setSpeedMultiplier(settings.speechSpeed);
    narrationEngine.setPersona(settings.voicePersona);
    narrationEngine.setEnabled(isNarratorEnabled);
  }, [settings.language, settings.speechSpeed, settings.voicePersona, isNarratorEnabled]);

  // Sync music volume
  useEffect(() => {
    andeanAudio.setVolume(settings.musicVolume);
  }, [settings.musicVolume]);

  // Trigger continuous narration
  const triggerSceneNarration = useCallback(() => {
    if (!isNarratorEnabled) return;
    const narrationText =
      settings.language === 'id'
        ? currentScene.fullNarrationId
        : currentScene.fullNarrationEn;

    narrationEngine.setLanguage(settings.language);
    narrationEngine.speakText(narrationText);
    hasSpokenThisScene.current = true;
  }, [currentScene, settings.language, isNarratorEnabled]);

  // When scene index changes, reset players and resolve initial screen mode
  useEffect(() => {
    setCurrentTime(0);
    setActivePhotoIndex(0);
    setMediaError(false);
    hasSpokenThisScene.current = false;
    hasAutoOpenedTrivia.current = false;
    narrationEngine.stop();

    // Pause and reset main video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    setIsPlaying(false);

    // Pause and reset custom video
    if (customVideoRef.current) {
      customVideoRef.current.currentTime = 0;
      customVideoRef.current.pause();
    }
    setIsCustomPlaying(false);
    setCustomCurrentTime(0);
    setActiveCustomCueText(null);
    setCustomVttCues([]);
    customVttCuesRef.current = [];
    setTrackVersionKey(Date.now());
    setTransitionNotice(null);

    // Pedagogical resolution: check which screen to open
    const targetMode = resolveInitialScreenMode(
      playbackSequence,
      Boolean(currentScene.customVideoUrl),
      activeScreenMode
    );
    setActiveScreenMode(targetMode);

    if (hasUserInteracted.current) {
      andeanAudio.playSceneTransitionSound();
    }
  }, [currentSceneIndex, countryName]);

  // Auto-switch to Layar 2 saat video guru selesai dimuat dari IndexedDB / Cloud
  useEffect(() => {
    if (
      currentScene.customVideoUrl &&
      playbackSequence === 'teacher-first' &&
      !hasUserInteracted.current &&
      activeScreenMode === 'main'
    ) {
      setActiveScreenMode('custom');
    }
  }, [currentScene.customVideoUrl, playbackSequence, activeScreenMode]);

  // Handle rewatch request
  useEffect(() => {
    if (rewatchKey !== undefined && rewatchKey > 0) {
      setCurrentTime(0);
      hasAutoOpenedTrivia.current = false;
      hasSpokenThisScene.current = false;
      setIsPlaying(true);
      setActiveScreenMode('main');
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      triggerSceneNarration();
    }
  }, [rewatchKey, triggerSceneNarration]);

  // High-precision smooth 60 FPS timer for 60s scene duration (Layar 1 - Zero Lag)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    if (isPlaying) {
      const tick = (now: number) => {
        const deltaSec = (now - lastTime) / 1000;
        lastTime = now;

        setCurrentTime((prev) => {
          if (prev >= 60) {
            return 60;
          }
          return Math.min(60, prev + deltaSec * playbackSpeed);
        });

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, playbackSpeed]);

  // Scene completion check for Layar 1
  useEffect(() => {
    const photoIdx = Math.min(
      Math.floor(currentTime / 20),
      currentScene.galleryImages.length - 1
    );
    setActivePhotoIndex(photoIdx);

    if (currentTime >= 60) {
      setIsPlaying(false);
      narrationEngine.stop();
      if (videoRef.current) videoRef.current.pause();

      // Sequence check
      const action = resolveNextSequenceAction('main', playbackSequence, Boolean(currentScene.customVideoUrl));
      if (action.nextScreen === 'custom' && action.shouldAutoPlay) {
        setTransitionNotice(
          settings.language === 'en'
            ? 'Documentary complete! Switching to Teacher Video (Screen 2)...'
            : 'Dokumenter selesai! Beralih otomatis ke Video Unggahan Guru (Layar 2)...'
        );
        setTimeout(() => {
          setActiveScreenMode('custom');
          playCustomVideo();
        }, 1500);
      } else if (!hasAutoOpenedTrivia.current) {
        hasAutoOpenedTrivia.current = true;
        onOpenTrivia();
      }
    }
  }, [currentTime, currentScene, onOpenTrivia, playbackSequence, settings.language]);

  // Layar 1 Play/Pause
  const togglePlay = useCallback(() => {
    hasUserInteracted.current = true;
    if (isPlaying) {
      setIsPlaying(false);
      narrationEngine.pause();
      if (videoRef.current) videoRef.current.pause();
    } else {
      // Pause custom video if it's playing to avoid double audio
      if (isCustomPlaying) {
        pauseCustomVideo();
      }
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      if (!isMusicPlaying) {
        andeanAudio.startMusic();
        setIsMusicPlaying(true);
      }
      if (!hasSpokenThisScene.current) {
        triggerSceneNarration();
      } else {
        narrationEngine.resume();
      }
    }
  }, [isPlaying, isMusicPlaying, isCustomPlaying, triggerSceneNarration]);

  // Ensure video element loads fresh stream when activeCustomVideoSrc changes
  useEffect(() => {
    if (customVideoRef.current && activeCustomVideoSrc) {
      customVideoRef.current.load();
      setCustomCurrentTime(0);
      setCustomVideoError(null);
    }
  }, [activeCustomVideoSrc, currentScene.number]);

  // Direct video file upload handler when recovering Screen 2 playback
  const handleScreen2DirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size <= 1024) {
      setCustomVideoError(
        isEn
          ? 'Selected video file is empty (0 bytes). Please choose a valid MP4 file.'
          : 'Berkas video yang dipilih kosong (0 bytes). Silakan pilih berkas MP4 yang valid.'
      );
      return;
    }

    try {
      setCustomVideoError(null);
      const sizeText = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const saved = await saveVideoToIndexedDB(
        countryName,
        currentScene.number,
        file,
        file.name,
        sizeText
      );

      if (onCustomVideoUploaded) {
        onCustomVideoUploaded(
          currentScene.number,
          saved.objectUrl,
          file.name,
          sizeText
        );
      }

      setTransitionNotice(
        isEn ? 'Video updated successfully! Starting playback...' : 'Berkas video berhasil diperbarui! Memulai pemutaran...'
      );
      setTimeout(() => setTransitionNotice(null), 3000);

      setTimeout(() => {
        if (customVideoRef.current) {
          customVideoRef.current.load();
          playCustomVideo();
        }
      }, 150);
    } catch (err: any) {
      setCustomVideoError(err?.message || 'Gagal menyimpan berkas video.');
    }
  };

  // Layar 2 (Custom Video) Handlers with Robust Autoplay & Decode Recovery
  const playCustomVideo = async () => {
    // Stop main audio and video so sounds don't overlap
    if (isPlaying) {
      setIsPlaying(false);
      narrationEngine.pause();
      if (videoRef.current) videoRef.current.pause();
    }
    const video = customVideoRef.current;
    if (!video) return;

    if (!activeCustomVideoSrc || !activeCustomVideoSrc.trim()) {
      setIsCustomPlaying(false);
      setCustomVideoError(
        isEn
          ? 'No video source found for Screen 2. Please choose an MP4 video file.'
          : 'Sumber video tidak ditemukan untuk Layar 2. Silakan pilih berkas video MP4.'
      );
      return;
    }

    // Jika video element sudah mendeteksi error media sebelumnya, jangan paksa play()
    if (video.error) {
      setIsCustomPlaying(false);
      const isNotSupported = video.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
      setCustomVideoError(
        isNotSupported
          ? (isEn
              ? 'Video format is not supported or source is missing. Please select a valid MP4 file.'
              : 'Format video tidak didukung atau sumber tidak ditemukan. Silakan pilih berkas MP4 baru.')
          : (isEn
              ? 'Video stream is currently loading or needs re-initialization. Tap "Retry Playback".'
              : 'Stream video memerlukan inisialisasi ulang. Silakan ketuk tombol "Coba Putar Lagi".')
      );
      return;
    }

    try {
      setCustomVideoError(null);
      await video.play();
      setIsCustomPlaying(true);
    } catch (err: any) {
      // HANYA coba muted recovery jika browser menolak karena kebijakan autoplay audio (NotAllowedError)
      if (err?.name === 'NotAllowedError') {
        try {
          video.muted = true;
          setIsCustomMuted(true);
          await video.play();
          setIsCustomPlaying(true);
          setTransitionNotice(
            settings.language === 'en'
              ? 'Playing (sound muted by browser; tap speaker icon to unmute)'
              : 'Video diputar (suara diheningkan oleh browser; ketuk ikon speaker untuk suara)'
          );
          setTimeout(() => setTransitionNotice(null), 3500);
          return;
        } catch (mutedErr) {
          console.warn('[Screen 2] Autoplay muted fallback prevented by browser:', mutedErr);
        }
      }

      // Penanganan anggun jika format media tidak didukung atau sedang buffering
      console.warn('[Screen 2] Playback blocked or media pending:', err?.message || err);
      setIsCustomPlaying(false);
      const errMessage = (err?.message || '').toLowerCase();
      const isUnsupported =
        err?.name === 'NotSupportedError' ||
        errMessage.includes('no supported source') ||
        errMessage.includes('notsupportederror') ||
        video.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;

      setCustomVideoError(
        isUnsupported
          ? (isEn
              ? 'Video file is empty (0 bytes), corrupted, or format is unsupported. Tap "Select MP4 Video File" below.'
              : 'Berkas video kosong (0 bytes), rusak, atau format tidak didukung browser ini. Ketuk tombol "Pilih Berkas Video MP4" di bawah.')
          : (isEn
              ? 'Playback was blocked or media is loading. Tap "Retry Playback" below or choose a new MP4 video.'
              : 'Pemutaran tertunda oleh browser. Silakan ketuk tombol "Coba Putar Lagi" atau pilih berkas video MP4 baru.')
      );
    }
  };

  const pauseCustomVideo = () => {
    if (customVideoRef.current) {
      customVideoRef.current.pause();
      setIsCustomPlaying(false);
    }
  };

  const toggleCustomPlay = () => {
    if (isCustomPlaying) {
      pauseCustomVideo();
    } else {
      playCustomVideo();
    }
  };

  const handleCustomTimeUpdate = () => {
    if (customVideoRef.current) {
      const time = customVideoRef.current.currentTime;
      setCustomCurrentTime(time);
      syncCustomCue(time, customVttCuesRef.current);
      if (!customDuration && customVideoRef.current.duration) {
        setCustomDuration(customVideoRef.current.duration);
      }
    }
  };

  const handleCustomSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCustomCurrentTime(newTime);
    if (customVideoRef.current) {
      customVideoRef.current.currentTime = newTime;
      syncCustomCue(newTime, customVttCuesRef.current);
    }
  };

  const jumpCustomSeconds = (delta: number) => {
    if (customVideoRef.current) {
      const nextTime = Math.max(0, Math.min(customDuration || 60, customCurrentTime + delta));
      customVideoRef.current.currentTime = nextTime;
      setCustomCurrentTime(nextTime);
      syncCustomCue(nextTime, customVttCuesRef.current);
    }
  };

  const changeCustomSpeed = (speed: number) => {
    setCustomSpeed(speed);
    if (customVideoRef.current) {
      customVideoRef.current.playbackRate = speed;
    }
  };

  const toggleCustomMute = () => {
    if (customVideoRef.current) {
      customVideoRef.current.muted = !isCustomMuted;
      setIsCustomMuted(!isCustomMuted);
    }
  };

  const toggleCustomFullscreen = () => {
    if (!customContainerRef.current) return;
    if (!document.fullscreenElement) {
      customContainerRef.current.requestFullscreen().catch(() => {});
      setIsCustomFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsCustomFullscreen(false);
    }
  };

  const toggleCustomSubtitles = useCallback(() => {
    setIsCustomSubtitlesEnabled((prev) => {
      const nextState = !prev;
      if (nextState && customSubtitleLang === 'off') {
        setCustomSubtitleLang('en');
      }
      return nextState;
    });
  }, [customSubtitleLang]);

  const selectCustomSubtitleLanguage = useCallback((lang: 'off' | 'en' | 'id') => {
    setCustomSubtitleLang(lang);
    if (lang === 'off') {
      setIsCustomSubtitlesEnabled(false);
    } else {
      setIsCustomSubtitlesEnabled(true);
    }
    setIsCustomSubMenuOpen(false);

    if (customVideoRef.current && customVideoRef.current.textTracks) {
      for (let i = 0; i < customVideoRef.current.textTracks.length; i++) {
        const track = customVideoRef.current.textTracks[i];
        if (track.language === lang && lang !== 'off') {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden';
        }
      }
    }
  }, []);

  // When custom video ends on Layar 2
  const handleCustomVideoEnded = () => {
    setIsCustomPlaying(false);
    const action = resolveNextSequenceAction('custom', playbackSequence, hasCustomVideo);

    if (action.shouldAutoPlay) {
      setTransitionNotice(
        settings.language === 'en'
          ? 'Teacher Video complete! Starting Curriculum Documentary (Screen 1)...'
          : 'Video Guru selesai! Memutar Dokumenter Kurikulum (Layar 1)...'
      );
      setTimeout(() => {
        setActiveScreenMode('main');
        setTransitionNotice(null);
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
        if (!isMusicPlaying) {
          andeanAudio.startMusic();
          setIsMusicPlaying(true);
        }
        triggerSceneNarration();
      }, 1500);
    }
  };

  // Main seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (newTime < 60) {
      hasAutoOpenedTrivia.current = false;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = (newTime / 60) * (videoRef.current.duration || 60);
    }
    narrationEngine.stop();
    hasSpokenThisScene.current = false;
  };

  const jumpSeconds = (delta: number) => {
    setCurrentTime((prev) => {
      const next = Math.max(0, Math.min(60, prev + delta));
      if (next < 60) {
        hasAutoOpenedTrivia.current = false;
      }
      if (videoRef.current) {
        videoRef.current.currentTime = (next / 60) * (videoRef.current.duration || 60);
      }
      return next;
    });
  };

  const toggleMusic = () => {
    const newState = andeanAudio.toggleMusic();
    setIsMusicPlaying(newState);
  };

  const toggleNarrator = () => {
    const nextState = !isNarratorEnabled;
    setIsNarratorEnabled(nextState);
    narrationEngine.setEnabled(nextState);
    if (!nextState) {
      narrationEngine.stop();
    } else if (isPlaying) {
      triggerSceneNarration();
    }
  };

  const toggleFullscreen = () => {
    if (!mainContainerRef.current) return;
    if (!document.fullscreenElement) {
      mainContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const isEn = settings.language === 'en';
  const m = isEn && currentScene.metricsEn ? currentScene.metricsEn : currentScene.metrics;

  const getPersonaLabel = () => {
    switch (settings.voicePersona) {
      case 'anak-perempuan':
        return isEn ? '👧 Primary School Girl' : '👧 Anak Perempuan SD';
      case 'anak-laki-laki':
        return isEn ? '👦 Primary School Boy' : '👦 Anak Laki-Laki SD';
      case 'guru-ramah':
      default:
        return isEn ? '👩‍🏫 Friendly Educator' : '👩‍🏫 Guru Ramah';
    }
  };

  // Handler when user uploads a custom video in the dropzone
  const handleCustomUploadComplete = (sceneNum: number, url: string, name?: string, size?: string) => {
    if (onCustomVideoUploaded) {
      onCustomVideoUploaded(sceneNum, url, name, size);
    }
    // Switch to Layar 2 and play immediately
    setActiveScreenMode('custom');
    setTimeout(() => {
      if (customVideoRef.current) {
        customVideoRef.current.load();
        customVideoRef.current.play().catch(() => {});
        setIsCustomPlaying(true);
      }
    }, 100);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* =========================================================================
          PANEL KONTROL GURU: PEMILIH LAYAR & PENGATUR URUTAN PEMUTARAN
          (Teacher Screen Display & Sequence Control Bar)
      ========================================================================= */}
      <div
        className={`p-3 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-stone-900/90 border-stone-800 text-stone-200'
            : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Left: Mode Tampilan Layar (Layar 1, Layar 2, Mode Berdampingan) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <MonitorPlay className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'Screen Display:' : 'Tampilan Layar:'}</span>
            </span>

            {/* Tombol Tab Layar 1 */}
            <button
              onClick={() => {
                pauseCustomVideo();
                setActiveScreenMode('main');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeScreenMode === 'main'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
              }`}
            >
              <span>🎓</span>
              <span>{isEn ? 'Screen 1: Curriculum Docu' : 'Layar 1: Dokumenter Kurikulum'}</span>
            </button>

            {/* Tombol Tab Layar 2 (Video Guru) */}
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  narrationEngine.pause();
                  if (videoRef.current) videoRef.current.pause();
                }
                setActiveScreenMode('custom');
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeScreenMode === 'custom'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
              }`}
            >
              <span>🎬</span>
              <span>{isEn ? 'Screen 2: Teacher Video' : 'Layar 2: Video Unggahan Guru'}</span>
              {hasCustomVideo && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 font-extrabold text-[9px] shadow animate-pulse ml-0.5">
                  {isEn ? 'READY' : 'ADA VIDEO'}
                </span>
              )}
            </button>

            {/* Tombol Tab Mode Berdampingan (Dual View) */}
            <button
              onClick={() => setActiveScreenMode('dual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeScreenMode === 'dual'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>{isEn ? 'Dual Split View' : 'Mode Berdampingan'}</span>
            </button>
          </div>

          {/* Right: Pengatur Urutan Pemutaran Guru */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
              <span>{isEn ? 'Playback Order:' : 'Urutan Putar:'}</span>
            </span>

            <div className="flex items-center bg-stone-950/70 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                onClick={() => setPlaybackSequence('teacher-first')}
                title={isEn ? 'Play Teacher Video first, then Documentary' : 'Putar video unggahan guru terlebih dahulu'}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  playbackSequence === 'teacher-first'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isEn ? '🥇 Teacher First' : '🥇 Video Guru Dulu'}
              </button>

              <button
                onClick={() => setPlaybackSequence('docu-first')}
                title={isEn ? 'Play Curriculum Documentary first, then Teacher Video' : 'Putar dokumenter kurikulum terlebih dahulu'}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  playbackSequence === 'docu-first'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isEn ? '🥈 Documentary First' : '🥈 Dokumenter Dulu'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifikasi Transisi Otomatis */}
        {transitionNotice && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{transitionNotice}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          AREA TAMPILAN VIDEO (LAYAR 1 / LAYAR 2 / DUAL SPLIT)
      ========================================================================= */}
      <div
        className={
          activeScreenMode === 'dual'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
            : 'w-full'
        }
      >
        {/* =====================================================================
            LAYAR 1: DOKUMENTER KURIKULUM (Tampil saat 'main' atau 'dual')
        ===================================================================== */}
        {(activeScreenMode === 'main' || activeScreenMode === 'dual') && (
          <div className="flex flex-col gap-2">
            {/* Header Mini Label Layar 1 */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isEn ? 'SCREEN 1: CURRICULUM DOCUMENTARY' : 'LAYAR 1: DOKUMENTER KURIKULUM'}</span>
              </span>
              {hasCustomVideo && activeScreenMode === 'main' && (
                <button
                  onClick={() => {
                    if (isPlaying) {
                      setIsPlaying(false);
                      narrationEngine.pause();
                      if (videoRef.current) videoRef.current.pause();
                    }
                    setActiveScreenMode('custom');
                    setTimeout(() => playCustomVideo(), 150);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow active:scale-95 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isEn ? '🎬 Teacher Video Ready (Screen 2) →' : '🎬 Video Guru Anda Siap (Layar 2) →'}</span>
                </button>
              )}
            </div>

            {/* FULL-WIDTH PROMINENT BANNER SAAT VIDEO GURU TERSEDIA DI LAYAR 2 */}
            {hasCustomVideo && activeScreenMode === 'main' && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/15 border border-amber-500/60 flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <div>
                    <span className="font-extrabold text-white text-xs block">
                      {isEn ? '🎬 Your Uploaded Teacher Video is ready on Screen 2!' : '🎬 Video materi guru yang Anda upload sudah siap di Layar 2!'}
                    </span>
                    <span className="text-amber-300/80 font-mono text-[10px]">
                      {currentScene.customFileName || 'Video Guru'} ({currentScene.customFileSize || 'IndexedDB/Cloud'})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isPlaying) {
                      setIsPlaying(false);
                      narrationEngine.pause();
                      if (videoRef.current) videoRef.current.pause();
                    }
                    setActiveScreenMode('custom');
                    setTimeout(() => playCustomVideo(), 150);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition shadow active:scale-95 cursor-pointer shrink-0"
                >
                  <span>{isEn ? 'Watch Screen 2 →' : 'Tonton di Layar 2 Sekarang →'}</span>
                </button>
              </div>
            )}

            <div
              ref={mainContainerRef}
              className="relative w-full aspect-video sm:rounded-2xl overflow-hidden bg-black shadow-2xl select-none group border border-stone-800"
            >
              {/* Real Documentary Video Element or Strict Policy Lock */}
              {isArchivalVerified ? (
                <>
                  {/* Real Photographic Ken Burns Layer - Always visible when paused or loading */}
                  {(!isPlaying || mediaError) && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={qaResult.activeVisualUrl}
                        alt={isEn ? qaResult.activeCaptionEn : qaResult.activeCaptionId}
                        className="w-full h-full object-cover scale-105 transition-all duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
                    </div>
                  )}

                  <video
                    key={`screen1-video-${countryName}-s${currentScene.number}-${currentScene.videoUrl}`}
                    ref={videoRef}
                    src={currentScene.videoUrl}
                    poster={qaResult.activeVisualUrl}
                    playsInline
                    muted={isVideoMuted}
                    onError={() => setMediaError(true)}
                    className={`w-full h-full object-cover transition-opacity duration-700 ${
                      isPlaying && !mediaError ? 'opacity-100' : 'opacity-0'
                    }`}
                    onEnded={() => onOpenTrivia()}
                  />
                </>
              ) : (
                /* Strict Curriculum Document Policy Lock: Do not display unverified media */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-stone-200">
                  <ShieldAlert className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                    {isEn ? 'Screen 1: Curriculum Archival Policy Enforced' : 'Layar 1: Kepatuhan Dokumen Kurikulum Terproteksi'}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                    {isEn
                      ? 'Media on Screen 1 is strictly restricted to verified materials from: World Digital Library - Library of Congress, UNESCO Digital Library / Archives, Europeana, Smithsonian Institution Digital Collections, Wikimedia Commons, Pixabay, Pexels, Videezy, and Mixkit.'
                      : 'Media pada Layar 1 (Dokumen Kurikulum) hanya dapat ditampilkan apabila bersumber dari repositori terverifikasi: World Digital Library - Library of Congress, UNESCO Digital Library / Archives, Europeana, Smithsonian Institution Digital Collections, Wikimedia Commons, Pixabay, Pexels, Videezy, dan Mixkit.'}
                  </p>
                </div>
              )}

              {/* Ambient Top Overlay Header: Scene metadata & 4K badge */}
              <div className="absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/30 to-transparent flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-red-600/90 text-white shadow">
                    Scene {currentScene.number}/6
                  </span>
                  <div className="text-white drop-shadow-md">
                    <h2 className="text-xs sm:text-sm md:text-base font-bold line-clamp-1">
                      {countryName}: {settings.language === 'id' ? currentScene.titleId : currentScene.titleEn}
                    </h2>
                    {currentScene.archivalSource && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-amber-300 font-medium">
                        <Landmark className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="line-clamp-1 font-semibold">
                          {currentScene.archivalSource.archiveName}
                        </span>
                        <span className="hidden md:inline px-1 py-0.2 rounded bg-black/60 text-[9px] font-mono text-stone-300 border border-stone-700">
                          {currentScene.archivalSource.license}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* AI Quality Assurance Anti-Mismatch Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-lg backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">{isEn ? qaResult.qaBadgeTextEn : qaResult.qaBadgeTextId}</span>
                  </span>

                  {isMusicPlaying && (
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Music className="w-3 h-3 animate-bounce" />
                      <span>{isEn ? 'Music' : 'Musik'}</span>
                    </span>
                  )}
                  {isNarratorEnabled && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow">
                      <Mic className="w-3 h-3 animate-pulse text-emerald-400" />
                      <span>{getPersonaLabel()}</span>
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-900/80 text-stone-300 border border-stone-700">
                    4K DOCU
                  </span>
                </div>
              </div>

              {/* Central Play Overlay if Paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer z-10 transition hover:bg-black/25"
                >
                  <div className="p-4 sm:p-5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-2xl transform transition hover:scale-110 active:scale-95 flex items-center justify-center">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Synchronized Closed Captions Overlay */}
              {isSubtitlesEnabled && activeCue && (
                <div
                  data-testid="video-subtitle-overlay"
                  className="absolute bottom-14 sm:bottom-16 inset-x-3 sm:inset-x-6 flex justify-center items-center pointer-events-none z-20 transition-all duration-150 animate-in fade-in"
                >
                  <div
                    className={`max-w-2xl px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-center shadow-2xl backdrop-blur-md transition-all ${
                      settings.subtitleContrast === 'solid-black'
                        ? 'bg-black/95 text-white border border-stone-700'
                        : settings.subtitleContrast === 'soft-frosted'
                        ? 'bg-stone-900/85 text-stone-100 border border-stone-600/50'
                        : 'bg-black/90 text-amber-300 border border-amber-500/50 shadow-black'
                    } ${
                      settings.fontStyle === 'serif'
                        ? 'font-serif'
                        : settings.fontStyle === 'mono'
                        ? 'font-mono'
                        : 'font-sans'
                    } ${
                      settings.fontSize === 'large'
                        ? 'text-xs sm:text-sm md:text-base font-bold'
                        : settings.fontSize === 'xlarge'
                        ? 'text-sm sm:text-base md:text-lg font-extrabold'
                        : 'text-[11px] sm:text-xs md:text-sm font-semibold'
                    }`}
                  >
                    <span className="leading-snug drop-shadow-md select-text">
                      {activeCue.text}
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-1.5 z-20">
                {/* Timeline Scrubber */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-amber-400 min-w-[35px]">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 flex items-center group/slider">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="0.5"
                      value={currentTime}
                      onChange={handleSeek}
                      aria-label="Seek Video Timeline"
                      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
                    />
                    <div
                      className="absolute left-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500 rounded-lg pointer-events-none group-hover/slider:h-2 transition-all"
                      style={{ width: `${(currentTime / 60) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 min-w-[85px] text-right">
                    01:00 (Tot {formatTotalTime(currentSceneIndex, currentTime)}/06:00)
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-1 text-white">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="p-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition font-bold"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => jumpSeconds(-5)}
                      aria-label="Rewind 5s"
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => jumpSeconds(5)}
                      aria-label="Forward 5s"
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                    >
                      {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={toggleMusic}
                      aria-label="Toggle Background Music"
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        isMusicPlaying
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                          : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      <Music className={`w-3 h-3 ${isMusicPlaying ? 'text-amber-400 animate-pulse' : ''}`} />
                      <span className="hidden md:inline">
                        {settings.language === 'id' ? 'Musik' : 'Music'}
                      </span>
                    </button>

                    <button
                      onClick={toggleNarrator}
                      aria-label="Toggle Narrator Voice"
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                        isNarratorEnabled
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow'
                          : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      {isNarratorEnabled ? (
                        <Mic className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-stone-400" />
                      )}
                      <span className="hidden md:inline">{getPersonaLabel()}</span>
                    </button>

                    <button
                      onClick={() => setIsSubtitlesEnabled((prev) => !prev)}
                      aria-label={isSubtitlesEnabled ? 'Disable Subtitles' : 'Enable Subtitles'}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                        isSubtitlesEnabled
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow'
                          : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      <Subtitles className="w-3 h-3 text-amber-400" />
                      <span className="font-mono text-[10px]">CC</span>
                    </button>

                    <button
                      onClick={onOpenTrivia}
                      aria-label="Open Trivia Quiz"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-md transition active:scale-95"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">{settings.language === 'id' ? 'Kuis' : 'Trivia'}</span>
                      {completedScenes[currentScene.number] && (
                        <Check className="w-3 h-3 text-emerald-300 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={onOpenSettings}
                      aria-label="Settings"
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                      className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Archival Provenance & License Verification Bar */}
            {currentScene.archivalSource && (
              <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 flex flex-col gap-1.5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                      {isEn ? 'Curriculum Verified Archive:' : 'Arsip Kurikulum Terverifikasi:'}
                    </span>
                    <span className="font-semibold text-white">
                      {currentScene.archivalSource.archiveName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                    <span className="line-clamp-1 italic text-stone-300">
                      {currentScene.archivalSource.collectionRecord}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[9px] border border-stone-700 shrink-0">
                      {currentScene.archivalSource.license}
                    </span>
                  </div>
                </div>

                {/* Spatial Text & Visual Verification Tag */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80 text-[10px] text-emerald-300 font-medium">
                  <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-stone-400 uppercase font-bold text-[9px]">
                    {isEn ? 'Spatial Visual Binding:' : 'Sinkronisasi Visual Spasial:'}
                  </span>
                  <span className="text-stone-200 line-clamp-1">
                    {isEn ? qaResult.activeCaptionEn : qaResult.activeCaptionId}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            LAYAR 2: VIDEO UNGGAHAN GURU (Tampil saat 'custom' atau 'dual')
        ===================================================================== */}
        {(activeScreenMode === 'custom' || activeScreenMode === 'dual') && (
          <div className="flex flex-col gap-2">
            {/* Header Mini Label Layar 2 */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{isEn ? 'SCREEN 2: TEACHER UPLOADED VIDEO' : 'LAYAR 2: VIDEO UNGGAHAN GURU'}</span>
              </span>
              {activeScreenMode === 'custom' && (
                <button
                  onClick={() => {
                    pauseCustomVideo();
                    setActiveScreenMode('main');
                  }}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{isEn ? 'Back to Curriculum Docu (Screen 1)' : 'Kembali ke Dokumenter Kurikulum (Layar 1)'}</span>
                </button>
              )}
            </div>

            <div
              ref={customContainerRef}
              className="relative w-full aspect-video sm:rounded-2xl overflow-hidden bg-black shadow-2xl select-none group border border-stone-800 flex items-center justify-center"
            >
              {hasCustomVideo ? (
                <>
                  {/* HTML5 Video Element untuk Video Unggahan Guru */}
                  <video
                    key={`screen2-video-${countryName}-s${currentScene.number}-${trackVersionKey}-${activeCustomVideoSrc}`}
                    ref={customVideoRef}
                    src={activeCustomVideoSrc}
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    preload="auto"
                    muted={isCustomMuted}
                    onTimeUpdate={handleCustomTimeUpdate}
                    onLoadedMetadata={handleCustomTimeUpdate}
                    onEnded={handleCustomVideoEnded}
                    onError={(e) => {
                      const err = e.currentTarget.error;
                      console.warn('[Screen 2 Media Error]:', err);
                      const isNotSupported = err?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
                      setCustomVideoError(
                        isNotSupported
                          ? (isEn
                              ? 'Video file is empty (0 bytes), missing, or unsupported. Tap "Select MP4 Video File" below.'
                              : 'Berkas video kosong (0 bytes), tidak ditemukan, atau format tidak didukung. Ketuk tombol "Pilih Berkas Video MP4" di bawah.')
                          : (isEn
                              ? 'Video decoder notice: Tap retry or select a new video file.'
                              : 'Format stream video memerlukan inisialisasi ulang. Silakan coba lagi atau pilih berkas video baru.')
                      );
                    }}
                    className="w-full h-full object-contain"
                  >
                    {activeSubtitleTracks.map((track) => (
                      <track
                        key={`track-${countryName}-s${currentScene.number}-${track.srcLang}-${trackVersionKey}`}
                        kind="metadata"
                        src={track.src}
                        srcLang={track.srcLang}
                        label={track.label}
                        default={isCustomSubtitlesEnabled && customSubtitleLang === track.srcLang}
                      />
                    ))}
                  </video>

                  {/* Enhanced Error Recovery Card for Screen 2 */}
                  {customVideoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 text-center">
                      <AlertCircle className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
                      <h4 className="text-sm font-bold text-white mb-1">
                        {isEn ? 'Screen 2 Video Notice' : 'Pemberitahuan Video Layar 2'}
                      </h4>
                      <p className="text-xs text-stone-300 mb-4 max-w-sm leading-relaxed font-sans">
                        {customVideoError}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (customVideoRef.current) {
                              customVideoRef.current.load();
                              playCustomVideo();
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Retry Playback' : 'Coba Putar Lagi'}</span>
                        </button>

                        <button
                          onClick={() => screen2FileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-stone-950" />
                          <span>{isEn ? '📁 Select MP4 Video File' : '📁 Pilih Berkas Video MP4'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setCustomVideoError(null);
                            setActiveScreenMode('main');
                            togglePlay();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-300 font-semibold text-xs shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Play Screen 1 (Docu)' : 'Buka Layar 1 (Kurikulum)'}</span>
                        </button>
                      </div>

                      {/* Hidden File Input for Screen 2 recovery */}
                      <input
                        ref={screen2FileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/*"
                        className="hidden"
                        onChange={handleScreen2DirectUpload}
                      />
                    </div>
                  )}

                  {/* YouTube-style Subtitle Overlay on Screen 2 (Aesthetic, non-obstructive) */}
                  {isCustomSubtitlesEnabled && activeCustomCueText && (
                    <div className="absolute bottom-[4.25rem] sm:bottom-[4.75rem] inset-x-3 flex justify-center pointer-events-none z-30 transition-all duration-150">
                      <span
                        className="youtube-caption-box text-center font-medium text-white shadow-lg select-none"
                        style={{
                          backgroundColor: 'rgba(8, 8, 8, 0.65)',
                          borderRadius: '4px',
                          fontSize: 'clamp(14px, 3.5cqi, 16px)',
                          padding: '4px 8px',
                          width: 'fit-content',
                          maxWidth: '88%',
                          lineHeight: '1.35',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {activeCustomCueText}
                      </span>
                    </div>
                  )}

                  {/* Header Badge Video Guru */}
                  <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-none z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-stone-950 shadow">
                        {isEn ? 'TEACHER CLIP' : 'MATERI GURU'}
                      </span>
                      <div className="text-white drop-shadow">
                        <h3 className="text-xs sm:text-sm font-bold line-clamp-1">
                          {currentScene.customFileName || (isEn ? 'Teacher Uploaded Video' : 'Video Unggahan Guru')}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px]">
                          {currentScene.customFileSize && (
                            <span className="text-amber-300/80 font-mono">
                              {currentScene.customFileSize}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-semibold text-[10px]">
                            <HardDrive className="w-2.5 h-2.5" />
                            <span>{isEn ? 'Saved Offline (IndexedDB)' : 'Tersimpan Offline (IndexedDB)'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      {/* AI Audio-to-Text Sync Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerAudioSync();
                        }}
                        disabled={isTranscribingAudio}
                        title={
                          isEn
                            ? 'AI Audio-to-Text: Auto-sync verbatim subtitles from video audio'
                            : 'AI Audio-to-Text: Sinkronkan transkrip presisi dari audio video'
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-[11px] font-semibold transition active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className={`w-3 h-3 text-amber-400 ${isTranscribingAudio ? 'animate-spin' : ''}`} />
                        <span>
                          {isTranscribingAudio
                            ? (isEn ? 'Syncing...' : 'Menganalisis...')
                            : (isEn ? 'AI Audio Sync' : 'Sinkron Audio AI')}
                        </span>
                      </button>

                      {onDeleteCustomVideo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseCustomVideo();
                            onDeleteCustomVideo(currentScene.number);
                          }}
                          title={isEn ? 'Delete / Replace this video' : 'Hapus / Ganti video ini'}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 hover:text-white text-[11px] font-semibold transition active:scale-95"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span className="hidden sm:inline">{isEn ? 'Remove' : 'Hapus'}</span>
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900/80 text-stone-300 border border-stone-700">
                        S{currentScene.number} EXT
                      </span>
                    </div>
                  </div>

                  {/* Real-time Transcription Status Notification */}
                  {transcriptionNotice && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-stone-950/95 border border-amber-500/60 text-amber-300 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>{transcriptionNotice}</span>
                    </div>
                  )}

                  {/* Central Play Overlay if Paused */}
                  {!isCustomPlaying && (
                    <div
                      onClick={toggleCustomPlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition hover:bg-black/25"
                    >
                      <div className="p-4 sm:p-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-2xl transform transition hover:scale-110 active:scale-95 flex items-center justify-center">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-stone-950 text-stone-950" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Controls Bar Layar 2 */}
                  <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-1.5 z-20">
                    {/* Timeline Scrubber */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-amber-400 min-w-[35px]">
                        {formatTime(customCurrentTime)}
                      </span>
                      <div className="relative flex-1 flex items-center group/slider">
                        <input
                          type="range"
                          min="0"
                          max={customDuration || 60}
                          step="0.5"
                          value={customCurrentTime}
                          onChange={handleCustomSeek}
                          aria-label="Seek Custom Video Timeline"
                          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
                        />
                        <div
                          className="absolute left-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg pointer-events-none group-hover/slider:h-2 transition-all"
                          style={{
                            width: `${customDuration ? (customCurrentTime / customDuration) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-stone-400 min-w-[40px] text-right">
                        {formatTime(customDuration)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-1 text-white">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          onClick={toggleCustomPlay}
                          aria-label={isCustomPlaying ? 'Pause Teacher Video' : 'Play Teacher Video'}
                          className="p-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition font-bold"
                        >
                          {isCustomPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={() => jumpCustomSeconds(-5)}
                          aria-label="Rewind 5s"
                          className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => jumpCustomSeconds(5)}
                          aria-label="Forward 5s"
                          className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={toggleCustomMute}
                          aria-label={isCustomMuted ? 'Unmute' : 'Mute'}
                          className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                        >
                          {isCustomMuted ? (
                            <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* Interactive CC Toggle & Language Dropdown */}
                        <div className="relative flex items-center">
                          {/* CC Toggle Button */}
                          <button
                            onClick={toggleCustomSubtitles}
                            title={
                              isCustomSubtitlesEnabled && customSubtitleLang !== 'off'
                                ? (isEn ? 'Subtitles On (Click to turn off)' : 'Subtitle Aktif (Klik untuk matikan)')
                                : (isEn ? 'Subtitles Off (Click to turn on)' : 'Subtitle Nonaktif (Klik untuk aktifkan)')
                            }
                            aria-label="Toggle Subtitles"
                            className={`flex items-center gap-1 px-2 py-1 rounded-l-lg border text-[11px] font-bold transition active:scale-95 ${
                              isCustomSubtitlesEnabled && customSubtitleLang !== 'off'
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border-stone-800'
                            }`}
                          >
                            <Subtitles className="w-3.5 h-3.5" />
                            <span>CC</span>
                            {isCustomSubtitlesEnabled && customSubtitleLang !== 'off' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-pulse ml-0.5" />
                            )}
                          </button>

                          {/* Language Dropdown Selector Button */}
                          <button
                            onClick={() => setIsCustomSubMenuOpen((prev) => !prev)}
                            title={isEn ? 'Subtitle Language' : 'Pilih Bahasa Subtitle'}
                            aria-label="Choose Subtitle Language"
                            className={`flex items-center gap-1 px-1.5 py-1 rounded-r-lg border border-l-0 text-[11px] font-semibold transition ${
                              isCustomSubMenuOpen
                                ? 'bg-amber-400 text-stone-950 border-amber-300'
                                : isCustomSubtitlesEnabled && customSubtitleLang !== 'off'
                                ? 'bg-amber-500/90 text-stone-950 border-amber-400 hover:bg-amber-400'
                                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-800'
                            }`}
                          >
                            <Globe className="w-3 h-3" />
                            <span className="uppercase text-[10px] font-mono font-bold">
                              {customSubtitleLang === 'off' || !isCustomSubtitlesEnabled ? 'OFF' : customSubtitleLang}
                            </span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isCustomSubMenuOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Interactive Dropdown Menu */}
                          {isCustomSubMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsCustomSubMenuOpen(false)}
                              />
                              <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-stone-950/95 border border-stone-700/80 p-1.5 shadow-2xl backdrop-blur-md z-50 flex flex-col gap-1 text-[11px]">
                                <div className="px-2 py-1 text-[10px] font-bold text-stone-400 border-b border-stone-800/80 uppercase tracking-wider flex items-center justify-between">
                                  <span>{isEn ? 'Subtitles' : 'Teks Terjemahan'}</span>
                                  <span className="text-amber-400 font-mono">.VTT</span>
                                </div>

                                {/* Off / Matikan Option */}
                                <button
                                  onClick={() => selectCustomSubtitleLanguage('off')}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                                    !isCustomSubtitlesEnabled || customSubtitleLang === 'off'
                                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                                  }`}
                                >
                                  <span>{isEn ? 'Off / Matikan' : 'Matikan / Off'}</span>
                                  {(!isCustomSubtitlesEnabled || customSubtitleLang === 'off') && (
                                    <Check className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </button>

                                {/* English Option */}
                                <button
                                  onClick={() => selectCustomSubtitleLanguage('en')}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                                    isCustomSubtitlesEnabled && customSubtitleLang === 'en'
                                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span>English</span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">EN</span>
                                  </div>
                                  {isCustomSubtitlesEnabled && customSubtitleLang === 'en' && (
                                    <Check className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </button>

                                {/* Indonesia Option */}
                                <button
                                  onClick={() => selectCustomSubtitleLanguage('id')}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                                    isCustomSubtitlesEnabled && customSubtitleLang === 'id'
                                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span>Indonesia</span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">ID</span>
                                  </div>
                                  {isCustomSubtitlesEnabled && customSubtitleLang === 'id' && (
                                    <Check className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Speed Toggle */}
                        <div className="hidden sm:flex items-center bg-stone-900/80 rounded-lg p-0.5 border border-stone-800 text-[10px] font-mono">
                          {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changeCustomSpeed(speed)}
                              className={`px-1.5 py-0.5 rounded transition ${
                                customSpeed === speed
                                  ? 'bg-amber-500 text-stone-950 font-bold'
                                  : 'text-stone-400 hover:text-white'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>

                        {/* Quick Action: Lanjut ke Layar 1 */}
                        <button
                          onClick={() => {
                            pauseCustomVideo();
                            setActiveScreenMode('main');
                            setIsPlaying(true);
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              videoRef.current.play().catch(() => {});
                            }
                            triggerSceneNarration();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                        >
                          <span>{isEn ? 'Play Screen 1' : 'Putar Layar 1'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={toggleCustomFullscreen}
                          aria-label={isCustomFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                          className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition"
                        >
                          {isCustomFullscreen ? (
                            <Minimize2 className="w-3.5 h-3.5" />
                          ) : (
                            <Maximize2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State: Belum ada video tambahan yang diunggah untuk Scene ini */
                <div className="p-6 text-center max-w-md mx-auto flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl">
                    <Film className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-100">
                      {isEn
                        ? `Screen 2: No Teacher Video for Scene ${currentScene.number}`
                        : `Layar 2: Belum Ada Video Guru untuk Scene ${currentScene.number}`}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      {isEn
                        ? `Upload supplementary videos like the national anthem, cultural performance, or intro brief for ${countryName}.`
                        : `Guru dapat mengunggah video tambahan seperti lagu kebangsaan, pentas seni, atau video pengantar khusus untuk ${countryName}.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        const dropzoneEl = document.getElementById('teacher-video-upload-section');
                        if (dropzoneEl) {
                          dropzoneEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isEn ? 'Upload Video to Screen 2' : 'Unggah Video ke Layar 2'}</span>
                    </button>

                    {onRefreshSync && (
                      <button
                        onClick={onRefreshSync}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition active:scale-95"
                        title={isEn ? 'Check for newly uploaded videos from phone' : 'Periksa video yang baru diupload dari HP'}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Check Video from Phone' : 'Cek Video dari HP'}</span>
                      </button>
                    )}

                    {onOpenSyncModal && (
                      <button
                        onClick={onOpenSyncModal}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition"
                      >
                        {isEn ? 'Cloud Settings' : 'Koneksi Cloud'}
                      </button>
                    )}

                    <button
                      onClick={() => setActiveScreenMode('main')}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition"
                    >
                      {isEn ? 'View Screen 1' : 'Tonton Layar 1'}
                    </button>
                  </div>

                  <span className="text-[10px] text-stone-500 font-mono">
                    {isEn ? 'Supported: .mp4, .mkv, .mov (Max 500 MB per video)' : 'Mendukung: .mp4, .mkv, .mov (Maksimal 500 MB per video)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          DATA PARAMETER FAKTUAL SCENE (Nama, Jenis, Jumlah, Luas, Panjang, Lebar, Ketinggian)
      ========================================================================= */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          isDarkMode
            ? 'bg-stone-900/90 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-500">
              {settings.language === 'id'
                ? `Data Parameter Faktual Scene ${currentScene.number}: ${currentScene.titleId}`
                : `Factual Parameter Metrics Scene ${currentScene.number}: ${currentScene.titleEn}`}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
            {isEn ? 'Factual Parameters' : 'Fakta Spesifikasi Murni'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {m.nama && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Nama:' : 'Name:'}
                </span>
                <span className="font-semibold text-stone-200">{m.nama}</span>
              </div>
            </div>
          )}

          {m.jenis && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Jenis / Kategori:' : 'Type / Category:'}
                </span>
                <span className="font-semibold text-stone-200">{m.jenis}</span>
              </div>
            </div>
          )}

          {m.jumlah && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Hash className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Jumlah:' : 'Quantity / Count:'}
                </span>
                <span className="font-semibold text-stone-200">{m.jumlah}</span>
              </div>
            </div>
          )}

          {m.luas && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Maximize className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Luas Wilayah:' : 'Area:'}
                </span>
                <span className="font-semibold text-stone-200">{m.luas}</span>
              </div>
            </div>
          )}

          {m.panjang && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Ruler className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Panjang:' : 'Length:'}
                </span>
                <span className="font-semibold text-stone-200">{m.panjang}</span>
              </div>
            </div>
          )}

          {(m.lebar || m.kedalaman) && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5">
              <Ruler className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {m.lebar
                    ? settings.language === 'id'
                      ? 'Lebar:'
                      : 'Width:'
                    : settings.language === 'id'
                    ? 'Kedalaman:'
                    : 'Depth:'}
                </span>
                <span className="font-semibold text-stone-200">{m.lebar || m.kedalaman}</span>
              </div>
            </div>
          )}

          {m.ketinggian && (
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5 sm:col-span-2 lg:col-span-3">
              <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {settings.language === 'id' ? 'Ketinggian / Elevasi:' : 'Elevation / Altitude:'}
                </span>
                <span className="font-semibold text-stone-200">{m.ketinggian}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          PANEL 6 SCENE DOKUMENTER & DROPZONE UPLOAD
      ========================================================================= */}
      <div
        className={`p-3 rounded-2xl border transition-colors ${
          isDarkMode
            ? 'bg-stone-900/70 border-stone-800 text-stone-200'
            : 'bg-white border-stone-200 text-stone-800 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-500">
              {settings.language === 'id'
                ? `6 Scene Dokumenter ${countryName} (Durasi: 6 Menit)`
                : `6 Documentary Scenes of ${countryName} (6 Mins)`}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSceneSelect(Math.max(0, currentSceneIndex - 1))}
              disabled={currentSceneIndex === 0}
              aria-label="Previous Scene"
              className="p-1.5 rounded-lg border border-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2">
              {currentSceneIndex + 1} / {scenes.length}
            </span>
            <button
              onClick={() => onSceneSelect(Math.min(scenes.length - 1, currentSceneIndex + 1))}
              disabled={currentSceneIndex === scenes.length - 1}
              aria-label="Next Scene"
              className="p-1.5 rounded-lg border border-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropzone Upload Video Fungsional dengan Anchor ID */}
        <div id="teacher-video-upload-section" className="mb-3 px-1">
          <VideoUploadDropzone
            countryName={countryName}
            currentSceneNumber={currentScene.number}
            onUploadSuccess={handleCustomUploadComplete}
            isDarkMode={isDarkMode}
            language={settings.language}
          />
        </div>

        {/* 6 Scene Buttons with Thumbnails & Teacher Video Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {scenes.map((scene, idx) => {
            const isActive = currentSceneIndex === idx;
            const isCompleted = !!completedScenes[scene.number];
            const sceneHasCustom = Boolean(scene.customVideoUrl);

            return (
              <button
                key={scene.id}
                onClick={() => {
                  hasUserInteracted.current = true;
                  onSceneSelect(idx);
                }}
                aria-label={`Jump to Scene ${scene.number}: ${scene.titleId}`}
                className={`relative flex flex-col rounded-xl overflow-hidden text-left p-2 transition-all border group ${
                  isActive
                    ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 shadow-lg scale-[1.02]'
                    : isDarkMode
                    ? 'border-stone-800 bg-stone-950/80 hover:border-stone-700 hover:bg-stone-800/60'
                    : 'border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <div className="relative w-full h-16 sm:h-20 rounded-lg overflow-hidden bg-stone-900 mb-1.5">
                  <img
                    src={
                      containsVisualHallucination(countryName, scene.galleryImages[0]?.url || scene.fallbackPoster)
                        ? (scene.galleryImages.find((img) => !containsVisualHallucination(countryName, img.url))?.url ||
                           (countryName.toLowerCase().includes('argentina')
                             ? '/assets/argentina/aconcagua.jpg'
                             : scene.fallbackPoster))
                        : (scene.galleryImages[0]?.url || scene.fallbackPoster)
                    }
                    alt={scene.titleId}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-amber-300">
                    S{scene.number}
                  </span>

                  {sceneHasCustom && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-stone-950 shadow">
                      🎬 Layar 2
                    </span>
                  )}

                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/80 text-stone-300">
                    01:00
                  </span>

                  {isCompleted && !sceneHasCustom && (
                    <span className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <h4
                    className={`text-xs font-bold line-clamp-1 ${
                      isActive
                        ? 'text-amber-500'
                        : isDarkMode
                        ? 'text-stone-200'
                        : 'text-stone-900'
                    }`}
                  >
                    {settings.language === 'id' ? scene.titleId : scene.titleEn}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {settings.language === 'id' ? scene.taglineId : scene.taglineEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
