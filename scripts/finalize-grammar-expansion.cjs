const fs = require('node:fs');

const path = 'app/lesson/[id].tsx';
let source = fs.readFileSync(path, 'utf8');
const sentinel = '// grammarBankSize(lesson.id)} заданий в банке';

if (!source.includes('{grammarBankSize(lesson.id)} заданий в банке · {GRAMMAR_PRACTICE_QUESTIONS} за тренировку')) {
  const toggleToken = 'setAllVerbs(previous => !previous);';
  const toggleAt = source.indexOf(toggleToken);
  if (toggleAt < 0) throw new Error('Grammar finalize: missing setAllVerbs toggle');

  const start = source.lastIndexOf('          <Pressable', toggleAt);
  if (start < 0) throw new Error('Grammar finalize: missing all-verbs Pressable start');

  const hintStart = source.indexOf('          <Text style={[styles.practiceHint', toggleAt);
  if (hintStart < 0) throw new Error('Grammar finalize: missing practiceHint');
  const hintEndStart = source.indexOf('          </Text>', hintStart);
  if (hintEndStart < 0) throw new Error('Grammar finalize: missing practiceHint end');
  const end = hintEndStart + '          </Text>'.length;

  const original = source.slice(start, end);
  const wrapped = [
    '          {!grammarLesson ? (',
    '            <>',
    original,
    '            </>',
    '          ) : (',
    '            <Text style={[styles.practiceHint, { color: colors.mutedForeground }]}>',
    '              {grammarBankSize(lesson.id)} заданий в банке · {GRAMMAR_PRACTICE_QUESTIONS} за тренировку',
    '            </Text>',
    '          )}',
  ].join('\n');
  source = source.slice(0, start) + wrapped + source.slice(end);
}

source = source.replace(`\n${sentinel}\n`, '\n');
fs.writeFileSync(path, source, 'utf8');
console.log('Finalized grammar expansion UI patch.');
