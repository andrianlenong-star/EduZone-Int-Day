import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDeviceType,
  generatePortableSyncPackage,
  testCloudConnection,
  generatePairingUrl,
} from './crossDeviceSync.js';

test('detectDeviceType returns valid fallback in Node environment', () => {
  const device = detectDeviceType();
  assert.equal(typeof device, 'string');
  assert.ok(device.length > 0);
});

test('testCloudConnection detects account password vs JWT Anon Key correctly', async () => {
  // Pass a short password-like string
  const diag = await testCloudConnection('https://ulbxfeurudjbkejkedms.supabase.co', 'mySecretPass123');
  assert.equal(diag.ok, false);
  assert.equal(diag.isPasswordNotKey, true);
  assert.equal(diag.keyValid, false);
  assert.ok(diag.messageId.includes('Password Akun'));
});

test('testCloudConnection handles empty parameters safely', async () => {
  const diag = await testCloudConnection('', '');
  assert.equal(diag.ok, false);
  assert.equal(diag.urlValid, false);
  assert.equal(diag.keyValid, false);
});

test('generatePortableSyncPackage produces valid JSON with metadata', () => {
  const sampleVideos = {
    1: {
      videoUrl: 'https://example.com/scene1.mp4',
      fileName: 'Materi_1.mp4',
      fileSize: '15.2 MB',
    },
    2: {
      videoUrl: 'https://example.com/scene2.mp4',
      fileName: 'Materi_2.mp4',
      fileSize: '22.1 MB',
    },
  };

  const jsonStr = generatePortableSyncPackage('Peru', sampleVideos);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.format, 'EduZone-CrossDevice-Sync-Package');
  assert.equal(parsed.country, 'Peru');
  assert.equal(parsed.scenes[1].fileName, 'Materi_1.mp4');
  assert.equal(parsed.scenes[2].fileSize, '22.1 MB');
});

test('sanitizeSupabaseUrl strips /rest/v1 and fixes malformed URLs preventing PGRST125', async () => {
  const { sanitizeSupabaseUrl } = await import('./crossDeviceSync.js');

  // Case 1: Copied from Data API with /rest/v1
  assert.equal(
    sanitizeSupabaseUrl('https://ulbxfeurudjbkejkedms.supabase.co/rest/v1'),
    'https://ulbxfeurudjbkejkedms.supabase.co'
  );

  // Case 2: Trailing slashes and whitespace
  assert.equal(
    sanitizeSupabaseUrl('   https://ulbxfeurudjbkejkedms.supabase.co/rest/v1/   '),
    'https://ulbxfeurudjbkejkedms.supabase.co'
  );

  // Case 3: Storage suffix
  assert.equal(
    sanitizeSupabaseUrl('https://ulbxfeurudjbkejkedms.supabase.co/storage/v1'),
    'https://ulbxfeurudjbkejkedms.supabase.co'
  );

  // Case 4: Project reference ID only
  assert.equal(
    sanitizeSupabaseUrl('ulbxfeurudjbkejkedms'),
    'https://ulbxfeurudjbkejkedms.supabase.co'
  );

  // Case 5: Empty input
  assert.equal(sanitizeSupabaseUrl(''), '');
});

test('buildSafeStorageFilePath generates clean, valid path without double slashes', async () => {
  const { buildSafeStorageFilePath } = await import('./crossDeviceSync.js');

  const path1 = buildSafeStorageFilePath('Peru', 1, '1000643602.mp4');
  assert.equal(path1, 'videos/scenes/peru/scene-1-1000643602.mp4');

  // Case with special characters and spaces
  const path2 = buildSafeStorageFilePath('United States', 2, 'Peru Culture (online-video-cutter.com) (1).mp4');
  assert.ok(path2.startsWith('videos/scenes/united_states/scene-2-'));
  assert.ok(path2.endsWith('.mp4'));
  assert.ok(!path2.includes(' '));
  assert.ok(!path2.includes('('));
  assert.ok(!path2.includes(')'));
  assert.ok(!path2.includes('//'));
});

