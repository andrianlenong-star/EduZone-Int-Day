/**
 * Core business rules and mathematical calculations for EduZone Audio-Visual Encyclopedia
 * Decoupled for fast, deterministic unit testing under Node.js test runner.
 */

import { VoicePersona } from '../types/encyclopedia';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Format seconds into mm:ss display string.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const clamped = Math.floor(seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format total documentary time across all scenes.
 * e.g., 6 scenes of 60s = 360s -> "06:00"
 */
export function formatTotalTime(sceneIndex: number, currentSceneTime: number, sceneDuration: number = 60): string {
  const currentTotal = Math.min(sceneIndex * sceneDuration + currentSceneTime, 6 * sceneDuration);
  return formatTime(currentTotal);
}

/**
 * Calculate overall documentary progress percentage (0 - 100%).
 */
export function calculateTotalProgress(
  sceneIndex: number,
  sceneTime: number,
  sceneDuration: number = 60,
  totalScenes: number = 6
): number {
  const totalDuration = totalScenes * sceneDuration;
  if (totalDuration <= 0) return 0;
  const currentTotal = sceneIndex * sceneDuration + Math.min(sceneTime, sceneDuration);
  const percent = (currentTotal / totalDuration) * 100;
  return Math.max(0, Math.min(100, Math.round(percent * 10) / 10));
}

/**
 * Evaluate quiz score and verify whether it meets the >= 70% passing threshold.
 */
export function evaluateQuizScore(
  answers: Record<number, number>,
  questions: Array<{ correctIndex: number }>
): { score: number; total: number; percentage: number; passed: boolean } {
  if (!questions || questions.length === 0) {
    return { score: 0, total: 0, percentage: 0, passed: false };
  }

  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const passed = checkProgressLock(percentage);

  return {
    score: correctCount,
    total: questions.length,
    percentage,
    passed,
  };
}

/**
 * Progress Lock rule: passing requires 75% or higher.
 */
export function checkProgressLock(percentage: number): boolean {
  return percentage >= 75;
}

/**
 * Safe navigation bounds for scene switching
 */
export function getNextSceneIndex(currentIndex: number, totalScenes: number = 6): number {
  return Math.min(currentIndex + 1, Math.max(0, totalScenes - 1));
}

export function getPreviousSceneIndex(currentIndex: number): number {
  return Math.max(currentIndex - 1, 0);
}

/**
 * Resolves speech synthesis parameters tuned for cheerful, natural elementary school voices
 */
export function getEffectiveSpeechParams(
  language: 'id' | 'en',
  speedMultiplier: number = 1.0,
  persona: VoicePersona = 'anak-perempuan'
): { langCode: string; rate: number; pitch: number } {
  let basePitch = 1.06;
  let baseRate = 0.95;

  if (persona === 'anak-perempuan') {
    basePitch = 1.48; // Bright, high child girl pitch
    baseRate = 1.08;
  } else if (persona === 'anak-laki-laki') {
    basePitch = 1.18; // Spirited, dynamic boyish pitch
    baseRate = 1.14;
  } else {
    basePitch = 0.96; // Calm, warm educator pitch
    baseRate = 0.88;
  }

  const clampedMultiplier = Math.max(0.7, Math.min(1.5, speedMultiplier));
  const effectiveRate = Math.round(baseRate * clampedMultiplier * 100) / 100;

  return {
    langCode: language === 'id' ? 'id-ID' : 'en-US',
    rate: effectiveRate,
    pitch: basePitch,
  };
}
