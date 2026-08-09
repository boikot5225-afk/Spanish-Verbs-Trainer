const fs = require('node:fs');

const path = 'data/lessons.ts';
let source = fs.readFileSync(path, 'utf8');

const edits = [
  [
    "summary: 'acheter → j’achète, appeler → j’appelle',",
    "summary: 'Как меняется основа у acheter, appeler, espérer и похожих глаголов',",
  ],
];

for (const [from, to] of edits) {
  if (source.includes(from)) source = source.replace(from, to);
}

fs.writeFileSync(path, source, 'utf8');
console.log('Finished Russian lesson subtitles.');
