import React, { useState, useEffect, useCallback } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { CountryOverviewCard } from './components/CountryOverviewCard';
import { VideoPlayer, PlayerSettings } from './components/VideoPlayer';
import { SceneDetailsPanel } from './components/SceneDetailsPanel';
import { TriviaQuizModal } from './components/TriviaQuizModal';
import { SettingsModal } from './components/SettingsModal';
import { FinalEvaluationModal } from './components/FinalEvaluationModal';
import { ShareModal } from './components/ShareModal';
import {
  getOrCreateCountryProfile,
  fetchWikipediaSummary,
} from './services/encyclopediaService';
import { CountryProfile, VoicePersona } from './types/encyclopedia';
import { getNextSceneIndex } from './utils/quizRules';
import { narrationEngine } from './utils/speechNarration';
import { andeanAudio } from './utils/andeanAudio';
import { getAllCountryVideosFromIndexedDB, deleteVideoFromIndexedDB, cleanCorruptedZeroByteVideos } from './utils/videoStorageDB';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CrossDeviceSyncModal } from './components/CrossDeviceSyncModal';
import { fetchRemoteVideos, saveSyncConfig } from './services/crossDeviceSync';

export default function App() {
  const [countryName, setCountryName] = useState<string>('Peru');
  const [availableCountries, setAvailableCountries] = useState<string[]>([
    'Peru',
    'Argentina',
    'Kolombia',
    'Jepang',
    'India',
    'Cina',
    'Korea Selatan',
    'Malaysia',
    'Vietnam',
    'Filipina',
    'Thailand',
    'Italia',
    'Jerman',
    'Belanda',
    'Prancis',
    'Inggris',
    'Spanyol',
    'Rusia',
    'Portugal',
    'Amerika Serikat',
    'Canada',
    'Texas',
    'Mexiko',
    'Indonesia',
    'Brasil',
    'Mesir',
  ]);
  const [countryProfile, setCountryProfile] = useState<CountryProfile>(() =>
    getOrCreateCountryProfile('Peru')
  );
  const [isLoadingWiki, setIsLoadingWiki] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [completedScenes, setCompletedScenes] = useState<Record<number, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isTriviaOpen, setIsTriviaOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFinalEvaluationOpen, setIsFinalEvaluationOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [rewatchKey, setRewatchKey] = useState<number>(0);

  const handleOpenTrivia = useCallback(() => {
    setIsTriviaOpen(true);
  }, []);

  const handleCloseTrivia = useCallback(() => {
    setIsTriviaOpen(false);
  }, []);

  const handleRewatchScene = useCallback(() => {
    setIsTriviaOpen(false);
    setRewatchKey((k) => k + 1);
  }, []);

  const [settings, setSettings] = useState<PlayerSettings>({
    language: 'en', // DEFAULT ENGLISH as requested
    fontSize: 'normal',
    fontStyle: 'sans',
    subtitleContrast: 'high-contrast',
    speechSpeed: 1.0,
    voicePersona: 'anak-perempuan', // default cheerful elementary school girl voice
    musicVolume: 0.35,
    showSubtitles: true,
    subtitleLanguage: 'en',
  });

  // Sync narration engine and cultural background audio on initial mount and state changes
  useEffect(() => {
    narrationEngine.setLanguage(settings.language);
    narrationEngine.setPersona(settings.voicePersona);
    narrationEngine.setSpeedMultiplier(settings.speechSpeed);
    andeanAudio.setCountry(countryName);
  }, [settings.language, settings.voicePersona, settings.speechSpeed, countryName]);

  // Helper to fetch and apply uploaded videos from IndexedDB (local offline) and cloud cross-device sync
  const syncCustomVideos = useCallback(async (country: string) => {
    // Bersihkan file 0 bytes dummy hasil impor metadata yang rusak
    try {
      await cleanCorruptedZeroByteVideos(country);
    } catch {
      // Ignore
    }

    // 1. PRIORITAS UTAMA: Muat langsung dari IndexedDB browser lokal (perangkat saat ini)
    try {
      const idbVideos = await getAllCountryVideosFromIndexedDB(country);
      if (Object.keys(idbVideos).length > 0) {
        setCountryProfile((prev) => {
          const updated = prev.scenes.map((s) => {
            const stored = idbVideos[s.number];
            if (stored) {
              return {
                ...s,
                isCustomVideo: true,
                customVideoUrl: stored.objectUrl,
                customFileName: stored.record.fileName,
                customFileSize: stored.record.fileSize,
              };
            }
            return s;
          });
          return { ...prev, scenes: updated };
        });
      }
    } catch (idbErr) {
      console.warn('IndexedDB sync notice:', idbErr);
    }

    // 2. SINKRONISASI CLOUD ANTARGAWAI (HP ANDROID <-> LAPTOP WINDOWS <-> IPAD DI VERCEL)
    try {
      const remoteVideos = await fetchRemoteVideos(country);
      if (Object.keys(remoteVideos).length > 0) {
        setCountryProfile((prev) => {
          const updated = prev.scenes.map((s) => {
            const remoteItem = remoteVideos[s.number];
            if (remoteItem && remoteItem.videoUrl) {
              return {
                ...s,
                isCustomVideo: true,
                customVideoUrl: remoteItem.videoUrl,
                customFileName: remoteItem.fileName,
                customFileSize: remoteItem.fileSize,
                customSubtitles: remoteItem.subtitles || s.customSubtitles,
              };
            }
            return s;
          });
          return { ...prev, scenes: updated };
        });
      }
    } catch (syncErr) {
      console.warn('Cloud cross-device sync notice:', syncErr);
    }
  }, []);

  // Load country data and sync with Wikipedia API + Local IndexedDB + Server Video Registry
  const loadCountryData = useCallback(async (name: string) => {
    setIsLoadingWiki(true);
    try {
      const wikiData = await fetchWikipediaSummary(name);
      const profile = getOrCreateCountryProfile(name, wikiData);

      // Muat dari IndexedDB browser lokal terlebih dahulu (bersihkan yang corrupt/0-byte)
      try {
        await cleanCorruptedZeroByteVideos(name);
        const idbVideos = await getAllCountryVideosFromIndexedDB(name);
        if (Object.keys(idbVideos).length > 0) {
          profile.scenes = profile.scenes.map((s) => {
            const stored = idbVideos[s.number];
            if (stored) {
              return {
                ...s,
                isCustomVideo: true,
                customVideoUrl: stored.objectUrl,
                customFileName: stored.record.fileName,
                customFileSize: stored.record.fileSize,
              };
            }
            return s;
          });
        }
      } catch (e) {
        console.warn('IndexedDB load notice:', e);
      }

      // Fetch persistent custom videos from server registry if available
      try {
        const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const res = await fetch(`/api/custom-videos?country=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.videos) {
            profile.scenes = profile.scenes.map((s) => {
              if (s.isCustomVideo && s.customVideoUrl) return s;
              const item = data.videos[s.number.toString()];
              if (item) {
                return {
                  ...s,
                  isCustomVideo: true,
                  customVideoUrl: item.videoUrl,
                  customFileName: item.fileName,
                  customFileSize: item.fileSize,
                  customSubtitles: item.subtitles || s.customSubtitles,
                };
              }
              return s;
            });
          }
        }
      } catch {
        // Offline or static Vercel host
      }

      setCountryProfile(profile);
      setCountryName(profile.name);
      setCurrentSceneIndex(0);
      setCompletedScenes({});
    } catch {
      const fallback = getOrCreateCountryProfile(name);
      setCountryProfile(fallback);
      setCountryName(fallback.name);
    } finally {
      setIsLoadingWiki(false);
    }
  }, []);

  // Real-Time Cross-Device Auto-Sync:
  // Otomatis memperbarui video saat berpindah tab, kembali ke browser, atau setiap 12 detik
  useEffect(() => {
    // 1. Sinkronisasi awal
    syncCustomVideos(countryName);

    // 2. Sinkronisasi instan saat guru kembali ke tab laptop / iPad
    const handleFocus = () => {
      syncCustomVideos(countryName);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncCustomVideos(countryName);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Polling interval 12 detik agar video baru dari HP langsung muncul tanpa perlu refresh
    const pollInterval = setInterval(() => {
      syncCustomVideos(countryName);
    }, 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [countryName, syncCustomVideos]);

  // Detect URL search query parameters (e.g. ?country=Peru&scene=1&lang=id&video_url=...&sync_url=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const countryParam = params.get('country');
      const sceneParam = params.get('scene');
      const langParam = params.get('lang');
      const syncUrlParam = params.get('sync_url');
      const syncKeyParam = params.get('sync_key');
      const videoUrlParam = params.get('video_url');
      const videoNameParam = params.get('video_name');
      const videoSceneParam = params.get('video_scene') || sceneParam || '1';

      // Auto-pairing cloud config dari link HP
      if (syncUrlParam && syncKeyParam) {
        saveSyncConfig({
          supabaseUrl: syncUrlParam,
          supabaseAnonKey: syncKeyParam,
        });
        syncCustomVideos(countryName);
      }

      if (countryParam) {
        setAvailableCountries((prev) =>
          prev.includes(countryParam) ? prev : [countryParam, ...prev]
        );
        loadCountryData(countryParam);
      }

      const sceneNum = sceneParam ? parseInt(sceneParam, 10) : 1;
      if (!isNaN(sceneNum) && sceneNum >= 1 && sceneNum <= 6) {
        setCurrentSceneIndex(sceneNum - 1);
      }

      // KUNCI UTAMA SISWA: Jika link yang dibagikan admin membawa video_url publik,
      // otomatis pasang video guru ke scene tersebut di gawai siswa!
      if (videoUrlParam) {
        const decodedVideoUrl = decodeURIComponent(videoUrlParam);
        const decodedVideoName = videoNameParam ? decodeURIComponent(videoNameParam) : 'Video Materi Guru';
        const targetSceneNum = parseInt(videoSceneParam, 10) || sceneNum || 1;

        setCountryProfile((prev) => {
          const updatedScenes = prev.scenes.map((s) => {
            if (s.number === targetSceneNum) {
              return {
                ...s,
                isCustomVideo: true,
                customVideoUrl: decodedVideoUrl,
                customFileName: decodedVideoName,
              };
            }
            return s;
          });
          return { ...prev, scenes: updatedScenes };
        });

        setCurrentSceneIndex(targetSceneNum - 1);
      }

      if (langParam === 'en' || langParam === 'id') {
        setSettings((prev) => ({ ...prev, language: langParam }));
      }
    }
  }, [loadCountryData, countryName, syncCustomVideos]);

  const handleCountryChange = (newCountry: string) => {
    loadCountryData(newCountry);
  };

  const handleAddCountry = (newCountry: string) => {
    setAvailableCountries((prev) =>
      prev.includes(newCountry) ? prev : [newCountry, ...prev]
    );
    loadCountryData(newCountry);
  };

  const handleUpdateSettings = (newSettings: Partial<PlayerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.language) {
        narrationEngine.setLanguage(newSettings.language);
      }
      if (newSettings.voicePersona) {
        narrationEngine.setPersona(newSettings.voicePersona);
      }
      if (newSettings.speechSpeed !== undefined) {
        narrationEngine.setSpeedMultiplier(newSettings.speechSpeed);
      }
      return updated;
    });
  };

  const handlePassScene = (sceneNumber: number) => {
    setCompletedScenes((prev) => ({ ...prev, [sceneNumber]: true }));
  };

  const handleCustomVideoUploaded = (
    sceneNumber: number,
    customVideoUrl: string,
    fileName?: string,
    fileSize?: string,
    subtitles?: any[]
  ) => {
    setCountryProfile((prev) => {
      const updatedScenes = prev.scenes.map((s) =>
        s.number === sceneNumber
          ? {
              ...s,
              customVideoUrl,
              isCustomVideo: true,
              customFileName: fileName || 'Video Materi Guru',
              customFileSize: fileSize || '',
              customSubtitles: subtitles || s.customSubtitles,
            }
          : s
      );
      return {
        ...prev,
        scenes: updatedScenes,
      };
    });
    setCurrentSceneIndex(sceneNumber - 1);
  };

  const handleDeleteCustomVideo = async (sceneNumber: number) => {
    await deleteVideoFromIndexedDB(countryName, sceneNumber);
    setCountryProfile((prev) => {
      const updatedScenes = prev.scenes.map((s) =>
        s.number === sceneNumber
          ? {
              ...s,
              customVideoUrl: undefined,
              isCustomVideo: false,
              customFileName: undefined,
              customFileSize: undefined,
            }
          : s
      );
      return {
        ...prev,
        scenes: updatedScenes,
      };
    });
  };

  const handleNextScene = () => {
    const nextIdx = getNextSceneIndex(currentSceneIndex, countryProfile.scenes.length);
    setCurrentSceneIndex(nextIdx);
  };

  const testCurrentChildVoice = () => {
    narrationEngine.setLanguage(settings.language);
    narrationEngine.setPersona(settings.voicePersona);
    narrationEngine.playPersonaChime(settings.voicePersona);
    const countryDisplayName = settings.language === 'en' ? (countryProfile.nameEn || countryProfile.name) : countryProfile.name;
    let sample = '';
    if (settings.voicePersona === 'anak-perempuan') {
      sample =
        settings.language === 'id'
          ? `Halo teman-teman! Yuk kita jelajahi ensiklopedia seru negara ${countryDisplayName} bersamaku!`
          : `Hello friends! Let's explore the exciting encyclopedia of ${countryDisplayName} together!`;
    } else if (settings.voicePersona === 'anak-laki-laki') {
      sample =
        settings.language === 'id'
          ? `Hai kawan-kawan! Ayo kita simak angka, panjang, dan ketinggian tempat di negara ${countryDisplayName} dengan semangat!`
          : `Hey friends! Let's discover the geography, lengths, and heights of ${countryDisplayName} with enthusiasm!`;
    } else {
      sample =
        settings.language === 'id'
          ? `Selamat datang anak-anak pintar. Mari kita pelajari fakta-fakta penting negara ${countryDisplayName}.`
          : `Welcome students. Let us explore the important facts of ${countryDisplayName}.`;
    }
    narrationEngine.speakText(sample);
  };

  const completedCount = Object.values(completedScenes).filter(Boolean).length;
  const currentScene = countryProfile.scenes[currentSceneIndex] || countryProfile.scenes[0];
  const countryDisplayName =
    settings.language === 'en'
      ? countryProfile.nameEn || countryProfile.name
      : countryProfile.name;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'
      }`}
    >
      {/* Header with user's uploaded EduZone logo, country input, and controls */}
      <HeaderNav
        countryName={countryName}
        onCountryChange={handleCountryChange}
        availableCountries={availableCountries}
        onAddCountry={handleAddCountry}
        language={settings.language}
        onLanguageChange={(lang) => handleUpdateSettings({ language: lang })}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFinalEvaluation={() => setIsFinalEvaluationOpen(true)}
        completedScenesCount={completedCount}
        onOpenShare={() => setIsShareOpen(true)}
        isSearchingWiki={isLoadingWiki}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Educational Audiovisual Encyclopedia Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        {/* Audio-visual Wikipedia / Encyclopedia Infobox & Voice Switcher */}
        <CountryOverviewCard
          country={countryProfile}
          currentPersona={settings.voicePersona}
          onPersonaChange={(persona: VoicePersona) =>
            handleUpdateSettings({ voicePersona: persona })
          }
          language={settings.language}
          isDarkMode={isDarkMode}
          onTestVoice={testCurrentChildVoice}
          availableCountries={availableCountries}
          onSelectCountry={handleCountryChange}
          isLoadingWiki={isLoadingWiki}
        />

        {/* Real Documentary Video Player - Clean Screen (No Subtitles) + Factual Metrics HUD */}
        <VideoPlayer
          countryName={countryDisplayName}
          scenes={countryProfile.scenes}
          currentSceneIndex={currentSceneIndex}
          onSceneSelect={(idx) => setCurrentSceneIndex(idx)}
          onOpenTrivia={handleOpenTrivia}
          completedScenes={completedScenes}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDarkMode={isDarkMode}
          rewatchKey={rewatchKey}
          onCustomVideoUploaded={handleCustomVideoUploaded}
          onDeleteCustomVideo={handleDeleteCustomVideo}
          onRefreshSync={() => syncCustomVideos(countryName)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* Scene Details Panel (Factual parameters, Voiceover transcript, Mini Project, Upload Architecture) */}
        <SceneDetailsPanel
          scene={currentScene}
          countryName={countryDisplayName}
          language={settings.language}
          isDarkMode={isDarkMode}
          onOpenTrivia={handleOpenTrivia}
          onOpenShare={() => setIsShareOpen(true)}
        />
      </main>

      {/* Share to Students Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sceneNumber={currentScene.number}
        countryName={countryDisplayName}
        language={settings.language}
        isDarkMode={isDarkMode}
        scenes={countryProfile.scenes}
        onVideoUploadedToCloud={handleCustomVideoUploaded}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Trivia Quiz Modal */}
      <TriviaQuizModal
        isOpen={isTriviaOpen}
        onClose={handleCloseTrivia}
        scene={currentScene}
        language={settings.language}
        isDarkMode={isDarkMode}
        onPassScene={handlePassScene}
        onNextScene={handleNextScene}
        onRewatchScene={handleRewatchScene}
      />

      {/* Settings Modal (Child Voice Tester & Audio Controls) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Final Evaluation & Certificate Modal */}
      <FinalEvaluationModal
        isOpen={isFinalEvaluationOpen}
        onClose={() => setIsFinalEvaluationOpen(false)}
        completedScenes={completedScenes}
        country={countryProfile}
        language={settings.language}
        isDarkMode={isDarkMode}
      />

      {/* Cross-Device Cloud & Peer Sync Modal (HP Android <-> Laptop Windows <-> iPad) */}
      <CrossDeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        countryName={countryName}
        language={settings.language}
        onSyncComplete={() => syncCustomVideos(countryName)}
      />

      {/* Clean Minimal Educational Footer */}
      <footer
        className={`border-t py-4 px-4 mt-auto text-xs transition-colors ${
          isDarkMode
            ? 'bg-stone-950/90 border-stone-800 text-stone-500'
            : 'bg-white border-stone-200 text-stone-600'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-semibold text-stone-400">
            EduZone MPI Kurikulum Merdeka SD (Kelas 1 - 6) • Berbasis Pedagogi Digital Interaktif Kemendikdasmen RI dan Cambridge Primary Checkpoint
          </p>
          <div className="flex items-center gap-3 text-[11px] text-stone-500">
            <span>
              {settings.language === 'id' ? 'Negara Aktif:' : 'Active Country:'}{' '}
              <strong className="text-amber-500">
                {settings.language === 'en'
                  ? (countryProfile.officialNameEn || countryProfile.nameEn || countryProfile.name)
                  : (countryProfile.officialName || countryProfile.name)}
              </strong>
            </span>
            <span>•</span>
            <span>
              {settings.language === 'id' ? 'Suara Aktif:' : 'Active Voice:'}{' '}
              {settings.voicePersona === 'anak-perempuan'
                ? (settings.language === 'id' ? '👧 Anak Perempuan SD' : '👧 Primary Schoolgirl')
                : settings.voicePersona === 'anak-laki-laki'
                ? (settings.language === 'id' ? '👦 Anak Laki-Laki SD' : '👦 Primary Schoolboy')
                : (settings.language === 'id' ? '👩‍🏫 Guru Ramah' : '👩‍🏫 Friendly Educator')}
            </span>
          </div>
        </div>
      </footer>

      {/* Offline Mode Status Banner */}
      <OfflineIndicator language={settings.language} />
    </div>
  );
}
