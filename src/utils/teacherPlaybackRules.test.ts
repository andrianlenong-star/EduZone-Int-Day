import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveInitialScreenMode,
  resolveNextSequenceAction,
  formatByteSize,
} from './teacherPlaybackRules';

test('resolveInitialScreenMode prioritizes Layar 2 when sequence is teacher-first and video exists', () => {
  const mode = resolveInitialScreenMode('teacher-first', true, 'main');
  assert.equal(mode, 'custom');
});

test('resolveInitialScreenMode stays on Layar 1 if no custom video exists even if sequence is teacher-first', () => {
  const mode = resolveInitialScreenMode('teacher-first', false, 'main');
  assert.equal(mode, 'main');
});

test('resolveInitialScreenMode preserves dual mode if teacher is in dual screen view', () => {
  const mode = resolveInitialScreenMode('teacher-first', true, 'dual');
  assert.equal(mode, 'dual');
});

test('resolveInitialScreenMode defaults to Layar 1 when sequence is docu-first', () => {
  const mode = resolveInitialScreenMode('docu-first', true, 'main');
  assert.equal(mode, 'main');
});

test('resolveNextSequenceAction transitions from custom to main when teacher-first', () => {
  const result = resolveNextSequenceAction('custom', 'teacher-first', true);
  assert.equal(result.nextScreen, 'main');
  assert.equal(result.shouldAutoPlay, true);
});

test('resolveNextSequenceAction transitions from main to custom when docu-first and custom video exists', () => {
  const result = resolveNextSequenceAction('main', 'docu-first', true);
  assert.equal(result.nextScreen, 'custom');
  assert.equal(result.shouldAutoPlay, true);
});

test('formatByteSize formats megabytes and kilobytes accurately', () => {
  assert.equal(formatByteSize(11.06 * 1024 * 1024), '11.1 MB');
  assert.equal(formatByteSize(500 * 1024), '500 KB');
});
