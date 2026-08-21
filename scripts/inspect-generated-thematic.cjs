const fs = require('node:fs');

function around(source, needle, before = 900, after = 2600) {
  const at = source.indexOf(needle);
  if (at < 0) return `NOT FOUND: ${needle}`;
  return source.slice(Math.max(0, at - before), Math.min(source.length, at + needle.length + after));
}

const thematic = fs.readFileSync('data/thematic-quiz.ts', 'utf8');
const context = fs.readFileSync('context/QuizContext.tsx', 'utf8');

console.log('\n===== THEMATIC QUIZ: buildThematicQuestions =====');
console.log(around(thematic, 'export function buildThematicQuestions', 1200, 5000));
console.log('\n===== THEMATIC QUIZ: constr-en-train =====');
console.log(around(thematic, "'constr-en-train'", 1800, 5200));
console.log('\n===== QUIZ CONTEXT: thematic session branch =====');
console.log(around(context, 'buildThematicQuestions', 1800, 5200));
