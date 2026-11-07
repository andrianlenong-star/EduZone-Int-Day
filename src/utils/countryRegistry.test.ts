import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTRY_NAME_MAPPING,
  WORLD_FACTUAL_REGISTRY,
} from '../data/countryRegistry';
import { getOrCreateCountryProfile } from '../services/encyclopediaService';

test('COUNTRY_NAME_MAPPING maps Argentina and Kolombia correctly', () => {
  assert.ok(COUNTRY_NAME_MAPPING['argentina'], 'argentina mapping must exist');
  assert.equal(COUNTRY_NAME_MAPPING['argentina'].id, 'Argentina');
  assert.equal(COUNTRY_NAME_MAPPING['argentina'].en, 'Argentina');
  assert.equal(COUNTRY_NAME_MAPPING['argentina'].wikiEn, 'Argentina');

  assert.ok(COUNTRY_NAME_MAPPING['kolombia'], 'kolombia mapping must exist');
  assert.equal(COUNTRY_NAME_MAPPING['kolombia'].id, 'Kolombia');
  assert.equal(COUNTRY_NAME_MAPPING['kolombia'].en, 'Colombia');
  assert.equal(COUNTRY_NAME_MAPPING['kolombia'].wikiEn, 'Colombia');

  assert.ok(COUNTRY_NAME_MAPPING['colombia'], 'colombia mapping must exist');
  assert.equal(COUNTRY_NAME_MAPPING['colombia'].id, 'Kolombia');
  assert.equal(COUNTRY_NAME_MAPPING['colombia'].en, 'Colombia');
});

test('WORLD_FACTUAL_REGISTRY contains verified 6-scene factual data for Argentina and Kolombia', () => {
  const arg = WORLD_FACTUAL_REGISTRY['Argentina'];
  assert.ok(arg, 'Argentina entry must exist');
  assert.equal(arg.flag, '🇦🇷');
  assert.equal(arg.capitalId, 'Buenos Aires');
  assert.equal(arg.capitalEn, 'Buenos Aires');
  assert.ok(arg.highestPointEn.includes('6,961'), 'Aconcagua elevation must be 6,961m');
  assert.ok(arg.instrumentsEn.includes('Bandoneón'), 'Argentina must feature Bandoneón');

  const col = WORLD_FACTUAL_REGISTRY['Kolombia'];
  assert.ok(col, 'Kolombia entry must exist');
  assert.equal(col.flag, '🇨🇴');
  assert.equal(col.capitalId, 'Bogotá');
  assert.equal(col.capitalEn, 'Bogotá');
  assert.ok(col.highestPointEn.includes('5,775'), 'Pico Cristóbal Colón must be 5,775m');
  assert.ok(col.instrumentsEn.includes('Accordion') || col.instrumentsEn.includes('Akordeon'), 'Colombia must feature Accordion');
});

test('getOrCreateCountryProfile builds 6 complete documentary scenes for Argentina and Colombia', () => {
  const profileArg = getOrCreateCountryProfile('Argentina');
  assert.equal(profileArg.name, 'Argentina');
  assert.equal(profileArg.scenes.length, 6, 'Argentina must have 6 scenes');
  assert.ok(profileArg.scenes[0].metricsEn?.ketinggian?.includes('6,961'), 'Scene 1 must have Aconcagua metric');

  const profileCol = getOrCreateCountryProfile('Kolombia');
  assert.equal(profileCol.name, 'Kolombia');
  assert.equal(profileCol.scenes.length, 6, 'Kolombia must have 6 scenes');
  assert.ok(profileCol.scenes[0].metricsEn?.panjang?.includes('3,208'), 'Scene 1 must have 3,208km coastline');
});

test('WORLD_FACTUAL_REGISTRY contains all 20 requested countries with 6 verified parameter groups', () => {
  const targetCountries = [
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
  ];

  for (const c of targetCountries) {
    const entry = WORLD_FACTUAL_REGISTRY[c];
    assert.ok(entry, `Country ${c} must exist in WORLD_FACTUAL_REGISTRY`);
    assert.ok(entry.flag, `${c} must have flag`);
    assert.ok(entry.areaEn, `${c} must have areaEn`);
    assert.ok(entry.coastlineEn, `${c} must have coastlineEn`);
    assert.ok(entry.highestPointEn, `${c} must have highestPointEn`);
    assert.ok(entry.heritageSiteEn, `${c} must have heritageSiteEn`);
    assert.ok(entry.monumentDimensionsEn, `${c} must have monumentDimensionsEn`);
    assert.ok(entry.officialLanguageEn, `${c} must have officialLanguageEn`);
    assert.ok(entry.traditionalAttireEn, `${c} must have traditionalAttireEn`);
    assert.ok(entry.instrumentsEn, `${c} must have instrumentsEn`);
    assert.ok(entry.iconicDishEn, `${c} must have iconicDishEn`);

    // Verify profile generation
    const profile = getOrCreateCountryProfile(c);
    assert.equal(profile.scenes.length, 6, `${c} must generate exactly 6 scenes`);
  }
});
