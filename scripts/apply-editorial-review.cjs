const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Editorial review: missing ${label}`);
  return source.replace(from, to);
}

function lessonChunk(source, id) {
  const marker = `  {\n    id: '${id}',`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Editorial review: lesson ${id} not found`);
  const next = source.indexOf("\n  {\n    id: '", start + marker.length);
  const endOfArray = source.indexOf('\n];', start + marker.length);
  const end = next >= 0 && (endOfArray < 0 || next < endOfArray) ? next : endOfArray;
  if (end < 0) throw new Error(`Editorial review: end of lesson ${id} not found`);
  return { start, end, text: source.slice(start, end) };
}

function editLesson(source, id, transform) {
  const { start, end, text } = lessonChunk(source, id);
  const next = transform(text);
  return source.slice(0, start) + next + source.slice(end);
}

function replaceLessonText(chunk, from, to, label) {
  return replaceRequired(chunk, from, to, label);
}

// ── 1. Порядок курса: сначала база, потом то, что на неё опирается ──────────
edit('data/lessons.ts', source => {
  source = replaceRequired(
    source,
    [
      'export const LESSON_BLOCKS: LessonBlock[] = [',
      "  'present',",
      "  'constructions',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'syntax',",
      "  'subjonctif',",
      "  'imperatif',",
      "  'litteraire',",
      '];',
    ].join('\n'),
    [
      'export const LESSON_BLOCKS: LessonBlock[] = [',
      "  'present',",
      "  'constructions',",
      "  'imperatif',",
      "  'passe',",
      "  'futur',",
      "  'composes',",
      "  'syntax',",
      "  'subjonctif',",
      "  'litteraire',",
      '];',
    ].join('\n'),
    'logical block order',
  );

  source = source.replace("  litteraire: 'Книжные времена · для чтения',", "  litteraire: 'Редкие и книжные формы',");

  // Основы выбора auxiliaire и базовое согласование нужны сразу после passé composé,
  // а не спустя два блока, когда пользователь уже дошёл до сложных составных времён.
  source = editLesson(source, 'choix-auxiliaire', chunk => chunk.replace("block: 'composes'", "block: 'passe'"));
  source = editLesson(source, 'accord-participe', chunk => chunk.replace("block: 'composes'", "block: 'passe'"));

  // Impératif passé — редкая продвинутая форма. Не ставим её рядом с базовым impératif.
  source = editLesson(source, 'imperatif-passe', chunk => chunk.replace("block: 'imperatif'", "block: 'litteraire'"));

  // ── Présent: не забегаем в ещё не пройденные времена ────────────────────
  source = editLesson(source, 'present-trois-groupes', chunk => {
    chunk = chunk.replace(
      "summary: 'Как устроено деление на -er, -ir с -iss- и всё остальное',",
      "summary: 'Чем отличаются три группы и как это помогает понимать спряжение',",
    );
    return chunk;
  });

  source = editLesson(source, 'present-g1-cer-ger', chunk => {
    chunk = chunk.replace("        heading: 'Орфография догоняет',", "        heading: 'Орфографические изменения',");
    chunk = chunk.replace(
      "          'nous mangeons, но vous mangez — по той же причине',\n          'в imparfait затронуты все формы, кроме nous и vous: je mangeais, mais nous mangions',",
      "          'nous mangeons, но vous mangez — по той же причине',",
    );
    return chunk;
  });

  source = editLesson(source, 'present-g1-alternance', chunk => {
    chunk = chunk.replace(
      "          'Глаголы вроде acheter, mener, lever, peser ставят гравис: j’achète, mais nous achetons. ' +\n          'Чередование доходит и до будущего времени: j’achèterai.',",
      "          'Глаголы вроде acheter, mener, lever, peser ставят гравис перед немым окончанием: ' +\n          'j’achète, tu achètes, ils achètent, но nous achetons и vous achetez.',",
    );
    chunk = chunk.replace(
      "          'Глаголы с é в основе (espérer, préférer, répéter) в настоящем получают è перед ' +\n          'немым окончанием: j’espère. В будущем приложение использует традиционное ' +\n          'написание j’espérerai; вариант j’espèrerai также допускается реформой 1990 года.',",
      "          'Глаголы с é в основе (espérer, préférer, répéter) в настоящем получают è перед ' +\n          'немым окончанием: j’espère, tu préfères, ils répètent. В формах nous и vous сохраняется é.',",
    );
    return chunk;
  });

  source = editLesson(source, 'present-g1-yer', chunk => {
    const advanced = [
      '      {',
      "        heading: 'envoyer выбивается',",
      '        body:',
      "          'В настоящем времени envoyer ведёт себя как все на -oyer, но основу будущего ' +",
      "          'берёт супплетивную: j’enverrai, а не «j’envoierai».',",
      '      },',
    ].join('\n');
    chunk = chunk.replace(advanced + '\n', '');
    chunk = chunk.replace(
      "      featured: ['nettoyer', 'payer', 'envoyer'],",
      "      featured: ['nettoyer', 'payer', 'essayer'],",
    );
    return chunk;
  });

  source = editLesson(source, 'present-etre-avoir', chunk => {
    chunk = chunk.replace("title: 'Четыре главных глагола',", "title: 'Être, avoir, aller и faire',");
    chunk = chunk.replace(
      "summary: 'être, avoir, aller, faire — фундамент всей системы',",
      "summary: 'Четыре частотных глагола, которые нужны с самого начала',",
    );
    chunk = chunk.replace(
      "          'Эти четыре глагола нужно знать раньше всех остальных: два из них служат ' +\n          'вспомогательными для всех составных времён, а два образуют базовые конструкции.',",
      "          'Эти четыре глагола встречаются постоянно. Être и avoir позже понадобятся для ' +\n          'составных времён, aller — для частотных конструкций, а faire — в огромном числе обычных выражений.',",
    );
    chunk = chunk.replace(
      "          'По написанию инфинитива aller выглядит как первая группа, но спрягается ' +\n          'полностью супплетивно: je vais, nous allons, ils vont.',",
      "          'По окончанию инфинитива aller похож на глагол первой группы, но имеет особые формы: ' +\n          'je vais, tu vas, nous allons, ils vont. Их нужно запомнить отдельно.',",
    );
    return chunk;
  });

  // ── Базовые конструкции: только présent и сама конструкция ──────────────
  source = editLesson(source, 'constr-futur-proche', chunk => {
    chunk = chunk.replace(
      "summary: 'aller + инфинитив — самый частый способ говорить о будущем',",
      "summary: 'aller + infinitif для планов, намерений и ближайшего будущего',",
    );
    chunk = chunk.replace(
      "          'В разговорной речи будущее чаще выражается не формой futur simple, а конструкцией ' +\n          '«aller в настоящем времени + инфинитив»: je vais partir — «я сейчас уеду».',",
      "          'Futur proche строится так: aller в настоящем времени + инфинитив. ' +\n          'Je vais partir значит «я собираюсь уехать / я скоро уеду». Конструкция особенно естественна для планов и намерений, связанных с текущей ситуацией.',",
    );
    return chunk;
  });

  source = editLesson(source, 'constr-passe-recent', chunk => {
    chunk = chunk.replace(
      "          'Конструкция «venir в настоящем времени + de + инфинитив» означает действие, ' +\n          'завершившееся буквально только что: je viens de manger — «я только что поел».',",
      "          'Passé récent строится так: venir в настоящем времени + de + инфинитив. ' +\n          'Je viens de manger значит «я только что поел».',",
    );
    const futureLesson = [
      '      {',
      "        heading: 'В прошедшем — через imparfait',",
      '        body:',
      "          'Чтобы сдвинуть точку отсчёта в прошлое, venir ставится в imparfait: ' +",
      "          'je venais de manger — «я только что поел» на фоне другого прошлого события.',",
      '      },',
    ].join('\n');
    chunk = chunk.replace(futureLesson + '\n', '');
    return chunk;
  });

  source = editLesson(source, 'constr-en-train', chunk => {
    chunk = chunk.replace("title: 'Действие в процессе',", "title: 'Être en train de',");
    chunk = chunk.replace(
      "summary: 'être en train de — французский аналог продолженного времени',",
      "summary: 'Как подчеркнуть, что действие идёт прямо сейчас',",
    );
    chunk = chunk.replace(
      "          'Отдельного продолженного времени во французском нет. Когда нужно подчеркнуть, ' +\n          'что действие разворачивается прямо сейчас, используют «être en train de + инфинитив».',",
      "          'Во французском нет отдельной формы, которая точно соответствовала бы английскому Continuous. ' +\n          'Если важно подчеркнуть сам процесс, используют être en train de + инфинитив.',",
    );
    return chunk;
  });

  source = editLesson(source, 'constr-modaux', chunk => {
    chunk = chunk.replace(
      "        heading: 'Окончание -x вместо -s',\n        body:\n          'pouvoir, vouloir и valoir — единственные глаголы, у которых в первом и втором лице ' +\n          'единственного числа пишется -x: je peux, tu veux, je vaux.',",
      "        heading: 'Особые формы pouvoir и vouloir',\n        body:\n          'В формах je и tu у pouvoir и vouloir пишется -x: je peux, tu peux; je veux, tu veux. ' +\n          'Эти частотные формы проще запомнить целиком.',",
    );
    return chunk;
  });

  source = editLesson(source, 'constr-il-faut', chunk => {
    chunk = chunk.replace(
      "summary: 'il faut, il pleut — глаголы без подлежащего',",
      "summary: 'il faut, il pleut и другие безличные обороты',",
    );
    chunk = chunk.replace(
      "          'Часть глаголов существует только в третьем лице единственного числа. ' +\n          'Подлежащее il у них формальное и ничего не обозначает.',",
      "          'В безличных оборотах il не обозначает конкретного человека или предмет. ' +\n          'Например, il faut значит «нужно», а il pleut — «идёт дождь».',",
    );
    const advanced = [
      '      {',
      "        heading: 'Два способа продолжить il faut',",
      '        bullets: [',
      "          'il faut + инфинитив — общее правило: il faut partir',",
      "          'il faut que + subjonctif — адресное требование: il faut que tu partes',",
      '        ],',
      '      },',
      '      {',
      "        heading: 'Почему именно subjonctif',",
      '        body:',
      "          'После il faut que действие ещё не состоялось — это не факт, а необходимость. ' +",
      "          'Изъявительное наклонение сообщало бы о реальном событии, поэтому язык требует сослагательного.',",
      "        table: { verbId: 'être', tense: 'subjPresent', caption: 'il faut que je sois…' },",
      '      },',
    ].join('\n');
    chunk = chunk.replace(
      advanced,
      [
        '      {',
        "        heading: 'Il faut + infinitif',",
        '        body:',
        "          'После il faut можно поставить инфинитив и выразить общую необходимость: ' +",
        "          'il faut partir — «нужно уходить», il faut travailler — «нужно работать».',",
        '      },',
      ].join('\n'),
    );
    chunk = chunk.replace("      tenses: ['present', 'subjPresent'],", "      tenses: ['present'],");
    return chunk;
  });

  source = editLesson(source, 'constr-savoir-connaitre', chunk => {
    chunk = chunk.replace("summary: 'Два глагола «знать» и граница между ними',", "summary: 'Когда «знать» — savoir, а когда — connaître',");
    return chunk;
  });

  source = editLesson(source, 'constr-pronominaux', chunk => {
    chunk = chunk.replace(
      "          'Местоименные глаголы всегда идут с местоимением, которое согласуется с подлежащим: ' +\n          'me, te, se, nous, vous, se. В словаре они записываются с частицей se.',",
      "          'Местоименные глаголы употребляются с местоимением, которое меняется вместе с лицом: ' +\n          'me, te, se, nous, vous, se. В словаре такие глаголы записываются с se: se laver, se lever.',",
    );
    const advancedPc = [
      '      {',
      "        heading: 'В составных временах — être',",
      '        body:',
      "          'Местоименные глаголы образуют сложные времена с être: elle s’est levée. Но ' +",
      "          'согласование не автоматическое: elle s’est lavé les mains, потому что прямое ' +",
      "          'дополнение les mains стоит после причастия.',",
      '      },',
    ].join('\n');
    const advancedImp = [
      '      {',
      "        heading: 'В императиве местоимение уходит вправо',",
      '        body:',
      "          'В утвердительной форме оно ставится после глагола через дефис, причём te ' +",
      "          'превращается в toi: lave-toi, levons-nous, dépêchez-vous.',",
      '      },',
    ].join('\n');
    chunk = chunk.replace(advancedPc + '\n', '').replace(advancedImp + '\n', '');
    return chunk;
  });

  // ── Passé: сначала passé composé и его базовые правила, затем imparfait ──
  source = editLesson(source, 'passe-compose-avoir', chunk => {
    chunk = chunk.replace(
      "          'Если прямого дополнения перед причастием нет, форма не меняется: elles ont parlé. ' +\n          'Но предшествующее прямое дополнение вызывает согласование: les lettres qu’elles ' +\n          'ont écrites. В изолированной таблице тренажёр показывает базовую форму.',",
      "          'В обычной конструкции с avoir причастие остаётся неизменным: elle a parlé, elles ont parlé. ' +\n          'Отдельное правило для прямого дополнения перед причастием будет разобрано позже.',",
    );
    return chunk;
  });

  source = editLesson(source, 'imparfait-vs-passe-compose', chunk => {
    chunk = chunk.replace(
      "          'Оба времени переводятся на русский одинаково, но описывают разное. ' +\n          'Разница не во времени события, а в том, как говорящий на него смотрит.',",
      "          'Оба времени часто передаются русским прошедшим, поэтому выбирать их только по переводу нельзя. ' +\n          'Passé composé обычно выделяет завершённое событие, а imparfait задаёт фон, состояние, привычку или процесс.',",
    );
    return chunk;
  });

  source = editLesson(source, 'choix-auxiliaire', chunk => {
    chunk = chunk.replace("title: 'Глаголы с двумя вспомогательными',", "title: 'Être или avoir в passé composé',");
    chunk = chunk.replace(
      "summary: 'monter, sortir, passer — être или avoir по смыслу',",
      "summary: 'Почему monter, sortir и некоторые другие глаголы могут брать оба вспомогательных',",
    );
    chunk = chunk.replace(
      "          'Часть глаголов из списка être может брать и avoir. Выбор определяется не капризом, ' +\n          'а наличием прямого дополнения.',",
      "          'Некоторые глаголы употребляются и с être, и с avoir — в зависимости от конструкции. ' +\n          'Для monter, descendre, sortir, rentrer, retourner и passer важна переходность: есть ли прямое дополнение.',",
    );
    return chunk;
  });

  source = editLesson(source, 'accord-participe', chunk => {
    chunk = chunk.replace("title: 'Согласование причастия',", "title: 'Согласование participe passé',");
    chunk = chunk.replace(
      "summary: 'Когда причастие меняет род и число',",
      "summary: 'Базовое правило с être и avoir',",
    );
    chunk = chunk.replace(
      "          'Причастие в составных временах ведёт себя то как глагол, то как прилагательное. ' +\n          'Всё зависит от вспомогательного.',",
      "          'В passé composé правила согласования зависят прежде всего от вспомогательного глагола. ' +\n          'Сначала достаточно освоить базовую разницу между être и avoir.',",
    );
    chunk = chunk.replace(
      "          'Причастие остаётся в базовой форме: elles ont mangé. Исключение существует — ' +\n          'согласование с предшествующим прямым дополнением, — но в тренажёре форм оно не ' +\n          'проверяется, потому что зависит от порядка слов в предложении.',",
      "          'В обычной конструкции с avoir причастие не согласуется с подлежащим: ' +\n          'elle a mangé, elles ont mangé. Более сложный случай с прямым дополнением перед причастием вынесен в отдельную тему.',",
    );
    const reflexive = [
      '      {',
      "        heading: 'Местоименные глаголы',",
      '        body:',
      "          'Они спрягаются с être, но согласование зависит от роли se и прямого дополнения: ' +",
      "          'elle s’est levée; elle s’est lavé les mains; elles se sont parlé. Простого правила ' +",
      "          '«être — значит согласовать с подлежащим» здесь недостаточно.',",
      '        table: {',
      "          verbId: 'se laver',",
      "          tense: 'passeCompose',",
      "          caption: 'se laver — согласование зависит от конструкции',",
      '        },',
      '      },',
    ].join('\n');
    chunk = chunk.replace(reflexive + '\n', '');
    chunk = chunk.replace("      tenses: ['passeCompose', 'plusQueParfait'],", "      tenses: ['passeCompose'],");
    return chunk;
  });

  // ── Futur / composés: не объясняем следующую тему заранее ───────────────
  source = editLesson(source, 'futur-simple', chunk => {
    chunk = chunk.replace(
      "summary: 'Окончания приклеиваются прямо к инфинитиву',",
      "summary: 'Как образуется простое будущее время',",
    );
    return chunk;
  });

  source = editLesson(source, 'conditionnel', chunk => {
    chunk = chunk.replace(
      "          'вежливость: je voudrais un café — вместо резкого je veux',",
      "          'вежливая просьба или пожелание: je voudrais un café',",
    );
    return chunk;
  });

  source = editLesson(source, 'plus-que-parfait', chunk => {
    const ahead = [
      '      {',
      "        heading: 'В условных предложениях',",
      '        body:',
      "          'После si в нереальном условии прошлого ставят plus-que-parfait, а в главной части — ' +",
      "          'conditionnel passé: si j’avais su, je serais venu.',",
      '      },',
    ].join('\n');
    chunk = chunk.replace(ahead + '\n', '');
    return chunk;
  });

  // ── Impératif: ранний блок должен быть самодостаточным ──────────────────
  source = editLesson(source, 'imperatif-present', chunk => {
    chunk = chunk.replace(
      "          'В отличие от испанского, французский обходится теми же формами: ' +\n          'ne parle pas, ne parlons pas. Отдельного отрицательного императива нет.',",
      "          'В отрицании используются те же формы: ne parle pas, ne parlons pas, ne parlez pas. ' +\n          'Отдельного набора окончаний для отрицательного impératif нет.',",
    );
    return chunk;
  });

  source = editLesson(source, 'imperatif-irreguliers', chunk => {
    chunk = chunk.replace(
      "summary: 'Четыре глагола берут формы из subjonctif',",
      "summary: 'Être, avoir, savoir и vouloir имеют особые формы',",
    );
    chunk = chunk.replace(
      "          'être, avoir, savoir и vouloir образуют повелительное наклонение не от настоящего ' +\n          'времени, а от сослагательного.',",
      "          'У être, avoir, savoir и vouloir формы impératif нельзя получить простым отбрасыванием подлежащего. ' +\n          'Их нужно запомнить отдельно.',",
    );
    const yEn = [
      '      {',
      "        heading: 'aller',",
      '        body:',
      "          'Форма va теряет -s как глагол первой группы, но перед наречиями y и en ' +",
      "          'оно возвращается для благозвучия: vas-y.',",
      '      },',
    ].join('\n');
    chunk = chunk.replace(yEn + '\n', '');
    return chunk;
  });

  // ── Subjonctif: правило il faut que появляется только здесь ─────────────
  source = editLesson(source, 'subj-volonte', chunk => {
    chunk = chunk.replace(
      "          'Сослагательное появляется после выражений воли, желания и требования. ' +\n          'Логика общая: действие в придаточном ещё не факт, а лишь чьё-то намерение.',",
      "          'После ряда выражений желания, требования и необходимости во французском употребляется subjonctif. ' +\n          'Это часть управления конструкции, поэтому полезно запоминать выражение сразу вместе с que.',",
    );
    if (!chunk.includes("heading: 'Il faut que'")) {
      const anchor = [
        '      {',
        "        heading: 'Основные глаголы',",
      ].join('\n');
      const at = chunk.indexOf(anchor);
      if (at < 0) throw new Error('Editorial review: subj-volonte insertion point missing');
      const insert = [
        '      {',
        "        heading: 'Il faut que',",
        '        body:',
        "          'Если необходимость относится к конкретному подлежащему, используется il faut que + subjonctif: ' +",
        "          'il faut que tu partes — «тебе нужно уйти», il faut que nous fassions vite — «нам нужно поторопиться».',",
        '      },',
        '',
      ].join('\n');
      chunk = chunk.slice(0, at) + insert + chunk.slice(at);
    }
    return chunk;
  });

  source = editLesson(source, 'subj-emotion-doute', chunk => {
    chunk = chunk.replace(
      "summary: 'Вторая большая группа контекстов',",
      "summary: 'Эмоции, сомнение и отрицание уверенности',",
    );
    return chunk;
  });

  // ── Синтаксис: терминология по-русски, французские термины только там,
  // где они нужны как название формы ───────────────────────────────────────
  source = editLesson(source, 'syntax-participe-cod', chunk => {
    chunk = chunk.replace("title: 'Participe passé с предшествующим COD',", "title: 'Причастие и прямое дополнение',");
    chunk = chunk.replace(
      "summary: 'les lettres que j’ai écrites, je les ai vues',",
      "summary: 'Когда с avoir причастие всё-таки согласуется',",
    );
    chunk = chunk.replace(
      "          'С avoir причастие обычно не согласуется, но предшествующий прямой объект меняет правило: причастие получает его род и число.',",
      "          'С avoir причастие обычно не согласуется. Но если прямое дополнение (COD) стоит перед причастием, ' +\n          'причастие согласуется с ним в роде и числе.',",
    );
    chunk = chunk.replace(
      "        body: 'В causatif participe passé fait перед инфинитивом остаётся неизменным: les chansons qu’elle a fait chanter.',",
      "        body: 'В конструкции faire + infinitif причастие fait перед инфинитивом остаётся неизменным: les chansons qu’elle a fait chanter.',",
    );
    return chunk;
  });

  source = editLesson(source, 'syntax-past-contrast', chunk => {
    chunk = chunk.replace(
      "          'Три времени становятся понятнее, когда конкурируют в одном контексте. Задача не «образовать imparfait», а решить, какую временную перспективу требует фраза.',",
      "          'Здесь три прошедших времени сравниваются в одном контексте. Нужно не просто образовать форму, ' +\n          'а определить, что перед нами: фон или процесс, завершённое событие либо действие, которое произошло ещё раньше.',",
    );
    return chunk;
  });

  // Устанавливаем явный порядок уроков внутри каждого блока. Так добавление нового
  // объекта в массив больше не сможет случайно поставить сложную тему раньше базы.
  if (!source.includes('const EDITORIAL_LESSON_ORDER')) {
    const anchor = '\nexport function getLessonById(id: string): Lesson | undefined {';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Editorial review: getLessonById anchor missing');
    const order = `\nconst EDITORIAL_LESSON_ORDER = [\n  'present-trois-groupes',\n  'present-etre-avoir',\n  'present-g1-cer-ger',\n  'present-g1-alternance',\n  'present-g1-yer',\n  'present-g2',\n  'present-g3-ir',\n\n  'constr-futur-proche',\n  'constr-passe-recent',\n  'constr-en-train',\n  'constr-modaux',\n  'constr-savoir-connaitre',\n  'constr-il-faut',\n  'constr-pronominaux',\n\n  'imperatif-present',\n  'imperatif-irreguliers',\n\n  'passe-compose-avoir',\n  'passe-compose-etre',\n  'choix-auxiliaire',\n  'accord-participe',\n  'imparfait',\n  'imparfait-vs-passe-compose',\n\n  'futur-simple',\n  'futur-irreguliers',\n  'conditionnel',\n\n  'plus-que-parfait',\n  'futur-anterieur',\n  'conditionnel-passe',\n\n  'syntax-prepositions',\n  'syntax-time-markers',\n  'syntax-pronoms-y-en',\n  'syntax-past-contrast',\n  'syntax-si',\n  'syntax-participe-cod',\n\n  'subj-present-formation',\n  'subj-present-irreguliers',\n  'subj-volonte',\n  'subj-emotion-doute',\n  'subj-conjonctions',\n  'subj-passe',\n\n  'litt-passe-simple',\n  'litt-subjonctif-imparfait',\n  'imperatif-passe',\n] as const;\n\nconst EDITORIAL_ORDER_INDEX = new Map<string, number>(\n  EDITORIAL_LESSON_ORDER.map((id, index) => [id, index]),\n);\n\nLESSONS.sort((left, right) =>\n  (EDITORIAL_ORDER_INDEX.get(left.id) ?? Number.MAX_SAFE_INTEGER) -\n  (EDITORIAL_ORDER_INDEX.get(right.id) ?? Number.MAX_SAFE_INTEGER),\n);\n`;
    source = source.slice(0, at) + order + source.slice(at);
  }

  return source;
});

