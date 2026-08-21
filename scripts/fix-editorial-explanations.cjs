const fs = require('node:fs');

const path = 'data/grammar-drills.ts';
let source = fs.readFileSync(path, 'utf8');

const from = `  if (lessonId === 'syntax-pronoms-y-en') {
    return raw.explanation
      .replace('verbe', 'глагол')
      .replace('les puis lui', 'сначала les, затем lui')
      .replace('COI', 'косвенное дополнение (COI)')
      .replace('COD', 'прямое дополнение (COD)');
  }`;

const to = `  if (lessonId === 'syntax-pronoms-y-en') {
    if (answer === 'y') {
      return 'Местоимение y заменяет дополнение с à, когда речь идёт о месте, предмете или идее.';
    }
    if (answer === 'en') {
      return 'Местоимение en обычно заменяет дополнение с de; при количестве само число остаётся в предложении.';
    }
    if (/^(?:Donne|Parle|Prends|Vas)-/u.test(answer)) {
      return 'В утвердительном impératif местоимения ставятся после глагола и присоединяются к нему через дефис.';
    }
    if (/^(?:Ne|N’|N')/u.test(answer)) {
      return 'В отрицательной конструкции местоимения стоят перед спрягаемым глаголом; отрицание охватывает весь этот блок.';
    }
    if (/\\b(?:lui|leur)\\b/u.test(answer)) {
      return 'Когда заменяются два дополнения, порядок местоимений фиксирован: le/la/les ставятся перед lui/leur, а en — после lui/leur.';
    }
    return \`Местоимение выбирается по управлению глагола и ставится в фиксированное место. Правильный вариант: «\${answer}».\`;
  }`;

if (!source.includes(to)) {
  if (!source.includes(from)) throw new Error('Editorial explanations: y/en helper not found');
  source = source.replace(from, to);
}

fs.writeFileSync(path, source, 'utf8');
console.log('Finished Russian y/en feedback.');
