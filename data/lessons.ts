import type { NonFinite, Periphrasis, Tense } from './types';
import { PERSONS } from './types';
import { getVerbById, VERBS } from './verbs';

/** Зачёт по теме: столько вопросов и не больше стольких ошибок, чтобы открыть следующую. */
export const EXAM_QUESTIONS = 30;
export const EXAM_MAX_MISTAKES = 2;

export type LessonBlock =
  | 'presente'
  | 'construcciones'
  | 'pasado'
  | 'futuro'
  | 'compuestos'
  | 'subjuntivo'
  | 'imperativo'
  | 'literario';

export const LESSON_BLOCKS: LessonBlock[] = [
  'presente',
  'construcciones',
  'pasado',
  'futuro',
  'compuestos',
  'subjuntivo',
  'imperativo',
  'literario',
];

export const LESSON_BLOCK_LABELS: Record<LessonBlock, string> = {
  presente: 'Настоящее время',
  construcciones: 'Глагольные конструкции',
  pasado: 'Прошедшее время',
  futuro: 'Будущее и условное',
  compuestos: 'Составные времена',
  subjuntivo: 'Сослагательное наклонение',
  imperativo: 'Повелительное наклонение',
  literario: 'Книжные времена',
};

export interface LessonSection {
  heading?: string;
  body?: string;
  bullets?: string[];
  /**
   * Встроенная таблица спряжения реального глагола из базы. С `periphrasis`
   * показывает конструкцию целиком: подпись «estar + герундий» обещала
   * estoy comiendo, а таблица выводила голое estoy.
   */
  table?: { verbId: string; tense: Tense; caption?: string; periphrasis?: Periphrasis };
}

export interface Lesson {
  id: string;
  block: LessonBlock;
  title: string;
  summary: string;
  sections: LessonSection[];
  /** Настройки тренировки по теме урока. */
  practice: {
    tenses: Tense[];
    /**
     * Неличные формы темы. Тема о герундии спрашивала спряжение estar в презенте
     * и ни разу сам герундий — лица у него нет, поэтому через `tenses` он
     * невыразим и нужен отдельный список.
     */
    forms?: NonFinite[];
    /**
     * Конструкция «вспомогательный + неличная форма» со своим списком времён:
     * спрашивается целиком (estoy comiendo), а не по частям. Тема о герундии
     * иначе тренирует либо спряжение estar, либо голый герундий — но не то,
     * чему учит.
     */
    periphrasis?: Periphrasis & { tenses: Tense[] };
    /** Явный список глаголов; если не задан — берётся по признакам неправильности. */
    verbIds?: string[];
    /** Признаки из метаданных: урок соберёт все глаголы с любым из них. */
    types?: string[];
    /** Ограничение выборки, чтобы тренировка не растекалась на сотни глаголов. */
    limit?: number;
    /**
     * Ключевые глаголы темы — каждый становится отдельной мини-тренировкой.
     * Если не задано, берутся первые из verbIds.
     */
    featured?: string[];
  };
}

/** Отдельная мини-тренировка внутри темы: один глагол либо весь набор. */
export interface LessonDrill {
  /** Устойчивый ключ для хранения медали. */
  key: string;
  label: string;
  verbIds: string[];
  isAll: boolean;
}

export const DRILL_QUESTIONS = 10;

/** Медаль за мини-тренировку: порог по доле верных ответов. */
export type Medal = 'gold' | 'silver' | 'bronze' | null;

export function medalFor(percent: number): Medal {
  if (percent >= 100) return 'gold';
  if (percent >= 90) return 'silver';
  if (percent >= 70) return 'bronze';
  return null;
}

export const MEDAL_LABELS: Record<Exclude<Medal, null>, string> = {
  gold: 'Золото · 100%',
  silver: 'Серебро · от 90%',
  bronze: 'Бронза · от 70%',
};

const REGULAR_SAMPLE = [
  'hablar',
  'trabajar',
  'estudiar',
  'comer',
  'beber',
  'aprender',
  'vivir',
  'recibir',
];

