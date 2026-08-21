const fs = require('node:fs');

const path = 'data/grammar-drills.ts';
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
  [
    "  'syntax-pronoms-y-en',",
    "  'syntax-prepositions',",
    "  'syntax-participe-cod',",
    "  'syntax-si',",
    "  'syntax-past-contrast',",
    "  'syntax-time-markers',",
  ].join('\n'),
  [
    "  'syntax-prepositions',",
    "  'syntax-pronoms-y-en',",
    "  'syntax-time-markers',",
    "  'syntax-past-contrast',",
    "  'syntax-si',",
    "  'syntax-participe-cod',",
  ].join('\n'),
);

const replacements = new Map([
  [
    "      q('Утвердительный impératif: Donne ce livre à Marie !', 'Donne-le-lui !', ['Donne-le-lui !', 'Le lui donne !', 'Donne-lui-le !', 'Donne-le à lui !'], 'В утвердительном impératif местоимения уходят после глагола: donne-le-lui.', 'Donne-le-lui !'),",
    "      q('Замените дополнения: Je donne la clé à ma sœur.', 'Je la lui donne.', ['Je la lui donne.', 'Je lui la donne.', 'Je lui en donne.', 'Je la donne lui.'], 'la ставится перед lui: je la lui donne.', 'Je la lui donne.'),",
  ],
  [
    "      q('Утвердительный impératif: Parle de ce problème à Paul !', 'Parle-lui-en !', ['Parle-lui-en !', 'Parle-en-lui !', 'Lui en parle !', 'Parle-le-lui !'], 'После утвердительного impératif: verbe + lui/leur + en.', 'Parle-lui-en !'),",
    "      q('Замените дополнения: Nous parlons de ce problème à nos collègues.', 'Nous leur en parlons.', ['Nous leur en parlons.', 'Nous en leur parlons.', 'Nous les en parlons.', 'Nous leur y parlons.'], 'lui/leur стоит перед en: nous leur en parlons.', 'Nous leur en parlons.'),",
  ],
  [
    "      q('Выберите нормативную форму: «Иди туда!»', 'Vas-y !', ['Vas-y !', 'Va-y !', 'Vas-en !', 'Va lui !'], 'У va перед y/en возвращается -s ради благозвучия: vas-y, vas-en.', 'Vas-y !'),",
    "      q('Замените «à ce message»: Tu réponds à ce message. → Tu ___ réponds.', 'y', ['y', 'en', 'le', 'lui'], 'répondre à quelque chose → y répondre.', 'Tu y réponds.'),",
  ],
  [
    "      q('Замените «du pain»: Prends du pain !', 'Prends-en !', ['Prends-en !', 'Prends-y !', 'En prends !', 'Prend-en !'], 'en заменяет de/du/des; в утвердительном impératif стоит после глагола.', 'Prends-en !'),",
    "      q('Замените «de cette ville»: Elle revient de cette ville. → Elle ___ revient.', 'en', ['en', 'y', 'la', 'lui'], 'revenir de quelque chose → en revenir.', 'Elle en revient.'),",
  ],
  [
    "      q('Выберите форму: «Не ходи туда!»', 'N’y va pas !', ['N’y va pas !', 'Ne va-y pas !', 'N’en va pas !', 'Y ne va pas !'], 'В отрицательном impératif местоимение снова стоит перед глаголом: n’y va pas.', \"N'y va pas !\"),",
    "      q('Замените «à nos vacances»: Nous pensons à nos vacances. → Nous ___ pensons.', 'y', ['y', 'en', 'les', 'leur'], 'penser à quelque chose → y penser.', 'Nous y pensons.'),",
  ],
  [
    "      q('Выберите форму: «Не говори мне об этом!»', 'Ne m’en parle pas !', ['Ne m’en parle pas !', 'Ne parle-m’en pas !', 'Ne me parle-en pas !', 'N’en me parle pas !'], 'В отрицательном impératif: ne + me + en + verbe + pas.', \"Ne m'en parle pas !\"),",
    "      q('Замените количество: J’achète deux baguettes. → J’___ achète deux.', 'en', ['en', 'y', 'les', 'leur'], 'При количестве en заменяет существительное, а число остаётся.', \"J'en achète deux.\"),",
  ],
  [
    "      q('Nous continuons ___ travailler.', 'à', ['à', 'de', '—', 'pour'], 'continuer à est ici la construction ciblée; continuer de existe aussi dans certains usages, donc ce item entraîne la construction la plus courante.', 'Nous continuons à travailler.'),",
    "      q('Nous commençons ___ travailler.', 'à', ['à', 'de', '—', 'pour'], 'commencer à + infinitif.', 'Nous commençons à travailler.'),",
  ],
]);

for (const [from, to] of replacements) {
  if (!source.includes(from)) throw new Error(`Grammar drills simplification: missing source item: ${from.slice(0, 70)}...`);
  source = source.replace(from, to);
}

fs.writeFileSync(path, source, 'utf8');
console.log('Simplified grammar drills and removed premature impératif questions.');
