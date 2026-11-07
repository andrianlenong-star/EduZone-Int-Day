import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  formatTotalTime,
  calculateTotalProgress,
  evaluateQuizScore,
  checkProgressLock,
  getNextSceneIndex,
  getPreviousSceneIndex,
  getEffectiveSpeechParams,
} from './quizRules';

test('formatTime correctly turns seconds into mm:ss', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(5), '00:05');
  assert.equal(formatTime(59), '00:59');
  assert.equal(formatTime(60), '01:00');
  assert.equal(formatTime(125), '02:05');
  assert.equal(formatTime(360), '06:00');
  assert.equal(formatTime(-1), '00:00');
});

test('formatTotalTime calculates cumulative documentary position', () => {
  assert.equal(formatTotalTime(0, 30), '00:30');
  assert.equal(formatTotalTime(1, 15), '01:15');
  assert.equal(formatTotalTime(5, 60), '06:00');
});

test('calculateTotalProgress computes accurate percentage across 6 scenes of 60s', () => {
  assert.equal(calculateTotalProgress(0, 0, 60, 6), 0);
  assert.equal(calculateTotalProgress(2, 60, 60, 6), 50);
  assert.equal(calculateTotalProgress(5, 60, 60, 6), 100);
});

test('checkProgressLock enforces >= 75% threshold', () => {
  assert.equal(checkProgressLock(100), true);
  assert.equal(checkProgressLock(75), true);
  assert.equal(checkProgressLock(74), false);
  assert.equal(checkProgressLock(50), false);
  assert.equal(checkProgressLock(0), false);
});

test('evaluateQuizScore calculates accuracy and pass status', () => {
  const mockQuestions = [
    { correctIndex: 1 },
    { correctIndex: 0 },
    { correctIndex: 2 },
    { correctIndex: 3 },
  ];

  const perfect = evaluateQuizScore({ 0: 1, 1: 0, 2: 2, 3: 3 }, mockQuestions);
  assert.equal(perfect.score, 4);
  assert.equal(perfect.percentage, 100);
  assert.equal(perfect.passed, true);

  const passing = evaluateQuizScore({ 0: 1, 1: 0, 2: 2, 3: 0 }, mockQuestions);
  assert.equal(passing.score, 3);
  assert.equal(passing.percentage, 75);
  assert.equal(passing.passed, true);

  const failing = evaluateQuizScore({ 0: 1, 1: 0, 2: 0, 3: 0 }, mockQuestions);
  assert.equal(failing.score, 2);
  assert.equal(failing.percentage, 50);
  assert.equal(failing.passed, false);
});

test('navigation helpers clamp within bounds', () => {
  assert.equal(getNextSceneIndex(0, 6), 1);
  assert.equal(getNextSceneIndex(5, 6), 5);
  assert.equal(getPreviousSceneIndex(5), 4);
  assert.equal(getPreviousSceneIndex(0), 0);
});

test('getEffectiveSpeechParams produces cheerful child voice pitch parameters', () => {
  const girlVoice = getEffectiveSpeechParams('id', 1.0, 'anak-perempuan');
  assert.equal(girlVoice.langCode, 'id-ID');
  assert.equal(girlVoice.pitch, 1.48); // high youthful cheerful pitch
  assert.equal(girlVoice.rate, 1.08);

  const boyVoice = getEffectiveSpeechParams('id', 1.0, 'anak-laki-laki');
  assert.equal(boyVoice.langCode, 'id-ID');
  assert.equal(boyVoice.pitch, 1.18); // boyish spirited pitch
  assert.equal(boyVoice.rate, 1.14);

  const teacherVoice = getEffectiveSpeechParams('id', 1.0, 'guru-ramah');
  assert.equal(teacherVoice.pitch, 0.96);
  assert.equal(teacherVoice.rate, 0.88);
});
