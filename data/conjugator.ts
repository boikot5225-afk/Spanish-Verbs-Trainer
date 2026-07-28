import type { ConjugationForm, Tense, Verb } from './types';
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

type RawForms = Record<Tense, string[]>;
type AliasForms = Partial<Record<Tense, string[][]>>;

const PERSON_CODES: PersonCode[] = ['1s', '2s', '3s', '1p', '2p', '3p'];
const SHOE = new Set([0, 1, 2, 5]);
const IRREGULARS = irregularData as IrregularMap;
const UNAVAILABLE = '—';

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

const ESTAR_PRESENT = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'];
const IR_PRESENT = ['voy', 'vas', 'va', 'vamos', 'vais', 'van'];
const HABER_PRESENT = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];
const HABER_IMPERFECT = ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'];
const HABER_FUTURE = ['habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán'];
const HABER_CONDITIONAL = ['habría', 'habrías', 'habría', 'habríamos', 'habríais', 'habrían'];
const HABER_SUBJUNCTIVE = ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'];
const HABER_SUBJUNCTIVE_IMPERFECT_RA = ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubierais', 'hubieran'];
const HABER_SUBJUNCTIVE_IMPERFECT_SE = ['hubiese', 'hubieses', 'hubiese', 'hubiésemos', 'hubieseis', 'hubiesen'];

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

