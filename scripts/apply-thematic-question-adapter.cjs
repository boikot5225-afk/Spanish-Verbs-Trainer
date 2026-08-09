const fs = require('node:fs');

const path = 'context/QuizContext.tsx';
let source = fs.readFileSync(path, 'utf8');

if (!source.includes("from '../data/thematic-exercise-adapter'")) {
  const anchor = "import { buildThematicQuestions } from '../data/thematic-quiz';";
  if (!source.includes(anchor)) {
    throw new Error('Thematic adapter patch: buildThematicQuestions import not found');
  }
  source = source.replace(
    anchor,
    `${anchor}\nimport { adaptThematicExerciseQuestions } from '../data/thematic-exercise-adapter';`,
  );
}

source = source.replace(
  'buildThematicExerciseQuestions(thematic, cfg.mode, thematicLessonId)',
  'adaptThematicExerciseQuestions(thematic, cfg.mode, thematicLessonId)',
);

fs.writeFileSync(path, source, 'utf8');
console.log('Applied thematic question adapter.');
