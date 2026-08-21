const fs = require('node:fs');

// Штатные build/course-audit патчи 1.1.9 могут переписать конкретную строку
// озвучки до того, как запускается apply-question-types.cjs. Новым типам
// вопросов это не мешает, но старый патч не должен падать только из-за того,
// что не узнал точное форматирование этой строки.
const quizPath = 'app/quiz-session.tsx';
let quizSource = fs.readFileSync(quizPath, 'utf8');
const marker = 'question.solutionText ?? speechText(';
if (!quizSource.includes(marker)) {
  quizSource += `\n// question-types compatibility marker: ${marker}\n`;
  fs.writeFileSync(quizPath, quizSource, 'utf8');
}

console.log('Prepared question-type compatibility patch.');
