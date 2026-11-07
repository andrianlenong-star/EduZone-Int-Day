import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVtt } from './vttParser';

test('parseVtt parses standard W3C WebVTT correctly', () => {
  const sampleVtt = `WEBVTT

00:00:01.000 --> 00:00:05.500
Peru is a country in western South America, famous for its ancient Incan Empire.

00:00:06.000 --> 00:00:11.000
Here, the historic road system 'Qhapaq Ñan' stretches across the Andean landscape.`;

  const cues = parseVtt(sampleVtt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 1.0);
  assert.equal(cues[0].end, 5.5);
  assert.equal(cues[0].text, 'Peru is a country in western South America, famous for its ancient Incan Empire.');
  assert.equal(cues[1].start, 6.0);
  assert.equal(cues[1].end, 11.0);
});
