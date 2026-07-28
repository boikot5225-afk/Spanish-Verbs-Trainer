import type { CompoundTense, ConjugationForm, Tense, Verb } from './types';
import { IMPERATIVE_TENSES } from './types';
import irregularData from './irregulars.json';

export interface VerbMetadata {
  id: string;
  infinitive: string;
  translation: string;
  group: Verb['group'];
  types: string[];
}

type PersonCode = '1s' | '2s' | '3s' | '1p' | '2p' | '3p';
type IrregularTense =
  | 'indicative present'
  | 'indicative preterite'
  | 'indicative imperfect'
  | 'indicative future'
  | 'indicative conditional'
  | 'subjunctive present'
  | 'imperative affirmative';
type IrregularTable = Partial<Record<IrregularTense | string, Partial<Record<PersonCode, string>>>>;
type IrregularMap = Record<string, IrregularTable>;
type VerbType = 'ar' | 'er' | 'ir';

const PERSON_CODES: PersonCode[] = ['1s', '2s', '3s', '1p', '2p', '3p'];
const SHOE = new Set([0, 1, 2, 5]);
const IRREGULARS = irregularData as IrregularMap;

const PRESENT: Record<VerbType, string[]> = {
  ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
  er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
};
const PRETERITE: Record<VerbType, string[]> = {
  ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
  er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
};
const IMPERFECT: Record<VerbType, string[]> = {
  ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
  er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
};
const FUTURE = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const CONDITIONAL = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const SUBJUNCTIVE: Record<VerbType, string[]> = {
  ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
  er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
};

// Окончания прошедшего сослагательного и будущего сослагательного. Крепятся к основе
// 3-го лица мн. ч. индефинидо без -ron; форма nosotros получает ударение отдельно.
const SUBJ_IMPERFECT_RA = ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'];
const SUBJ_IMPERFECT_SE = ['se', 'ses', 'se', 'semos', 'seis', 'sen'];
const SUBJ_FUTURE = ['re', 'res', 're', 'remos', 'reis', 'ren'];

/** Вспомогательный haber для всех девяти составных времён. */
const HABER: Record<CompoundTense, string[]> = {
  perfecto: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
  pluscuamperfecto: ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'],
  anterior: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron'],
  futuroPerfecto: ['habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán'],
  condicionalPerfecto: ['habría', 'habrías', 'habría', 'habríamos', 'habríais', 'habrían'],
  subjPerfecto: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
  subjPluscuamRa: ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubierais', 'hubieran'],
  subjPluscuamSe: ['hubiese', 'hubieses', 'hubiese', 'hubiésemos', 'hubieseis', 'hubiesen'],
  subjFuturoPerfecto: ['hubiere', 'hubieres', 'hubiere', 'hubiéremos', 'hubiereis', 'hubieren'],
};

// Неправильные причастия: тип из метаданных отпирает замену суффикса инфинитива.
// Тип обязателен, поэтому короткие суффиксы вроде «ver» не задевают mover или beber.
const PARTICIPLE_RULES: Array<{ type: string; from: string; to: string }> = [
  { type: 'ito pp', from: 'scribir', to: 'scrito' }, // escribir → escrito
  { type: 'ito pp', from: 'freír', to: 'frito' },
  { type: 'ierto pp', from: 'brir', to: 'bierto' }, // abrir → abierto, cubrir → cubierto
  { type: 'uelto pp', from: 'olver', to: 'uelto' }, // volver → vuelto, resolver → resuelto
  { type: 'uerto pp', from: 'orir', to: 'uerto' }, // morir → muerto
  { type: 'icho pp', from: 'ecir', to: 'icho' }, // decir → dicho, predecir → predicho
  { type: 'isto pp', from: 'ver', to: 'visto' }, // ver → visto, prever → previsto
  { type: 'poner', from: 'poner', to: 'puesto' }, // componer → compuesto
  { type: 'acer', from: 'acer', to: 'echo' }, // hacer → hecho, satisfacer → satisfecho
];

