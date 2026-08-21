const fs = require('node:fs');

const path = 'data/lessons.ts';
let source = fs.readFileSync(path, 'utf8');

const marker = "  {\n    id: 'constr-pronominaux',";
const start = source.indexOf(marker);
if (start < 0) throw new Error('Pronominal prerequisite fix: lesson not found');
const next = source.indexOf("\n  {\n    id: '", start + marker.length);
const endOfArray = source.indexOf('\n];', start + marker.length);
const end = next >= 0 && (endOfArray < 0 || next < endOfArray) ? next : endOfArray;
if (end < 0) throw new Error('Pronominal prerequisite fix: lesson end not found');

let chunk = source.slice(start, end);
const practiceAt = chunk.indexOf('    practice: {');
if (practiceAt < 0) throw new Error('Pronominal prerequisite fix: practice block not found');

const beforePractice = chunk.slice(0, practiceAt);
let practice = chunk.slice(practiceAt);
practice = practice.replace(/tenses:\s*\[[^\]]*\],/u, "tenses: ['present'],");

// Этот ранний урок объясняет только местоименную модель в présent.
// Passé composé и impératif разбираются позже в собственных уроках.
const cleaned = beforePractice
  .replace(/\n      \{\n        heading: 'В составных временах — être',[\s\S]*?\n      \},/u, '')
  .replace(/\n      \{\n        heading: 'В императиве местоимение уходит вправо',[\s\S]*?\n      \},/u, '');

chunk = cleaned + practice;
if (!/practice:\s*\{[\s\S]*?tenses:\s*\['present'\]/u.test(chunk)) {
  throw new Error('Pronominal prerequisite fix: failed to force present-only practice');
}

source = source.slice(0, start) + chunk + source.slice(end);
fs.writeFileSync(path, source, 'utf8');

// apply-build-fixes генерирует этот валидатор из старого шаблона, где урок
// ещё содержал passé composé и impératif. После редакторского удаления этих
// разделов эталон тоже должен ожидать только présent.
const validatorPath = 'scripts/validate-lesson-alignment.ts';
if (fs.existsSync(validatorPath)) {
  let validator = fs.readFileSync(validatorPath, 'utf8');
  const stale = "['present', 'passeCompose', 'imperatifPresent']";
  if (validator.includes('pronominal lesson must train every form explained in the lesson')) {
    if (!validator.includes(stale)) {
      throw new Error('Pronominal prerequisite fix: stale validator tense list not found');
    }
    validator = validator.replace(stale, "['present']");
    fs.writeFileSync(validatorPath, validator, 'utf8');
  }
}

console.log('Kept pronominal lesson present-only until passé composé and impératif are taught.');
