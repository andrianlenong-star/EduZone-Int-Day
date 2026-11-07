import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  containsVisualHallucination,
  performDualVerificationLoop,
  GEO_CULTURAL_REGISTRY,
} from './geoCulturalValidator';

test('AI QA Anti-Mismatch: Detects and rejects Bali temple on Argentina', () => {
  const baliTempleUrl = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80';
  
  // Cross-check on Argentina
  const hasHallucination = containsVisualHallucination('Argentina', baliTempleUrl, 'Pura Ulun Danu');
  assert.equal(hasHallucination, true, 'Bali temple must be flagged as a visual hallucination for Argentina');

  // Check keyword detection
  const hasKeywordHallucination = containsVisualHallucination('Argentina', 'https://example.com/test.jpg', 'Pagoda in Bali');
  assert.equal(hasKeywordHallucination, true, 'Asian temple keywords must be flagged for South America');
});

test('Dual-Verification Loop: Subtitle "In Mendoza, Mount Aconcagua towers at 6,961 meters." binds to real Mount Aconcagua', () => {
  const subtitle = 'In Mendoza, Mount Aconcagua towers at 6,961 meters, standing as the highest summit in the Americas.';
  const candidateUrl = 'https://example.com/generic-argentina.jpg';
  
  const result = performDualVerificationLoop(
    'Argentina',
    1,
    subtitle,
    candidateUrl,
    'Lanskap Argentina',
    'Argentina Landscape'
  );

  assert.equal(result.isCertified, true);
  assert.equal(result.detectedPlaceEntity, 'Mount Aconcagua');
  assert.equal(result.status, 'exact_entity_match');
  assert.ok(
    result.activeVisualUrl.toLowerCase().includes('aconcagua'),
    'Active visual must be bound to authentic Mount Aconcagua'
  );
  assert.ok(!result.activeVisualUrl.includes('1544644181-1484b3fdfc62'), 'Must never be Bali temple');
});

test('Dual-Verification Loop: If input is Bali temple for Argentina, automatically intercept and replace with Mount Aconcagua', () => {
  const subtitle = 'In Mendoza, Mount Aconcagua towers at 6,961 meters.';
  const wrongBaliUrl = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80';
  
  const result = performDualVerificationLoop(
    'Argentina',
    1,
    subtitle,
    wrongBaliUrl,
    'Pura Ulun Danu Bali',
    'Ulun Danu Bali Temple'
  );

  assert.equal(result.isCertified, true);
  assert.notEqual(result.activeVisualUrl, wrongBaliUrl, 'Wrong Bali URL must be replaced');
  assert.ok(
    result.activeVisualUrl.toLowerCase().includes('aconcagua'),
    'Must be replaced with authentic Mount Aconcagua'
  );
});
