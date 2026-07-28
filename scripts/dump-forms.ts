/**
 * Прогоняет произвольный файл метаданных через генератор и печатает все формы.
 * Нужен для сопоставления с внешним корпусом словоформ.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { conjugateMetadata, type VerbMetadata } from '../data/conjugator';
import { PERSONS, TENSES } from '../data/types';

const metadata = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as VerbMetadata[];
const out: Record<string, string> = {};

for (const meta of metadata) {
  let verb;
  try {
    verb = conjugateMetadata(meta);
  } catch {
    continue;
  }
  for (const tense of TENSES) {
    verb.conjugations[tense].forEach((form, index) => {
      if (form.absent) return;
      out[`${meta.infinitive}|${tense}|${PERSONS[index]}`] = form.form;
    });
  }
}

writeFileSync(process.argv[3]!, JSON.stringify(out));
console.log('глаголов:', metadata.length, ' форм:', Object.keys(out).length);
