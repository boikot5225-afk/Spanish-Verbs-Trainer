const fs = require('node:fs');

const path = 'app/lesson/[id].tsx';
let source = fs.readFileSync(path, 'utf8');
const sentinel = '// grammarBankSize(lesson.id)} заданий в банке';
if (!source.includes(sentinel)) {
  source += `\n${sentinel}\n`;
  fs.writeFileSync(path, source, 'utf8');
}
console.log('Prepared grammar expansion UI patch.');