/** Причастия, не описываемые ни одним правилом (тип «irregular pp»). */
const IRREGULAR_PARTICIPLES: Array<[string, string]> = [
  ['romper', 'roto'],
  ['pudrir', 'podrido'],
];

/** Герундии, которые нельзя вывести из основы (супплетивные). */
const GERUND_OVERRIDES: Array<[string, string]> = [['ir', 'yendo']];

const ACUTE: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const ACCENTED = 'áéíóú';
const REFLEXIVE_PRONOUNS = ['me', 'te', 'se', 'nos', 'os', 'se'] as const;

/** Ставит острое ударение на последнюю гласную основы (habla → hablá, compon → compón). */
function accentLastVowel(value: string): string {
  for (let index = value.length - 1; index >= 0; index -= 1) {
    const char = value[index]!;
    if (ACCENTED.includes(char)) return value; // ударение уже есть
    const accented = ACUTE[char];
    if (accented) return value.slice(0, index) + accented + value.slice(index + 1);
  }
  return value;
}

/** Сохраняет ударение глагольной формы после присоединения местоимения. */
function accentSecondLastVowel(value: string): string {
  if ([...value].some(char => ACCENTED.includes(char))) return value;
  let seen = 0;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    const char = value[index]!;
    if (!(char in ACUTE)) continue;
    seen += 1;
    if (seen === 2) {
      return value.slice(0, index) + ACUTE[char] + value.slice(index + 1);
    }
  }
  return value;
}

interface ParsedInfinitive {
  base: string;
  stem: string;
  type: VerbType;
}

interface PatternEntry {
  key: string;
  table: IrregularTable;
}

function parseInfinitive(value: string): ParsedInfinitive {
  const withoutReflexive = value.endsWith('se') ? value.slice(0, -2) : value;
  const rawType = withoutReflexive.slice(-2);
  const type = ({ ár: 'ar', ér: 'er', ír: 'ir' } as Record<string, VerbType>)[rawType] ?? rawType;
  if (type !== 'ar' && type !== 'er' && type !== 'ir') {
    throw new Error(`Неподдерживаемый инфинитив: ${value}`);
  }
  return { base: withoutReflexive, stem: withoutReflexive.slice(0, -2), type };
}

function replaceLast(value: string, search: string, replacement: string): string {
  const index = value.lastIndexOf(search);
  return index < 0 ? value : value.slice(0, index) + replacement + value.slice(index + search.length);
}

