/**
 * Точная сверка с эталонными формами, снятыми с референсного приложения.
 * Ключ фикстуры — «инфинитив|время|лицо», значение — ожидаемая форма.
 */
import { readFileSync } from 'node:fs';
import { VERBS } from '../data/verbs';
import { PERSONS, type Tense } from '../data/types';

const truth = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as Record<string, string>;
const byTense = new Map<string, { ok: number; bad: string[] }>();
let compared = 0;

for (const verb of VERBS) {
  for (const tense of Object.keys(verb.conjugations) as Tense[]) {
    verb.conjugations[tense].forEach((form, index) => {
      const expected = truth[`${verb.infinitive}|${tense}|${PERSONS[index]}`];
      if (expected === undefined) return;
      compared += 1;
      const cell = byTense.get(tense) ?? { ok: 0, bad: [] };
      if (form.absent) {
        cell.bad.push(`${verb.infinitive}/${PERSONS[index]}: ждали «${expected}», форма отсутствует`);
      } else if (form.form === expected) {
        cell.ok += 1;
      } else {
        cell.bad.push(`${verb.infinitive}/${PERSONS[index]}: ждали «${expected}», получили «${form.form}»`);
      }
      byTense.set(tense, cell);
    });
  }
}

const rows = [...byTense.entries()].sort((a, b) => b[1].bad.length - a[1].bad.length);
let bad = 0;
console.log(`сверено форм: ${compared}`);
for (const [tense, cell] of rows) {
  bad += cell.bad.length;
  const total = cell.ok + cell.bad.length;
  console.log(`  ${tense.padEnd(16)} ${cell.ok}/${total}  расхождений: ${cell.bad.length}`);
}
console.log(`\nвсего расхождений: ${bad}`);
const limit = Number(process.argv[3] ?? 40);
for (const [tense, cell] of rows) {
  for (const line of cell.bad.slice(0, limit)) console.log(`  ${tense} ${line}`);
}