export const LESSONS: Lesson[] = [
  // ── Настоящее время ──────────────────────────────────────────────────────
  {
    id: 'presente-regular',
    block: 'presente',
    title: 'Три спряжения',
    summary: 'Окончания -ar, -er, -ir в настоящем времени',
    sections: [
      {
        body:
          'Все испанские глаголы в словаре стоят в инфинитиве и кончаются на -ar, -er или -ir. ' +
          'Это и есть три спряжения. Отбросьте у инфинитива последние две буквы — останется основа, ' +
          'к ней и добавляются личные окончания.',
      },
      {
        heading: 'Первое спряжение: -ar',
        body: 'Самая большая группа — больше половины всех глаголов языка.',
        table: { verbId: 'hablar', tense: 'presente', caption: 'hablar — говорить' },
      },
      {
        heading: 'Второе и третье: -er и -ir',
        body:
          'Эти два спряжения различаются всего в двух формах — nosotros и vosotros. ' +
          'В остальных четырёх окончания совпадают полностью, так что запоминать нужно только разницу.',
        table: { verbId: 'comer', tense: 'presente', caption: 'comer — есть' },
      },
      {
        table: { verbId: 'vivir', tense: 'presente', caption: 'vivir — жить' },
        body: 'Сравните: comemos / coméis против vivimos / vivís. Больше нигде -er и -ir не расходятся.',
      },
      {
        heading: 'Местоимения обычно не нужны',
        body:
          'Окончание само указывает на лицо, поэтому yo, tú, nosotros в речи чаще опускают: ' +
          'вместо «yo hablo español» говорят просто «hablo español». Местоимение добавляют, ' +
          'когда нужно подчеркнуть, кто именно, или снять неоднозначность между él, ella и usted.',
      },
    ],
    practice: { tenses: ['presente'], verbIds: REGULAR_SAMPLE },
  },
  {
    id: 'pronombres',
    block: 'presente',
    title: 'Местоимения и обращение',
    summary: 'tú, usted, vosotros, ustedes — и где какое',
    sections: [
      {
        body:
          'В таблицах приложения шесть строк, и две из них устроены сложнее, чем кажется. ' +
          'Испанский различает не только число, но и вежливость, а распределение форм ' +
          'зависит от страны.',
      },
      {
        heading: 'Единственное число',
        bullets: [
          'yo — я',
          'tú — ты, обращение на равных',
          'usted — вы вежливое, к одному человеку',
          'él, ella — он, она',
        ],
      },
      {
        body:
          'Главная ловушка: usted грамматически стоит в третьем лице. Usted habla, а не ' +
          '«usted hablas». Поэтому в таблице строка «él/ella» обслуживает и вежливое обращение — ' +
          'форма у них одна.',
        table: { verbId: 'hablar', tense: 'presente', caption: 'usted habla — как él' },
      },
      {
        heading: 'Множественное число',
        bullets: [
          'nosotros, nosotras — мы',
          'vosotros, vosotras — вы, к нескольким на равных',
          'ustedes — вы, к нескольким',
          'ellos, ellas — они',
        ],
      },
      {
        heading: 'Где что употребляют',
        body:
          'В Испании работают обе формы: vosotros для своих, ustedes для вежливости. ' +
          'В современной речи Латинской Америки вместо vosotros обычно используют ustedes — ' +
          'и в дружеском, и в вежливом обращении. Формы ustedes при этом совпадают с ellos. ' +
          'Vosotros всё же встречается в старых текстах, богослужении и речи некоторых сообществ.',
      },
      {
        body:
          'Отсюда практический вывод: если учите испанский Испании, строку vosotros нужно ' +
          'знать. Если Латинской Америки — её можно почти не трогать, но узнавать в книгах ' +
          'и фильмах всё равно полезно.',
      },
      {
        heading: 'Местоимение обычно опускают',
        body:
          'Окончание уже указывает на лицо, поэтому hablo español звучит естественнее, ' +
          'чем yo hablo español. Местоимение добавляют для контраста (yo trabajo, él no) ' +
          'или чтобы различить él, ella и usted — у них одна форма глагола.',
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: REGULAR_SAMPLE,
      featured: ['hablar', 'comer', 'vivir', 'trabajar', 'beber', 'recibir'],
    },
  },
  {
    id: 'presente-o-ue',
    block: 'presente',
    title: 'Чередование o → ue',
    summary: 'dormir → duermo, contar → cuento',
    sections: [
      {
        body:
          'У части глаголов гласная в корне меняется, когда на неё падает ударение. ' +
          'Самое частое чередование — o переходит в ue.',
      },
      {
        table: { verbId: 'dormir', tense: 'presente', caption: 'dormir — спать' },
      },
      {
        heading: 'Правило ботинка',
        body:
          'Обратите внимание, где чередование есть, а где нет: duermo, duermes, duerme … duermen — ' +
          'но dormimos и dormís остаются с o. Дело в ударении: в формах nosotros и vosotros оно ' +
          'уходит на окончание, и корень его теряет. Если обвести на таблице формы с чередованием, ' +
          'получится контур ботинка — отсюда школьное название этого правила.',
      },
      {
        body:
          'Чередование не зависит от спряжения — оно встречается у всех трёх: contar и mostrar на -ar, ' +
          'volver и poder на -er, dormir и morir на -ir.',
        table: { verbId: 'contar', tense: 'presente', caption: 'contar — считать, рассказывать' },
      },
      {
        heading: 'Отдельный случай',
        body:
          'Глагол jugar («играть») — единственный, где чередуется u → ue: juego, juegas, juega, ' +
          'jugamos, jugáis, juegan. Логика та же самая.',
      },
    ],
    practice: { tenses: ['presente'], types: ['o to ue', 'u to ue'], limit: 60, featured: ['dormir', 'poder', 'contar', 'volver', 'mostrar', 'jugar'] },
  },
  {
    id: 'presente-e-ie',
    block: 'presente',
    title: 'Чередование e → ie',
    summary: 'pensar → pienso, querer → quiero',
    sections: [
      {
        body:
          'Второе по частоте чередование работает по тому же правилу ботинка: под ударением ' +
          'корневая e превращается в ie, а в формах nosotros и vosotros остаётся как в инфинитиве.',
      },
      {
        table: { verbId: 'pensar', tense: 'presente', caption: 'pensar — думать' },
      },
      {
        body:
          'Так же ведут себя empezar и cerrar на -ar, entender и querer на -er, sentir и preferir на -ir. ' +
          'Это одна из самых больших групп в языке — около девяноста глаголов.',
        table: { verbId: 'querer', tense: 'presente', caption: 'querer — хотеть, любить' },
      },
      {
        heading: 'Не путайте с прошедшим',
        body:
          'У глаголов на -ir вроде sentir чередование e → ie в настоящем сочетается с другим, ' +
          'e → i, в прошедшем: siento, но sintió. К этому вернёмся в уроке про индефинидо.',
      },
    ],
    practice: { tenses: ['presente'], types: ['i before e'], limit: 60, featured: ['pensar', 'querer', 'sentir', 'empezar', 'entender', 'cerrar'] },
  },
  {
    id: 'presente-e-i',
    block: 'presente',
    title: 'Чередование e → i',
    summary: 'pedir → pido, servir → sirvo',
    sections: [
      {
        body:
          'Третье чередование встречается только у глаголов на -ir. Корневая e под ударением ' +
          'переходит не в ie, а просто в i.',
      },
      {
        table: { verbId: 'pedir', tense: 'presente', caption: 'pedir — просить, заказывать' },
      },
      {
        body:
          'Правило ботинка действует и здесь: pedimos и pedís сохраняют e. По этому образцу ' +
          'изменяются servir, repetir, seguir, medir, vestir и ещё около тридцати глаголов.',
      },
      {
        heading: 'Как отличить от e → ie',
        body:
          'По инфинитиву угадать нельзя — sentir даёт siento, а servir даёт sirvo. ' +
          'Тип чередования приходится запоминать вместе с глаголом, но подсказка есть: ' +
          'глаголы на -edir, -egir, -eguir, -etir, -estir почти всегда идут по модели e → i.',
      },
    ],
    practice: { tenses: ['presente'], types: ['e to i'], limit: 60, featured: ['pedir', 'servir', 'repetir', 'seguir', 'vestir', 'medir'] },
  },
  {
    id: 'presente-yo-irregular',
    block: 'presente',
    title: 'Неправильное «yo»',
    summary: 'hago, pongo, salgo, conozco',
    sections: [
      {
        body:
          'Есть группа глаголов с особой формой первого лица единственного числа. У некоторых ' +
          'остальные формы регулярны, а у tener, venir и ряда других дополнительно меняется корень: ' +
          'tengo, но tienes; vengo, но vienes.',
      },
      {
        table: { verbId: 'hacer', tense: 'presente', caption: 'hacer — делать' },
      },
      {
        heading: 'Три способа',
        bullets: [
          'Вставка -g-: hacer → hago, poner → pongo, salir → salgo, tener → tengo, venir → vengo',
          'Вставка -ig-: traer → traigo, caer → caigo, oír → oigo',
          'Вставка -zc- у глаголов на -cer и -cir после гласной: conocer → conozco, traducir → traduzco',
        ],
      },
      {
        table: { verbId: 'conocer', tense: 'presente', caption: 'conocer — знать, быть знакомым' },
      },
      {
        heading: 'Почему это важно запомнить',
        body:
          'Форма yo — не просто исключение, из неё строится всё сослагательное наклонение. ' +
          'Запомнив tengo, вы автоматически получаете tenga, tengas, tengamos и так далее. ' +
          'Подробнее об этом — в уроке о presente de subjuntivo.',
      },
    ],
    practice: {
      tenses: ['presente'],
      types: ['add g', 'add ig', 'z before c'],
      limit: 60,
      featured: ['hacer', 'poner', 'salir', 'tener', 'conocer', 'traer'],
    },
  },

  // ── Глагольные конструкции ───────────────────────────────────────────────
  {
    id: 'ser-estar',
    block: 'construcciones',
    title: 'Ser или estar',
    summary: 'Два глагола «быть» и как их не путать',
    sections: [
      {
        body:
          'В испанском два глагола со значением «быть», и выбор между ними меняет смысл. ' +
          'Грубое правило «ser — постоянное, estar — временное» работает часто, но подводит: ' +
          'человек смертен постоянно, а «está muerto» говорят через estar.',
      },
      {
        heading: 'Ser — что это такое',
        body:
          'Определение, профессия, происхождение, национальность, материал, принадлежность, ' +
          'время и дата. Soy médico. Es de Perú. La mesa es de madera. Son las tres.',
        table: { verbId: 'ser', tense: 'presente', caption: 'ser — быть (сущность)' },
      },
      {
        heading: 'Estar — в каком состоянии и где',
        body:
          'Местоположение, самочувствие, настроение, результат изменения. ' +
          'Estoy en casa. Está cansado. La puerta está abierta.',
        table: { verbId: 'estar', tense: 'presente', caption: 'estar — быть (состояние)' },
      },
      {
        heading: 'Одно прилагательное — два смысла',
        bullets: [
          'es aburrido — он скучный человек · está aburrido — ему скучно',
          'es listo — он сообразительный · está listo — он готов',
          'es rico — он богатый · está rico — это вкусно',
          'es verde — он зелёного цвета · está verde — он незрелый',
        ],
      },
      {
        body:
          'Отсюда практический приём: если фраза описывает, каков предмет по сути, берите ser; ' +
          'если в каком он сейчас виде или где находится — estar.',
      },
    ],
    practice: {
      // Прошедшие времена тема показывает в тексте, но тренирует только настоящее:
      // indefinido и imperfecto разбираются много позже, в блоке о прошедшем.
      // Ради полноразмерного зачёта выборка дополнена другими связочными глаголами —
      // подходы по ключевым остаются на самих ser и estar.
      tenses: ['presente'],
      verbIds: ['ser', 'estar', 'parecer', 'quedar', 'andar', 'permanecer'],
      featured: ['ser', 'estar'],
    },
  },
  {
    id: 'hay-haber',
    block: 'construcciones',
    title: 'Hay и haber',
    summary: 'Безличное «есть, имеется»',
    sections: [
      {
        body:
          'Hay — особая безличная форма глагола haber. Она сообщает, что нечто существует ' +
          'или имеется в наличии: Hay un problema. Hay tres libros en la mesa.',
      },
      {
        heading: 'Всегда единственное число',
        body:
          'Это главная ошибка изучающих. Hay не согласуется с тем, что за ним стоит: ' +
          'hay un libro и hay veinte libros — форма одна и та же. Никаких «hayn» не бывает.',
      },
      {
        heading: 'В других временах',
        bullets: [
          'Прошедшее длительное: había — Había mucha gente (не «habían»)',
          'Прошедшее законченное: hubo — Hubo un accidente',
          'Будущее: habrá · Условное: habría',
          'Сослагательное: haya — No creo que haya problemas',
        ],
        table: { verbId: 'haber', tense: 'preteriteImp', caption: 'había — безличное «было»' },
      },
      {
        heading: 'Hay или estar',
        body:
          'Hay вводит нечто новое и неопределённое, estar сообщает, где находится уже известное. ' +
          'Hay un banco en la plaza — «на площади есть банк». El banco está en la plaza — ' +
          '«тот самый банк находится на площади». В нейтральной начальной фразе после hay обычно ' +
          'стоит неопределённая группа (un banco, bancos), но определённые группы возможны, ' +
          'если их уже задаёт контекст.',
      },
      {
        heading: 'Не путайте с вспомогательным haber',
        body:
          'Тот же глагол в формах he, has, ha строит составные времена: he comido. ' +
          'Это разные употребления одного слова, и безличное hay стоит особняком от всей таблицы.',
        table: { verbId: 'haber', tense: 'presente', caption: 'haber как вспомогательный' },
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['haber', 'estar', 'existir', 'quedar', 'faltar', 'sobrar'],
      featured: ['haber', 'estar'],
    },
  },
  {
    id: 'gustar',
    block: 'construcciones',
    title: 'Gustar и обратные глаголы',
    summary: 'Me gusta — нравится не «я», а «оно»',
    sections: [
      {
        body:
          'Gustar устроен наоборот по сравнению с русским «я люблю». Подлежащее здесь — ' +
          'то, что нравится, а человек стоит в дательном: Me gusta el café — дословно ' +
          '«кофе мне нравится».',
      },
      {
        heading: 'Глагол согласуется с предметом',
        bullets: [
          'Me gusta el libro — единственное число',
          'Me gustan los libros — множественное',
          'Me gusta leer — один инфинитив или группа инфинитивов обычно требует единственного числа',
        ],
      },
      {
        body:
          'Меняется не глагол, а местоимение перед ним: me, te, le, nos, os, les. ' +
          'Te gusta — тебе нравится, les gusta — им нравится. Для ясности или усиления ' +
          'добавляют a mí, a ti, a Juan: A mí me gusta, pero a él no le gusta.',
        table: { verbId: 'gustar', tense: 'presente', caption: 'gustar — в речи живут 3-и лица' },
      },
      {
        heading: 'Такие же глаголы',
        bullets: [
          'encantar — очень нравиться: Me encanta este libro',
          'interesar, importar — интересовать, быть важным',
          'doler — болеть: Me duele la cabeza',
          'faltar, quedar — не хватать, оставаться',
          'parecer — казаться: Me parece bien',
        ],
      },
      {
        body:
          'Обратите внимание на doler: болит голова, поэтому me duele la cabeza, ' +
          'а не «yo duelo». Это та же схема, что и у gustar.',
        table: { verbId: 'doler', tense: 'presente', caption: 'doler — болеть' },
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['gustar', 'encantar', 'interesar', 'importar', 'doler', 'faltar', 'quedar', 'parecer'],
      featured: ['gustar', 'encantar', 'doler', 'parecer', 'quedar', 'faltar'],
    },
  },
  {
    id: 'saber-conocer',
    block: 'construcciones',
    title: 'Saber или conocer',
    summary: 'Два глагола «знать»',
    sections: [
      {
        body:
          'Русское «знать» в испанском распадается надвое, и выбор здесь такой же ' +
          'обязательный, как между ser и estar.',
      },
      {
        heading: 'Saber — знать факт или уметь',
        body:
          'Информация, факты, а с инфинитивом — умение. Sé la respuesta. No sé dónde está. ' +
          'Sé nadar — «умею плавать».',
        table: { verbId: 'saber', tense: 'presente', caption: 'saber — знать, уметь' },
      },
      {
        heading: 'Conocer — быть знакомым',
        body:
          'Люди, города, книги, вкус вина — всё, с чем можно свести знакомство. ' +
          'Conozco a María. Conozco Madrid. Перед человеком обязателен предлог a.',
        table: { verbId: 'conocer', tense: 'presente', caption: 'conocer — знать, быть знакомым' },
      },
      {
        heading: 'В прошедшем смысл меняется',
        bullets: [
          'Supe la verdad — «узнал правду» (в тот момент), а не «знал»',
          'Conocí a Juan — «познакомился с Хуаном», а не «был знаком»',
          'Для длящегося состояния берут imperfecto: sabía, conocía',
        ],
      },
      {
        body:
          'Это частые значения, а не механическое правило для любого контекста: supe нередко ' +
          'означает «узнал», conocí — «познакомился», а imperfecto обычно описывает уже имевшееся ' +
          'знание или знакомство. Ya sabía la respuesta — «уже знал ответ».',
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['saber', 'conocer', 'entender', 'comprender', 'reconocer', 'recordar'],
      featured: ['saber', 'conocer'],
    },
  },
  {
    id: 'verbos-de-cambio',
    block: 'construcciones',
    title: 'Глаголы становления',
    summary: 'ponerse, hacerse, volverse, quedarse',
    sections: [
      {
        body:
          'В русском одно «становиться», в испанском — целый набор, и выбор зависит от того, ' +
          'как говорящий представляет перемену и с какими словами принято сочетать глагол. ' +
          'Ни один из признаков ниже не работает как абсолютное правило.',
      },
      {
        heading: 'ponerse — изменение состояния',
        body:
          'С прилагательными о настроении, цвете, самочувствии. Se puso rojo — «покраснел». ' +
          'Me pongo nervioso. Часто речь о заметной реакции или новом состоянии, но оно не обязано ' +
          'быть кратким.',
        table: { verbId: 'poner', tense: 'presente', caption: 'ponerse + прилагательное' },
      },
      {
        heading: 'volverse — новое свойство',
        body:
          'Se volvió loco — «сошёл с ума». Se ha vuelto muy desconfiado. Часто о переменах ' +
          'в характере или поведении; необратимость из самой конструкции не следует.',
        table: { verbId: 'volver', tense: 'preteriteIndef', caption: 'volverse + прилагательное' },
      },
      {
        heading: 'Остальные',
        bullets: [
          'hacerse — профессия, статус, убеждения или постепенный результат: se hizo médico, se hizo rico',
          'llegar a ser — достижение через усилия: llegó a ser director',
          'quedarse — состояние как итог события: se quedó solo, se quedó sordo',
          'convertirse en — превращение во что-то другое: se convirtió en un símbolo',
        ],
      },
      {
        body:
          'Выбирать лучше по типичным сочетаниям и смыслу всего предложения: ponerse часто описывает ' +
          'состояние, quedarse — его результат, hacerse — статус или путь, llegar a ser — достигнутый итог.',
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['poner', 'volver', 'hacer', 'quedar', 'llegar', 'convertir'],
      featured: ['poner', 'volver', 'hacer', 'quedar', 'llegar', 'convertir'],
    },
  },
  {
    id: 'reflexivos',
    block: 'construcciones',
    title: 'Возвратные глаголы',
    summary: 'levantarse, llamarse, ducharse',
    sections: [
      {
        body:
          'Возвратные глаголы в инфинитиве кончаются на -se: levantarse, llamarse, ducharse. ' +
          'Это тот же глагол плюс местоимение, которое меняется по лицам.',
      },
      {
        heading: 'Местоимения',
        bullets: [
          'me levanto — я встаю · te levantas — ты встаёшь',
          'se levanta — он встаёт · nos levantamos — мы встаём',
          'os levantáis — вы встаёте · se levantan — они встают',
        ],
        table: { verbId: 'levantarse', tense: 'presente', caption: 'местоимение входит в форму' },
      },
      {
        body:
          'Основа спрягается по тем же правилам, что и у соответствующего глагола без -se, ' +
          'а лицо дополнительно показывает местоимение. В таблицах возвратных глаголов оно ' +
          'входит в форму: me levanto, te levantas, se levanta.',
      },
      {
        heading: 'Где стоит местоимение',
        bullets: [
          'Перед спрягаемой формой: me levanto',
          'С инфинитивом и герундием — на выбор: voy a levantarme или me voy a levantar',
          'В утвердительном императиве приклеивается: ¡levántate!, ¡siéntese!',
          'В отрицательном — снова впереди: no te levantes',
        ],
      },
      {
        heading: 'Возвратность меняет смысл',
        bullets: [
          'ir — идти · irse — уходить',
          'dormir — спать · dormirse — засыпать',
          'llamar — звать, звонить · llamarse — называться',
          'poner — класть · ponerse — надевать, становиться',
        ],
      },
      {
        heading: 'Неправильные возвратные',
        body:
          'Местоимение не отменяет изменений основы и окончаний. ' +
          'Если глагол чередуется, он чередуется и в возвратной форме — despertarse даёт ' +
          'me despierto, dormirse даёт me duermo, vestirse даёт me visto.',
        table: { verbId: 'despertarse', tense: 'presente', caption: 'despertarse — me despierto' },
      },
      {
        body:
          'Так же ведут себя acordarse (me acuerdo), encontrarse (me encuentro), sentarse ' +
          '(me siento), probarse (me pruebo), despedirse (me despido) и sentirse (me siento — ' +
          'да, совпадает с sentarse в первом лице).',
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['levantarse', 'llamarse', 'despertarse', 'acostarse', 'ducharse', 'sentarse', 'vestirse', 'irse', 'dormirse', 'ponerse', 'sentirse'],
      featured: ['levantarse', 'llamarse', 'despertarse', 'acostarse', 'vestirse', 'irse'],
    },
  },
  {
    id: 'ir-a-infinitivo',
    block: 'construcciones',
    title: 'Ir a + инфинитив и перифразы',
    summary: 'Voy a comer — намерение и ожидаемое событие',
    sections: [
      {
        body:
          'Конструкция ir a плюс инфинитив выражает намерение, план или ожидаемое событие; ' +
          'близость во времени не обязательна. В разговорной речи она часто конкурирует с простым ' +
          'будущим, но формы voy a llamarte и llamaré не взаимозаменяемы во всех контекстах.',
        table: { verbId: 'ir', tense: 'presente', caption: 'ir — спрягается только он' },
      },
      {
        body:
          'Меняется только ir, инфинитив остаётся неизменным: vas a comer, vamos a salir, ' +
          'van a llegar. В прошедшем длительном получается «собирался»: iba a llamarte.',
      },
      {
        heading: 'Другие полезные перифразы',
        bullets: [
          'acabar de + инфинитив — только что: Acabo de llegar',
          'tener que + инфинитив — быть должным: Tengo que trabajar',
          'hay que + инфинитив — нужно (безлично): Hay que estudiar',
          'volver a + инфинитив — сделать снова: Vuelvo a intentarlo',
          'empezar a / terminar de — начать и закончить делать',
          'seguir + герундий — продолжать: Sigo estudiando',
        ],
      },
      {
        heading: 'Что здесь спрягается',
        body:
          'Во всех этих оборотах изменяется только первый глагол. Второй стоит в инфинитиве ' +
          'или герундии как неличная форма — поэтому, выучив спряжение ir, tener, acabar ' +
          'и volver, вы получаете все конструкции разом.',
        table: { verbId: 'tener', tense: 'presente', caption: 'tener que — «должен»' },
      },
    ],
    practice: {
      tenses: ['presente'],
      verbIds: ['ir', 'acabar', 'tener', 'deber', 'volver', 'seguir', 'empezar', 'terminar'],
      featured: ['ir', 'tener', 'acabar', 'volver', 'seguir', 'empezar'],
    },
  },
  {
    id: 'estar-gerundio',
    block: 'construcciones',
    title: 'Estar + герундий',
    summary: 'Estoy comiendo — действие прямо сейчас',
    sections: [
      {
        body:
          'Продолженное время строится из estar в нужном времени и герундия: estoy comiendo — ' +
          '«я (сейчас) ем». Герундий не меняется, спрягается только estar.',
        table: {
          verbId: 'comer',
          tense: 'presente',
          caption: 'estar + герундий',
          periphrasis: { auxiliary: 'estar', form: 'gerundio' },
        },
      },
      {
        heading: 'Работает в любом времени',
        bullets: [
          'estaba comiendo — ел (в тот момент)',
          'estuve comiendo — ел некоторое время',
          'estaré comiendo — буду есть',
          'he estado comiendo — ел всё это время',
        ],
      },
      {
        heading: 'Важное отличие от английского',
        body:
          'В испанском эту конструкцию не переносят автоматически на любой запланированный будущий ' +
          'случай, как в английском. «Завтра я еду в Мадрид» обычно передают mañana voy a Madrid ' +
          'или voy a ir. Estar + герундий прежде всего показывает действие в развитии вокруг ' +
          'описываемого момента.',
      },
      {
        heading: 'Не только с estar',
        bullets: [
          'seguir + герундий — продолжать: Sigue lloviendo',
          'llevar + герундий — делать уже сколько-то времени: Llevo dos horas esperando',
          'ir + герундий — постепенно: Va mejorando',
          'andar + герундий — делать то и дело',
        ],
      },
      {
        body:
          'Герундий каждого глагола показан на его странице рядом с причастием — ' +
          'там же видно, если он неправильный: leyendo, durmiendo, diciendo.',
        table: { verbId: 'estar', tense: 'preteriteImp', caption: 'estaba — «делал в тот момент»' },
      },
    ],
    practice: {
      // Спрягать сами содержательные глаголы теме не нужно — она про конструкцию.
      tenses: [],
      // Герундий отдельно: не зная diciendo, не построишь estoy diciendo.
      forms: ['gerundio'],
      periphrasis: { auxiliary: 'estar', form: 'gerundio', tenses: ['presente'] },
      // Глаголы теперь смысловые, а не вспомогательные: estar стоит в конструкции.
      // Взяты те, у которых герундий показателен — durmiendo, pidiendo, leyendo.
      verbIds: ['hablar', 'comer', 'vivir', 'decir', 'dormir', 'pedir', 'leer', 'escribir'],
      featured: ['comer', 'decir', 'dormir', 'pedir', 'leer', 'escribir'],
    },
  },

  // ── Прошедшее время ──────────────────────────────────────────────────────
  {
    id: 'indefinido-regular',
    block: 'pasado',
    title: 'Indefinido: правильные глаголы',
    summary: 'Законченное действие в прошлом',
    sections: [
      {
        body:
          'Pretérito indefinido описывает действие, которое произошло и закончилось: ' +
          '«вчера я поговорил с ним», «в прошлом году мы переехали».',
      },
      {
        table: { verbId: 'hablar', tense: 'preteriteIndef', caption: 'hablar — говорить' },
      },
      {
        heading: 'Хорошая новость',
        body:
          'У -er и -ir здесь совершенно одинаковые окончания — запоминать нужно только два набора ' +
          'вместо трёх.',
        table: { verbId: 'comer', tense: 'preteriteIndef', caption: 'comer — есть' },
      },
      {
        heading: 'Следите за ударением',
        body:
          'Ударение — единственное, что отличает некоторые формы от настоящего времени. ' +
          'hablo («я говорю») и habló («он поговорил») различаются только им. ' +
          'То же с hablé и hable. В письме это значок, в речи — смысл.',
      },
    ],
    practice: { tenses: ['preteriteIndef'], verbIds: REGULAR_SAMPLE },
  },
  {
    id: 'presente-ortografia',
    block: 'pasado',
    title: 'Орфографические изменения',
    summary: 'busqué, llegué, crucé — звук важнее буквы',
    sections: [
      {
        body:
          'Часть глаголов выглядит неправильными, хотя на самом деле они правильные. ' +
          'Написание меняется только чтобы сохранить звучание основы — в испанском буквы c, g и z ' +
          'читаются по-разному перед разными гласными.',
      },
      {
        heading: 'Что и когда меняется',
        bullets: [
          'c → qu перед e: buscar → busqué (так сохраняется звук /k/)',
          'g → gu перед e: llegar → llegué',
          'z → c перед e: cruzar → crucé (в испанском z перед e почти не пишется)',
          'g → j перед a и o: coger → cojo',
        ],
      },
      {
        table: { verbId: 'buscar', tense: 'preteriteIndef', caption: 'buscar — искать' },
      },
      {
        body:
          'В индефинидо это затрагивает только форму yo — единственную с окончанием на -é. ' +
          'Зато в сослагательном наклонении, где все окончания начинаются на -e, изменение проходит ' +
          'через всю таблицу: busque, busques, busquemos…',
      },
      {
        body:
          'Таких глаголов много — почти триста, — но правило одно и запоминать отдельные слова не нужно. ' +
          'Достаточно услышать, что звук должен остаться прежним.',
      },
    ],
    practice: {
      // Сослагательное здесь только упоминается: его образование разбирается
      // в своём блоке много позже, тренировать его на этом месте курса рано.
      tenses: ['preteriteIndef'],
      types: ['c to qu', 'g to gu', 'z to c', 'g to j'],
      limit: 60,
      featured: ['buscar', 'llegar', 'cruzar', 'tocar', 'pagar', 'empezar'],
    },
  },
  {
    id: 'indefinido-fuerte',
    block: 'pasado',
    title: 'Indefinido: сильные основы',
    summary: 'tuve, estuve, supe, hice, dije',
    sections: [
      {
        body:
          'Около двадцати самых частых глаголов образуют индефинидо от изменённой основы. ' +
          'Их называют сильными, потому что ударение в первом и третьем лице падает на корень, ' +
          'а не на окончание.',
      },
      {
        heading: 'Общий набор окончаний',
        body:
          'Все сильные глаголы берут одни и те же окончания — и ни одно из них не имеет ударения ' +
          'на письме: -e, -iste, -o, -imos, -isteis, -ieron. Сравните с правильным hablé / habló, ' +
          'где значок обязателен.',
        table: { verbId: 'tener', tense: 'preteriteIndef', caption: 'tener — иметь' },
      },
      {
        heading: 'Основы, которые стоит выучить',
        bullets: [
          'tener → tuv-, estar → estuv-, andar → anduv-',
          'saber → sup-, caber → cup-, poder → pud-, poner → pus-',
          'querer → quis-, hacer → hic-, venir → vin-',
          'decir → dij-, traer → traj-, conducir → conduj-',
        ],
      },
      {
        heading: 'Основа на -j',
        body:
          'Если основа кончается на j, третье лицо множественного числа теряет i: не dijieron, ' +
          'а dijeron. То же у trajeron, condujeron. Это касается всех глаголов на -ducir.',
        table: { verbId: 'decir', tense: 'preteriteIndef', caption: 'decir — говорить, сказать' },
      },
      {
        heading: 'Два одинаковых',
        body:
          'Ser и ir в индефинидо совпадают полностью: fui, fuiste, fue, fuimos, fuisteis, fueron. ' +
          'Что именно имелось в виду, всегда понятно из контекста.',
      },
    ],
    practice: {
      tenses: ['preteriteIndef'],
      types: ['uv preterite', 'up preterite', 'add j', 'c to j'],
      limit: 40,
      featured: ['tener', 'estar', 'saber', 'hacer', 'decir', 'poder'],
    },
  },
  {
    id: 'imperfecto',
    block: 'pasado',
    title: 'Imperfecto',
    summary: 'Самое правильное время в языке',
    sections: [
      {
        body:
          'Pretérito imperfecto показывает прошлую ситуацию изнутри, не выделяя её завершение: ' +
          'она могла длиться, повторяться или служить фоном. «Раньше я много читал», ' +
          '«шёл дождь», «мне было десять лет».',
      },
      {
        table: { verbId: 'hablar', tense: 'preteriteImp', caption: 'hablar — говорить' },
      },
      {
        body:
          'Глаголы на -er и -ir берут окончания -ía, -ías, -ía, -íamos, -íais, -ían — снова один ' +
          'набор на два спряжения.',
      },
      {
        heading: 'Три исключения на весь язык',
        body:
          'Это единственное время, где почти нет неправильных форм. Их ровно три: ser (era, eras, era…), ' +
          'ir (iba, ibas, iba…) и ver (veía, veías…). Больше ничего запоминать не нужно — ' +
          'ни чередований, ни сильных основ.',
        table: { verbId: 'ser', tense: 'preteriteImp', caption: 'ser — быть' },
      },
    ],
    practice: { tenses: ['preteriteImp'], verbIds: [...REGULAR_SAMPLE, 'ser', 'ir', 'ver'] },
  },
  {
    id: 'indefinido-vs-imperfecto',
    block: 'pasado',
    title: 'Indefinido или imperfecto',
    summary: 'Как выбрать между двумя прошедшими',
    sections: [
      {
        body:
          'Оба времени переводятся на русский прошедшим, поэтому выбор кажется произвольным. ' +
          'На деле разница не во времени события, а во взгляде на него.',
      },
      {
        heading: 'Indefinido — точка',
        body:
          'Действие как факт, у которого есть начало и конец. Отвечает на вопрос «что произошло». ' +
          'Ayer hablé con María. El año pasado viajamos a Perú.',
      },
      {
        heading: 'Imperfecto — линия',
        body:
          'Фон, привычка, состояние, описание. Отвечает на «что было, как было, что обычно происходило». ' +
          'Antes hablaba con María todos los días. Llovía y hacía frío.',
      },
      {
        heading: 'Вместе в одном предложении',
        body:
          'Чаще всего они встречаются в паре: imperfecto задаёт обстановку, indefinido вносит событие, ' +
          'которое её прерывает. Yo dormía cuando sonó el teléfono — «я спал (фон), когда зазвонил ' +
          'телефон (событие)». Поменяйте времена местами, и смысл рассыплется.',
      },
      {
        heading: 'Подсказки-маркеры',
        bullets: [
          'Indefinido: ayer, anoche, el lunes pasado, hace dos años, de repente',
          'Imperfecto: siempre, a menudo, todos los días, mientras, cuando era niño',
        ],
      },
      {
        body:
          'Маркеры помогают, но не выбирают время вместо смысла: например, siempre возможно ' +
          'и с indefinido, если речь о завершённом периоде. Главное — как говорящий видит событие.',
      },
    ],
    practice: {
      tenses: ['preteriteIndef', 'preteriteImp'],
      verbIds: [...REGULAR_SAMPLE, 'ser', 'ir', 'tener', 'estar', 'hacer'],
    },
  },

  // ── Будущее и условное ───────────────────────────────────────────────────
  {
    id: 'futuro-condicional',
    block: 'futuro',
    title: 'Futuro и condicional',
    summary: 'Два времени с одной основой',
    sections: [
      {
        body:
          'Эти два времени удобно учить вместе: у них общая основа и почти нет исключений. ' +
          'Причём основа — не корень, а целый инфинитив, к которому окончания добавляются прямо ' +
          'в конец, ничего не отбрасывая.',
      },
      {
        table: { verbId: 'hablar', tense: 'futuro', caption: 'futuro: hablar + окончание' },
      },
      {
        body:
          'Окончания одни и те же для всех трёх спряжений: -é, -ás, -á, -emos, -éis, -án. ' +
          'Никакой разницы между -ar, -er и -ir здесь нет.',
      },
      {
        heading: 'Condicional',
        body:
          'Условное наклонение строится от той же основы, но с окончаниями -ía, -ías, -ía, -íamos, ' +
          '-íais, -ían. Они совпадают с imperfecto глаголов на -er и -ir — только приклеиваются ' +
          'к полному инфинитиву, а не к корню.',
        table: { verbId: 'hablar', tense: 'condicional', caption: 'condicional: hablaría' },
      },
    ],
    practice: { tenses: ['futuro', 'condicional'], verbIds: REGULAR_SAMPLE },
  },
  {
    id: 'futuro-irregular',
    block: 'futuro',
    title: 'Неправильные основы будущего',
    summary: 'tendré, saldré, diré — двенадцать глаголов',
    sections: [
      {
        body:
          'Исключений здесь всего около двенадцати, и они одни и те же для futuro и condicional: ' +
          'выучив tendré, вы автоматически знаете tendría.',
      },
      {
        heading: 'Выпадает гласная',
        bullets: [
          'poder → podr-',
          'saber → sabr-',
          'querer → querr-',
          'haber → habr-',
          'caber → cabr-',
        ],
      },
      {
        heading: 'Появляется d',
        bullets: [
          'tener → tendr-',
          'poner → pondr-',
          'salir → saldr-',
          'venir → vendr-',
          'valer → valdr-',
        ],
      },
      {
        heading: 'Совсем короткие',
        body: 'decir → dir- и hacer → har-. Это самые сильные сокращения в группе.',
        table: { verbId: 'tener', tense: 'futuro', caption: 'tener — иметь' },
      },
      {
        body:
          'Обратите внимание: окончания при этом остаются абсолютно правильными. Меняется только ' +
          'то, к чему они присоединяются.',
      },
    ],
    practice: {
      tenses: ['futuro', 'condicional'],
      types: ['d future', 'drop vowel future'],
      limit: 40,
      featured: ['tener', 'poder', 'saber', 'salir', 'venir', 'decir'],
    },
  },

  {
    id: 'probabilidad',
    block: 'futuro',
    title: 'Догадка и предположение',
    summary: 'Serán las tres — «наверное, три часа»',
    sections: [
      {
        body:
          'У будущего и условного есть второе, очень разговорное употребление, никак ' +
          'не связанное со временем: ими выражают предположение. По-русски это «наверное», ' +
          '«должно быть», «пожалуй».',
      },
      {
        heading: 'Futuro — догадка о настоящем',
        body:
          '¿Qué hora es? — Serán las tres. «Часа три, наверное». ¿Dónde está Juan? — ' +
          'Estará en casa. Речь не о будущем: говорящий предполагает про сейчас.',
        table: { verbId: 'ser', tense: 'futuro', caption: 'serán — «наверное, столько»' },
      },
      {
        heading: 'Condicional — догадка о прошлом',
        body:
          'Estaría cansado — «он, наверное, устал» (тогда). Serían las tres cuando llegó — ' +
          '«было часа три, когда он пришёл».',
        table: { verbId: 'estar', tense: 'condicional', caption: 'estaría — «наверное, был»' },
      },
      {
        heading: 'Составные — то же самое, но о завершённом',
        bullets: [
          'Habrá salido ya — «наверное, уже вышел»',
          'Habría salido antes — «наверное, вышел раньше»',
        ],
      },
      {
        body:
          'Понять, о чём речь, помогает контекст: если рядом нет указания на будущее, ' +
          'а вопрос про «сейчас» — перед вами предположение, а не прогноз.',
      },
    ],
    practice: {
      tenses: ['futuro', 'condicional'],
      verbIds: ['ser', 'estar', 'tener', 'ir', 'hacer', 'salir', 'venir', 'saber'],
      featured: ['ser', 'estar', 'tener', 'ir', 'hacer', 'salir'],
    },
  },

  // ── Составные времена ────────────────────────────────────────────────────
  {
    id: 'participio-perfecto',
    block: 'compuestos',
    title: 'Причастие и pretérito perfecto',
    summary: 'he hablado — основа всех составных времён',
    sections: [
      {
        body:
          'Все девять составных времён устроены одинаково: вспомогательный глагол haber ' +
          'плюс причастие. Меняется только форма haber — причастие остаётся неизменным всегда.',
      },
      {
        heading: 'Причастие',
        body:
          'Образуется просто: -ar → -ado, -er и -ir → -ido. Hablar → hablado, comer → comido, ' +
          'vivir → vivido.',
      },
      {
        heading: 'Pretérito perfecto',
        body:
          'Настоящее время haber (he, has, ha, hemos, habéis, han) плюс причастие. ' +
          'Описывает прошедшее, связанное с настоящим: «сегодня я уже поел», «я никогда там не был».',
        table: { verbId: 'hablar', tense: 'perfecto', caption: 'hablar — говорить' },
      },
      {
        heading: 'Неправильные причастия',
        bullets: [
          'hacer → hecho, decir → dicho',
          'ver → visto, poner → puesto',
          'escribir → escrito, abrir → abierto',
          'volver → vuelto, morir → muerto, romper → roto',
        ],
      },
      {
        body:
          'Приставочные глаголы наследуют причастие корневого: componer → compuesto, ' +
          'describir → descrito, devolver → devuelto. Отдельно их запоминать не нужно.',
        table: { verbId: 'hacer', tense: 'perfecto', caption: 'hacer — делать' },
      },
    ],
    practice: {
      tenses: ['perfecto'],
      // Причастие спрашивается и отдельно: внутри perfecto оно всегда идёт
      // с haber, и неправильные формы (hecho, dicho, visto, escrito) легко
      // выучить как часть связки, ни разу не назвав саму форму.
      forms: ['participio'],
      verbIds: [...REGULAR_SAMPLE, 'hacer', 'decir', 'ver', 'escribir'],
    },
  },
  {
    id: 'compuestos-resto',
    block: 'compuestos',
    title: 'Остальные составные',
    summary: 'había hablado, habré hablado, habría hablado',
    sections: [
      {
        body:
          'Освоив схему «haber + причастие», вы получаете сразу все составные времена. ' +
          'Причастие не меняется — достаточно поставить haber в нужное время.',
      },
      {
        heading: 'Pluscuamperfecto',
        body:
          'Imperfecto глагола haber плюс причастие: «к тому моменту уже сделал». ' +
          'Cuando llegué, ya habían cenado — «когда я пришёл, они уже поужинали».',
        table: { verbId: 'hablar', tense: 'pluscuamperfecto', caption: 'había hablado' },
      },
      {
        heading: 'Futuro perfecto',
        body:
          'Habré hablado — «к тому времени уже поговорю». Второе, более частое значение — ' +
          'предположение о прошлом: Ya habrá llegado — «наверное, он уже приехал».',
        table: { verbId: 'hablar', tense: 'futuroPerfecto', caption: 'habré hablado' },
      },
      {
        heading: 'Condicional perfecto',
        body:
          'Habría hablado — «поговорил бы». Чаще всего встречается во второй части условных ' +
          'предложений о несбывшемся прошлом, к которым мы придём в блоке о сослагательном.',
        table: { verbId: 'hablar', tense: 'condicionalPerfecto', caption: 'habría hablado' },
      },
      {
        heading: 'Pretérito anterior',
        body:
          'Hube hablado существует, но в живой речи почти не встречается — только в книжном ' +
          'повествовании после apenas, en cuanto, cuando. Знать его полезно для чтения, ' +
          'использовать в разговоре не нужно.',
      },
    ],
    practice: {
      tenses: ['pluscuamperfecto', 'futuroPerfecto', 'condicionalPerfecto'],
      verbIds: [...REGULAR_SAMPLE, 'hacer', 'ver'],
    },
  },

  {
    id: 'perfecto-vs-indefinido',
    block: 'compuestos',
    title: 'Perfecto или indefinido',
    summary: 'he comido или comí',
    sections: [
      {
        body:
          'Оба времени переводятся русским прошедшим и оба означают законченное действие. ' +
          'Разница — в том, закончился ли период, о котором вы говорите.',
      },
      {
        heading: 'Perfecto — период ещё длится',
        body:
          'Сегодня, на этой неделе, в этом году, за всю жизнь. Hoy he trabajado mucho. ' +
          'Este año hemos viajado dos veces. Момент говорения входит в этот отрезок.',
        table: { verbId: 'hablar', tense: 'perfecto', caption: 'he hablado' },
      },
      {
        heading: 'Indefinido — период закрыт',
        body:
          'Вчера, на прошлой неделе, в 2020 году. Ayer trabajé mucho. En 2020 viajamos a Perú. ' +
          'Отрезок остался в прошлом целиком.',
        table: { verbId: 'hablar', tense: 'preteriteIndef', caption: 'hablé' },
      },
      {
        heading: 'Слова-подсказки',
        bullets: [
          'Perfecto: hoy, esta mañana, esta semana, este mes, ya, todavía no, alguna vez, nunca',
          'Indefinido: ayer, anoche, la semana pasada, hace un año, en 2020, aquel día',
        ],
      },
      {
        heading: 'Важная оговорка про регионы',
        body:
          'Распределение сильно зависит от региона. Во многих районах Испании связь с текущим ' +
          'отрезком действительно подталкивает к perfecto; во многих американских вариантах ' +
          'чаще выбирают indefinido. Но и в Испании, и в Америке есть свои зоны и контексты ' +
          'с иным распределением — hoy trabajé само по себе не ошибка.',
      },
    ],
    practice: {
      tenses: ['perfecto', 'preteriteIndef'],
      verbIds: [...REGULAR_SAMPLE, 'hacer', 'decir', 'ver', 'ir', 'tener', 'estar'],
      featured: ['hablar', 'comer', 'hacer', 'decir', 'ver', 'tener'],
    },
  },
  {
    id: 'estilo-indirecto',
    block: 'compuestos',
    title: 'Косвенная речь',
    summary: 'Dijo que venía — согласование времён',
    sections: [
      {
        body:
          'Когда чужие слова пересказывают в прошедшем, времена внутри придаточного сдвигаются ' +
          'на шаг назад. Это и есть то, ради чего нужны имперфект, плюсквамперфект и кондисионал ' +
          'одновременно.',
      },
      {
        heading: 'Как сдвигаются времена',
        bullets: [
          '«Vengo» → Dijo que venía (настоящее → имперфект)',
          '«Vine» / «He venido» → Dijo que había venido (прошедшее → плюсквамперфект)',
          '«Vendré» → Dijo que vendría (будущее → кондисионал)',
          '«Ven» → Me dijo que viniera (императив → сослагательное прошедшее)',
        ],
      },
      {
        table: { verbId: 'venir', tense: 'preteriteImp', caption: 'настоящее уходит в имперфект' },
      },
      {
        table: { verbId: 'venir', tense: 'condicional', caption: 'будущее уходит в кондисионал' },
      },
      {
        heading: 'Когда сдвигать не нужно',
        body:
          'Если сказанное верно и сейчас, презенс можно оставить: Dijo que vive en Madrid — ' +
          'он и правда там живёт. Выбор зависит от временной точки зрения говорящего и актуальности ' +
          'сообщения: при вводящем глаголе в прошедшем сдвиг типичен, но не выполняется вслепую.',
      },
      {
        body:
          'Обратите внимание: imperfecto и condicional при таком сдвиге не означают ни ' +
          'привычки, ни условия. Они просто занимают место настоящего и будущего.',
      },
    ],
    practice: {
      tenses: ['preteriteImp', 'pluscuamperfecto', 'condicional'],
      verbIds: ['venir', 'ir', 'ser', 'estar', 'tener', 'hacer', 'decir', 'hablar', 'comer', 'vivir'],
      featured: ['venir', 'decir', 'ir', 'ser', 'tener', 'hacer'],
    },
  },
  {
    id: 'pasiva',
    block: 'compuestos',
    title: 'Пассив',
    summary: 'ser + причастие и оборот с se',
    sections: [
      {
        body:
          'Причастие нужно не только для составных времён. Вместе с ser оно образует ' +
          'страдательный залог: La casa fue construida en 1920 — «дом был построен в 1920».',
        table: { verbId: 'ser', tense: 'preteriteIndef', caption: 'ser — спрягается он' },
      },
      {
        heading: 'Причастие здесь согласуется',
        body:
          'И это главное отличие от составных времён. После haber причастие неизменно ' +
          '(ha construido), а в пассиве оно меняется по роду и числу вместе с подлежащим: ' +
          'el libro fue escrito, la carta fue escrita, los libros fueron escritos.',
      },
      {
        body: 'Исполнитель действия вводится предлогом por: La novela fue escrita por Cervantes.',
      },
      {
        heading: 'В речи чаще другое',
        body:
          'Пассив с ser обычен в официальной речи и там, где важно само событие или исполнитель. ' +
          'Во многих других случаях испанский предпочитает активную конструкцию или оборот с se: ' +
          'Se venden casas — «продаются дома», Aquí se habla español — «здесь говорят ' +
          'по-испански». При пассивном se глагол согласуется с предметом: se vende una casa, ' +
          'se venden casas.',
      },
      {
        heading: 'Estar + причастие — это не пассив',
        body:
          'Сравните: La puerta fue cerrada — «дверь закрыли» (действие). La puerta está cerrada — ' +
          '«дверь закрыта» (результат, состояние). Первое сообщает о событии, второе описывает вид.',
        table: { verbId: 'estar', tense: 'presente', caption: 'estar + причастие — результат' },
      },
    ],
    practice: {
      tenses: ['preteriteIndef', 'presente', 'perfecto', 'preteriteImp'],
      verbIds: ['ser', 'estar', 'construir', 'escribir', 'abrir', 'hacer', 'vender', 'publicar'],
      featured: ['ser', 'estar', 'escribir', 'abrir', 'hacer', 'construir'],
    },
  },

  // ── Сослагательное наклонение ────────────────────────────────────────────
  {
    id: 'subjuntivo-formacion',
    block: 'subjuntivo',
    title: 'Presente de subjuntivo: образование',
    summary: 'Всё начинается с формы «yo»',
    sections: [
      {
        body:
          'Сослагательное наклонение пугает больше, чем заслуживает. Образуется оно механически, ' +
          'из формы, которую вы уже знаете.',
      },
      {
        heading: 'Три шага',
        bullets: [
          'Возьмите глагол в первом лице настоящего времени: hablo, como, tengo',
          'Уберите конечную -o: habl-, com-, teng-',
          'Добавьте «противоположную» гласную: у -ar это -e, у -er и -ir это -a',
        ],
      },
      {
        table: { verbId: 'hablar', tense: 'subjuntivo', caption: 'hablar → hable' },
      },
      {
        heading: 'Зачем нужен был шаг с «yo»',
        body:
          'Именно поэтому в прошлом уроке мы отдельно разбирали неправильное первое лицо. ' +
          'Вся его неправильность автоматически переходит в сослагательное: tengo даёт tenga, ' +
          'hago даёт haga, conozco даёт conozca — во всех шести формах.',
        table: { verbId: 'tener', tense: 'subjuntivo', caption: 'tengo → tenga' },
      },
      {
        heading: 'Шесть настоящих исключений',
        body:
          'Только у них форма yo не подходит, потому что не кончается на -o: ser → sea, ir → vaya, ' +
          'saber → sepa, haber → haya, estar → esté, dar → dé. Шесть глаголов на весь язык.',
      },
    ],
    practice: {
      tenses: ['subjuntivo'],
      verbIds: [...REGULAR_SAMPLE, 'tener', 'hacer', 'conocer', 'ser', 'ir', 'saber', 'estar', 'dar'],
    },
  },
  {
    id: 'subjuntivo-cambios',
    block: 'subjuntivo',
    title: 'Чередования в сослагательном',
    summary: 'sintamos, durmamos, pidamos',
    sections: [
      {
        body:
          'Правило «взять форму yo» переносит в сослагательное и чередование корня. ' +
          'Но у глаголов на -ir есть добавочное изменение, которого в настоящем времени нет.',
      },
      {
        heading: 'Глаголы на -ar и -er: обычный ботинок',
        body:
          'Чередование идёт там же, где в настоящем, а nosotros и vosotros остаются с исходной ' +
          'гласной: pienso → piense, pienses… но pensemos, penséis.',
        table: { verbId: 'pensar', tense: 'subjuntivo', caption: 'pensar — ботинок сохраняется' },
      },
      {
        body:
          'Так же ведут себя poder и querer: podamos, queramos — без ue и ie. ' +
          'Это частая ошибка: «puedamos» не существует.',
        table: { verbId: 'poder', tense: 'subjuntivo', caption: 'podamos, а не «puedamos»' },
      },
      {
        heading: 'Глаголы на -ir: меняются и nosotros с vosotros',
        body:
          'Здесь ботинок ломается. Там, где -ar и -er возвращают исходную гласную, -ir подставляет ' +
          'ту же, что в третьем лице индефинидо: e → i, o → u.',
        table: { verbId: 'sentir', tense: 'subjuntivo', caption: 'sentir → sintamos, sintáis' },
      },
      {
        table: { verbId: 'dormir', tense: 'subjuntivo', caption: 'dormir → durmamos, durmáis' },
        body:
          'У глаголов с чередованием e → i изменение идёт во всех шести формах сразу: ' +
          'pedir даёт pida, pidas, pida, pidamos, pidáis, pidan — ломаться там уже нечему.',
      },
      {
        heading: 'Как это запомнить',
        body:
          'Сравните два ряда: podamos и queramos против sintamos и durmamos. Разница только ' +
          'в спряжении инфинитива — -er против -ir. Если глагол на -ir и в настоящем у него ' +
          'чередование, оно достанет и nosotros с vosotros.',
      },
    ],
    practice: {
      tenses: ['subjuntivo'],
      verbIds: ['sentir', 'dormir', 'pedir', 'morir', 'seguir', 'poder', 'querer', 'pensar', 'volver', 'servir', 'preferir', 'repetir'],
      featured: ['sentir', 'dormir', 'pedir', 'poder', 'querer', 'morir'],
    },
  },
  {
    id: 'subjuntivo-uso',
    block: 'subjuntivo',
    title: 'Когда нужен subjuntivo',
    summary: 'Не факт, а отношение к факту',
    sections: [
      {
        body:
          'Индикатив сообщает о том, что есть. Сослагательное — о том, чего человек хочет, боится, ' +
          'в чём сомневается или что оценивает. Разница не во времени, а в модальности.',
      },
      {
        heading: 'Желание и воля',
        body:
          'Quiero que vengas — «хочу, чтобы ты пришёл». Обратите внимание: в русском тоже появляется ' +
          '«бы». Сюда же espero que, prefiero que, es necesario que.',
      },
      {
        heading: 'Эмоция и оценка',
        body:
          'Me alegra que estés aquí — «рад, что ты здесь». Факт очевиден, но говорящий не сообщает его, ' +
          'а реагирует на него. Es importante que estudies, es una pena que no puedas.',
      },
      {
        heading: 'Сомнение и отрицание',
        body:
          'No creo que sea verdad — «не думаю, что это правда». Показательно, что утвердительное ' +
          'creo que es verdad требует индикатива: уверенность возвращает обычную форму.',
      },
      {
        heading: 'После некоторых союзов',
        bullets: [
          'Всегда: para que, antes de que, sin que, a menos que',
          'При отсылке к будущему: cuando, hasta que, en cuanto (Cuando llegues, llámame)',
          'Aunque — по смыслу: с фактом индикатив, с уступкой сослагательное',
        ],
      },
    ],
    practice: {
      tenses: ['subjuntivo'],
      verbIds: ['ser', 'estar', 'tener', 'ir', 'poder', 'saber', 'venir', 'hacer', 'querer', 'hablar'],
    },
  },
  {
    id: 'subjuntivo-imperfecto',
    block: 'subjuntivo',
    title: 'Imperfecto de subjuntivo',
    summary: 'Две равноправные формы: -ra и -se',
    sections: [
      {
        body:
          'Прошедшее сослагательное образуется от неожиданной основы — от третьего лица ' +
          'множественного числа индефинидо.',
      },
      {
        heading: 'Три шага',
        bullets: [
          'Возьмите форму ellos в индефинидо: hablaron, comieron, tuvieron',
          'Уберите -ron: habla-, comie-, tuvie-',
          'Добавьте -ra, -ras, -ra, -ramos, -rais, -ran',
        ],
      },
      {
        table: { verbId: 'hablar', tense: 'subjImperfectoRa', caption: 'hablaron → hablara' },
      },
      {
        heading: 'Почему это удобно',
        body:
          'Любая неправильность индефинидо переходит сюда сама собой. Tuvieron даёт tuviera, ' +
          'dijeron даёт dijera, fueron даёт fuera. Отдельного списка исключений просто нет — ' +
          'достаточно знать индефинидо.',
        table: { verbId: 'tener', tense: 'subjImperfectoRa', caption: 'tuvieron → tuviera' },
      },
      {
        heading: 'Форма на -se',
        body:
          'В сослагательных контекстах есть второй нормативный вариант: hablase, hablases, hablase… ' +
          'Обычно он передаёт то же значение, а выбор зависит от стиля и региона; вариант на -ra ' +
          'значительно чаще. У -ra есть и отдельные употребления вне этой пары, поэтому формы не ' +
          'взаимозаменяемы буквально везде. В приложении обе даны отдельными вкладками.',
        table: { verbId: 'hablar', tense: 'subjImperfectoSe', caption: 'вариант на -se' },
      },
    ],
    practice: {
      tenses: ['subjImperfectoRa', 'subjImperfectoSe'],
      verbIds: [...REGULAR_SAMPLE, 'tener', 'decir', 'ser', 'ir', 'hacer', 'poder'],
    },
  },
  {
    id: 'subjuntivo-compuestos',
    block: 'subjuntivo',
    title: 'Составные сослагательного',
    summary: 'haya hablado, hubiera hablado',
    sections: [
      {
        body:
          'Схема та же, что и в индикативе: haber плюс причастие. Разница только в том, ' +
          'что сам haber ставится в сослагательное наклонение.',
      },
      {
        heading: 'Pretérito perfecto de subjuntivo',
        body:
          'Presente de subjuntivo глагола haber (haya, hayas, haya, hayamos, hayáis, hayan) ' +
          'плюс причастие. Нужен там же, где обычный perfecto, но в придаточном после выражений ' +
          'эмоции или сомнения: Me alegro de que hayas venido — «рад, что ты пришёл».',
        table: { verbId: 'hablar', tense: 'subjPerfecto', caption: 'haya hablado' },
      },
      {
        heading: 'Pluscuamperfecto de subjuntivo',
        body:
          'Imperfecto de subjuntivo глагола haber плюс причастие. Как и у простого имперфекта, ' +
          'здесь две равноправные формы — на -ra и на -se.',
        table: { verbId: 'hablar', tense: 'subjPluscuamRa', caption: 'hubiera hablado' },
      },
      {
        table: { verbId: 'hablar', tense: 'subjPluscuamSe', caption: 'hubiese hablado — вариант на -se' },
        body:
          'Эта форма, в частности, нужна в условных предложениях о несбывшемся прошлом, ' +
          'к которым мы перейдём в следующем уроке.',
      },
      {
        heading: 'Проверьте себя на неправильных',
        body:
          'Неправильность живёт только в причастии — haber уже неправильный сам по себе и всегда ' +
          'одинаков. Hubiera hecho, hubiera dicho, hubiera visto: меняется вторая часть, не первая.',
        table: { verbId: 'hacer', tense: 'subjPluscuamRa', caption: 'hubiera hecho' },
      },
    ],
    practice: {
      tenses: ['subjPerfecto', 'subjPluscuamRa', 'subjPluscuamSe'],
      verbIds: [...REGULAR_SAMPLE, 'hacer', 'decir', 'ver', 'escribir', 'volver'],
    },
  },
  {
    id: 'condicionales',
    block: 'subjuntivo',
    title: 'Условные предложения',
    summary: 'Si tuviera dinero, viajaría',
    sections: [
      {
        body:
          'Здесь сослагательное наклонение и условное время работают в паре. Конструкция зависит ' +
          'от того, насколько условие реально.',
      },
      {
        heading: 'Реальное условие',
        body:
          'Обычный индикатив, никакого сослагательного: Si tengo tiempo, voy contigo — ' +
          '«если будет время, пойду с тобой». Речь о том, что вполне может случиться.',
      },
      {
        heading: 'Маловероятное или нереальное',
        body:
          'Si + imperfecto de subjuntivo, а во второй части — condicional. ' +
          'Si tuviera dinero, viajaría a España — «если бы у меня были деньги, я бы поехал». ' +
          'Условие представлено как гипотетическое или отдалённое; фраза сама по себе не доказывает, ' +
          'что денег сейчас точно нет и поездка невозможна.',
      },
      {
        heading: 'Упущенное в прошлом',
        body:
          'Si + pluscuamperfecto de subjuntivo и condicional perfecto. ' +
          'Si hubiera sabido, habría venido — «если бы я знал, я бы пришёл». Не знал и не пришёл.',
      },
      {
        heading: 'Правило для современной обычной речи',
        body:
          'После условного si не ставят presente de subjuntivo: si tengas — ошибка. Обычно нужен ' +
          'индикатив или прошедшее сослагательное. Формы будущего subjuntivo вроде si fuere ' +
          'сохраняются в старых текстах и юридическом языке.',
      },
    ],
    practice: {
      tenses: ['subjImperfectoRa', 'condicional', 'subjPluscuamRa', 'condicionalPerfecto'],
      verbIds: ['tener', 'saber', 'poder', 'ser', 'estar', 'ir', 'hacer', 'venir', 'hablar', 'vivir'],
    },
  },

  // ── Повелительное наклонение ─────────────────────────────────────────────
  {
    id: 'imperativo-afirmativo',
    block: 'imperativo',
    title: 'Императив утвердительный',
    summary: 'habla, hable, hablemos, hablad, hablen',
    sections: [
      {
        body:
          'Повелительное наклонение — единственное, где нет формы «я»: приказать самому себе нельзя. ' +
          'Остальные пять форм собираются из того, что вы уже знаете.',
      },
      {
        heading: 'Откуда берётся каждая форма',
        bullets: [
          'tú — третье лицо единственного числа настоящего времени: habla, come, vive',
          'usted, ustedes, nosotros — из сослагательного: hable, hablen, hablemos',
          'vosotros — инфинитив, где -r заменяется на -d: hablad, comed, vivid',
        ],
      },
      {
        table: { verbId: 'hablar', tense: 'imperativoAfirmativo', caption: 'hablar — говори' },
      },
      {
        heading: 'Восемь коротких исключений',
        body:
          'Только у формы tú есть настоящие исключения, и все они односложные: ' +
          'decir → di, hacer → haz, ir → ve, poner → pon, salir → sal, ser → sé, tener → ten, venir → ven.',
        table: { verbId: 'tener', tense: 'imperativoAfirmativo', caption: 'tener — имей' },
      },
      {
        body:
          'Приставочные наследуют их с ударением: componer → compón, detener → detén, prevenir → prevén. ' +
          'Основная модель vosotros очень регулярна; отдельные особенности появляются, например, ' +
          'при присоединении возвратного местоимения.',
      },
      {
        heading: 'Про vosotros и ustedes',
        body:
          'В Испании командуют через vosotros: abrid las ventanas. В Латинской Америке эта форма ' +
          'в современной повседневной речи обычно уступает ustedes: abran las ventanas. ' +
          'Строка ustedes в таблице совпадает с ellos; vosotros всё же можно встретить в ' +
          'исторических, религиозных и некоторых локальных контекстах.',
      },
      {
        heading: 'Форма nosotros и vamos a',
        body:
          'Форма nosotros совершенно обычна: hablemos — «давайте поговорим», no discutamos — ' +
          '«давайте не спорить». Конструкция vamos a + инфинитив тоже употребительна, но выражает ' +
          'совместный план или побуждение и не всегда равна императиву: vamos a cantar, vamos a comer. ' +
          'У глагола ir в утвердительном призыве обычно говорят vamos.',
      },
    ],
    practice: {
      tenses: ['imperativoAfirmativo'],
      verbIds: [...REGULAR_SAMPLE, 'tener', 'hacer', 'decir', 'ir', 'poner', 'salir', 'ser', 'venir'],
    },
  },
  {
    id: 'imperativo-negativo',
    block: 'imperativo',
    title: 'Императив отрицательный',
    summary: 'no hables — здесь всё из сослагательного',
    sections: [
      {
        body:
          'Отрицательный императив проще утвердительного: у него нет ни одного исключения. ' +
          'Все формы без остатка берутся из presente de subjuntivo, к которому спереди ставится no.',
      },
      {
        table: { verbId: 'hablar', tense: 'imperativoNegativo', caption: 'no hables' },
      },
      {
        heading: 'Главная ловушка',
        body:
          'Форма tú в утвердительном и отрицательном императиве — разная. Habla, но no hables. ' +
          'Ven, но no vengas. Sal, но no salgas. Отрицание не просто добавляется к команде: ' +
          'вся форма меняется на сослагательную.',
        table: { verbId: 'tener', tense: 'imperativoNegativo', caption: 'no tengas' },
      },
      {
        body:
          'Зато исключений здесь нет вовсе: di превращается в no digas, haz — в no hagas, ' +
          've — в no vayas, строго по общему правилу.',
      },
    ],
    practice: {
      tenses: ['imperativoNegativo', 'imperativoAfirmativo'],
      verbIds: [...REGULAR_SAMPLE, 'tener', 'hacer', 'decir', 'ir', 'poner', 'salir', 'venir'],
    },
  },
  {
    id: 'voseo',
    block: 'imperativo',
    title: 'Voseo: формы vos',
    summary: 'vos hablás, hablá — Аргентина и Центральная Америка',
    sections: [
      {
        body:
          'В Аргентине, Уругвае, Парагвае и большей части Центральной Америки вместо tú говорят ' +
          'vos. Это не просторечие, а норма для десятков миллионов носителей, и глагол при vos ' +
          'может получать особые формы. Ниже дана прежде всего распространённая риоплатская модель; ' +
          'в других регионах системы voseo заметно различаются.',
      },
      {
        heading: 'Настоящее время',
        bullets: [
          '-ar: vos hablás (вместо hablas) — ударение уходит на окончание',
          '-er: vos comés (вместо comes)',
          '-ir: vos vivís (совпадает с формой vosotros)',
          'ser: vos sos — единственное по-настоящему особое',
        ],
      },
      {
        body:
          'Главное следствие ударения: чередования корня исчезают. Tú puedes, но vos podés. ' +
          'Tú quieres, но vos querés. Tú duermes, но vos dormís. Ударение на окончании — ' +
          'корень его не получает и не меняется.',
        table: { verbId: 'poder', tense: 'presente', caption: 'tú puedes · vos podés' },
      },
      {
        heading: 'Утвердительный императив',
        bullets: [
          'Инфинитив без -r, ударение на последнем слоге: hablá, comé, viví',
          'Никаких исключений: decir → decí, poner → poné, tener → tené, venir → vení',
          'Сравните с tú: di, pon, ten, ven — там коротко, здесь наоборот',
          'Единственное особое: ir → andá (от andar)',
        ],
        table: { verbId: 'decir', tense: 'imperativoAfirmativo', caption: 'tú: di · vos: decí' },
      },
      {
        heading: 'Всё остальное — как у tú',
        body:
          'В нормативной риоплатской модели прошедшее, будущее, условное и многие формы ' +
          'сослагательного совпадают с tú: vos hablabas, vos hablarás, no hables. В других ' +
          'регионах встречаются формы вроде hablés и отличия в прошедшем; это не единая система ' +
          'для всей Латинской Америки.',
      },
      {
        heading: 'Чего нет в приложении',
        body:
          'Таблицы и тесты построены на шести лицах без vos, поэтому его формы здесь только ' +
          'в тексте урока. Тренировка ниже прогоняет формы tú и императив тех же глаголов — ' +
          'именно с ними vos и стоит сравнивать.',
      },
    ],
    practice: {
      tenses: ['presente', 'imperativoAfirmativo'],
      verbIds: ['hablar', 'comer', 'vivir', 'poder', 'querer', 'dormir', 'decir', 'poner', 'tener', 'venir', 'ser', 'ir'],
      featured: ['hablar', 'comer', 'vivir', 'decir', 'tener', 'venir'],
    },
  },

  // ── Книжные времена ──────────────────────────────────────────────────────
  {
    id: 'tiempos-literarios',
    block: 'literario',
    title: 'Три редких времени',
    summary: 'hube hablado, hablare, hubiere hablado',
    sections: [
      {
        body:
          'В приложении есть все двадцать времён, и три из них вы почти не встретите в разговоре. ' +
          'Их стоит уметь узнавать при чтении, но не нужно заставлять себя употреблять.',
      },
      {
        heading: 'Pretérito anterior',
        body:
          'Indefinido глагола haber плюс причастие. Означает действие, случившееся ' +
          'непосредственно перед другим прошедшим, и появляется только после apenas, en cuanto, ' +
          'cuando, después de que в книжном повествовании: Apenas hubo terminado, se marchó. ' +
          'В живой речи вместо него говорят обычное индефинидо: apenas terminó, se marchó.',
        table: { verbId: 'hablar', tense: 'anterior', caption: 'hube hablado' },
      },
      {
        heading: 'Futuro de subjuntivo',
        body:
          'Образуется от той же основы, что и imperfecto de subjuntivo — третье лицо ' +
          'множественного числа индефинидо без -ron, — но с окончаниями -re, -res, -re, -remos, ' +
          '-reis, -ren. Hablaron даёт hablare.',
        table: { verbId: 'hablar', tense: 'subjFuturo', caption: 'hablare' },
      },
      {
        body:
          'Живёт оно в двух местах: в юридическом языке («el que infringiere esta norma…») ' +
          'и в застывших поговорках. Их полезно знать целиком: sea lo que fuere — «будь что будет», ' +
          'adonde fueres, haz lo que vieres — «в чужой монастырь со своим уставом не ходят». ' +
          'В обычной речи вместо него давно используется presente de subjuntivo.',
      },
      {
        heading: 'Futuro perfecto de subjuntivo',
        body:
          'Самое редкое время языка: hubiere плюс причастие. Встречается почти исключительно ' +
          'в текстах законов и договоров. Достаточно узнавать его в лицо.',
        table: { verbId: 'hablar', tense: 'subjFuturoPerfecto', caption: 'hubiere hablado' },
      },
      {
        heading: 'Что с этим делать',
        body:
          'Прогоните тренировку пару раз, чтобы формы перестали выглядеть незнакомыми, ' +
          'и возвращайтесь к ним, когда встретите в тексте. Тратить на них силы наравне ' +
          'с индефинидо или сослагательным настоящим смысла нет.',
      },
    ],
    practice: {
      tenses: ['anterior', 'subjFuturo', 'subjFuturoPerfecto'],
      verbIds: [...REGULAR_SAMPLE, 'ser', 'ir', 'ver', 'hacer', 'tener'],
      featured: ['ser', 'ir', 'ver', 'hacer', 'tener', 'hablar'],
    },
  },
];

const LESSON_BY_ID = new Map(LESSONS.map(lesson => [lesson.id, lesson]));

export function getLessonById(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function lessonsByBlock(block: LessonBlock): Lesson[] {
  return LESSONS.filter(lesson => lesson.block === block);
}

/** Глаголы для тренировки по уроку: явный список либо подбор по признакам неправильности. */
export function lessonPracticeVerbIds(lesson: Lesson): string[] {
  const { verbIds, types, limit, featured } = lesson.practice;
  if (verbIds?.length) return verbIds;
  if (!types?.length) return [];

  const matched = VERBS.filter(verb => types.some(type => verb.types.includes(type))).map(
    verb => verb.id,
  );
  // Ключевые глаголы идут первыми и входят в набор всегда — даже если их
  // неправильность размечена своим типом (poder — классический o → ue, но
  // в метаданных у него отдельный признак) или их отсекает limit.
  const keys = (featured ?? []).filter(id => getVerbById(id));
  const ordered = [...keys, ...matched.filter(id => !keys.includes(id))];
  return limit ? ordered.slice(0, Math.max(limit, keys.length)) : ordered;
}

/**
 * Мини-тренировки темы: по одной на каждый ключевой глагол плюс общая по всем.
 * Это подуровни внутри урока — их проходят до зачёта, чтобы набить руку.
 */
export function lessonDrills(lesson: Lesson): LessonDrill[] {
  const all = lessonPracticeVerbIds(lesson);
  const featured = lesson.practice.featured ?? all.slice(0, 6);
  const drills: LessonDrill[] = featured
    .filter(verbId => all.includes(verbId))
    .map(verbId => ({
      key: verbId,
      label: getVerbById(verbId)?.infinitive ?? verbId,
      verbIds: [verbId],
      isAll: false,
    }));

  drills.push({ key: '__all__', label: 'Все глаголы', verbIds: all, isAll: true });
  return drills;
}

/**
 * Сколько форм даёт набор глаголов. У времени шесть лиц, у неличной формы —
 * одна на глагол, поэтому складывать их напрямую нельзя.
 */
export function practiceCombinations(lesson: Lesson, verbCount: number): number {
  const finite = lesson.practice.tenses.length * PERSONS.length;
  const nonFinite = (lesson.practice.forms ?? []).length;
  const periphrastic = (lesson.practice.periphrasis?.tenses.length ?? 0) * PERSONS.length;
  return verbCount * (finite + nonFinite + periphrastic);
}

export function drillSize(lesson: Lesson, drill: LessonDrill): number {
  const combinations = practiceCombinations(lesson, drill.verbIds.length);
  return Math.min(drill.isAll ? EXAM_QUESTIONS : DRILL_QUESTIONS, combinations);
}

/** Сколько вопросов в зачёте: 30 или меньше, если у темы просто нет столько форм. */
export function lessonExamSize(lesson: Lesson): number {
  return Math.min(EXAM_QUESTIONS, practiceCombinations(lesson, lessonPracticeVerbIds(lesson).length));
}

/** Порядок прохождения курса — тот же, в котором уроки объявлены. */
export function lessonIndex(lessonId: string): number {
  return LESSONS.findIndex(lesson => lesson.id === lessonId);
}

export function nextLesson(lessonId: string): Lesson | undefined {
  const index = lessonIndex(lessonId);
  return index < 0 ? undefined : LESSONS[index + 1];
}
