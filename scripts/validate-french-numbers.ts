import assert from 'node:assert/strict';
import {
  frenchNumberToWords,
  normalizeFrenchNumberAnswer,
  parseNumberDigits,
} from '../data/french-numbers';

const cases: Array<[number, string]> = [
  [0, 'zéro'],
  [1, 'un'],
  [17, 'dix-sept'],
  [21, 'vingt et un'],
  [31, 'trente et un'],
  [69, 'soixante-neuf'],
  [70, 'soixante-dix'],
  [71, 'soixante et onze'],
  [72, 'soixante-douze'],
  [80, 'quatre-vingts'],
  [81, 'quatre-vingt-un'],
  [91, 'quatre-vingt-onze'],
  [99, 'quatre-vingt-dix-neuf'],
  [100, 'cent'],
  [101, 'cent un'],
  [200, 'deux cents'],
  [201, 'deux cent un'],
  [280, 'deux cent quatre-vingts'],
  [281, 'deux cent quatre-vingt-un'],
  [999, 'neuf cent quatre-vingt-dix-neuf'],
  [1_000, 'mille'],
  [1_001, 'mille un'],
  [2_000, 'deux mille'],
  [71_000, 'soixante et onze mille'],
  [80_000, 'quatre-vingt mille'],
  [200_000, 'deux cent mille'],
  [999_999, 'neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf'],
];

for (const [value, expected] of cases) {
  assert.equal(frenchNumberToWords(value), expected, `${value} should be ${expected}`);
}

assert.equal(
  normalizeFrenchNumberAnswer('Vingt-et-un'),
  normalizeFrenchNumberAnswer('vingt et un'),
  'hyphens and spaces should be equivalent',
);
assert.equal(
  normalizeFrenchNumberAnswer('ZERO'),
  normalizeFrenchNumberAnswer('zéro'),
  'diacritics should not make an otherwise correct answer fail',
);
assert.equal(parseNumberDigits('12 345'), 12_345);
assert.equal(parseNumberDigits('12\u202F345'), 12_345);
assert.equal(parseNumberDigits('12a345'), null);
assert.equal(parseNumberDigits('1000000'), null);

assert.throws(() => frenchNumberToWords(-1), RangeError);
assert.throws(() => frenchNumberToWords(1_000_000), RangeError);

console.log(`French number validation OK: ${cases.length} cardinal cases.`);
