const fs = require('node:fs');

const path = 'app/lesson/[id].tsx';
let source = fs.readFileSync(path, 'utf8');

const examWhy = /            <Text style=\{\[styles\.examWhy, \{ color: colors\.mutedForeground \}\]\}>\n[\s\S]*?            <\/Text>/u;

if (!examWhy.test(source)) {
  throw new Error('Grammar tab adaptation: exam explanation block not found');
}

source = source.replace(
  examWhy,
  [
    '            <Text style={[styles.examWhy, { color: colors.mutedForeground }]}>',
    '              {grammarLesson',
    "                ? 'Зачёт отмечает эту грамматическую тему как пройденную. Остальные темы раздела доступны независимо — здесь нет линейной разблокировки.'",
    "                : 'После успешного зачёта откроется следующая тема глагольного курса. Новых форм здесь нет: сначала изучите таблицы и потренируйтесь выше.'}",
    '            </Text>',
  ].join('\n'),
);

fs.writeFileSync(path, source, 'utf8');
console.log('Adapted grammar lesson copy for standalone grammar tab.');