function addAcuteToLastVowel(value: string): string {
  const plain = stripMarks(value);
  for (let index = plain.length - 1; index >= 0; index -= 1) {
    const replacement = ({ a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' } as Record<string, string>)[plain[index]!];
    if (replacement) return plain.slice(0, index) + replacement + plain.slice(index + 1);
  }
  return value;
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
  if (!SHOE.has(index)) return stem;
  let value = stem;
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
  return (
    patternOverride(parsed.base, patterns, 'indicative present', PERSON_CODES[index]!) ??
    stem + PRESENT[parsed.type][index]
  );
}

function irregularPreteriteStem(
  parsed: ParsedInfinitive,
  types: Set<string>,
): { stem: string; kind?: 'irregular' | 'j' } {
  const { base, stem } = parsed;
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
  if (overridden !== undefined) return overridden;

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
      : ['í', 'iste', 'yó', 'imos', 'isteis', 'yeron'];
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
  patterns: PatternEntry[],
  index: number,
): string {
  return (
    patternOverride(parsed.base, patterns, 'indicative imperfect', PERSON_CODES[index]!) ??
    parsed.stem + IMPERFECT[parsed.type][index]
  );
}

function normalizedInfinitive(base: string): string {
  const rawType = base.slice(-2);
  const normalized = ({ ár: 'ar', ér: 'er', ír: 'ir' } as Record<string, string>)[rawType] ?? rawType;
  return base.slice(0, -2) + normalized;
}

function futureStem(base: string, types: Set<string>): string {
  const clean = normalizedInfinitive(base);
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
  return index === 4 && types.has('drop accent 2p subjunctive') ? stripMarks(form) : form;
}

function gerundForm(parsed: ParsedInfinitive, types: Set<string>): string {
  if (parsed.base === 'ir') return 'yendo';
  if (parsed.base.endsWith('decir')) return parsed.base.slice(0, -5) + 'diciendo';

  let stem = parsed.stem;
  if (parsed.type === 'ir') {
    if (types.has('e to i preterite') || types.has('e to i') || types.has('reír') || types.has('eír')) {
      stem = replaceLast(stem, 'e', 'i').replace(/í/g, 'i');
      return stem + (stem.endsWith('i') ? 'endo' : 'iendo');
    }
    if (types.has('o to u preterite')) {
      stem = replaceLast(stem, 'o', 'u');
      return stem + 'iendo';
    }
  }

  if (parsed.type !== 'ar' && /[aeiouáéíóúü]$/u.test(parsed.stem)) {
    return parsed.stem + 'yendo';
  }
  return parsed.stem + (parsed.type === 'ar' ? 'ando' : 'iendo');
}

function regularGerund(parsed: ParsedInfinitive): string {
  if (parsed.type !== 'ar' && /[aeiouáéíóúü]$/u.test(parsed.stem)) return parsed.stem + 'yendo';
  return parsed.stem + (parsed.type === 'ar' ? 'ando' : 'iendo');
}

function pastParticiple(parsed: ParsedInfinitive): string {
  const base = normalizedInfinitive(parsed.base);
  const suffixes: Array<[string, string]> = [
    ['satisfacer', 'satisfecho'],
    ['hacer', 'hecho'],
    ['decir', 'dicho'],
    ['abrir', 'abierto'],
    ['cubrir', 'cubierto'],
    ['escribir', 'escrito'],
    ['scribir', 'scrito'],
    ['poner', 'puesto'],
    ['resolver', 'resuelto'],
    ['solver', 'suelto'],
    ['volver', 'vuelto'],
    ['morir', 'muerto'],
    ['romper', 'roto'],
    ['prever', 'previsto'],
    ['ver', 'visto'],
    ['imprimir', 'impreso'],
    ['freír', 'frito'],
    ['proveer', 'provisto'],
  ];
  for (const [suffix, result] of suffixes) {
    if (base.endsWith(suffix)) return base.slice(0, -suffix.length) + result;
  }
  const ending = parsed.type === 'ar' ? 'ado' : /[aeiouáéíóúü]$/u.test(parsed.stem) ? 'ído' : 'ido';
  return parsed.stem + ending;
}

function regularParticiple(parsed: ParsedInfinitive): string {
  const ending = parsed.type === 'ar' ? 'ado' : /[aeiouáéíóúü]$/u.test(parsed.stem) ? 'ído' : 'ido';
  return parsed.stem + ending;
}

function imperfectSubjunctiveForms(preteriteThirdPlural: string, ending: 'ra' | 'se'): string[] {
  const root = preteriteThirdPlural.endsWith('ron')
    ? preteriteThirdPlural.slice(0, -3)
    : preteriteThirdPlural;
  const endings = ending === 'ra'
    ? ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran']
    : ['se', 'ses', 'se', 'semos', 'seis', 'sen'];
  return endings.map((item, index) => (index === 3 ? addAcuteToLastVowel(root) : root) + item);
}

function imperativeAffirmativeForms(
  parsed: ParsedInfinitive,
  patterns: PatternEntry[],
  present: string[],
  subjunctive: string[],
): string[] {
  const vosotrosRegular = normalizedInfinitive(parsed.base).slice(0, -1) + 'd';
  return [
    UNAVAILABLE,
    patternOverride(parsed.base, patterns, 'imperative affirmative', '2s') ?? present[2]!,
    patternOverride(parsed.base, patterns, 'imperative affirmative', '3s') ?? subjunctive[2]!,
    patternOverride(parsed.base, patterns, 'imperative affirmative', '1p') ?? subjunctive[3]!,
    patternOverride(parsed.base, patterns, 'imperative affirmative', '2p') ?? vosotrosRegular,
    patternOverride(parsed.base, patterns, 'imperative affirmative', '3p') ?? subjunctive[5]!,
  ];
}

function imperativeNegativeForms(subjunctive: string[]): string[] {
  return [
    UNAVAILABLE,
    `no ${subjunctive[1]}`,
    `no ${subjunctive[2]}`,
    `no ${subjunctive[3]}`,
    `no ${subjunctive[4]}`,
    `no ${subjunctive[5]}`,
  ];
}

function regularBaseline(parsed: ParsedInfinitive): RawForms {
  const presente = PRESENT[parsed.type].map(ending => parsed.stem + ending);
  const preteriteIndef = PRETERITE[parsed.type].map(ending => parsed.stem + ending);
  const preteriteImp = IMPERFECT[parsed.type].map(ending => parsed.stem + ending);
  const futuro = FUTURE.map(ending => normalizedInfinitive(parsed.base) + ending);
  const condicional = CONDITIONAL.map(ending => normalizedInfinitive(parsed.base) + ending);
  const subjuntivo = SUBJUNCTIVE[parsed.type].map(ending => parsed.stem + ending);
  const gerundio = regularGerund(parsed);
  const participio = regularParticiple(parsed);
  const subjuntivoImperfecto = imperfectSubjunctiveForms(preteriteIndef[5]!, 'ra');

  return {
    presente,
    presenteContinuo: ESTAR_PRESENT.map(aux => `${aux} ${gerundio}`),
    preteritePerfecto: HABER_PRESENT.map(aux => `${aux} ${participio}`),
    futuroProximo: IR_PRESENT.map(aux => `${aux} a ${normalizedInfinitive(parsed.base)}`),
    preteriteIndef,
    preteriteImp,
    pluscuamperfecto: HABER_IMPERFECT.map(aux => `${aux} ${participio}`),
    futuro,
    futuroPerfecto: HABER_FUTURE.map(aux => `${aux} ${participio}`),
    condicional,
    condicionalPerfecto: HABER_CONDITIONAL.map(aux => `${aux} ${participio}`),
    subjuntivo,
    subjuntivoImperfecto,
    subjuntivoPerfecto: HABER_SUBJUNCTIVE.map(aux => `${aux} ${participio}`),
    subjuntivoPluscuamperfecto: HABER_SUBJUNCTIVE_IMPERFECT_RA.map(aux => `${aux} ${participio}`),
    imperativoAfirmativo: [UNAVAILABLE, presente[2]!, subjuntivo[2]!, subjuntivo[3]!, normalizedInfinitive(parsed.base).slice(0, -1) + 'd', subjuntivo[5]!],
    imperativoNegativo: [UNAVAILABLE, `no ${subjuntivo[1]}`, `no ${subjuntivo[2]}`, `no ${subjuntivo[3]}`, `no ${subjuntivo[4]}`, `no ${subjuntivo[5]}`],
  };
}

function markForms(forms: RawForms, baseline: RawForms, aliases: AliasForms): Record<Tense, ConjugationForm[]> {
  const result = {} as Record<Tense, ConjugationForm[]>;
  (Object.keys(forms) as Tense[]).forEach(tense => {
    result[tense] = forms[tense].map((form, index) => ({
      form,
      irregular: form !== baseline[tense][index],
      available: form !== UNAVAILABLE,
      aliases: aliases[tense]?.[index]?.filter(alias => alias !== form),
    }));
  });
  return result;
}

export function conjugateMetadata(metadata: VerbMetadata): Verb {
  const parsed = parseInfinitive(metadata.infinitive);
  const types = new Set(metadata.types);
  const patterns = applicablePatterns(parsed.base, types);

  const presente = PERSON_CODES.map((_, index) => presentForm(parsed, types, patterns, index));
  const preteriteIndef = PERSON_CODES.map((_, index) => preteriteForm(parsed, types, patterns, index));
  const preteriteImp = PERSON_CODES.map((_, index) => imperfectForm(parsed, patterns, index));
  const futuro = PERSON_CODES.map((_, index) => futureForm(parsed, types, patterns, index, false));
  const condicional = PERSON_CODES.map((_, index) => futureForm(parsed, types, patterns, index, true));
  const subjuntivo = PERSON_CODES.map((_, index) => subjunctiveForm(parsed, types, patterns, index));
  const gerundio = gerundForm(parsed, types);
  const participio = pastParticiple(parsed);
  const subjuntivoImperfecto = imperfectSubjunctiveForms(preteriteIndef[5]!, 'ra');
  const subjuntivoImperfectoSe = imperfectSubjunctiveForms(preteriteIndef[5]!, 'se');

  const forms: RawForms = {
    presente,
    presenteContinuo: ESTAR_PRESENT.map(aux => `${aux} ${gerundio}`),
    preteritePerfecto: HABER_PRESENT.map(aux => `${aux} ${participio}`),
    futuroProximo: IR_PRESENT.map(aux => `${aux} a ${normalizedInfinitive(parsed.base)}`),
    preteriteIndef,
    preteriteImp,
    pluscuamperfecto: HABER_IMPERFECT.map(aux => `${aux} ${participio}`),
    futuro,
    futuroPerfecto: HABER_FUTURE.map(aux => `${aux} ${participio}`),
    condicional,
    condicionalPerfecto: HABER_CONDITIONAL.map(aux => `${aux} ${participio}`),
    subjuntivo,
    subjuntivoImperfecto,
    subjuntivoPerfecto: HABER_SUBJUNCTIVE.map(aux => `${aux} ${participio}`),
    subjuntivoPluscuamperfecto: HABER_SUBJUNCTIVE_IMPERFECT_RA.map(aux => `${aux} ${participio}`),
    imperativoAfirmativo: imperativeAffirmativeForms(parsed, patterns, presente, subjuntivo),
    imperativoNegativo: imperativeNegativeForms(subjuntivo),
  };

  const aliases: AliasForms = {
    subjuntivoImperfecto: subjuntivoImperfectoSe.map(form => [form]),
    subjuntivoPluscuamperfecto: HABER_SUBJUNCTIVE_IMPERFECT_SE.map(aux => [`${aux} ${participio}`]),
  };

  return {
    id: metadata.id,
    infinitive: metadata.infinitive,
    translation: metadata.translation,
    group: metadata.group,
    conjugations: markForms(forms, regularBaseline(parsed), aliases),
  };
}
