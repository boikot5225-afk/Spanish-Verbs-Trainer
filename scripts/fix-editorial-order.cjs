const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function lessonChunk(source, id) {
  const marker = `  {\n    id: '${id}',`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Final order: lesson ${id} not found`);
  const next = source.indexOf("\n  {\n    id: '", start + marker.length);
  const endOfArray = source.indexOf('\n];', start + marker.length);
  const end = next >= 0 && (endOfArray < 0 || next < endOfArray) ? next : endOfArray;
  if (end < 0) throw new Error(`Final order: end of lesson ${id} not found`);
  return { start, end, text: source.slice(start, end) };
}

edit('data/lessons.ts', source => {
  // Impératif passé должен оставаться в imperative: этот блок знает, что у
  // повелительного наклонения существуют только tu/nous/vous. Но сам блок
  // переносим после составных времён, чтобы passé impératif не появлялся раньше базы.
  {
    const { start, end, text } = lessonChunk(source, 'imperatif-passe');
    const fixed = text.replace("block: 'litteraire'", "block: 'imperatif'");
    source = source.slice(0, start) + fixed + source.slice(end);
  }

  source = source.replace(
    [
      'export const LESSON_BLOCKS: LessonBlock[] = [',
      "  'present',",
      "  'constructions',",
      "  'imperatif',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'syntax',",
      "  'subjonctif',",
      "  'litteraire',",
      '];',
    ].join('\n'),
    [
      'export const LESSON_BLOCKS: LessonBlock[] = [',
      "  'present',",
      "  'constructions',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'imperatif',",
      "  'syntax',",
      "  'subjonctif',",
      "  'litteraire',",
      '];',
    ].join('\n'),
  );

  // Порядок массива нужен для последовательного открытия тем и для тестов.
  source = source.replace(
    [
      "  'constr-pronominaux',",
      '',
      "  'imperatif-present',",
      "  'imperatif-irreguliers',",
      '',
      "  'passe-compose-avoir',",
    ].join('\n'),
    [
      "  'constr-pronominaux',",
      '',
      "  'passe-compose-avoir',",
    ].join('\n'),
  );
  source = source.replace(
    [
      "  'conditionnel-passe',",
      '',
      "  'syntax-prepositions',",
    ].join('\n'),
    [
      "  'conditionnel-passe',",
      '',
      "  'imperatif-present',",
      "  'imperatif-irreguliers',",
      "  'imperatif-passe',",
      '',
      "  'syntax-prepositions',",
    ].join('\n'),
  );
  source = source.replace("  'litt-subjonctif-imparfait',\n  'imperatif-passe',", "  'litt-subjonctif-imparfait',");

  return source;
});

edit('scripts/validate-editorial-content.ts', source => {
  source = source.replace(
    [
      "  'present',",
      "  'constructions',",
      "  'imperatif',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'syntax',",
      "  'subjonctif',",
      "  'litteraire',",
    ].join('\n'),
    [
      "  'present',",
      "  'constructions',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'imperatif',",
      "  'syntax',",
      "  'subjonctif',",
      "  'litteraire',",
    ].join('\n'),
  );

  source = source.replace(
    [
      "  'constr-pronominaux',",
      '',
      "  'imperatif-present',",
      "  'imperatif-irreguliers',",
      '',
      "  'passe-compose-avoir',",
    ].join('\n'),
    [
      "  'constr-pronominaux',",
      '',
      "  'passe-compose-avoir',",
    ].join('\n'),
  );
  source = source.replace(
    [
      "  'conditionnel-passe',",
      '',
      "  'syntax-prepositions',",
    ].join('\n'),
    [
      "  'conditionnel-passe',",
      '',
      "  'imperatif-present',",
      "  'imperatif-irreguliers',",
      "  'imperatif-passe',",
      '',
      "  'syntax-prepositions',",
    ].join('\n'),
  );
  source = source.replace("  'litt-subjonctif-imparfait',\n  'imperatif-passe',", "  'litt-subjonctif-imparfait',");
  source = source.replace(
    "assert.equal(getLessonById('imperatif-passe')?.block, 'litteraire', 'Редкий impératif passé должен быть в продвинутом блоке');",
    "assert.equal(getLessonById('imperatif-passe')?.block, 'imperatif', 'Impératif passé должен использовать механику трёх лиц impératif');",
  );

  return source;
});

console.log('Aligned final lesson order with imperative mechanics.');
