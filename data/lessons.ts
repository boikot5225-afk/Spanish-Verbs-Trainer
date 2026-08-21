import type { Tense } from './types';
import { PERSONS } from './types';
import { getVerbById, VERBS } from './verbs';

/** Зачёт по теме: столько вопросов и не больше стольких ошибок, чтобы открыть следующую. */
export const EXAM_QUESTIONS = 30;
export const EXAM_MAX_MISTAKES = 2;

export type LessonBlock =
  | 'present'
  | 'constructions'
  | 'passe'
  | 'futur'
  | 'composes'
  | 'subjonctif'
  | 'imperatif'
  | 'litteraire';

export const LESSON_BLOCKS: LessonBlock[] = [
  'present',
  'constructions',
  'passe',
  'futur',
  'composes',
  'subjonctif',
  'imperatif',
  'litteraire',
];

export const LESSON_BLOCK_LABELS: Record<LessonBlock, string> = {
  present: 'Настоящее время',
  constructions: 'Глагольные конструкции',
  passe: 'Прошедшее время',
  futur: 'Будущее и условное',
  composes: 'Составные времена',
  subjonctif: 'Сослагательное наклонение',
  imperatif: 'Повелительное наклонение',
  litteraire: 'Книжные времена · для чтения',
};

export interface LessonSection {
  heading?: string;
  body?: string;
  bullets?: string[];
  /** Встроенная таблица спряжения реального глагола из базы. */
  table?: { verbId: string; tense: Tense; caption?: string };
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

export const LESSONS: Lesson[] = [
  // ── Настоящее время ──────────────────────────────────────────────────────
  {
    id: 'present-trois-groupes',
    block: 'present',
    title: 'Три группы глаголов',
    summary: 'Как устроено деление на -er, -ir с -iss- и всё остальное',
    sections: [
      {
        body:
          'Французские глаголы делятся на три группы. Деление не декоративное: от группы ' +
          'зависит, какие окончания глагол получает в настоящем времени и насколько ' +
          'предсказуемо ведёт себя во всех остальных.',
      },
      {
        heading: 'Первая группа: -er',
        body:
          'Первая группа — самая многочисленная и продуктивная. Отбросьте -er, к оставшейся ' +
          'основе добавьте окончания -e, -es, -e, -ons, -ez, -ent. У parler формы je, tu, ' +
          'il/elle и ils/elles звучат одинаково, хотя пишутся по-разному.',
        table: { verbId: 'parler', tense: 'present', caption: 'parler — говорить' },
      },
      {
        heading: 'Вторая группа: -ir с расширением -iss-',
        body:
          'Во множественном числе между основой и окончанием вставляется -iss-. ' +
          'Именно это расширение отличает вторую группу от третьей: глаголы выглядят ' +
          'одинаково в инфинитиве, но расходятся уже в форме nous.',
        table: { verbId: 'finir', tense: 'present', caption: 'finir — заканчивать' },
      },
      {
        heading: 'Третья группа: всё остальное',
        body:
          'Сюда попадают глаголы на -re, на -oir и та часть глаголов на -ir, которая ' +
          'обходится без -iss-. Среди них много самых частотных глаголов языка; удобнее ' +
          'учить не абстрактную «третью группу», а отдельные семейства и образцы.',
        table: { verbId: 'prendre', tense: 'present', caption: 'prendre — брать' },
      },
      {
        heading: 'Подлежащее обычно обязательно',
        body:
          'В обычной личной фразе французский не опускает подлежащее так, как испанский ' +
          'или итальянский: говорят je parle, а не просто «parle». Подлежащим может быть ' +
          'местоимение или существительное. Главные исключения — impératif (Parle !) и ' +
          'неличные формы вроде parler.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['parler', 'travailler', 'aimer', 'finir', 'choisir', 'partir', 'prendre'],
      featured: ['parler', 'finir', 'prendre'],
    },
  },
  {
    id: 'present-g1-cer-ger',
    block: 'present',
    title: 'Глаголы на -cer и -ger',
    summary: 'Смягчение перед a и o: nous commençons, nous mangeons',
    sections: [
      {
        body:
          'Буквы c и g читаются мягко перед e и i, но твёрдо перед a, o, u. Чтобы ' +
          'произношение основы не менялось от формы к форме, орфография подстраивается.',
      },
      {
        heading: '-cer: c переходит в ç',
        body:
          'Перед окончанием на -o- и -a- пишется ç. В настоящем времени это задевает ' +
          'единственную форму — nous, — зато в imparfait и passé simple таких форм больше.',
        table: { verbId: 'commencer', tense: 'present', caption: 'commencer — начинать' },
      },
      {
        heading: '-ger: между g и окончанием вставляется e',
        body: 'Тот же приём другим способом: g остаётся мягким за счёт немой e.',
        table: { verbId: 'manger', tense: 'present', caption: 'manger — есть' },
      },
      {
        bullets: [
          'nous commençons, но vous commencez — перед e смягчение не нужно',
          'nous mangeons, но vous mangez — по той же причине',
          'в imparfait затронуты все формы, кроме nous и vous: je mangeais, mais nous mangions',
        ],
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'commencer',
        'avancer',
        'lancer',
        'placer',
        'manger',
        'changer',
        'nager',
        'partager',
      ],
      featured: ['commencer', 'manger', 'changer'],
    },
  },
  {
    id: 'present-g1-alternance',
    block: 'present',
    title: 'Чередования e → è и удвоение согласной',
    summary: 'acheter → j’achète, appeler → j’appelle',
    sections: [
      {
        body:
          'Часть глаголов первой группы меняет основу перед немыми окончаниями: в ' +
          'единственном числе и в третьем лице множественного. Чередование отражает ' +
          'произношение: j’achète, но nous achetons.',
      },
      {
        heading: 'e → è',
        body:
          'Глаголы вроде acheter, mener, lever, peser ставят гравис: j’achète, mais nous achetons. ' +
          'Чередование доходит и до будущего времени: j’achèterai.',
        table: { verbId: 'acheter', tense: 'present', caption: 'acheter — покупать' },
      },
      {
        heading: 'Удвоение согласной',
        body:
          'В традиционном написании часть глаголов на -eler и -eter удваивает согласную: ' +
          'appeler → j’appelle, jeter → je jette; у других появляется è. Реформа 1990 года ' +
          'разрешила написание с è для многих таких глаголов, но appeler и jeter сохраняют удвоение.',
        table: { verbId: 'appeler', tense: 'present', caption: 'appeler — звать' },
      },
      {
        heading: 'é → è',
        body:
          'Глаголы с é в основе (espérer, préférer, répéter) в настоящем получают è перед ' +
          'немым окончанием: j’espère. В будущем приложение использует традиционное ' +
          'написание j’espérerai; вариант j’espèrerai также допускается реформой 1990 года.',
        table: { verbId: 'espérer', tense: 'present', caption: 'espérer — надеяться' },
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'acheter',
        'lever',
        'mener',
        'peser',
        'appeler',
        'jeter',
        'espérer',
        'préférer',
        'répéter',
      ],
      featured: ['acheter', 'appeler', 'espérer'],
    },
  },
  {
    id: 'present-g1-yer',
    block: 'present',
    title: 'Глаголы на -yer',
    summary: 'nettoyer → je nettoie, но payer → je paye',
    sections: [
      {
        body:
          'Перед немым окончанием y переходит в i. Это касается глаголов на -oyer и -uyer ' +
          'без исключений.',
        table: { verbId: 'nettoyer', tense: 'present', caption: 'nettoyer — чистить' },
      },
      {
        heading: 'Глаголы на -ayer — особый случай',
        body:
          'У них допустимы оба написания: je paye и je paie одинаково правильны. ' +
          'В приложении принят вариант с сохранением y.',
        table: { verbId: 'payer', tense: 'present', caption: 'payer — платить' },
      },
      {
        heading: 'envoyer выбивается',
        body:
          'В настоящем времени envoyer ведёт себя как все на -oyer, но основу будущего ' +
          'берёт супплетивную: j’enverrai, а не «j’envoierai».',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'nettoyer',
        'employer',
        'ennuyer',
        'appuyer',
        'payer',
        'essayer',
        'balayer',
        'envoyer',
      ],
      featured: ['nettoyer', 'payer', 'envoyer'],
    },
  },
  {
    id: 'present-g2',
    block: 'present',
    title: 'Вторая группа',
    summary: 'Расширение -iss- во множественном числе',
    sections: [
      {
        body:
          'Вторая группа в настоящем времени регулярна: единственное число даёт -is, -is, -it, ' +
          'множественное — -issons, -issez, -issent. Редкие орфографические особенности ' +
          'отдельных глаголов не меняют эту схему.',
        table: { verbId: 'finir', tense: 'present', caption: 'finir — заканчивать' },
      },
      {
        heading: 'Как отличить от третьей группы',
        body:
          'Оба типа глаголов оканчиваются на -ir. Проверка одна: поставьте глагол в форму nous. ' +
          'Если появляется -iss- (nous finissons) — вторая группа; если нет (nous partons) — третья.',
      },
      {
        heading: 'Откуда они берутся',
        body:
          'Группа продуктивна: от прилагательных регулярно образуются новые глаголы — ' +
          'rouge → rougir, grand → grandir. Поэтому значение «становиться каким-то» ' +
          'встречается в ней особенно часто.',
        bullets: [
          'choisir — выбирать',
          'réussir — добиваться успеха',
          'réfléchir — размышлять',
          'obéir — подчиняться',
        ],
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['finir', 'choisir', 'réussir', 'remplir', 'grandir', 'obéir', 'réfléchir', 'agir'],
      featured: ['finir', 'choisir', 'réfléchir'],
    },
  },
  {
    id: 'present-g3-ir',
    block: 'present',
    title: 'Третья группа на -ir',
    summary: 'partir, ouvrir, venir — три разных образца',
    sections: [
      {
        body:
          'Глаголы третьей группы на -ir распадаются на несколько семейств. ' +
          'Внутри семейства спряжение предсказуемо, поэтому учить стоит именно образцами.',
      },
      {
        heading: 'Тип partir: теряют согласную',
        body:
          'partir, sortir, dormir, servir, mentir, sentir. В единственном числе последняя ' +
          'согласная основы исчезает: je pars, nous partons.',
        table: { verbId: 'partir', tense: 'present', caption: 'partir — уезжать' },
      },
      {
        heading: 'Тип ouvrir: как первая группа',
        body:
          'ouvrir, offrir, couvrir, souffrir выглядят как глаголы на -ir, но в настоящем ' +
          'времени берут окончания первой группы: j’ouvre, а не «j’ouvris».',
        table: { verbId: 'ouvrir', tense: 'present', caption: 'ouvrir — открывать' },
      },
      {
        heading: 'Тип venir: три основы',
        body:
          'venir и tenir со всеми производными меняют основу трижды: vien-, ven-, vienn-. ' +
          'Ту же схему повторяют devenir, revenir, obtenir, maintenir.',
        table: { verbId: 'venir', tense: 'present', caption: 'venir — приходить' },
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'partir',
        'sortir',
        'dormir',
        'servir',
        'ouvrir',
        'offrir',
        'venir',
        'tenir',
        'courir',
      ],
      featured: ['partir', 'ouvrir', 'venir'],
    },
  },
  {
    id: 'present-etre-avoir',
    block: 'present',
    title: 'Четыре главных глагола',
    summary: 'être, avoir, aller, faire — фундамент всей системы',
    sections: [
      {
        body:
          'Эти четыре глагола нужно знать раньше всех остальных: два из них служат ' +
          'вспомогательными для всех составных времён, а два образуют базовые конструкции.',
      },
      { table: { verbId: 'être', tense: 'present', caption: 'être — быть' } },
      { table: { verbId: 'avoir', tense: 'present', caption: 'avoir — иметь' } },
      {
        heading: 'Формы на -tes',
        body:
          'Три частотные формы нужно запомнить отдельно: vous êtes, vous faites, vous dites. ' +
          'Глагол redire повторяет vous redites, тогда как большинство производных от dire ' +
          'имеют -disez: vous contredisez, vous interdisez.',
        table: { verbId: 'faire', tense: 'present', caption: 'faire — делать' },
      },
      {
        heading: 'aller — единственный неправильный на -er',
        body:
          'По написанию инфинитива aller выглядит как первая группа, но спрягается ' +
          'полностью супплетивно: je vais, nous allons, ils vont.',
        table: { verbId: 'aller', tense: 'present', caption: 'aller — идти' },
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'être',
        'avoir',
        'aller',
        'faire',
        'dire',
        'pouvoir',
        'vouloir',
        'devoir',
        'savoir',
        'voir',
      ],
      featured: ['être', 'avoir', 'aller', 'faire'],
    },
  },

  // ── Глагольные конструкции ───────────────────────────────────────────────
  {
    id: 'constr-futur-proche',
    block: 'constructions',
    title: 'Ближайшее будущее',
    summary: 'aller + инфинитив — самый частый способ говорить о будущем',
    sections: [
      {
        body:
          'В разговорной речи будущее чаще выражается не формой futur simple, а конструкцией ' +
          '«aller в настоящем времени + инфинитив»: je vais partir — «я сейчас уеду».',
        table: {
          verbId: 'aller',
          tense: 'present',
          caption: 'aller — вспомогательный для futur proche',
        },
      },
      {
        heading: 'Чем отличается от futur simple',
        bullets: [
          'futur proche часто показывает намерение, план или событие, связанное с настоящей ситуацией',
          'futur simple нейтрально сообщает о будущем, обещании, прогнозе или результате',
          'дистанция не решает всё: оба варианта встречаются и в близком, и в далёком будущем',
          'в устной речи futur proche очень частотен, но futur simple никуда не исчез',
        ],
      },
      {
        heading: 'Отрицание охватывает aller',
        body:
          'Je ne vais pas partir. Частицы окружают именно спрягаемый глагол, а не инфинитив.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['aller', 'partir', 'manger', 'venir', 'faire', 'voir', 'sortir'],
      featured: ['aller', 'faire', 'venir'],
    },
  },
  {
    id: 'constr-passe-recent',
    block: 'constructions',
    title: 'Недавнее прошедшее',
    summary: 'venir de + инфинитив — «только что»',
    sections: [
      {
        body:
          'Конструкция «venir в настоящем времени + de + инфинитив» означает действие, ' +
          'завершившееся буквально только что: je viens de manger — «я только что поел».',
        table: {
          verbId: 'venir',
          tense: 'present',
          caption: 'venir — вспомогательный для passé récent',
        },
      },
      {
        heading: 'Предлог de обязателен',
        body:
          'Без него конструкция распадается: je viens manger значит «я иду поесть», ' +
          'то есть цель, а не недавнее прошлое.',
      },
      {
        heading: 'В прошедшем — через imparfait',
        body:
          'Чтобы сдвинуть точку отсчёта в прошлое, venir ставится в imparfait: ' +
          'je venais de manger — «я только что поел» на фоне другого прошлого события.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['venir', 'arriver', 'finir', 'partir', 'manger', 'rentrer', 'sortir'],
      featured: ['venir', 'arriver', 'finir'],
    },
  },
  {
    id: 'constr-en-train',
    block: 'constructions',
    title: 'Действие в процессе',
    summary: 'être en train de — французский аналог продолженного времени',
    sections: [
      {
        body:
          'Отдельного продолженного времени во французском нет. Когда нужно подчеркнуть, ' +
          'что действие разворачивается прямо сейчас, используют «être en train de + инфинитив».',
        table: {
          verbId: 'être',
          tense: 'present',
          caption: 'être — вспомогательный для конструкции',
        },
      },
      {
        heading: 'Когда она полезна',
        body:
          'Обычное настоящее время je travaille может означать и «я сейчас работаю», и ' +
          '«я работаю вообще». Être en train de нужна, когда важно специально подчеркнуть ' +
          'процесс; во многих фразах контекста и présent вполне достаточно.',
      },
      {
        heading: 'Действие рассматривается как процесс',
        body:
          'Конструкция естественнее всего с действием, которое можно увидеть в развитии. ' +
          'Даже краткое событие возможно, если говорящий представляет его как процесс; ' +
          'поэтому механического запрета на «мгновенные» глаголы нет.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['être', 'travailler', 'manger', 'lire', 'écrire', 'dormir', 'parler'],
      featured: ['être', 'travailler', 'lire'],
    },
  },
  {
    id: 'constr-modaux',
    block: 'constructions',
    title: 'Модальные глаголы',
    summary: 'pouvoir, vouloir, devoir + инфинитив без предлога',
    sections: [
      {
        body:
          'Три модальных глагола присоединяют инфинитив напрямую, без предлога. ' +
          'Все три относятся к третьей группе и меняют основу.',
      },
      { table: { verbId: 'pouvoir', tense: 'present', caption: 'pouvoir — мочь' } },
      { table: { verbId: 'vouloir', tense: 'present', caption: 'vouloir — хотеть' } },
      { table: { verbId: 'devoir', tense: 'present', caption: 'devoir — быть должным' } },
      {
        heading: 'Окончание -x вместо -s',
        body:
          'pouvoir, vouloir и valoir — единственные глаголы, у которых в первом и втором лице ' +
          'единственного числа пишется -x: je peux, tu veux, je vaux.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['pouvoir', 'vouloir', 'devoir', 'savoir', 'aller', 'faire', 'venir'],
      featured: ['pouvoir', 'vouloir', 'devoir'],
    },
  },
  {
    id: 'constr-il-faut',
    block: 'constructions',
    title: 'Безличные конструкции',
    summary: 'il faut, il pleut — глаголы без подлежащего',
    sections: [
      {
        body:
          'Часть глаголов существует только в третьем лице единственного числа. ' +
          'Подлежащее il у них формальное и ничего не обозначает.',
        table: { verbId: 'falloir', tense: 'present', caption: 'falloir — быть нужным' },
      },
      {
        heading: 'Два способа продолжить il faut',
        bullets: [
          'il faut + инфинитив — общее правило: il faut partir',
          'il faut que + subjonctif — адресное требование: il faut que tu partes',
        ],
      },
      {
        heading: 'Почему именно subjonctif',
        body:
          'После il faut que действие ещё не состоялось — это не факт, а необходимость. ' +
          'Изъявительное наклонение сообщало бы о реальном событии, поэтому язык требует сослагательного.',
        table: { verbId: 'être', tense: 'subjPresent', caption: 'il faut que je sois…' },
      },
    ],
    practice: {
      tenses: ['present', 'subjPresent'],
      verbIds: ['falloir', 'être', 'avoir', 'faire', 'aller', 'partir', 'venir'],
      featured: ['être', 'avoir', 'faire'],
    },
  },
  {
    id: 'constr-savoir-connaitre',
    block: 'constructions',
    title: 'savoir и connaître',
    summary: 'Два глагола «знать» и граница между ними',
    sections: [
      {
        body:
          'Русское «знать» распадается во французском на два глагола, и выбор между ними ' +
          'не стилистический, а смысловой.',
      },
      {
        heading: 'savoir — знать факт или уметь',
        body:
          'Присоединяет придаточное или инфинитив: je sais qu’il est parti, je sais nager. ' +
          'С инфинитивом означает приобретённое умение.',
        table: { verbId: 'savoir', tense: 'present', caption: 'savoir — знать, уметь' },
      },
      {
        heading: 'connaître — быть знакомым',
        body:
          'Обычно присоединяет существительное или местоимение: je connais Paris, je connais ' +
          'cette femme. Для сообщения факта через придаточное с que употребляют savoir, а не connaître.',
        table: { verbId: 'connaître', tense: 'present', caption: 'connaître — быть знакомым' },
      },
      {
        heading: 'Циркумфлекс',
        body:
          'В третьем лице единственного числа перед -t сохраняется крышечка: il connaît. ' +
          'Реформа 1990 года разрешает писать без неё, но традиционное написание остаётся основным.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'savoir',
        'connaître',
        'pouvoir',
        'comprendre',
        'apprendre',
        'reconnaître',
        'paraître',
      ],
      featured: ['savoir', 'connaître', 'reconnaître'],
    },
  },
  {
    id: 'constr-pronominaux',
    block: 'constructions',
    title: 'Местоименные глаголы',
    summary: 'se laver, se lever — глаголы с возвратным местоимением',
    sections: [
      {
        body:
          'Местоименные глаголы всегда идут с местоимением, которое согласуется с подлежащим: ' +
          'me, te, se, nous, vous, se. В словаре они записываются с частицей se.',
        table: { verbId: 'se laver', tense: 'present', caption: 'se laver — мыться' },
      },
      {
        heading: 'Элизия перед гласной',
        body: 'me, te и se теряют гласную: je m’appelle, tu t’habilles, il s’arrête.',
      },
      {
        heading: 'В составных временах — être',
        body:
          'Местоименные глаголы образуют сложные времена с être: elle s’est levée. Но ' +
          'согласование не автоматическое: elle s’est lavé les mains, потому что прямое ' +
          'дополнение les mains стоит после причастия.',
      },
      {
        heading: 'В императиве местоимение уходит вправо',
        body:
          'В утвердительной форме оно ставится после глагола через дефис, причём te ' +
          'превращается в toi: lave-toi, levons-nous, dépêchez-vous.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: [
        'se laver',
        'se lever',
        'se coucher',
        "s'habiller",
        'se promener',
        'se dépêcher',
        "s'appeler",
        'se réveiller',
        'se tromper',
        "s'arrêter",
      ],
      featured: ['se laver', 'se lever', "s'appeler"],
    },
  },

  // ── Прошедшее время ──────────────────────────────────────────────────────
  {
    id: 'passe-compose-avoir',
    block: 'passe',
    title: 'Passé composé с avoir',
    summary: 'Основное прошедшее время разговорной речи',
    sections: [
      {
        body:
          'Passé composé строится из вспомогательного глагола в настоящем времени и ' +
          'причастия прошедшего времени. Подавляющее большинство глаголов берёт avoir.',
        table: { verbId: 'parler', tense: 'passeCompose', caption: 'parler — говорить' },
      },
      {
        heading: 'Как образуется причастие',
        bullets: [
          'первая группа: -er → -é (parlé, mangé)',
          'вторая группа: -ir → -i (fini, choisi)',
          'третья группа: непредсказуемо (pris, fait, vu, dit, écrit)',
        ],
      },
      {
        heading: 'С avoir причастие обычно неизменно',
        body:
          'Если прямого дополнения перед причастием нет, форма не меняется: elles ont parlé. ' +
          'Но предшествующее прямое дополнение вызывает согласование: les lettres qu’elles ' +
          'ont écrites. В изолированной таблице тренажёр показывает базовую форму.',
        table: { verbId: 'prendre', tense: 'passeCompose', caption: 'prendre — брать' },
      },
    ],
    practice: {
      tenses: ['passeCompose'],
      verbIds: [
        'parler',
        'finir',
        'prendre',
        'faire',
        'voir',
        'dire',
        'écrire',
        'mettre',
        'boire',
        'lire',
      ],
      featured: ['parler', 'prendre', 'faire'],
    },
  },
  {
    id: 'passe-compose-etre',
    block: 'passe',
    title: 'Passé composé с être',
    summary: 'Глаголы, которые обычно образуют passé composé с être',
    sections: [
      {
        body:
          'Небольшая группа непереходных глаголов образует составные времена с être. ' +
          'Список лучше запомнить: одного значения движения недостаточно — marcher, courir ' +
          'и voyager, например, употребляются с avoir.',
        table: { verbId: 'aller', tense: 'passeCompose', caption: 'aller — идти' },
      },
      {
        heading: 'Что входит в список',
        bullets: [
          'движение с изменением места: aller, venir, arriver, partir, entrer, sortir',
          'изменение положения: monter, descendre, tomber',
          'пребывание и возвращение: rester, rentrer, retourner',
          'рождение и смерть: naître, mourir',
          'производные от venir: devenir, revenir, parvenir',
        ],
      },
      {
        heading: 'Причастие согласуется с подлежащим',
        body:
          'Это главное отличие от avoir: il est sorti, но elle est sortie и elles sont sorties. ' +
          'Согласование идёт по роду и числу, как у прилагательного.',
        table: { verbId: 'sortir', tense: 'passeCompose', caption: 'sortir — выходить' },
      },
    ],
    practice: {
      tenses: ['passeCompose'],
      verbIds: [
        'aller',
        'venir',
        'partir',
        'sortir',
        'arriver',
        'entrer',
        'monter',
        'descendre',
        'tomber',
        'rester',
        'naître',
        'mourir',
      ],
      featured: ['aller', 'venir', 'sortir'],
    },
  },
  {
    id: 'imparfait',
    block: 'passe',
    title: 'Imparfait',
    summary: 'Самое регулярное время французского языка',
    sections: [
      {
        body:
          'Для большинства глаголов imparfait образуется так: возьмите форму nous в настоящем ' +
          'времени, отбросьте -ons и добавьте -ais, -ais, -ait, -ions, -iez, -aient.',
        table: { verbId: 'parler', tense: 'imparfait', caption: 'nous parlons → je parlais' },
      },
      {
        heading: 'Главное исключение',
        body:
          'У être основа ét-, её нельзя вывести из nous sommes. У безличных falloir и pleuvoir ' +
          'формы nous нет, поэтому их основы fall- и pleuv- тоже запоминают отдельно.',
        table: { verbId: 'être', tense: 'imparfait', caption: 'être — особая основа ét-' },
      },
      {
        heading: 'Орфография догоняет',
        body:
          'У глаголов на -cer и -ger смягчение проявляется во всех формах, кроме nous и vous: ' +
          'je mangeais, nous mangions.',
        table: { verbId: 'manger', tense: 'imparfait', caption: 'manger — смягчение перед a' },
      },
    ],
    practice: {
      tenses: ['imparfait'],
      verbIds: [
        'être',
        'avoir',
        'faire',
        'parler',
        'finir',
        'prendre',
        'aller',
        'manger',
        'commencer',
        'voir',
      ],
      featured: ['être', 'manger', 'prendre'],
    },
  },
  {
    id: 'imparfait-vs-passe-compose',
    block: 'passe',
    title: 'Imparfait или passé composé',
    summary: 'Главный выбор при рассказе о прошлом',
    sections: [
      {
        body:
          'Оба времени переводятся на русский одинаково, но описывают разное. ' +
          'Разница не во времени события, а в том, как говорящий на него смотрит.',
      },
      {
        heading: 'Passé composé — событие',
        body:
          'Завершённое действие, продвигающее рассказ вперёд. Отвечает на вопрос ' +
          '«что произошло?»: hier, j’ai vu un film.',
        table: { verbId: 'parler', tense: 'passeCompose', caption: 'законченное действие' },
      },
      {
        heading: 'Imparfait — фон',
        body:
          'Обстановка, привычка, длящееся состояние. Отвечает на вопрос «как было?»: ' +
          'quand j’étais petit, je parlais souvent avec lui.',
        table: { verbId: 'parler', tense: 'imparfait', caption: 'фон и привычка' },
      },
      {
        heading: 'Подсказки, а не переключатели',
        bullets: [
          'passé composé: soudain, hier, une fois, trois fois',
          'imparfait: toujours, souvent, chaque jour, pendant que',
        ],
      },
    ],
    practice: {
      tenses: ['imparfait', 'passeCompose'],
      verbIds: [
        'parler',
        'faire',
        'aller',
        'voir',
        'manger',
        'finir',
        'prendre',
        'être',
        'avoir',
        'venir',
      ],
      featured: ['parler', 'aller', 'être'],
    },
  },

  // ── Будущее и условное ───────────────────────────────────────────────────
  {
    id: 'futur-simple',
    block: 'futur',
    title: 'Futur simple',
    summary: 'Окончания приклеиваются прямо к инфинитиву',
    sections: [
      {
        body:
          'Основа будущего времени — сам инфинитив, а окончания совпадают с настоящим ' +
          'временем глагола avoir: -ai, -as, -a, -ons, -ez, -ont. Основа всегда оканчивается на -r.',
        table: { verbId: 'parler', tense: 'futurSimple', caption: 'parler → je parlerai' },
      },
      {
        heading: 'Глаголы на -re теряют e',
        body: 'prendre → je prendrai, attendre → j’attendrai. Согласная -r- при этом сохраняется.',
        table: { verbId: 'prendre', tense: 'futurSimple', caption: 'prendre → je prendrai' },
      },
      {
        heading: 'Чередования доходят и сюда',
        body:
          'Глаголы с чередованием e → è сохраняют его во всех формах будущего: ' +
          'j’achèterai, j’appellerai. А вот é → è в будущем по традиционной норме не происходит: j’espérerai.',
      },
    ],
    practice: {
      tenses: ['futurSimple'],
      verbIds: [
        'parler',
        'finir',
        'prendre',
        'partir',
        'manger',
        'choisir',
        'rendre',
        'attendre',
        'sortir',
        'écrire',
      ],
      featured: ['parler', 'prendre', 'finir'],
    },
  },
  {
    id: 'futur-irreguliers',
    block: 'futur',
    title: 'Неправильные основы будущего',
    summary: 'Полтора десятка глаголов, которые нужно знать наизусть',
    sections: [
      {
        body:
          'У самых частотных глаголов основа будущего не выводится из инфинитива. ' +
          'Хорошая новость: эта же основа обслуживает и conditionnel, так что выучить её нужно один раз.',
        table: { verbId: 'aller', tense: 'futurSimple', caption: 'aller → j’irai' },
      },
      {
        heading: 'Список',
        bullets: [
          'être → ser-, avoir → aur-, aller → ir-, faire → fer-',
          'venir → viendr-, tenir → tiendr-, voir → verr-, envoyer → enverr-',
          'pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-',
          'courir → courr-, mourir → mourr-, valoir → vaudr-, falloir → faudr-',
        ],
      },
      {
        heading: 'Удвоенное -rr-',
        body:
          'У courir, mourir, pouvoir и voir в основе два r. На письме это заметно, ' +
          'на слух — почти нет, поэтому ошибка частая.',
        table: { verbId: 'avoir', tense: 'futurSimple', caption: 'avoir → j’aurai' },
      },
    ],
    practice: {
      tenses: ['futurSimple'],
      verbIds: [
        'être',
        'avoir',
        'aller',
        'faire',
        'venir',
        'voir',
        'pouvoir',
        'vouloir',
        'devoir',
        'savoir',
        'courir',
        'mourir',
        'envoyer',
        'tenir',
        'recevoir',
      ],
      featured: ['être', 'avoir', 'aller', 'faire'],
    },
  },
  {
    id: 'conditionnel',
    block: 'futur',
    title: 'Conditionnel présent',
    summary: 'Основа будущего плюс окончания imparfait',
    sections: [
      {
        body:
          'Conditionnel présent собирается из двух уже знакомых деталей: основа берётся ' +
          'от futur simple, окончания — от imparfait. Новых основ и окончаний нет; отдельно ' +
          'нужно освоить значения этой формы.',
        table: { verbId: 'être', tense: 'conditionnel', caption: 'ser- + -ais = je serais' },
      },
      {
        heading: 'Три употребления',
        bullets: [
          'вежливость: je voudrais un café — вместо резкого je veux',
          'гипотеза: si j’avais le temps, je viendrais',
          'непроверенная информация: le train aurait du retard',
        ],
      },
      {
        heading: 'Не путать с futur',
        body:
          'Разница только в окончании: je serai — будущее, je serais — условное. ' +
          'На слух они у многих носителей совпадают, поэтому опора идёт на контекст.',
        table: { verbId: 'vouloir', tense: 'conditionnel', caption: 'vouloir — вежливая просьба' },
      },
    ],
    practice: {
      tenses: ['conditionnel'],
      verbIds: [
        'être',
        'avoir',
        'aller',
        'faire',
        'vouloir',
        'pouvoir',
        'aimer',
        'savoir',
        'venir',
        'parler',
      ],
      featured: ['vouloir', 'être', 'pouvoir'],
    },
  },

  // ── Составные времена ────────────────────────────────────────────────────
  {
    id: 'plus-que-parfait',
    block: 'composes',
    title: 'Plus-que-parfait',
    summary: 'Прошедшее до прошедшего',
    sections: [
      {
        body:
          'Вспомогательный глагол ставится в imparfait, дальше идёт причастие. ' +
          'Время обозначает действие, предшествовавшее другому прошедшему.',
        table: { verbId: 'parler', tense: 'plusQueParfait', caption: 'j’avais parlé' },
      },
      {
        heading: 'Выбор вспомогательного тот же',
        body:
          'Глагол, который берёт être в passé composé, берёт его и здесь — вместе с ' +
          'согласованием причастия.',
        table: { verbId: 'aller', tense: 'plusQueParfait', caption: 'j’étais allé(e)' },
      },
      {
        heading: 'В условных предложениях',
        body:
          'После si в нереальном условии прошлого ставят plus-que-parfait, а в главной части — ' +
          'conditionnel passé: si j’avais su, je serais venu.',
      },
    ],
    practice: {
      tenses: ['plusQueParfait'],
      verbIds: [
        'parler',
        'finir',
        'prendre',
        'aller',
        'sortir',
        'faire',
        'voir',
        'dire',
        'partir',
        'venir',
      ],
      featured: ['parler', 'aller', 'faire'],
    },
  },
  {
    id: 'futur-anterieur',
    block: 'composes',
    title: 'Futur antérieur',
    summary: 'Будущее, завершённое к моменту в будущем',
    sections: [
      {
        body:
          'Вспомогательный глагол в futur simple плюс причастие. Означает действие, ' +
          'которое закончится раньше другого будущего: quand j’aurai fini, je partirai.',
        table: { verbId: 'parler', tense: 'futurAnterieur', caption: 'j’aurai parlé' },
      },
      {
        heading: 'После временных союзов',
        body:
          'Quand, dès que и après que могут вводить futur antérieur, когда одно будущее ' +
          'действие должно завершиться раньше другого: «когда закончу» → quand j’aurai fini. ' +
          'Сам по себе союз это время не требует.',
      },
      {
        heading: 'Предположение о прошлом',
        body:
          'Il aura oublié — «наверное, забыл». Формально будущее, по смыслу догадка о прошедшем.',
      },
    ],
    practice: {
      tenses: ['futurAnterieur'],
      verbIds: [
        'parler',
        'finir',
        'partir',
        'arriver',
        'faire',
        'terminer',
        'sortir',
        'prendre',
        'venir',
        'rentrer',
      ],
      featured: ['parler', 'finir', 'partir'],
    },
  },
  {
    id: 'conditionnel-passe',
    block: 'composes',
    title: 'Conditionnel passé',
    summary: 'Несбывшееся: «я бы сделал, но не сделал»',
    sections: [
      {
        body:
          'Вспомогательный глагол в conditionnel présent плюс причастие. ' +
          'Чаще всего обозначает нереализованное действие: оно могло произойти, но не ' +
          'произошло. Также форма встречается в сообщениях с оговоркой и предположениях о прошлом.',
        table: { verbId: 'faire', tense: 'conditionnelPasse', caption: 'j’aurais fait' },
      },
      {
        heading: 'Полная условная конструкция',
        body:
          'Si + plus-que-parfait в придаточном, conditionnel passé в главном: ' +
          'si tu étais venu, nous aurions parlé.',
      },
      {
        heading: 'Упрёк и сожаление',
        body:
          'Tu aurais dû me le dire — «ты должен был мне сказать». Одно из самых частых употреблений.',
      },
    ],
    practice: {
      tenses: ['conditionnelPasse'],
      verbIds: [
        'parler',
        'faire',
        'aller',
        'venir',
        'pouvoir',
        'vouloir',
        'devoir',
        'savoir',
        'dire',
        'voir',
      ],
      featured: ['faire', 'devoir', 'pouvoir'],
    },
  },
  {
    id: 'choix-auxiliaire',
    block: 'composes',
    title: 'Глаголы с двумя вспомогательными',
    summary: 'monter, sortir, passer — être или avoir по смыслу',
    sections: [
      {
        body:
          'Часть глаголов из списка être может брать и avoir. Выбор определяется не капризом, ' +
          'а наличием прямого дополнения.',
        table: { verbId: 'monter', tense: 'passeCompose', caption: 'il est monté — без дополнения' },
      },
      {
        heading: 'Правило',
        bullets: [
          'нет дополнения → être, глагол непереходный: il est sorti — «он вышел»',
          'есть дополнение → avoir, глагол переходный: il a sorti la voiture — «он вывел машину»',
        ],
      },
      {
        heading: 'Кого это касается',
        body:
          'Чаще всего это monter, descendre, sortir, rentrer, retourner и passer. У entrer ' +
          'тоже бывает переходное употребление (entrer des données). Поэтому надёжнее смотреть ' +
          'на конструкцию конкретного значения, а не на один заученный список.',
        table: {
          verbId: 'descendre',
          tense: 'passeCompose',
          caption: 'descendre — то же чередование',
        },
      },
      {
        heading: 'Смысл меняется вместе с вспомогательным',
        body:
          'Il a passé l’examen — «он сдавал / сдал экзамен». Il est passé par ici — ' +
          '«он прошёл здесь». Это разные конструкции, а не стилистические варианты.',
      },
    ],
    practice: {
      tenses: ['passeCompose'],
      verbIds: [
        'monter',
        'descendre',
        'sortir',
        'rentrer',
        'retourner',
        'passer',
        'entrer',
        'tomber',
        'rester',
        'arriver',
      ],
      featured: ['monter', 'descendre', 'sortir'],
    },
  },
  {
    id: 'accord-participe',
    block: 'composes',
    title: 'Согласование причастия',
    summary: 'Когда причастие меняет род и число',
    sections: [
      {
        body:
          'Причастие в составных временах ведёт себя то как глагол, то как прилагательное. ' +
          'Всё зависит от вспомогательного.',
      },
      {
        heading: 'С être — согласуется с подлежащим',
        body:
          'Работает как обычное прилагательное: +e для женского рода, +s для множественного, ' +
          '+es для обоих сразу.',
        table: { verbId: 'sortir', tense: 'passeCompose', caption: 'il est sorti / elle est sortie' },
      },
      {
        heading: 'С avoir — не согласуется',
        body:
          'Причастие остаётся в базовой форме: elles ont mangé. Исключение существует — ' +
          'согласование с предшествующим прямым дополнением, — но в тренажёре форм оно не ' +
          'проверяется, потому что зависит от порядка слов в предложении.',
      },
      {
        heading: 'Причастия на -s и -x',
        body:
          'Во множественном числе мужского рода они не меняются: il est assis → ils sont assis. ' +
          'Наращивать второе -s не нужно.',
      },
      {
        heading: 'Местоименные глаголы',
        body:
          'Они спрягаются с être, но согласование зависит от роли se и прямого дополнения: ' +
          'elle s’est levée; elle s’est lavé les mains; elles se sont parlé. Простого правила ' +
          '«être — значит согласовать с подлежащим» здесь недостаточно.',
        table: {
          verbId: 'se laver',
          tense: 'passeCompose',
          caption: 'se laver — согласование зависит от конструкции',
        },
      },
    ],
    practice: {
      tenses: ['passeCompose', 'plusQueParfait'],
      verbIds: [
        'aller',
        'venir',
        'partir',
        'sortir',
        'naître',
        'mourir',
        'arriver',
        'rester',
        'tomber',
        'se laver',
        'se lever',
      ],
      featured: ['sortir', 'se laver', 'venir'],
    },
  },

  // ── Сослагательное наклонение ────────────────────────────────────────────
  {
    id: 'subj-present-formation',
    block: 'subjonctif',
    title: 'Образование subjonctif présent',
    summary: 'Основа третьего лица множественного плюс окончания',
    sections: [
      {
        body:
          'Возьмите форму ils в настоящем времени, отбросьте -ent — получится основа. ' +
          'К ней добавляются -e, -es, -e, -ions, -iez, -ent.',
        table: { verbId: 'parler', tense: 'subjPresent', caption: 'ils parlent → que je parle' },
      },
      {
        heading: 'Формы nous и vous особые',
        body:
          'Обычно они строятся от основы формы nous présent: nous prenons → que nous prenions. ' +
          'У регулярных глаголов результат совпадает по написанию с imparfait, но у être, avoir, ' +
          'faire, savoir и других неправильных глаголов это совпадение не работает.',
        table: { verbId: 'prendre', tense: 'subjPresent', caption: 'prendre — две основы' },
      },
      {
        heading: 'Совпадения с настоящим временем',
        body:
          'У регулярных глаголов первой группы формы je, tu, il/elle и ils/elles в subjonctif ' +
          'présent совпадают по написанию с indicatif présent. Формы nous и vous отличаются: ' +
          'nous parlons, но que nous parlions.',
      },
    ],
    practice: {
      tenses: ['subjPresent'],
      verbIds: [
        'parler',
        'finir',
        'partir',
        'prendre',
        'venir',
        'boire',
        'voir',
        'écrire',
        'dire',
        'mettre',
      ],
      featured: ['parler', 'prendre', 'venir'],
    },
  },
  {
    id: 'subj-present-irreguliers',
    block: 'subjonctif',
    title: 'Неправильный subjonctif',
    summary: 'Основные частотные глаголы с особыми основами',
    sections: [
      {
        body:
          'У нескольких частотных глаголов стандартная схема по форме ils не работает ' +
          'полностью или даёт только часть парадигмы. Ниже — основные формы, которые стоит ' +
          'запомнить отдельно.',
        table: { verbId: 'être', tense: 'subjPresent', caption: 'être — soi-' },
      },
      { table: { verbId: 'aller', tense: 'subjPresent', caption: 'aller — aill- / all-' } },
      {
        heading: 'Список',
        bullets: [
          'être → sois, avoir → aie, aller → aille, faire → fasse',
          'savoir → sache, pouvoir → puisse, vouloir → veuille',
          'valoir → vaille, falloir → faille',
        ],
      },
      {
        heading: 'faire, savoir и pouvoir не меняют основу',
        body:
          'В отличие от aller и vouloir, у них одна основа на все шесть форм: ' +
          'que je fasse, que nous fassions.',
        table: { verbId: 'faire', tense: 'subjPresent', caption: 'faire — одна основа fass-' },
      },
    ],
    practice: {
      tenses: ['subjPresent'],
      verbIds: [
        'être',
        'avoir',
        'aller',
        'faire',
        'savoir',
        'pouvoir',
        'vouloir',
        'valoir',
        'falloir',
        'devoir',
      ],
      featured: ['être', 'avoir', 'aller', 'faire'],
    },
  },
  {
    id: 'subj-volonte',
    block: 'subjonctif',
    title: 'Воля и необходимость',
    summary: 'Глаголы, после которых subjonctif обязателен',
    sections: [
      {
        body:
          'Сослагательное появляется после выражений воли, желания и требования. ' +
          'Логика общая: действие в придаточном ещё не факт, а лишь чьё-то намерение.',
        table: { verbId: 'vouloir', tense: 'subjPresent', caption: 'que je veuille' },
      },
      {
        heading: 'Основные глаголы',
        bullets: [
          'vouloir que, souhaiter que, désirer que',
          'exiger que, demander que, proposer que',
          'préférer que, accepter que, refuser que',
        ],
      },
      {
        heading: 'Важное ограничение',
        body:
          'Если подлежащее в главном и придаточном совпадает, придаточное не строится: ' +
          'вместо «je veux que je parte» говорят je veux partir.',
      },
      {
        heading: 'espérer — исключение',
        body:
          'В утвердительной фразе espérer que обычно требует изъявительного наклонения, ' +
          'часто futur simple: j’espère qu’il viendra. В отрицании или вопросе subjonctif ' +
          'возможен, если говорящий подчёркивает сомнение.',
      },
    ],
    practice: {
      tenses: ['subjPresent'],
      verbIds: [
        'vouloir',
        'souhaiter',
        'désirer',
        'demander',
        'préférer',
        'exiger',
        'permettre',
        'proposer',
        'refuser',
        'accepter',
      ],
      featured: ['vouloir', 'préférer', 'permettre'],
    },
  },
  {
    id: 'subj-emotion-doute',
    block: 'subjonctif',
    title: 'Эмоция и сомнение',
    summary: 'Вторая большая группа контекстов',
    sections: [
      {
        body:
          'Subjonctif требуется после выражений чувства и неуверенности. При эмоции событие ' +
          'может быть вполне реальным: je suis content qu’il soit là. Наклонение здесь ' +
          'показывает оценку говорящего, а не объявляет событие вымышленным.',
        table: { verbId: 'craindre', tense: 'subjPresent', caption: 'que je craigne' },
      },
      {
        heading: 'Эмоция',
        bullets: [
          'être content / triste / surpris que',
          'avoir peur que, craindre que',
          'il est dommage que, c’est bien que',
        ],
      },
      {
        heading: 'Сомнение и отрицание уверенности',
        body:
          'Ключевая пара: je pense qu’il viendra — изъявительное, мнение подаётся как вероятное. ' +
          'Je ne pense pas qu’il vienne — subjonctif, говорящий подчёркивает сомнение. После ' +
          'отрицания indicatif тоже возможен, если факт всё же утверждается.',
        table: { verbId: 'venir', tense: 'subjPresent', caption: 'venir — que je vienne' },
      },
      {
        heading: 'Вопрос не переключает наклонение автоматически',
        body:
          'Pensez-vous qu’il vienne ? подчёркивает сомнение; Pensez-vous qu’il viendra ? ' +
          'нейтральнее спрашивает о прогнозе. Выбор зависит от того, представляет ли говорящий ' +
          'событие как вероятное или ставит его под сомнение.',
      },
    ],
    practice: {
      tenses: ['subjPresent'],
      verbIds: [
        'craindre',
        'venir',
        'être',
        'avoir',
        'croire',
        'penser',
        'sembler',
        'plaire',
        'aimer',
        'souhaiter',
      ],
      featured: ['craindre', 'venir', 'croire'],
    },
  },
  {
    id: 'subj-conjonctions',
    block: 'subjonctif',
    title: 'Союзы, требующие subjonctif',
    summary: 'Частотные связки, после которых нужен subjonctif',
    sections: [
      {
        body:
          'Некоторые устойчивые союзы надёжно требуют subjonctif. Их полезно учить целиком, ' +
          'но не переносить правило на любую конструкцию с que.',
        table: { verbId: 'pouvoir', tense: 'subjPresent', caption: 'pour que je puisse' },
      },
      {
        heading: 'Список',
        bullets: [
          'цель: pour que, afin que',
          'время: avant que, jusqu’à ce que, en attendant que',
          'уступка: bien que, quoique',
          'условие: à condition que, à moins que, pourvu que',
          'отрицание: sans que',
        ],
      },
      {
        heading: 'Опасная пара',
        body:
          'Avant que требует subjonctif, а après que — изъявительного: ' +
          'avant qu’il parte, но après qu’il est parti.',
        table: { verbId: 'partir', tense: 'subjPresent', caption: 'avant qu’il parte' },
      },
    ],
    practice: {
      tenses: ['subjPresent'],
      verbIds: [
        'partir',
        'finir',
        'venir',
        'faire',
        'être',
        'avoir',
        'pouvoir',
        'savoir',
        'attendre',
        'comprendre',
      ],
      featured: ['pouvoir', 'partir', 'faire'],
    },
  },
  {
    id: 'subj-passe',
    block: 'subjonctif',
    title: 'Subjonctif passé',
    summary: 'Сослагательное для уже завершённого действия',
    sections: [
      {
        body:
          'Вспомогательный глагол ставится в subjonctif présent, дальше идёт причастие. ' +
          'Употребляется там же, где и настоящее сослагательное, но для действия, которое уже произошло.',
        table: { verbId: 'parler', tense: 'subjPasse', caption: 'que j’aie parlé' },
      },
      {
        heading: 'Сравнение',
        bullets: [
          'je suis content qu’il vienne — рад, что он приходит / придёт; действие не представлено как завершённое',
          'je suis content qu’il soit venu — рад, что он пришёл; действие завершилось раньше',
        ],
      },
      {
        heading: 'Вспомогательный выбирается по общему правилу',
        body: 'Глаголы списка être и здесь берут être — с согласованием причастия.',
        table: { verbId: 'partir', tense: 'subjPasse', caption: 'que je sois parti(e)' },
      },
    ],
    practice: {
      tenses: ['subjPasse'],
      verbIds: [
        'parler',
        'finir',
        'partir',
        'venir',
        'faire',
        'arriver',
        'sortir',
        'prendre',
        'dire',
        'voir',
      ],
      featured: ['parler', 'partir', 'faire'],
    },
  },

  // ── Повелительное наклонение ─────────────────────────────────────────────
  {
    id: 'imperatif-present',
    block: 'imperatif',
    title: 'Impératif présent',
    summary: 'Три формы, местоимение опускается',
    sections: [
      {
        body:
          'Императив существует только для tu, nous и vous. Формы берутся из настоящего ' +
          'времени, но подлежащее не пишется: parle, parlons, parlez.',
        table: { verbId: 'parler', tense: 'imperatifPresent', caption: 'parler — первая группа' },
      },
      {
        heading: 'Первая группа теряет -s',
        body:
          'В форме tu у глаголов на -er конечное -s исчезает: tu parles, но parle ! ' +
          'То же касается ouvrir и его семейства: ouvre !',
        table: { verbId: 'finir', tense: 'imperatifPresent', caption: 'finir — -s сохраняется' },
      },
      {
        heading: 'Отрицание отдельного спряжения не требует',
        body:
          'В отличие от испанского, французский обходится теми же формами: ' +
          'ne parle pas, ne parlons pas. Отдельного отрицательного императива нет.',
      },
    ],
    practice: {
      tenses: ['imperatifPresent'],
      verbIds: [
        'parler',
        'finir',
        'prendre',
        'venir',
        'faire',
        'aller',
        'partir',
        'écouter',
        'regarder',
        'manger',
        'ouvrir',
        'attendre',
      ],
      featured: ['parler', 'finir', 'prendre'],
    },
  },
  {
    id: 'imperatif-irreguliers',
    block: 'imperatif',
    title: 'Неправильный императив',
    summary: 'Четыре глагола берут формы из subjonctif',
    sections: [
      {
        body:
          'être, avoir, savoir и vouloir образуют повелительное наклонение не от настоящего ' +
          'времени, а от сослагательного.',
        table: { verbId: 'être', tense: 'imperatifPresent', caption: 'être — sois, soyons, soyez' },
      },
      {
        table: { verbId: 'avoir', tense: 'imperatifPresent', caption: 'avoir — aie, ayons, ayez' },
      },
      {
        heading: 'savoir и vouloir',
        body:
          'savoir даёт sache, sachons, sachez. У vouloir практически употребима только ' +
          'форма veuillez — вежливое «будьте добры».',
        table: {
          verbId: 'savoir',
          tense: 'imperatifPresent',
          caption: 'savoir — sache, sachons, sachez',
        },
      },
      {
        heading: 'aller',
        body:
          'Форма va теряет -s как глагол первой группы, но перед наречиями y и en ' +
          'оно возвращается для благозвучия: vas-y.',
      },
    ],
    practice: {
      tenses: ['imperatifPresent'],
      verbIds: [
        'être',
        'avoir',
        'savoir',
        'vouloir',
        'aller',
        'faire',
        'dire',
        'venir',
        'prendre',
        'ouvrir',
        'sortir',
        'voir',
      ],
      featured: ['être', 'avoir', 'savoir'],
    },
  },
  {
    id: 'imperatif-passe',
    block: 'imperatif',
    title: 'Impératif passé',
    summary: 'Редкая форма для действия, завершённого к сроку',
    sections: [
      {
        body:
          'Вспомогательный глагол ставится в императив, дальше идёт причастие: ' +
          'aie fini avant midi — «закончи до полудня».',
        table: {
          verbId: 'parler',
          tense: 'imperatifPasse',
          caption: 'aie parlé, ayons parlé, ayez parlé',
        },
      },
      {
        heading: 'Когда встречается',
        body:
          'Форма книжная и редкая. Она подчёркивает не само действие, а срок, ' +
          'к которому оно должно быть завершено.',
      },
      {
        heading: 'Вспомогательный по общему правилу',
        body: 'Глаголы списка être берут être: sois parti avant huit heures.',
      },
    ],
    practice: {
      tenses: ['imperatifPasse'],
      verbIds: [
        'parler',
        'finir',
        'partir',
        'faire',
        'terminer',
        'arriver',
        'venir',
        'sortir',
        'prendre',
        'rentrer',
        'manger',
        'écrire',
      ],
      featured: ['parler', 'finir', 'partir'],
    },
  },

  // ── Книжные времена ──────────────────────────────────────────────────────
  {
    id: 'litt-passe-simple',
    block: 'litteraire',
    title: 'Passé simple и passé antérieur',
    summary: 'Времена письменного повествования',
    sections: [
      {
        body:
          'Passé simple выполняет в повествовании примерно ту же работу, что passé composé, ' +
          'и употребляется главным образом в романах, исторических текстах и сказках. В обычной ' +
          'разговорной речи он редок, но возможен как цитата, шутка или нарочито высокий стиль.',
        table: { verbId: 'parler', tense: 'passeSimple', caption: 'parler — первая группа' },
      },
      {
        heading: 'Три набора окончаний',
        bullets: [
          'на -a: глаголы первой группы (je parlai, il parla)',
          'на -i: вторая группа и часть третьей (je finis, il prit)',
          'на -u: другая часть третьей (je fus, il eut, il connut)',
        ],
      },
      {
        heading: 'Что нужно уметь на практике',
        body:
          'Активно образовывать passé simple почти никогда не требуется. Достаточно уверенно ' +
          'узнавать формы третьего лица — именно они несут повествование.',
        table: { verbId: 'être', tense: 'passeSimple', caption: 'être — je fus, il fut' },
      },
      { table: { verbId: 'prendre', tense: 'passeSimple', caption: 'prendre — il prit' } },
      {
        heading: 'Passé antérieur',
        body:
          'Составная пара к passé simple: вспомогательный глагол в passé simple плюс причастие. ' +
          'Встречается после союзов quand и dès que в книжном повествовании.',
        table: { verbId: 'parler', tense: 'passeAnterieur', caption: 'quand il eut parlé…' },
      },
    ],
    practice: {
      tenses: ['passeSimple', 'passeAnterieur'],
      verbIds: [
        'être',
        'avoir',
        'faire',
        'aller',
        'venir',
        'voir',
        'prendre',
        'dire',
        'parler',
        'finir',
        'naître',
        'mourir',
      ],
      featured: ['être', 'avoir', 'prendre'],
    },
  },
  {
    id: 'litt-subjonctif-imparfait',
    block: 'litteraire',
    title: 'Книжный subjonctif',
    summary: 'Распознавание imparfait и plus-que-parfait сослагательного',
    sections: [
      {
        body:
          'Эти формы нужны прежде всего для чтения классической и нарочито высокой прозы. ' +
          'Subjonctif imparfait изредка появляется в очень формальной речи; plus-que-parfait ' +
          'сослагательного ещё реже. Для повседневной активной речи их заучивать не обязательно.',
        table: { verbId: 'être', tense: 'subjImparfait', caption: 'être — que je fusse' },
      },
      {
        heading: 'Образование',
        body:
          'Основа берётся от passé simple, к ней добавляются окончания с удвоенной -ss-. ' +
          'Третье лицо единственного числа получает циркумфлекс вместо -ss-.',
        table: { verbId: 'parler', tense: 'subjImparfait', caption: 'parler — qu’il parlât' },
      },
      {
        heading: 'Зачем это знать',
        body:
          'Узнавание форм вроде qu’il fût или qu’il eût полезно при чтении классики. ' +
          'В современной речи обычно выбирают subjonctif présent или passé в зависимости ' +
          'от того, завершилось действие или нет.',
      },
      {
        heading: 'Plus-que-parfait сослагательного',
        body:
          'Вспомогательный глагол в subjonctif imparfait плюс причастие. Та же форма может ' +
          'выступать в главной части условия как conditionnel passé deuxième forme; различие ' +
          'определяется синтаксисом, а не окончанием.',
        table: { verbId: 'parler', tense: 'subjPlusQueParfait', caption: 'qu’il eût parlé' },
      },
    ],
    practice: {
      tenses: ['subjImparfait', 'subjPlusQueParfait'],
      verbIds: [
        'être',
        'avoir',
        'faire',
        'parler',
        'finir',
        'venir',
        'prendre',
        'voir',
        'aller',
        'savoir',
      ],
      featured: ['être', 'avoir', 'parler'],
    },
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find(lesson => lesson.id === id);
}

export function lessonsByBlock(block: LessonBlock): Lesson[] {
  return LESSONS.filter(lesson => lesson.block === block);
}

export function lessonPracticeVerbIds(lesson: Lesson): string[] {
  const { verbIds, types, limit, featured } = lesson.practice;
  if (verbIds?.length) return verbIds;
  if (!types?.length) return [];

  const matched = VERBS.filter(verb => types.some(type => verb.types.includes(type))).map(
    verb => verb.id,
  );
  // Ключевые глаголы идут первыми и входят в набор всегда — даже если их
  // неправильность размечена своим типом или их отсекает limit.
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

export function drillSize(lesson: Lesson, drill: LessonDrill): number {
  const combinations = drill.verbIds.length * lesson.practice.tenses.length * PERSONS.length;
  return Math.min(drill.isAll ? EXAM_QUESTIONS : DRILL_QUESTIONS, combinations);
}

/** Сколько вопросов в зачёте: 30 или меньше, если у темы просто нет столько форм. */
export function lessonExamSize(lesson: Lesson): number {
  const combinations =
    lessonPracticeVerbIds(lesson).length * lesson.practice.tenses.length * PERSONS.length;
  return Math.min(EXAM_QUESTIONS, combinations);
}

/** Порядок прохождения курса — тот же, в котором уроки объявлены. */
export function lessonIndex(lessonId: string): number {
  return LESSONS.findIndex(lesson => lesson.id === lessonId);
}

export function nextLesson(lessonId: string): Lesson | undefined {
  const index = lessonIndex(lessonId);
  return index < 0 ? undefined : LESSONS[index + 1];
}
