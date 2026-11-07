import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVideoStorageKey } from './videoStorageDB';

test('buildVideoStorageKey creates normalized storage keys for countries and scenes', () => {
  assert.equal(buildVideoStorageKey('Peru', 1), 'peru_scene_1');
  assert.equal(buildVideoStorageKey('Korea Selatan', 3), 'korea_selatan_scene_3');
  assert.equal(buildVideoStorageKey('United States', 6), 'united_states_scene_6');
});
