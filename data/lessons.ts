import type { Tense } from './types';
import { VERBS } from './verbs';

export type LessonBlock =
  | 'presente'
  | 'pasado'
  | 'futuro'
  | 'compuestos'
  | 'subjuntivo'
  | 'imperativo';

export const LESSON_BLOCKS: LessonBlock[] = [
  'presente',
  'pasado',
  'futuro',
  'compuestos',
  'subjuntivo',
  'imperativo',
];

export const LESSON_BLOCK_LABELS: Record<LessonBlock, string> = {
  presente: 'Настоящее время',
  pasado: 'Прошедшее время',
  futuro: 'Будущее и условное',
  compuestos: 'Составные времена',
  subjuntivo: 'Сослагательное наклонение',
  imperativo: 'Повелительное наклонение',
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
  };
}

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
    practice: { tenses: ['presente'], types: ['o to ue', 'u to ue'], limit: 60 },
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
    practice: { tenses: ['presente'], types: ['i before e'], limit: 60 },
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
    practice: { tenses: ['presente'], types: ['e to i'], limit: 60 },
  },
  {
    id: 'presente-yo-irregular',
    block: 'presente',
    title: 'Неправильное «yo»',
    summary: 'hago, pongo, salgo, conozco',
    sections: [
      {
        body:
          'Есть группа глаголов, у которых неправильная только одна форма — первое лицо ' +
          'единственного числа. Остальные пять спрягаются как обычно.',
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
    },
  },
  {
    id: 'presente-ortografia',
    block: 'presente',
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
          'c → qu перед e: buscar → busqué (иначе читалось бы «бусер»)',
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
      tenses: ['preteriteIndef', 'subjuntivo'],
      types: ['c to qu', 'g to gu', 'z to c', 'g to j'],
      limit: 60,
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
          'Pretérito imperfecto описывает прошлое без границ: то, что тянулось, повторялось ' +
          'или служило фоном. «Раньше я много читал», «шёл дождь», «мне было десять лет».',
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
    practice: { tenses: ['perfecto'], verbIds: [...REGULAR_SAMPLE, 'hacer', 'decir', 'ver', 'escribir'] },
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
        heading: 'Futuro perfecto и condicional perfecto',
        body:
          'Habré hablado — «к тому времени уже поговорю» или предположение о прошлом ' +
          '(«наверное, поговорил»). Habría hablado — «поговорил бы».',
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
          'Существует вторая, полностью равноправная форма: hablase, hablases, hablase… ' +
          'Значение то же самое, выбор — дело стиля и региона. В Испании -se звучит чуть книжнее, ' +
          'в Латинской Америке преобладает -ra. В приложении обе формы даны отдельными вкладками.',
        table: { verbId: 'hablar', tense: 'subjImperfectoSe', caption: 'вариант на -se' },
      },
    ],
    practice: {
      tenses: ['subjImperfectoRa', 'subjImperfectoSe'],
      verbIds: [...REGULAR_SAMPLE, 'tener', 'decir', 'ser', 'ir', 'hacer', 'poder'],
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
          'Денег нет, поездки не будет.',
      },
      {
        heading: 'Упущенное в прошлом',
        body:
          'Si + pluscuamperfecto de subjuntivo и condicional perfecto. ' +
          'Si hubiera sabido, habría venido — «если бы я знал, я бы пришёл». Не знал и не пришёл.',
      },
      {
        heading: 'Одно железное правило',
        body:
          'После si в значении «если» никогда не ставится presente de subjuntivo. ' +
          'Si tengas — ошибка. Только индикатив или прошедшее сослагательное.',
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
          'Форма vosotros при этом всегда правильная, без исключений вообще.',
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
  const { verbIds, types, limit } = lesson.practice;
  if (verbIds?.length) return verbIds;
  if (!types?.length) return [];

  const matched = VERBS.filter(verb => types.some(type => verb.types.includes(type))).map(
    verb => verb.id,
  );
  return limit ? matched.slice(0, limit) : matched;
}
