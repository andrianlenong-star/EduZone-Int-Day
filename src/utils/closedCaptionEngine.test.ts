import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLanguage,
  segmentTextToChunks,
  generateSynchronizedSubtitles,
  getSceneSubtitles,
  exportSubtitlesAsJson,
} from './closedCaptionEngine';

test('detectLanguage correctly distinguishes Indonesian vs English', () => {
  const enSample = 'Colombia is a magnificent nation at the northern tip of South America with coastline.';
  const idSample = 'Kolombia adalah negara yang memiliki dua garis pantai samudra di kawasan khatulistiwa.';

  assert.equal(detectLanguage(enSample), 'en');
  assert.equal(detectLanguage(idSample), 'id');
});

test('segmentTextToChunks respects max 40-50 characters per line without splitting words', () => {
  const text = 'Argentina is South America’s second-largest country, spanning 2,780,400 square kilometers across the Southern Cone. Stretching from subtropical wetlands in the north to sub-antarctic tundra.';
  const chunks = segmentTextToChunks(text, 46);

  assert.ok(chunks.length > 0, 'Must produce chunks');
  chunks.forEach((chunk, idx) => {
    assert.ok(chunk.length <= 50, `Chunk ${idx} length ${chunk.length} should be <= 50: "${chunk}"`);
    assert.ok(chunk.trim().length > 0, 'Chunk must not be empty');
  });
});

test('generateSynchronizedSubtitles creates valid non-overlapping JSON structure', () => {
  const narrative = 'Peru is a country in western South America famous for the ancient Inca sanctuary of Machu Picchu, the majestic Andes mountains, and the biodiverse Amazon rainforest.';
  const cues = generateSynchronizedSubtitles(narrative, 45.0, 1.2);

  assert.ok(cues.length >= 2, 'Should create multiple subtitle cues');

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    assert.ok(cue.start < cue.end, `Cue ${i} start ${cue.start} must be < end ${cue.end}`);
    assert.ok(cue.text.length <= 50, `Cue ${i} text length must be <= 50 chars`);

    if (i > 0) {
      assert.ok(cues[i - 1].end <= cue.start, `Cue ${i} must not overlap with cue ${i - 1}`);
    }
  }

  // Verify JSON export structure
  const jsonStr = exportSubtitlesAsJson(cues);
  const parsed = JSON.parse(jsonStr);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed[0].start, cues[0].start);
  assert.equal(parsed[0].text, cues[0].text);
});

test('getSceneSubtitles retrieves verified English subtitles for Argentina and Colombia', () => {
  const argCues = getSceneSubtitles('Argentina', 1, 'en', 'Argentina is South America’s second-largest country...');
  assert.ok(argCues.length > 0);
  assert.ok(argCues.some(c => c.text.includes('Aconcagua')));

  const colCues = getSceneSubtitles('Colombia', 1, 'en', 'Colombia is a magnificent nation...');
  assert.ok(colCues.length > 0);
  assert.ok(colCues.some(c => c.text.includes('Caribbean Sea')));
});
