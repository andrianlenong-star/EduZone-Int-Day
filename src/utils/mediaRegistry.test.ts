import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSceneMedia, isApprovedArchivalSource, WORLD_MEDIA_REGISTRY } from '../data/countryMediaRegistry';

test('getSceneMedia provides authentic media and archival citations for all requested countries', () => {
  const targetCountries = [
    'Jepang',
    'India',
    'Peru',
    'Brasil',
    'Kolombia',
    'Argentina',
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
    'Meksiko',
  ];

  for (const country of targetCountries) {
    for (let scene = 1; scene <= 6; scene++) {
      const media = getSceneMedia(country, scene);
      assert.ok(media, `Media should exist for ${country} scene ${scene}`);
      assert.ok(media.fallbackPoster, `fallbackPoster should exist for ${country} scene ${scene}`);
      assert.ok(media.videoUrl, `videoUrl should exist for ${country} scene ${scene}`);
      assert.ok(media.galleryImages.length > 0, `galleryImages should exist for ${country} scene ${scene}`);
      assert.ok(media.archivalSource, `archivalSource should exist for ${country} scene ${scene}`);
      assert.ok(media.archivalSource.archiveName, `archiveName should exist for ${country} scene ${scene}`);
      assert.equal(
        isApprovedArchivalSource(media.archivalSource),
        true,
        `Archival source for ${country} scene ${scene} must be an approved archival repository`
      );
    }
  }
});

test('isApprovedArchivalSource strictly rejects unauthorized sources to prevent non-compliant media on Screen 1', () => {
  assert.equal(isApprovedArchivalSource(null), false);
  assert.equal(isApprovedArchivalSource(undefined), false);
  assert.equal(
    isApprovedArchivalSource({
      archiveName: 'Random Unverified Blog',
      collectionRecord: 'Unknown Video',
      assetType: 'video',
      license: 'All rights reserved',
      institution: 'Personal Host',
    }),
    false
  );
  assert.equal(
    isApprovedArchivalSource({
      archiveName: 'World Digital Library - Library of Congress',
      collectionRecord: 'Historical Manuscript',
      assetType: 'manuscript',
      license: 'Public Domain',
      institution: 'Library of Congress',
    }),
    true
  );
});

test('Argentina scene 1 does NOT show Machu Picchu and shows Los Glaciares / Fitz Roy', () => {
  const argScene1 = getSceneMedia('Argentina', 1);
  assert.ok(!argScene1.fallbackPoster.includes('photo-1526392060635-9d6019884377'), 'Should not be Machu Picchu');
  assert.ok(argScene1.archivalSource.collectionRecord.includes('Los Glaciares') || argScene1.archivalSource.collectionRecord.includes('145'));
});

test('Argentina scene 3 shows Hispanic Reading Room / LOC manuscripts instead of laptop stock photo', () => {
  const argScene3 = getSceneMedia('Argentina', 3);
  assert.ok(!argScene3.fallbackPoster.includes('photo-1517245386807-bb43f82c33c4'), 'Should not be laptop stock photo');
  assert.ok(argScene3.archivalSource.archiveName.includes('Library of Congress'));
});
