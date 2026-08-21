import type {
  Auxiliary,
  CompoundTense,
  ConjugationForm,
  Tense,
  Verb,
  VerbGroup,
} from './types';
import {
  COMPOUND_AUX_TENSE,
  COMPOUND_TENSES,
  IMPERATIVE_PERSONS,
  IMPERATIVE_TENSES,
  PERSONS,
} from './types';
import irregularData from './irregulars.json';

export interface VerbMetadata {
  id: string;
  infinitive: string;
  translation: string;
  group: VerbGroup;
  aux: Auxiliary;
  pronominal?: boolean;
  types: string[];
}

/**
 * Набор основ (radicaux), из которых собираются все формы. Любое поле можно
 * не задавать — оно выводится из инфинитива по правилам группы или семейства.
 */
interface Stems {
  /** Основа настоящего: je / tu / il. */
  r1?: string;
  /** Основа настоящего: nous / vous. От неё же образуется imparfait. */
  r2?: string;
  /** Основа настоящего: ils. От неё же обычно образуется subjonctif. */
  r3?: string;
  /** Окончания настоящего в единственном числе — у третьей группы их несколько наборов. */
  presEndings?: [string, string, string];
  /** Основа futur / conditionnel, всегда оканчивается на -r. */
  fut?: string;
  /** Основа passé simple вместе с типом гласной. */
  ps?: string;
  psType?: 'a' | 'i' | 'u' | 'in';
  /** Основа subjonctif: единственное число и ils. */
  sub1?: string;
  /** Основа subjonctif: nous / vous. */
  sub2?: string;
  /** Основа imparfait, если она расходится с r2. */
  imp?: string;
  participePasse?: string;
  participePresent?: string;
  /** Полностью заданные формы настоящего — для être, avoir, aller. */
  presentOverride?: [string, string, string, string, string, string];
  /** Полностью заданные формы subjonctif présent. */
  subjOverride?: [string, string, string, string, string, string];
  /** Императив целиком (tu / nous / vous) — для être, avoir, savoir, vouloir. */
  imperativeOverride?: [string, string, string];
  /** Безличный глагол: есть только форма 3-го лица единственного числа. */
  impersonal?: boolean;
  note?: string;
}

type IrregularMap = Record<string, Stems>;

const IRREGULARS = irregularData as unknown as IrregularMap;

// ── Окончания ────────────────────────────────────────────────────────────────

const PRESENT_G1_SG: [string, string, string] = ['e', 'es', 'e'];
const PRESENT_G2_SG: [string, string, string] = ['is', 'is', 'it'];
const PRESENT_G3_SG: [string, string, string] = ['s', 's', 't'];

const IMPARFAIT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUTUR = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
const CONDITIONNEL = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const SUBJ_PRESENT = ['e', 'es', 'e', 'ions', 'iez', 'ent'];

type PsType = NonNullable<Stems['psType']>;

const PASSE_SIMPLE: Record<PsType, string[]> = {
  a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
  i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
};

const SUBJ_IMPARFAIT: Record<PsType, string[]> = {
  a: ['asse', 'asses', 'ât', 'assions', 'assiez', 'assent'],
  i: ['isse', 'isses', 'ît', 'issions', 'issiez', 'issent'],
  u: ['usse', 'usses', 'ût', 'ussions', 'ussiez', 'ussent'],
  in: ['insse', 'insses', 'înt', 'inssions', 'inssiez', 'inssent'],
};

/** Вспомогательные глаголы в тех временах, что нужны составным. */
const AUX_FORMS: Record<Auxiliary, Partial<Record<Tense, string[]>>> = {
  avoir: {
    present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    passeSimple: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'],
    futurSimple: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
    conditionnel: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
    subjPresent: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
    subjImparfait: ['eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent'],
    imperatifPresent: ['', 'aie', '', 'ayons', 'ayez', ''],
  },
  etre: {
    present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    passeSimple: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'],
    futurSimple: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    conditionnel: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
    subjPresent: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
    subjImparfait: ['fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent'],
    imperatifPresent: ['', 'sois', '', 'soyons', 'soyez', ''],
  },
};

/** Возвратные местоимения по лицам — для местоименных глаголов. */
const REFLEXIVE = ['me', 'te', 'se', 'nous', 'vous', 'se'];
/** В утвердительном императиве местоимение уходит вправо: lave-toi, levons-nous. */
const REFLEXIVE_IMPERATIVE = ['', 'toi', '', 'nous', 'vous', ''];

