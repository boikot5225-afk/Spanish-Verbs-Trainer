const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

edit('app/lesson/[id].tsx', source => {
  if (!source.includes("from '../../data/grammar-drills'")) {
    const re = /import \{[^\n]*\} from '\.\.\/\.\.\/data\/verbs';/u;
    const match = source.match(re);
    if (!match) throw new Error('Grammar compile fix: missing verbs import');
    source = source.replace(
      re,
      [
        match[0],
        "import {",
        "  GRAMMAR_EXAM_QUESTIONS,",
        "  GRAMMAR_PRACTICE_QUESTIONS,",
        "  grammarBankSize,",
        "  grammarExamQuestions,",
        "  grammarQuestions,",
        "  isGrammarLessonId,",
        "} from '../../data/grammar-drills';",
      ].join('\n'),
    );
  }
  return source;
});

edit('app/quiz-session.tsx', source => {
  if (!source.includes('  explanationText:')) {
    const at = source.indexOf('  correctAnswer:');
    if (at < 0) throw new Error('Grammar compile fix: missing correctAnswer style');
    const style = "  explanationText: { fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 4 },\n";
    source = source.slice(0, at) + style + source.slice(at);
  }
  return source;
});

console.log('Fixed grammar expansion compile integration.');
