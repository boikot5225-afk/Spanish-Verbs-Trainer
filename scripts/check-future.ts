/** Точная сверка futur/conditionnel с эталонными формами. */
import { readFileSync } from 'node:fs';
import { VERBS } from '../data/verbs';
import { PERSONS, type Tense } from '../data/types';

const truth = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as Record<string, string>;
let compared = 0;
const wrong: string[] = [];

for (const verb of VERBS) {
  for (const tense of ['futurSimple', 'conditionnel'] as Tense[]) {
    verb.conjugations[tense].forEach((form, index) => {
      const expected = truth[`${verb.infinitive}|${tense}|${PERSONS[index]}`];
      if (!expected) return;
      compared += 1;
      if (expected !== form.form) {
        wrong.push(
          `${verb.infinitive.padEnd(14)} ${`${tense}/${PERSONS[index]}`.padEnd(22)} ждали «${expected}», получили «${form.form}»`,
        );
      }
    });
  }
}
console.log(`сверено форм: ${compared}`);
console.log(`расхождений : ${wrong.length}`);
for (const line of wrong) console.log('  ' + line);