/** Инфинитив без возвратной частицы: «se laver» → «laver». */
function bareInfinitive(infinitive: string): string {
  return infinitive.replace(/^(se |s')/u, '');
}

/** Добавляет возвратное местоимение с элизией: je me lave, mais je m'appelle. */
function applyPronominal(tense: Tense, forms: string[]): string[] {
  return forms.map((form, index) => {
    if (!form) return form;
    if (IMPERATIVE_TENSES.has(tense)) {
      const suffix = REFLEXIVE_IMPERATIVE[index]!;
      return suffix ? `${form}-${suffix}` : form;
    }
    const pronoun = REFLEXIVE[index]!;
    const elides = pronoun.length === 2 && /^[aeiouyàâéèêëîïôûùüh]/iu.test(form);
    return elides ? `${pronoun[0]}'${form}` : `${pronoun} ${form}`;
  });
}

/** Согласование причастия при être: индекс лица → окончание мужского рода. */
const ETRE_AGREEMENT = ['', '', '', 's', 's', 's'];
/** Женский вариант того же согласования — показывается в таблице как подсказка. */
const ETRE_AGREEMENT_F = ['e', 'e', 'e', 'es', 'es', 'es'];

/**
 * Приклеивает окончание согласования. Причастия, уже оканчивающиеся на -s или
 * -x, во множественном числе мужского рода не меняются: il est assis →
 * ils sont assis, а не «assiss».
 */
function agree(participle: string, suffix: string): string {
  if (suffix === 's' && /[sx]$/u.test(participle)) return participle;
  return participle + suffix;
}

// ── Орфографические чередования первой группы ────────────────────────────────

const MUTE_ENDINGS = new Set(['e', 'es', 'ent', '']);
const VOWELS = 'aeiouyàâéèêëîïôûùü';

function startsWithHardVowel(ending: string): boolean {
  return /^[aoâô]/u.test(ending);
}

/** Гласная последнего слога основы — нужна для чередований e→è и é→è. */
function lastStemVowel(stem: string): { index: number; char: string } | null {
  for (let index = stem.length - 1; index >= 0; index -= 1) {
    const char = stem[index]!;
    if (VOWELS.includes(char)) return { index, char };
  }
  return null;
}

function replaceAt(value: string, index: number, char: string): string {
  return value.slice(0, index) + char + value.slice(index + 1);
}

/**
 * Подгоняет основу первой группы под окончание.
 *
 * Перед -a/-o смягчается c→ç и g→ge (nous plaçons, nous mangeons), перед немым
 * окончанием происходят чередования y→i, l→ll, t→tt и e→è (il nettoie, il appelle,
 * il achète, il mène). Глаголы на -ayer сохраняют y (il paye) — из двух
 * допустимых вариантов взят тот, что используется в эталонном приложении.
 */
function adjustG1Stem(stem: string, ending: string, types: string[]): string {
  if (startsWithHardVowel(ending)) {
    if (types.includes('-cer') && stem.endsWith('c')) return `${stem.slice(0, -1)}ç`;
    if (types.includes('-ger') && stem.endsWith('g')) return `${stem}e`;
    return stem;
  }
  if (!MUTE_ENDINGS.has(ending)) return stem;

  if (types.includes('-yer') && /[ou]y$/u.test(stem)) return `${stem.slice(0, -1)}i`;
  if (types.includes('ll/tt')) {
    if (stem.endsWith('l')) return `${stem}l`;
    if (stem.endsWith('t')) return `${stem}t`;
  }
  if (types.includes('e→è') || types.includes('é→è')) {
    const vowel = lastStemVowel(stem);
    if (vowel && (vowel.char === 'e' || vowel.char === 'é')) {
      return replaceAt(stem, vowel.index, 'è');
    }
  }
  return stem;
}

/**
 * Основа futur/conditionnel для первой группы. Чередования, зависящие от немого
 * -e- следующего слога, доходят и сюда: mènerai, appellerai, achèterai, paierai.
 * Глаголы на é→è по традиционной норме основу не меняют: espérerai.
 */
function futureStemG1(infinitive: string, types: string[]): string {
  const stem = infinitive.slice(0, -2);
  const adjusted = types.includes('é→è') ? stem : adjustG1Stem(stem, 'e', types);
  return `${adjusted}er`;
}

// ── Семейства третьей группы ─────────────────────────────────────────────────

interface Family {
  /** Инфинитив должен оканчиваться на этот суффикс. */
  suffix: string;
  /** Метка семейства — попадает в types и по ней уроки подбирают примеры. */
  type: string;
  /** Строит основы от инфинитива. */
  build: (infinitive: string) => Stems;
}

/** Инфинитив без последних `count` символов. */
function cut(infinitive: string, count: number): string {
  return infinitive.slice(0, -count);
}

const FAMILIES: Family[] = [
  // prendre, comprendre, apprendre — раньше общего -dre
  {
    suffix: 'prendre',
    type: '-prendre',
    build: inf => {
      const base = cut(inf, 5);
      return {
        r1: `${base}end`,
        r2: `${base}en`,
        r3: `${base}enn`,
        presEndings: ['s', 's', ''],
        fut: `${base}endr`,
        ps: base,
        psType: 'i',
        sub1: `${base}enn`,
        sub2: `${base}en`,
        participePasse: `${base}is`,
        participePresent: `${base}enant`,
      };
    },
  },
  // craindre, peindre, joindre
  {
    suffix: 'indre',
    type: '-indre',
    build: inf => {
      const base = cut(inf, 5);
      const soft = `${base}ign`;
      return {
        r1: `${base}in`,
        r2: soft,
        r3: soft,
        presEndings: ['s', 's', 't'],
        fut: cut(inf, 1),
        ps: soft,
        psType: 'i',
        sub1: soft,
        sub2: soft,
        participePasse: `${base}int`,
        participePresent: `${soft}ant`,
      };
    },
  },
  // conduire, produire, cuire
  {
    suffix: 'uire',
    type: '-uire',
    build: inf => {
      const base = cut(inf, 2); // condui-
      return {
        r1: base,
        r2: `${base}s`,
        r3: `${base}s`,
        presEndings: ['s', 's', 't'],
        fut: `${base}r`,
        ps: `${base}s`,
        psType: 'i',
        sub1: `${base}s`,
        sub2: `${base}s`,
        participePasse: `${base}t`,
        participePresent: `${base}sant`,
      };
    },
  },
  // connaître, paraître
  {
    suffix: 'aître',
    type: '-aître',
    build: inf => {
      const base = cut(inf, 5);
      return {
        // 3-е лицо сохраняет циркумфлекс перед -t: il connaît.
        presentOverride: [
          `${base}ais`,
          `${base}ais`,
          `${base}aît`,
          `${base}aissons`,
          `${base}aissez`,
          `${base}aissent`,
        ],
        r1: `${base}ai`,
        r2: `${base}aiss`,
        r3: `${base}aiss`,
        presEndings: ['s', 's', 't'],
        fut: `${base}aîtr`,
        ps: base,
        psType: 'u',
        sub1: `${base}aiss`,
        sub2: `${base}aiss`,
        participePasse: `${base}u`,
        participePresent: `${base}aissant`,
      };
    },
  },
  // mettre, permettre, promettre
  {
    suffix: 'ettre',
    type: '-ettre',
    build: inf => {
      const base = cut(inf, 5);
      return {
        r1: `${base}et`,
        r2: `${base}ett`,
        r3: `${base}ett`,
        presEndings: ['s', 's', ''],
        fut: `${base}ettr`,
        ps: base,
        psType: 'i',
        sub1: `${base}ett`,
        sub2: `${base}ett`,
        participePasse: `${base}is`,
        participePresent: `${base}ettant`,
      };
    },
  },
  // battre, combattre
  {
    suffix: 'attre',
    type: '-attre',
    build: inf => {
      const base = cut(inf, 5);
      return {
        r1: `${base}at`,
        r2: `${base}att`,
        r3: `${base}att`,
        presEndings: ['s', 's', ''],
        fut: `${base}attr`,
        ps: `${base}att`,
        psType: 'i',
        sub1: `${base}att`,
        sub2: `${base}att`,
        participePasse: `${base}attu`,
        participePresent: `${base}attant`,
      };
    },
  },
  // rompre, corrompre — раньше общего -dre не нужно, но раньше -re
  {
    suffix: 'ompre',
    type: '-ompre',
    build: inf => {
      const base = cut(inf, 2);
      return {
        r1: base,
        r2: base,
        r3: base,
        presEndings: ['s', 's', 't'],
        fut: cut(inf, 1),
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        participePasse: `${base}u`,
        participePresent: `${base}ant`,
      };
    },
  },
  // rendre, répondre, perdre, mordre, attendre
  {
    suffix: 'dre',
    type: '-dre',
    build: inf => {
      const base = cut(inf, 2);
      return {
        r1: base,
        r2: base,
        r3: base,
        presEndings: ['s', 's', ''],
        fut: cut(inf, 1),
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        participePasse: `${base}u`,
        participePresent: `${base}ant`,
      };
    },
  },
  // venir, tenir, obtenir, revenir
  {
    suffix: 'enir',
    type: '-enir',
    build: inf => {
      const base = cut(inf, 4);
      return {
        r1: `${base}ien`,
        r2: `${base}en`,
        r3: `${base}ienn`,
        presEndings: ['s', 's', 't'],
        fut: `${base}iendr`,
        ps: base,
        psType: 'in',
        sub1: `${base}ienn`,
        sub2: `${base}en`,
        participePasse: `${base}enu`,
        participePresent: `${base}enant`,
      };
    },
  },
  // acquérir, conquérir
  {
    suffix: 'érir',
    type: '-érir',
    build: inf => {
      const base = cut(inf, 4);
      return {
        r1: `${base}ier`,
        r2: `${base}ér`,
        r3: `${base}ièr`,
        presEndings: ['s', 's', 't'],
        fut: `${base}err`,
        ps: base,
        psType: 'i',
        sub1: `${base}ièr`,
        sub2: `${base}ér`,
        participePasse: `${base}is`,
        participePresent: `${base}érant`,
      };
    },
  },
  // recevoir, décevoir, apercevoir
  {
    suffix: 'evoir',
    type: '-evoir',
    build: inf => {
      const base = cut(inf, 5);
      // Перед o и u основа смягчается: je reçois, reçu, nous reçûmes,
      // но перед e остаётся твёрдой: nous recevons.
      const soft = `${base.slice(0, -1)}ç`;
      return {
        r1: `${soft}oi`,
        r2: `${base}ev`,
        r3: `${soft}oiv`,
        presEndings: ['s', 's', 't'],
        fut: `${base}evr`,
        ps: soft,
        psType: 'u',
        sub1: `${soft}oiv`,
        sub2: `${base}ev`,
        participePasse: `${soft}u`,
        participePresent: `${base}evant`,
      };
    },
  },
  // cueillir, accueillir, recueillir — настоящее как у первой группы,
  // основа будущего на -er: je cueillerai
  {
    suffix: 'cueillir',
    type: '-cueillir',
    build: inf => {
      const base = cut(inf, 2); // cueill-
      return {
        r1: base,
        r2: base,
        r3: base,
        presEndings: ['e', 'es', 'e'],
        fut: `${base}er`,
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        participePasse: `${base}i`,
        participePresent: `${base}ant`,
      };
    },
  },
  // assaillir, tressaillir, défaillir — то же настоящее, но будущее от инфинитива
  {
    suffix: 'saillir',
    type: '-saillir',
    build: inf => {
      const base = cut(inf, 2); // assaill-
      return {
        r1: base,
        r2: base,
        r3: base,
        presEndings: ['e', 'es', 'e'],
        fut: inf,
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        participePasse: `${base}i`,
        participePresent: `${base}ant`,
      };
    },
  },
  // ouvrir, offrir, souffrir, couvrir — спрягаются в настоящем как первая группа
  {
    suffix: 'rir',
    type: '-vrir/-frir',
    build: inf => {
      const base = cut(inf, 2); // ouvr-, offr-
      return {
        r1: base,
        r2: base,
        r3: base,
        presEndings: ['e', 'es', 'e'],
        fut: inf,
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        // Причастие строится от более короткой основы: ouvrir → ouvert.
        participePasse: `${cut(inf, 3)}ert`,
        participePresent: `${base}ant`,
      };
    },
  },
  // partir, sortir, dormir, servir, mentir, sentir — теряют согласную в ед. ч.
  {
    suffix: 'ir',
    type: '-ir sans -iss-',
    build: inf => {
      const base = cut(inf, 2);
      return {
        r1: base.slice(0, -1),
        r2: base,
        r3: base,
        presEndings: ['s', 's', 't'],
        fut: inf,
        ps: base,
        psType: 'i',
        sub1: base,
        sub2: base,
        participePasse: `${base}i`,
        participePresent: `${base}ant`,
      };
    },
  },
];

function familyFor(infinitive: string): Family | null {
  for (const family of FAMILIES) {
    if (infinitive.endsWith(family.suffix)) return family;
  }
  return null;
}

// ── Сборка основ ─────────────────────────────────────────────────────────────

/** Основы по правилам группы — без учёта семейств и таблицы исключений. */
function regularStems(metadata: VerbMetadata): Stems {
  const { infinitive, group, types } = metadata;
  const base = cut(infinitive, 2);
  if (group === '1') {
    return {
      r1: base,
      r2: base,
      r3: base,
      presEndings: PRESENT_G1_SG,
      fut: futureStemG1(infinitive, types),
      ps: base,
      psType: 'a',
      sub1: base,
      sub2: base,
      participePasse: `${base}é`,
      participePresent: `${adjustG1Stem(base, 'ant', types)}ant`,
    };
  }
  if (group === '2') {
    return {
      r1: base,
      r2: `${base}iss`,
      r3: `${base}iss`,
      presEndings: PRESENT_G2_SG,
      fut: infinitive,
      ps: base,
      psType: 'i',
      sub1: `${base}iss`,
      sub2: `${base}iss`,
      participePasse: `${base}i`,
      participePresent: `${base}issant`,
    };
  }
  return {
    r1: base,
    r2: base,
    r3: base,
    presEndings: PRESENT_G3_SG,
    fut: infinitive.endsWith('re') ? cut(infinitive, 1) : infinitive,
    ps: base,
    psType: 'i',
    sub1: base,
    sub2: base,
    participePasse: `${base}u`,
    participePresent: `${base}ant`,
  };
}

function resolveStems(metadata: VerbMetadata): Stems {
  const regular = regularStems(metadata);
  const family = metadata.group === '3' ? familyFor(metadata.infinitive) : null;
  const withFamily = family ? { ...regular, ...family.build(metadata.infinitive) } : regular;
  const override = IRREGULARS[metadata.infinitive];
  return override ? { ...withFamily, ...override } : withFamily;
}

// ── Генерация форм ───────────────────────────────────────────────────────────

const ABSENT: ConjugationForm = { form: '—', irregular: false, absent: true };

/** Приклеивает окончание к основе, применяя чередования первой группы. */
function join(stem: string, ending: string, group: VerbGroup, types: string[]): string {
  const adjusted = group === '1' ? adjustG1Stem(stem, ending, types) : stem;
  return adjusted + ending;
}

interface RawForms {
  conjugations: Record<Tense, string[]>;
  participePresent: string;
  participePasse: string;
}

function buildForms(metadata: VerbMetadata, stems: Stems): RawForms {
  const { group, types } = metadata;
  const sg = stems.presEndings ?? PRESENT_G3_SG;
  const plural = group === '2' ? ['issons', 'issez', 'issent'] : ['ons', 'ez', 'ent'];
  const r1 = stems.r1!;
  const r2 = stems.r2!;
  const r3 = stems.r3!;
  const psType = stems.psType ?? 'i';

  const present = stems.presentOverride
    ? [...stems.presentOverride]
    : [
        join(r1, sg[0], group, types),
        join(r1, sg[1], group, types),
        join(r1, sg[2], group, types),
        group === '2' ? `${cut(metadata.infinitive, 2)}issons` : join(r2, plural[0]!, group, types),
        group === '2' ? `${cut(metadata.infinitive, 2)}issez` : join(r2, plural[1]!, group, types),
        group === '2' ? `${cut(metadata.infinitive, 2)}issent` : join(r3, plural[2]!, group, types),
      ];

  const subjPresent = stems.subjOverride
    ? [...stems.subjOverride]
    : [
        join(stems.sub1!, SUBJ_PRESENT[0]!, group, types),
        join(stems.sub1!, SUBJ_PRESENT[1]!, group, types),
        join(stems.sub1!, SUBJ_PRESENT[2]!, group, types),
        join(stems.sub2!, SUBJ_PRESENT[3]!, group, types),
        join(stems.sub2!, SUBJ_PRESENT[4]!, group, types),
        join(stems.sub1!, SUBJ_PRESENT[5]!, group, types),
      ];

  const simple = (stem: string, endings: string[]) =>
    endings.map(ending => join(stem, ending, group, types));

  const conjugations = {
    present,
    imparfait: simple(stems.imp ?? r2, IMPARFAIT),
    passeSimple: simple(stems.ps!, PASSE_SIMPLE[psType]),
    futurSimple: simple(stems.fut!, FUTUR),
    conditionnel: simple(stems.fut!, CONDITIONNEL),
    subjPresent,
    subjImparfait: simple(stems.ps!, SUBJ_IMPARFAIT[psType]),
    imperatifPresent: imperative(metadata, stems, present),
  } as Record<Tense, string[]>;

  const participle = stems.participePasse!;
  for (const tense of COMPOUND_TENSES) {
    conjugations[tense] = compound(tense as CompoundTense, metadata.aux, participle);
  }

  // Если у глагола нет императива (pouvoir), то нет и составного императива.
  if (conjugations.imperatifPresent!.every(form => form === '')) {
    conjugations.imperatifPasse = PERSONS.map(() => '');
  }

  return {
    conjugations,
    participePresent: stems.participePresent!,
    participePasse: participle,
  };
}

function imperative(metadata: VerbMetadata, stems: Stems, present: string[]): string[] {
  if (stems.imperativeOverride) {
    const [tu, nous, vous] = stems.imperativeOverride;
    return ['', tu, '', nous, vous, ''];
  }
  const raw = present[1]!;
  // Первая группа и глаголы на -vrir/-frir теряют -s: parle, ouvre.
  const dropsS = metadata.group === '1' || stems.presEndings?.[1] === 'es';
  const tu = dropsS && raw.endsWith('s') ? raw.slice(0, -1) : raw;
  return ['', tu, '', present[3]!, present[4]!, ''];
}

function compound(tense: CompoundTense, aux: Auxiliary, participle: string): string[] {
  const auxForms = AUX_FORMS[aux][COMPOUND_AUX_TENSE[tense]]!;
  return PERSONS.map((person, index) => {
    if (tense === 'imperatifPasse' && !IMPERATIVE_PERSONS.has(person)) return '';
    const agreed = aux === 'etre' ? agree(participle, ETRE_AGREEMENT[index]!) : participle;
    return `${auxForms[index]!} ${agreed}`.trim();
  });
}

/** Женский вариант составной формы при être — подсказка для таблицы спряжения. */
export function feminineCompound(
  tense: Tense,
  aux: Auxiliary,
  participle: string,
  personIndex: number,
): string | null {
  if (aux !== 'etre' || !COMPOUND_TENSES.has(tense)) return null;
  const auxForms = AUX_FORMS[aux][COMPOUND_AUX_TENSE[tense as CompoundTense]];
  const auxForm = auxForms?.[personIndex];
  if (!auxForm) return null;
  return `${auxForm} ${agree(participle, ETRE_AGREEMENT_F[personIndex]!)}`.trim();
}

export function conjugateMetadata(metadata: VerbMetadata): Verb {
  // Спрягается всегда «голый» глагол; возвратное местоимение навешивается сверху.
  const base: VerbMetadata = { ...metadata, infinitive: bareInfinitive(metadata.infinitive) };
  const stems = resolveStems(base);
  const built = buildForms(base, stems);
  // Тот же генератор на «правильных» основах даёт эталон для подсветки ★.
  const baseline = buildForms(base, regularStems(base));

  const conjugations = {} as Record<Tense, ConjugationForm[]>;
  for (const tense of Object.keys(built.conjugations) as Tense[]) {
    const actual = metadata.pronominal
      ? applyPronominal(tense, built.conjugations[tense]!)
      : built.conjugations[tense]!;
    const plain = metadata.pronominal
      ? applyPronominal(tense, baseline.conjugations[tense]!)
      : baseline.conjugations[tense]!;
    conjugations[tense] = actual.map((form, index) =>
      form === ''
        ? ABSENT
        : { form, irregular: form !== plain[index] },
    );
  }

  if (stems.impersonal) {
    for (const tense of Object.keys(conjugations) as Tense[]) {
      conjugations[tense] = conjugations[tense]!.map((form, index) =>
        index === 2 ? form : ABSENT,
      );
    }
  }

  const family = metadata.group === '3' ? familyFor(base.infinitive) : null;
  const types =
    family && !metadata.types.includes(family.type)
      ? [...metadata.types, family.type]
      : metadata.types;

  return {
    id: metadata.id,
    infinitive: metadata.infinitive,
    translation: metadata.translation,
    group: metadata.group,
    aux: metadata.aux,
    pronominal: metadata.pronominal,
    types,
    conjugations,
    participePresent: {
      form: built.participePresent,
      irregular: built.participePresent !== baseline.participePresent,
    },
    participePasse: {
      form: built.participePasse,
      irregular: built.participePasse !== baseline.participePasse,
    },
    irregularNote: stems.note,
  };
}
