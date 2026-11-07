import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_QUIZ_REGISTRY,
  getAllRegisteredCountries,
  normalizeCountryKey,
  getCountryQuiz,
} from './quizRegistry';

test('quizRegistry includes all 30 expected countries', () => {
  const registered = getAllRegisteredCountries();
  assert.equal(registered.length, 30);

  const expectedCountries = [
    'peru', 'argentina', 'brasil', 'kolombia', 'jepang', 'india', 'cina', 'korea_selatan',
    'malaysia', 'vietnam', 'filipina', 'thailand', 'italia', 'jerman', 'belanda', 'prancis',
    'inggris', 'spanyol', 'rusia', 'portugal', 'amerika_serikat', 'canada', 'texas', 'meksiko',
    'indonesia', 'mesir', 'yunani', 'australia', 'afrika_selatan', 'turki'
  ];

  for (const c of expectedCountries) {
    assert.ok(registered.includes(c), `Country ${c} should be in registry`);
  }
});

test('every country in quizRegistry has valid questions and options structure', () => {
  for (const [countryKey, questions] of Object.entries(DEFAULT_QUIZ_REGISTRY)) {
    assert.ok(Array.isArray(questions), `${countryKey} questions must be an array`);
    assert.ok(questions.length >= 4, `${countryKey} should have at least 4 questions, got ${questions.length}`);

    questions.forEach((q, idx) => {
      assert.ok(typeof q.id === 'string' && q.id.length > 0, `${countryKey} Q${idx} missing valid id`);
      assert.ok(typeof q.sceneContext === 'string', `${countryKey} Q${idx} missing sceneContext`);
      assert.ok(typeof q.questionText === 'string' && q.questionText.length > 5, `${countryKey} Q${idx} missing questionText`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${countryKey} Q${idx} needs at least 2 options`);
      assert.ok(
        q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.options.length,
        `${countryKey} Q${idx} correctAnswerIndex out of bounds`
      );
    });
  }
});

test('normalizeCountryKey correctly normalizes variations and aliases', () => {
  assert.equal(normalizeCountryKey('Peru'), 'peru');
  assert.equal(normalizeCountryKey('COLOMBIA'), 'kolombia');
  assert.equal(normalizeCountryKey('South Korea'), 'korea_selatan');
  assert.equal(normalizeCountryKey('United States'), 'amerika_serikat');
  assert.equal(normalizeCountryKey('Germany'), 'jerman');
  assert.equal(normalizeCountryKey('South Africa'), 'afrika_selatan');
  assert.equal(normalizeCountryKey('UnknownCountry'), 'peru'); // fallback
});

test('getCountryQuiz retrieves structured questions for any country', () => {
  const peruQuiz = getCountryQuiz('peru');
  assert.ok(peruQuiz.length === 6);
  assert.ok(peruQuiz[0].questionText.includes('Machu Picchu'));

  const idnQuiz = getCountryQuiz('Indonesia');
  assert.ok(idnQuiz.length === 6);
  assert.ok(idnQuiz[1].options[1].includes('Borobudur'));
});
