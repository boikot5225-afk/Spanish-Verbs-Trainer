const fs = require('node:fs');

function dumpMatches(path, patterns, radius = 5) {
  const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/u);
  const wanted = new Set();
  lines.forEach((line, index) => {
    if (patterns.some(pattern => line.includes(pattern))) {
      for (let i = Math.max(0, index - radius); i <= Math.min(lines.length - 1, index + radius); i += 1) {
        wanted.add(i);
      }
    }
  });
  console.log(`\n===== ${path} =====`);
  let last = -2;
  [...wanted].sort((a, b) => a - b).forEach(index => {
    if (index > last + 1) console.log('---');
    console.log(`${String(index + 1).padStart(4, '0')}: ${lines[index]}`);
    last = index;
  });
}

dumpMatches('context/QuizContext.tsx', [
  'buildQuestions',
  'lessonId',
  'constr-',
  'construction',
  'transform',
  'decorate',
  'correctAnswer',
  'buildExerciseQuestion',
], 4);

dumpMatches('data/types.ts', [
  'export type QuizMode',
  'export interface QuizQuestion',
  'construction',
  'context',
], 3);

throw new Error('INTENTIONAL_AUDIT_STOP');
