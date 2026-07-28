/**
 * Сверяет формы генератора с корпусом словоформ, снятым с эталонного приложения.
 * Корпус собран из примеров-предложений, поэтому покрыт неравномерно: считаем
 * долю попаданий по каждой паре «время × лицо» и смотрим только на те ячейки,
 * где корпус густой — там промах означает ошибку генератора.
 */
import { readFileSync } from 'node:fs';
import { VERBS } from '../data/verbs';
import { PERSONS, type Tense } from '../data/types';

const corpus = new Set<string>(JSON.parse(readFileSync(process.argv[2]!, 'utf8')));
const CHECKED: Tense[] = [
  'present',
  'imparfait',
  'passeSimple',
  'futurSimple',
  'conditionnel',
  'subjPresent',
];

const cells = new Map<string, { hit: number; total: number; misses: string[] }>();

for (const verb of VERBS) {
  for (const tense of CHECKED) {
    verb.conjugations[tense].forEach((form, index) => {
      if (form.absent) return;
      const key = `${tense}/${PERSONS[index]}`;
      const cell = cells.get(key) ?? { hit: 0, total: 0, misses: [] };
      cell.total += 1;
      if (corpus.has(form.form)) cell.hit += 1;
      else cell.misses.push(`${verb.infinitive} → ${form.form}`);
      cells.set(key, cell);
    });
  }
}

const rows = [...cells.entries()].map(([key, cell]) => ({
  key,
  rate: cell.hit / cell.total,
  ...cell,
}));
rows.sort((a, b) => b.rate - a.rate);

console.log('покрытие корпуса по ячейкам:');
for (const row of rows) {
  console.log(`  ${row.key.padEnd(26)} ${(row.rate * 100).toFixed(0).padStart(3)}%  (${row.hit}/${row.total})`);
}

const dense = rows.filter(row => row.rate >= 0.8);
console.log(`\nплотные ячейки: ${dense.length}/${rows.length} — расхождения в них:`);
const seen = new Set<string>();
for (const row of dense) {
  for (const miss of row.misses) {
    if (seen.has(miss)) continue;
    seen.add(miss);
    console.log(`  ${row.key.padEnd(26)} ${miss}`);
  }
}
console.log(`всего расхождений в плотных ячейках: ${seen.size}`);