// ── 2. Все объяснения в новых грамматических упражнениях — по-русски ───────
edit('data/grammar-drills.ts', source => {
  source = source.replace("title: 'À / DE / без предлога',", "title: 'Предлоги после глаголов',");
  source = source.replace("subtitle: 'Управление французских глаголов',", "subtitle: 'à, de или без предлога',");
  source = source.replace("title: 'Participe passé + COD',", "title: 'Причастие и прямое дополнение',");
  source = source.replace("subtitle: 'Согласование по позиции дополнения',", "subtitle: 'Когда причастие меняет род и число',");
  source = source.replace("title: 'Три прошедших времени',", "title: 'Выбор прошедшего времени',");
  source = source.replace("subtitle: 'Imparfait / passé composé / plus-que-parfait',", "subtitle: 'imparfait, passé composé или plus-que-parfait',");

  if (!source.includes('function editorialExplanation(')) {
    const anchor = 'function materialize(lessonId: GrammarLessonId, raw: RawQuestion): GrammarQuizQuestion {';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Editorial review: grammar materialize anchor missing');
    const helper = `function editorialExplanation(lessonId: GrammarLessonId, raw: RawQuestion): string {\n  const answer = raw.answer.trim();\n  const prompt = raw.prompt;\n  const speech = raw.speech ?? '';\n\n  if (lessonId === 'syntax-pronoms-y-en') {\n    return raw.explanation\n      .replace('verbe', 'глагол')\n      .replace('les puis lui', 'сначала les, затем lui')\n      .replace('COI', 'косвенное дополнение (COI)')\n      .replace('COD', 'прямое дополнение (COD)');\n  }\n\n  if (lessonId === 'syntax-prepositions') {\n    if (answer === '—') {\n      return 'Здесь дополнение присоединяется без предлога. Управление глагола лучше запоминать вместе с готовой конструкцией.';\n    }\n    return \`Здесь требуется предлог «\${answer}». Управление глагола лучше запоминать целиком: глагол + \${answer} + инфинитив или дополнение.\`;\n  }\n\n  if (lessonId === 'syntax-participe-cod') {\n    if (prompt.includes('___ chanter')) {\n      return 'В конструкции faire + infinitif причастие fait остаётся неизменным.';\n    }\n    if (prompt.includes('(parler)') || prompt.includes('(téléphoner)')) {\n      return 'У parler и téléphoner местоимение se является косвенным дополнением, поэтому причастие не согласуется.';\n    }\n    if (prompt.includes('s’est ___ les mains')) {\n      return 'Прямое дополнение les mains стоит после причастия; se здесь косвенное дополнение, поэтому пишется lavé без окончания.';\n    }\n    if (prompt.includes('Elle s’est ___.')) {\n      return 'В se laver без другого прямого дополнения se относится к elle и является прямым дополнением, поэтому причастие согласуется: lavée.';\n    }\n    if (prompt.includes('(rencontrer)')) {\n      return 'В se rencontrer местоимение se является прямым дополнением и относится к elles, поэтому нужно согласование: rencontrées.';\n    }\n    const before = /\\bque\\b|qu[’']|\\bles ai\\b|l[’']ai|Quels|Quelle|Cette porte|Les photos/u.test(prompt);\n    if (before) {\n      return \`Прямое дополнение стоит перед причастием. С avoir причастие согласуется с ним в роде и числе: «\${answer}».\`;\n    }\n    return 'Прямое дополнение стоит после причастия, поэтому с avoir согласования нет.';\n  }\n\n  if (lessonId === 'syntax-si') {\n    if (/avais su|avait étudié|étions partis|m[’']avais appelé|aviez réservé|était venue|avais été|avions su/u.test(speech)) {\n      return 'Для нереального условия в прошлом используется si + plus-que-parfait, а в главной части — conditionnel passé.';\n    }\n    if (/j[’']avais plus|habitions|parlait français|j[’']étais toi|pouvais choisir|connaissais|magasin était/u.test(speech)) {\n      return 'Для гипотезы о настоящем или будущем используется si + imparfait, а в главной части — conditionnel présent.';\n    }\n    return 'В реальном условии после si ставится présent. В главной части возможны présent, futur simple или impératif — в зависимости от смысла.';\n  }\n\n  if (lessonId === 'syntax-past-contrast') {\n    if (/^(avait|avaient|avions|aviez|étais|était|étaient)\\b/u.test(answer) && answer.includes(' ')) {\n      return 'Это действие произошло раньше другого момента в прошлом, поэтому нужен plus-que-parfait.';\n    }\n    if (/^(ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont)\\b/u.test(answer) && answer.includes(' ')) {\n      return 'Здесь действие представлено как завершённое событие, поэтому нужен passé composé.';\n    }\n    return 'Здесь описывается фон, состояние, привычка или действие в процессе, поэтому нужен imparfait.';\n  }\n\n  if (lessonId === 'syntax-time-markers') {\n    const key = answer.toLowerCase();\n    if (key === 'depuis') return 'Depuis указывает на начало состояния или действия, которое продолжается до точки отсчёта.';\n    if (key === 'pendant') return 'Pendant обозначает длительность ограниченного интервала; часто речь идёт об уже завершённом периоде.';\n    if (key === 'il y a') return 'Il y a + отрезок времени означает «столько-то времени назад» и указывает на момент в прошлом.';\n    if (key === 'pour') return 'Pour + срок указывает на предполагаемую или запланированную длительность.';\n    if (key === 'ça fait') return 'Ça fait + длительность + que — один из способов сказать, как долго продолжается ситуация.';\n    if (key === 'que') return 'В конструкции ça fait + длительность + que перед придаточной частью ставится que.';\n  }\n\n  return /[А-Яа-яЁё]/u.test(raw.explanation)\n    ? raw.explanation\n    : \`Правильный вариант: «\${answer}».\`;\n}\n\n`;
    source = source.slice(0, at) + helper + source.slice(at);
  }

  source = source.replace('    explanation: raw.explanation,', '    explanation: editorialExplanation(lessonId, raw),');
  return source;
});

// ── 3. Несколько явно машинных переводов в примерах ───────────────────────
edit('data/examples.ts', source => {
  const edits = [
    ["ru: 'В то время у нас было время.'", "ru: 'В то время у нас было достаточно времени.'"],
    ["ru: 'Мы выпили вместе кофе.'", "ru: 'Мы вместе выпили кофе.'"],
    ["ru: 'Они умерли в один год.'", "ru: 'Они умерли в том же году.'"],
    ["ru: 'Ответ ты получишь завтра.'", "ru: 'Ты получишь ответ завтра.'"],
    ["ru: 'Он побежит марафон.'", "ru: 'Он побежит марафонскую дистанцию.'"],
  ];
  for (const [from, to] of edits) source = source.replace(from, to);
  return source;
});

console.log('Applied full Russian editorial review and logical lesson order.');
