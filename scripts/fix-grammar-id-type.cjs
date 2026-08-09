const fs = require('node:fs');
const path = 'data/grammar-drills.ts';
let source = fs.readFileSync(path, 'utf8');
source = source.replace(
  'export type GrammarLessonId = (typeof GRAMMAR_LESSON_IDS)[number];',
  'export type GrammarLessonId = string;',
);
fs.writeFileSync(path, source, 'utf8');
console.log('Aligned grammar lesson id type with generic Lesson.id.');
