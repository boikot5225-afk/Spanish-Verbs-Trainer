export type NumberRangeId =
  | 'starter'
  | 'regular'
  | 'seventy'
  | 'hundreds'
  | 'thousands'
  | 'large'
  | 'all';

export type NumberRange = {
  id: NumberRangeId;
  label: string;
  min: number;
  max: number;
};

export const NUMBER_RANGES: NumberRange[] = [
  { id: 'starter', label: '0–20', min: 0, max: 20 },
  { id: 'regular', label: '21–69', min: 21, max: 69 },
  { id: 'seventy', label: '70–99', min: 70, max: 99 },
  { id: 'hundreds', label: '100–999', min: 100, max: 999 },
  { id: 'thousands', label: '1 000–9 999', min: 1_000, max: 9_999 },
  { id: 'large', label: '10 000–999 999', min: 10_000, max: 999_999 },
  { id: 'all', label: 'Все', min: 0, max: 999_999 },
];

const SMALL = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
] as const;

const TENS: Record<number, string> = {
  20: 'vingt',
  30: 'trente',
  40: 'quarante',
  50: 'cinquante',
  60: 'soixante',
};

function belowHundred(value: number): string {
  if (value <= 16) return SMALL[value];
  if (value < 20) return `dix-${SMALL[value - 10]}`;

  if (value < 70) {
    const tens = Math.floor(value / 10) * 10;
    const unit = value % 10;
    const tensWord = TENS[tens];

    if (unit === 0) return tensWord;
    if (unit === 1) return `${tensWord} et un`;
    return `${tensWord}-${SMALL[unit]}`;
  }

  if (value < 80) {
    const rest = value - 60;
    if (rest === 11) return 'soixante et onze';
    return `soixante-${belowHundred(rest)}`;
  }

  const rest = value - 80;
  if (rest === 0) return 'quatre-vingts';
  return `quatre-vingt-${belowHundred(rest)}`;
}

function belowThousand(value: number): string {
  if (value < 100) return belowHundred(value);

  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const hundredWord =
    hundreds === 1 ? 'cent' : `${SMALL[hundreds]} cent${rest === 0 ? 's' : ''}`;

  return rest === 0 ? hundredWord : `${hundredWord} ${belowHundred(rest)}`;
}

function beforeMille(value: number): string {
  const rendered = belowThousand(value);
  if (rendered.endsWith('quatre-vingts')) return rendered.slice(0, -1);
  if (rendered.endsWith('cents')) return rendered.slice(0, -1);
  return rendered;
}

export function frenchNumberToWords(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 999_999) {
    throw new RangeError('French number trainer supports integers from 0 to 999999.');
  }

  if (value < 1_000) return belowThousand(value);

  const thousands = Math.floor(value / 1_000);
  const rest = value % 1_000;
  const thousandWord = thousands === 1 ? 'mille' : `${beforeMille(thousands)} mille`;

  return rest === 0 ? thousandWord : `${thousandWord} ${belowThousand(rest)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function normalizeFrenchNumberAnswer(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[’']/gu, '')
    .replace(/[\s\u00A0\u202F\-‐‑‒–—]+/gu, '');
}

export function parseNumberDigits(value: string): number | null {
  const compact = value.replace(/[\s\u00A0\u202F]/gu, '');
  if (!/^\d+$/u.test(compact)) return null;

  const parsed = Number(compact);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 999_999) return null;
  return parsed;
}

export function randomNumberForRange(rangeId: NumberRangeId, previous?: number): number {
  const pool = NUMBER_RANGES.filter(range => range.id !== 'all');
  const range =
    rangeId === 'all'
      ? pool[Math.floor(Math.random() * pool.length)]
      : NUMBER_RANGES.find(item => item.id === rangeId) ?? NUMBER_RANGES[0];

  const span = range.max - range.min + 1;
  let next = range.min + Math.floor(Math.random() * span);

  if (span > 1 && next === previous) {
    next = range.min + ((next - range.min + 1) % span);
  }

  return next;
}
