const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

edit('data/lessons.ts', source => {
  source = source.replace(
    "          'Перед окончанием на -o- и -a- пишется ç. В настоящем времени это задевает ' +\n          'единственную форму — nous, — зато в imparfait и passé simple таких форм больше.',",
    "          'Перед окончанием на -o- пишется ç, чтобы сохранить мягкое произношение c. ' +\n          'В настоящем времени это нужно в форме nous: nous commençons.',",
  );
  return source;
});

console.log('Removed remaining ahead-of-syllabus references.');