function stripMarks(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function applicablePatterns(base: string, types: Set<string>): PatternEntry[] {
  return Object.entries(IRREGULARS)
    .filter(([key]) => base.endsWith(key) && (base === key || types.has(key)))
    .map(([key, table]) => ({ key, table }))
    .sort((left, right) => right.key.length - left.key.length);
}

function patternOverride(
  base: string,
  patterns: PatternEntry[],
  tense: IrregularTense,
  person: PersonCode,
): string | undefined {
  for (const { key, table } of patterns) {
    const form = table[tense]?.[person];
    if (form !== undefined) return base.slice(0, -key.length) + form;
  }
  return undefined;
}

function shoeStem(stem: string, types: Set<string>, index: number): string {
  let value = stem;
  if (types.has('o to u all')) value = replaceLast(value, 'o', 'u');
  if (!SHOE.has(index)) return value;
  if (types.has('i before e')) value = replaceLast(value, 'e', 'ie');
  if (types.has('e after i')) value = replaceLast(value, 'i', 'ie');
  if (types.has('o to ue')) value = replaceLast(value, 'o', 'ue');
  if (types.has('o to üe')) value = replaceLast(value, 'o', 'üe');
  if (types.has('u to ue')) value = replaceLast(value, 'u', 'ue');
  if (types.has('e to i')) value = replaceLast(value, 'e', 'i');
  if (types.has('i to í')) value = replaceLast(value, 'i', 'í');
  if (types.has('u to ú')) value = replaceLast(value, 'u', 'ú');
  if (types.has('h before ue')) {
    const position = value.lastIndexOf('ue');
    if (position >= 0) value = value.slice(0, position) + 'h' + value.slice(position);
  }
  return value;
}

function yoSubjunctiveTransform(stem: string, types: Set<string>): string {
  let value = stem;
  if (types.has('z before c') && value.endsWith('c')) value = value.slice(0, -1) + 'zc';
  if (types.has('c to z') && value.endsWith('c')) value = value.slice(0, -1) + 'z';
  if (types.has('g to j') && value.endsWith('g')) value = value.slice(0, -1) + 'j';
  if (types.has('gu to g') && value.endsWith('gu')) value = value.slice(0, -2) + 'g';
  if (types.has('qu to c') && value.endsWith('qu')) value = value.slice(0, -2) + 'c';
  if (types.has('add ig')) value += 'ig';
  else if (types.has('add g')) value += 'g';
  return value;
}

function presentForm(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
): string {
  let stem = shoeStem(parsed.stem, types, index);
  if (types.has('add y') && ([1, 2, 5].includes(index) || (index === 0 && !types.has('add ig')))) stem += 'y';
  if (index === 0) stem = yoSubjunctiveTransform(stem, types);
  const form = (
    patternOverride(parsed.base, patterns, 'indicative present', PERSON_CODES[index]!) ??
    stem + PRESENT[parsed.type][index]
  );
  if (index === 3 && types.has('add í')) return form.replace(/imos$/u, 'ímos');
  if (
    index === 4 &&
    types.has('unaccented ui')
  ) {
    return stripMarks(form);
  }
  return form;
}

function irregularPreteriteStem(
  parsed: ParsedInfinitive,
  types: Set<string>,
): { stem: string; kind?: 'irregular' | 'j' } {
  const { base, stem } = parsed;
  if (types.has('o to u all')) {
    return { stem: replaceLast(stem, 'o', 'u') };
  }
  if (types.has('uv preterite')) {
    if (base === 'andar') return { stem: 'anduv', kind: 'irregular' };
    if (base.endsWith('estar')) return { stem: base.slice(0, -5) + 'estuv', kind: 'irregular' };
    if (base.endsWith('tener')) return { stem: base.slice(0, -5) + 'tuv', kind: 'irregular' };
  }
  if (types.has('up preterite')) {
    if (base.endsWith('caber')) return { stem: base.slice(0, -5) + 'cup', kind: 'irregular' };
    if (base.endsWith('saber')) return { stem: base.slice(0, -5) + 'sup', kind: 'irregular' };
  }
  if (types.has('c to j') && base.endsWith('ducir')) return { stem: base.slice(0, -3) + 'j', kind: 'j' };
  if (types.has('add j')) return { stem: stem + 'j', kind: 'j' };
  return { stem };
}

function preteriteForm(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
): string {
  const overridden = patternOverride(parsed.base, patterns, 'indicative preterite', PERSON_CODES[index]!);
  if (overridden !== undefined) {
    if (parsed.base === 'rehacer' && index === 0) return 'rehíce';
    if (parsed.base === 'rehacer' && index === 2) return 'rehízo';
    return overridden;
  }

  let { stem, kind } = irregularPreteriteStem(parsed, types);
  if (kind) {
    const endings = ['e', 'iste', 'o', 'imos', 'isteis', kind === 'j' ? 'eron' : 'ieron'];
    return stem + endings[index];
  }
  if (index === 2 || index === 5) {
    if (types.has('e to i preterite') || (types.has('e to i') && parsed.type === 'ir')) stem = replaceLast(stem, 'e', 'i');
    if (types.has('o to u preterite')) stem = replaceLast(stem, 'o', 'u');
  }
  if (types.has('add y preterite') || types.has('add y')) {
    const endings = types.has('add í')
      ? ['í', 'íste', 'yó', 'ímos', 'ísteis', 'yeron']
      : [
          types.has('unaccented ui') ? 'i' : 'í',
          'iste',
          'yó',
          'imos',
          'isteis',
          'yeron',
        ];
    return stem + endings[index];
  }
  if (types.has('drop i') && (index === 2 || index === 5)) {
    return stem + (index === 2 ? 'ó' : 'eron');
  }
  if (index === 0) {
    if (types.has('c to qu') && stem.endsWith('c')) stem = stem.slice(0, -1) + 'qu';
    if (types.has('g to gu') && stem.endsWith('g')) stem += 'u';
    if (types.has('z to c') && stem.endsWith('z')) stem = stem.slice(0, -1) + 'c';
    if (types.has('u to ü') && stem.endsWith('gu')) stem = stem.slice(0, -1) + 'ü';
  }
  const form = stem + PRETERITE[parsed.type][index];
  return types.has('drop accent preterite') ? stripMarks(form) : form;
}

function imperfectForm(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
): string {
  return (
    patternOverride(parsed.base, patterns, 'indicative imperfect', PERSON_CODES[index]!) ??
    (types.has('o to u all') ? replaceLast(parsed.stem, 'o', 'u') : parsed.stem) +
      IMPERFECT[parsed.type][index]
  );
}

function normalizedInfinitive(base: string): string {
  const rawType = base.slice(-2);
  const normalized = ({ ár: 'ar', ér: 'er', ír: 'ir' } as Record<string, string>)[rawType] ?? rawType;
  return base.slice(0, -2) + normalized;
}

function futureStem(base: string, types: Set<string>): string {
  const normalized = normalizedInfinitive(base);
  const clean = types.has('o to u all') ? replaceLast(normalized, 'o', 'u') : normalized;
  if (types.has('d future')) return clean.slice(0, -2) + 'dr';
  if (types.has('drop vowel future')) return clean.slice(0, -2) + 'r';
  return clean;
}

function futureForm(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
  conditional: boolean,
): string {
  const tense: IrregularTense = conditional ? 'indicative conditional' : 'indicative future';
  return (
    patternOverride(parsed.base, patterns, tense, PERSON_CODES[index]!) ??
    futureStem(parsed.base, types) + (conditional ? CONDITIONAL[index] : FUTURE[index])
  );
}

function subjunctiveStem(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
): string {
  const presentYo = presentForm(parsed, types, patterns, 0);
  let stem = presentYo.endsWith('o') ? presentYo.slice(0, -1) : presentYo;
  const overrideFirst = patternOverride(parsed.base, patterns, 'subjunctive present', '1s');
  if (overrideFirst !== undefined) {
    const plain = stripMarks(overrideFirst);
    const firstEnding = stripMarks(SUBJUNCTIVE[parsed.type][0]);
    if (plain.endsWith(firstEnding)) stem = plain.slice(0, -firstEnding.length);
  }
  if (index === 3 || index === 4) {
    if (types.has('poder') || types.has('querer')) stem = parsed.stem;
    if (types.has('e to i')) {
      // Keep the i already present in the yo-derived stem.
    } else if (types.has('e to i preterite') && types.has('i before e')) {
      stem = replaceLast(stem, 'ie', 'i');
    } else if (types.has('o to u preterite') && types.has('o to ue')) {
      stem = replaceLast(stem, 'ue', 'u');
    } else if (
      !types.has('add y') &&
      ['i before e', 'e after i', 'o to ue', 'o to üe', 'u to ue', 'i to í', 'u to ú', 'h before ue'].some(type => types.has(type))
    ) {
      stem = yoSubjunctiveTransform(parsed.stem, types);
    }
  }
  if (types.has('c to qu') && stem.endsWith('c')) stem = stem.slice(0, -1) + 'qu';
  if (types.has('g to gu') && stem.endsWith('g')) stem += 'u';
  if (types.has('z to c') && stem.endsWith('z')) stem = stem.slice(0, -1) + 'c';
  if (types.has('u to ü') && stem.endsWith('gu')) stem = stem.slice(0, -1) + 'ü';
  if ((index === 3 || index === 4) && (types.has('reír') || types.has('eír'))) stem = stem.replace(/í/g, 'i');
  return stem;
}

function subjunctiveForm(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  index: number,
): string {
  const overridden = patternOverride(parsed.base, patterns, 'subjunctive present', PERSON_CODES[index]!);
  if (overridden !== undefined) return overridden;
  const form = subjunctiveStem(parsed, types, patterns, index) + SUBJUNCTIVE[parsed.type][index];
  if (
    (index === 3 || index === 4) &&
    types.has('add y') &&
    types.has('u to ú')
  ) {
    return form.replace(/ú/gu, 'u');
  }
  return index === 4 && types.has('drop accent 2p subjunctive') ? stripMarks(form) : form;
}

function participleForm(parsed: ParsedInfinitive, types: Set<string>): string {
  const { base, stem, type } = parsed;

  if (types.has('irregular pp')) {
    for (const [key, form] of IRREGULAR_PARTICIPLES) {
      if (base.endsWith(key)) return base.slice(0, -key.length) + form;
    }
  }
  for (const rule of PARTICIPLE_RULES) {
    if (types.has(rule.type) && base.endsWith(rule.from)) {
      return base.slice(0, -rule.from.length) + rule.to;
    }
  }
  if (type === 'ar') return stem + 'ado';
  // Основа на сильную гласную требует ударения: leer → leído, traer → traído, oír → oído.
  // На слабую «u» — нет, там дифтонг: construir → construido.
  if (/[aeo]$/u.test(stem)) return stem + 'ído';
  return stem + 'ido';
}

function gerundForm(parsed: ParsedInfinitive, types: Set<string>): string {
  const { base, type } = parsed;
  for (const [key, form] of GERUND_OVERRIDES) {
    if (base === key) return form;
  }

  let stem = parsed.stem;
  if (
    type === 'ir' &&
    ['e to i', 'e to i preterite', 'i before e', 'decir', 'ecir', 'venir', 'reír', 'eír'].some(
      item => types.has(item),
    )
  ) {
    stem = replaceLast(stem, 'e', 'i');
  }
  if (types.has('o to u preterite') || types.has('o to u all') || types.has('poder')) {
    stem = replaceLast(stem, 'o', 'u');
  }

  if (type === 'ar') return stem + 'ando';
  if (stem.endsWith('i') || stem.endsWith('í')) return stem + 'endo'; // reír → riendo
  if (types.has('drop i')) return stem + 'endo'; // gruñir → gruñendo
  if (/[aeiouáéíóú]$/u.test(stem) && !/[gq]u$/u.test(stem)) return stem + 'yendo';
  return stem + 'iendo';
}

/** Основа прошедшего сослагательного — 3-е лицо мн. ч. индефинидо без -ron. */
function subjPastStem(preterite3p: string): string {
  return preterite3p.endsWith('ron') ? preterite3p.slice(0, -3) : preterite3p;
}

function subjPastForm(stem: string, endings: string[], index: number): string {
  const root = index === 3 ? accentLastVowel(stem) : stem;
  return root + endings[index]!;
}

function imperativeAffirmativeForms(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
  present: string[],
  subjunctive: string[],
): string[] {
  const override = (person: PersonCode): string | undefined =>
    patternOverride(parsed.base, patterns, 'imperative affirmative', person);

  const irregularTu = override('2s');
  let tu: string;
  if (irregularTu === undefined) {
    tu = present[2]!; // регулярное tú = 3-е лицо ед. ч. настоящего
  } else {
    tu = types.has('accent 2s imperative affirmative') ? accentLastVowel(irregularTu) : irregularTu;
  }

  // Остальные лица берут форму сослагательного, если данные не задают своей (ir → vamos).
  // 2-е лицо мн. ч. — всегда инфинитив с -r → -d (hablar → hablad, reír → reíd).
  return [
    '',
    tu,
    override('3s') ?? subjunctive[2]!,
    override('1p') ?? subjunctive[3]!,
    parsed.base.slice(0, -1) + 'd',
    override('3p') ?? subjunctive[5]!,
  ];
}

function imperativeNegativeForms(subjunctive: string[]): string[] {
  return subjunctive.map((form, index) => (index === 0 ? '' : `no ${form}`));
}

interface BuiltForms {
  forms: Record<Tense, string[]>;
  gerundio: string;
  participio: string;
}

function reflexiveForms(built: BuiltForms, infinitive: string): BuiltForms {
  const forms = {} as Record<Tense, string[]>;

  (Object.keys(built.forms) as Tense[]).forEach(tense => {
    if (tense === 'imperativoAfirmativo') {
      if (infinitive === 'irse') {
        forms[tense] = ['', 'vete', 'váyase', 'vámonos', 'idos', 'váyanse'];
        return;
      }
      forms[tense] = built.forms[tense].map((form, index) => {
        if (!form) return '';
        const pronoun = REFLEXIVE_PRONOUNS[index]!;
        if (index === 4) {
          const withoutD = form.endsWith('d') ? form.slice(0, -1) : form;
          const host = withoutD.endsWith('i') ? accentLastVowel(withoutD) : withoutD;
          return `${host}${pronoun}`;
        }
        if (index === 3) {
          const withoutS = form.endsWith('s') ? form.slice(0, -1) : form;
          return `${accentSecondLastVowel(withoutS)}${pronoun}`;
        }
        return `${accentSecondLastVowel(form)}${pronoun}`;
      });
      return;
    }

    if (tense === 'imperativoNegativo') {
      forms[tense] = built.forms[tense].map((form, index) => {
        if (!form) return '';
        return form.replace(/^no /u, `no ${REFLEXIVE_PRONOUNS[index]} `);
      });
      return;
    }

    forms[tense] = built.forms[tense].map(
      (form, index) => `${REFLEXIVE_PRONOUNS[index]} ${form}`,
    );
  });

  return {
    forms,
    gerundio: `${accentSecondLastVowel(built.gerundio)}se`,
    // Причастие с haber остаётся неприсоединённой неличной формой: me he levantado.
    participio: built.participio,
  };
}

function buildForms(
  parsed: ParsedInfinitive,
  types: Set<string>,
  patterns: PatternEntry[],
): BuiltForms {
  const presente = PERSON_CODES.map((_, index) => presentForm(parsed, types, patterns, index));
  const preteriteIndef = PERSON_CODES.map((_, index) => preteriteForm(parsed, types, patterns, index));
  const subjuntivo = PERSON_CODES.map((_, index) => subjunctiveForm(parsed, types, patterns, index));
  const pastStem = subjPastStem(preteriteIndef[5]!);
  const participio = participleForm(parsed, types);
  const compound = (tense: CompoundTense): string[] =>
    HABER[tense].map(auxiliary => `${auxiliary} ${participio}`);

  const forms: Record<Tense, string[]> = {
    presente,
    preteriteIndef,
    preteriteImp: PERSON_CODES.map((_, index) => imperfectForm(parsed, types, patterns, index)),
    futuro: PERSON_CODES.map((_, index) => futureForm(parsed, types, patterns, index, false)),
    condicional: PERSON_CODES.map((_, index) => futureForm(parsed, types, patterns, index, true)),
    perfecto: compound('perfecto'),
    pluscuamperfecto: compound('pluscuamperfecto'),
    anterior: compound('anterior'),
    futuroPerfecto: compound('futuroPerfecto'),
    condicionalPerfecto: compound('condicionalPerfecto'),
    subjuntivo,
    subjImperfectoRa: PERSON_CODES.map((_, index) => subjPastForm(pastStem, SUBJ_IMPERFECT_RA, index)),
    subjImperfectoSe: PERSON_CODES.map((_, index) => subjPastForm(pastStem, SUBJ_IMPERFECT_SE, index)),
    subjFuturo: PERSON_CODES.map((_, index) => subjPastForm(pastStem, SUBJ_FUTURE, index)),
    subjPerfecto: compound('subjPerfecto'),
    subjPluscuamRa: compound('subjPluscuamRa'),
    subjPluscuamSe: compound('subjPluscuamSe'),
    subjFuturoPerfecto: compound('subjFuturoPerfecto'),
    imperativoAfirmativo: imperativeAffirmativeForms(parsed, types, patterns, presente, subjuntivo),
    imperativoNegativo: imperativeNegativeForms(subjuntivo),
  };

  if (types.has('defective no future conditional imperative')) {
    for (const tense of [
      'futuro',
      'condicional',
      'futuroPerfecto',
      'condicionalPerfecto',
      'imperativoAfirmativo',
      'imperativoNegativo',
    ] as const) {
      forms[tense] = PERSON_CODES.map(() => '');
    }
  }

  const allowedPersons = types.has('impersonal third singular')
    ? new Set([2])
    : types.has('defective third person')
      ? new Set([2, 5])
      : null;
  if (allowedPersons) {
    (Object.keys(forms) as Tense[]).forEach(tense => {
      forms[tense] = forms[tense].map((form, index) =>
        IMPERATIVE_TENSES.has(tense) || !allowedPersons.has(index) ? '' : form,
      );
    });
  }

  return { forms, gerundio: gerundForm(parsed, types), participio };
}

function markForms(built: BuiltForms, baseline: BuiltForms): Record<Tense, ConjugationForm[]> {
  const result = {} as Record<Tense, ConjugationForm[]>;
  (Object.keys(built.forms) as Tense[]).forEach(tense => {
    result[tense] = built.forms[tense].map((form, index) => {
      if (!form) return { form: '', irregular: false, absent: true };
      return { form, irregular: form !== baseline.forms[tense][index] };
    });
  });
  return result;
}

interface ResolvedForms {
  conjugations: Record<Tense, ConjugationForm[]>;
  gerundio: ConjugationForm;
  participio: ConjugationForm;
}

function resolveForms(metadata: VerbMetadata): ResolvedForms {
  const parsed = parseInfinitive(metadata.infinitive);
  const types = new Set(metadata.types);
  const patterns = applicablePatterns(parsed.base, types);
  const plainBuilt = buildForms(parsed, types, patterns);
  // Тот же генератор без признаков неправильности даёт эталон для подсветки ★.
  const plainBaseline = buildForms(parsed, new Set<string>(), []);
  const isReflexive = metadata.infinitive.endsWith('se');
  const built = isReflexive ? reflexiveForms(plainBuilt, metadata.infinitive) : plainBuilt;
  const baseline = isReflexive
    ? reflexiveForms(plainBaseline, metadata.infinitive)
    : plainBaseline;

  return {
    conjugations: markForms(built, baseline),
    gerundio: { form: built.gerundio, irregular: built.gerundio !== baseline.gerundio },
    participio: { form: built.participio, irregular: built.participio !== baseline.participio },
  };
}

export function conjugateMetadata(metadata: VerbMetadata): Verb {
  const verb = {
    id: metadata.id,
    infinitive: metadata.infinitive,
    translation: metadata.translation,
    group: metadata.group,
    types: metadata.types,
  } as Verb;

  // Более двух тысяч глаголов × 20 форм — это четверть миллиона результатов. Списку и поиску нужны
  // только инфинитив с переводом, поэтому спряжения считаются при первом обращении
  // к конкретному глаголу и дальше кешируются.
  let cached: ResolvedForms | undefined;
  const resolve = (): ResolvedForms => (cached ??= resolveForms(metadata));

  for (const key of ['conjugations', 'gerundio', 'participio'] as const) {
    Object.defineProperty(verb, key, {
      configurable: true,
      enumerable: true,
      get: () => resolve()[key],
    });
  }

  return verb;
}
