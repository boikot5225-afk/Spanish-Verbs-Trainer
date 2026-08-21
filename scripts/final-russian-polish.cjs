const fs = require('node:fs');

const path = 'data/lessons.ts';
let source = fs.readFileSync(path, 'utf8');

function editLessonSummary(id, summary) {
  const marker = `  {\n    id: '${id}',`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Final Russian polish: lesson ${id} not found`);
  const next = source.indexOf("\n  {\n    id: '", start + marker.length);
  const endOfArray = source.indexOf('\n];', start + marker.length);
  const end = next >= 0 && (endOfArray < 0 || next < endOfArray) ? next : endOfArray;
  if (end < 0) throw new Error(`Final Russian polish: end of lesson ${id} not found`);

  let chunk = source.slice(start, end);
  const replaced = chunk.replace(/^    summary: .*,$/mu, `    summary: ${JSON.stringify(summary)},`);
  if (replaced === chunk) throw new Error(`Final Russian polish: summary ${id} not found`);
  source = source.slice(0, start) + replaced + source.slice(end);
}

editLessonSummary(
  'present-g1-alternance',
  'Как меняется основа у acheter, appeler, espérer и похожих глаголов',
);

fs.writeFileSync(path, source, 'utf8');
console.log('Finished Russian lesson subtitles.');
