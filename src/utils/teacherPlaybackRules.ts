/**
 * Teacher Playback Sequence & Dual Screen Rules
 * Pedagogical helper for managing separate screen displays (Layar 1 vs Layar 2)
 * and sequence preference (Guru First vs Documentary First).
 */

export type ScreenDisplayMode = 'main' | 'custom' | 'dual';
export type PlaybackSequence = 'teacher-first' | 'docu-first';

export interface SceneVideoState {
  hasCustomVideo: boolean;
  customVideoUrl?: string;
  customFileName?: string;
}

/**
 * Determines which screen should be prioritized when a scene is loaded.
 */
export function resolveInitialScreenMode(
  sequence: PlaybackSequence,
  hasCustomVideo: boolean,
  currentMode: ScreenDisplayMode
): ScreenDisplayMode {
  // If teacher explicitly selected dual mode, preserve dual view
  if (currentMode === 'dual') {
    return 'dual';
  }

  // If teacher chose "Putar Video Guru Dulu" and a custom video exists, prioritize Layar 2
  if (sequence === 'teacher-first' && hasCustomVideo) {
    return 'custom';
  }

  // Otherwise default to Layar 1 (Dokumenter Kurikulum)
  return 'main';
}

/**
 * Resolves the next action when a video completes playing on either screen.
 */
export function resolveNextSequenceAction(
  finishedScreen: 'main' | 'custom',
  sequence: PlaybackSequence,
  hasCustomVideo: boolean
): { nextScreen: ScreenDisplayMode; shouldAutoPlay: boolean; notificationText: string } {
  if (finishedScreen === 'custom') {
    if (sequence === 'teacher-first') {
      return {
        nextScreen: 'main',
        shouldAutoPlay: true,
        notificationText: 'Video Guru selesai. Memutar Layar 1 (Dokumenter Kurikulum)...',
      };
    }
    return {
      nextScreen: 'main',
      shouldAutoPlay: false,
      notificationText: 'Video Guru selesai.',
    };
  }

  // finishedScreen === 'main'
  if (sequence === 'docu-first' && hasCustomVideo) {
    return {
      nextScreen: 'custom',
      shouldAutoPlay: true,
      notificationText: 'Dokumenter selesai. Memutar Layar 2 (Materi Tambahan Guru)...',
    };
  }

  return {
    nextScreen: 'main',
    shouldAutoPlay: false,
    notificationText: 'Dokumenter selesai. Silakan lanjutkan ke Kuis Trivia atau Scene berikutnya.',
  };
}

/**
 * Formats file size in MB or KB
 */
export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }
  const kilobytes = bytes / 1024;
  return `${kilobytes.toFixed(0)} KB`;
}
