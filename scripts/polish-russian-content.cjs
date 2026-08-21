const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function lessonChunk(source, id) {
  const marker = `  {\n    id: '${id}',`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Russian polish: lesson ${id} not found`);
  const next = source.indexOf("\n  {\n    id: '", start + marker.length);
  const endOfArray = source.indexOf('\n];', start + marker.length);
  const end = next >= 0 && (endOfArray < 0 || next < endOfArray) ? next : endOfArray;
  if (end < 0) throw new Error(`Russian polish: end of lesson ${id} not found`);
  return { start, end, text: source.slice(start, end) };
}

function editLesson(source, id, transform) {
  const { start, end, text } = lessonChunk(source, id);
  const next = transform(text);
  return source.slice(0, start) + next + source.slice(end);
}

function setField(chunk, field, value) {
  const pattern = new RegExp(`(^\\s{4}${field}: )(['\"]).*?\\2,$`, 'mu');
  if (!pattern.test(chunk)) throw new Error(`Russian polish: ${field} not found in lesson`);
  return chunk.replace(pattern, `$1${JSON.stringify(value)},`);
}

function heading(chunk, from, to) {
  return chunk.replace(`heading: '${from}'`, `heading: ${JSON.stringify(to)}`);
}

function replaceBodyContaining(chunk, needle, text) {
  const at = chunk.indexOf(needle);
  if (at < 0) return chunk;
  const bodyAt = chunk.lastIndexOf('body:', at);
  if (bodyAt < 0) throw new Error(`Russian polish: body not found for ${needle}`);
  const candidates = [
    chunk.indexOf('\n        table:', at),
    chunk.indexOf('\n        bullets:', at),
    chunk.indexOf('\n      },', at),
  ].filter(index => index >= 0);
  const end = Math.min(...candidates);
  if (!Number.isFinite(end)) throw new Error(`Russian polish: body end not found for ${needle}`);
  return chunk.slice(0, bodyAt) + `body: ${JSON.stringify(text)},` + chunk.slice(end);
}

const META = {
  'present-trois-groupes': ['Три группы глаголов', 'Как различать три группы и чего ждать от спряжения'],
  'present-etre-avoir': ['Être, avoir, aller и faire', 'Четыре частотных глагола, которые нужны с самого начала'],
  'present-g1-cer-ger': ['Глаголы на -cer и -ger', 'Почему пишется nous commençons и nous mangeons'],
  'present-g1-alternance': ['Чередования e/é → è и удвоение согласной', 'acheter → j’achète, appeler → j’appelle'],
  'present-g1-yer': ['Глаголы на -yer', 'Когда y меняется на i: nettoyer, payer и другие'],
  'present-g2': ['Вторая группа', 'Регулярная модель на -ir с -iss-'],
  'present-g3-ir': ['Третья группа на -ir', 'Основные модели: partir, ouvrir и venir'],
  'constr-futur-proche': ['Futur proche', 'aller + infinitif для планов и ближайшего будущего'],
  'constr-passe-recent': ['Passé récent', 'venir de + infinitif: действие только что произошло'],
  'constr-en-train': ['Être en train de', 'Как подчеркнуть, что действие происходит прямо сейчас'],
  'constr-modaux': ['Pouvoir, vouloir и devoir', 'Мочь, хотеть и быть должным: глагол + infinitif'],
  'constr-il-faut': ['Безличные обороты', 'il faut, il pleut и другие конструкции с формальным il'],
  'constr-savoir-connaitre': ['Savoir и connaître', 'Когда по-французски нужно savoir, а когда connaître'],
  'constr-pronominaux': ['Местоименные глаголы', 'Как работают me, te, se, nous и vous при глаголе'],
  'passe-compose-avoir': ['Passé composé с avoir', 'Как образуется passé composé у большинства глаголов'],
  'passe-compose-etre': ['Passé composé с être', 'Какие глаголы образуют passé composé с être'],
  'choix-auxiliaire': ['Être или avoir в passé composé', 'Когда один глагол может употребляться с разными вспомогательными'],
  'accord-participe': ['Согласование participe passé', 'Базовые правила с être и avoir'],
  'imparfait': ['Imparfait', 'Как образуется imparfait и где меняется написание'],
  'imparfait-vs-passe-compose': ['Imparfait или passé composé', 'Как выбрать между фоном и завершённым событием'],
  'futur-simple': ['Futur simple', 'Как образуется простое будущее время'],
  'futur-irreguliers': ['Неправильные основы futur simple', 'Основы будущего времени, которые нужно запомнить'],
  'conditionnel': ['Conditionnel présent', 'Как образуется conditionnel présent и где он употребляется'],
  'plus-que-parfait': ['Plus-que-parfait', 'Действие, которое произошло раньше другого момента в прошлом'],
  'futur-anterieur': ['Futur antérieur', 'Действие, которое завершится к определённому моменту в будущем'],
  'conditionnel-passe': ['Conditionnel passé', 'Как говорить о том, что могло бы произойти в прошлом'],
  'imperatif-present': ['Impératif présent', 'Повелительные формы для tu, nous и vous'],
  'imperatif-irreguliers': ['Особые формы impératif', 'Être, avoir, savoir и vouloir: формы, которые нужно запомнить'],
  'imperatif-passe': ['Impératif passé', 'Редкая форма: действие должно быть завершено к указанному моменту'],
  'syntax-pronoms-y-en': ['Y, en и порядок местоимений', 'Как заменить дополнение и поставить местоимение на нужное место'],
  'syntax-prepositions': ['Предлоги после глаголов', 'Когда нужен à, de, а когда предлог не ставится'],
  'syntax-participe-cod': ['Причастие и прямое дополнение', 'Когда participe passé с avoir согласуется'],
  'syntax-si': ['Условные предложения с si', 'Три основные модели: реальное условие, гипотеза и прошлое'],
  'syntax-past-contrast': ['Три прошедших времени', 'Imparfait, passé composé и plus-que-parfait в одном контексте'],
  'syntax-time-markers': ['Маркеры времени и длительности', 'depuis, pendant, il y a, ça fait и pour'],
  'subj-present-formation': ['Как образуется subjonctif présent', 'Основы и окончания настоящего сослагательного'],
  'subj-present-irreguliers': ['Неправильные формы subjonctif', 'Être, avoir, aller и другие частотные глаголы'],
  'subj-volonte': ['Желание, требование и необходимость', 'Конструкции с que, после которых употребляется subjonctif'],
  'subj-emotion-doute': ['Эмоции и сомнение', 'Когда subjonctif выражает оценку или неуверенность'],
  'subj-conjonctions': ['Союзы с subjonctif', 'pour que, avant que, bien que и другие частотные союзы'],
  'subj-passe': ['Subjonctif passé', 'Как выразить завершённое действие в subjonctif'],
  'litt-passe-simple': ['Passé simple и passé antérieur', 'Как распознавать основные времена письменного повествования'],
  'litt-subjonctif-imparfait': ['Книжные формы subjonctif', 'Subjonctif imparfait и plus-que-parfait для чтения'],
};

const INTROS = {
  'present-trois-groupes': ['Французские глаголы делятся на три группы', 'Во французском глаголы традиционно делят на три группы. Это помогает понять, по какой модели глагол спрягается в настоящем времени и насколько его формы регулярны.'],
  'present-etre-avoir': ['Эти четыре глагола встречаются постоянно', 'Être, avoir, aller и faire встречаются постоянно, поэтому их формы стоит выучить в самом начале. Позже être и avoir понадобятся для составных времён, а aller и faire — для множества частотных конструкций.'],
  'present-g1-cer-ger': ['Буквы c и g читаются мягко', 'Перед e и i буквы c и g произносятся мягко, а перед a, o и u — твёрдо. В некоторых формах написание меняется, чтобы сохранить то же произношение основы.'],
  'present-g1-alternance': ['Часть глаголов первой группы меняет основу', 'У некоторых глаголов первой группы основа меняется в формах je, tu, il/elle и ils/elles. Это отражает произношение: j’achète, но nous achetons; j’appelle, но nous appelons.'],
  'present-g1-yer': ['Перед немым окончанием y переходит в i', 'У глаголов на -oyer и -uyer буква y меняется на i в формах je, tu, il/elle и ils/elles: je nettoie, ils emploient. У глаголов на -ayer часто допустимы оба варианта: je paye и je paie.'],
  'present-g2': ['Вторая группа в настоящем времени регулярна', 'Глаголы второй группы спрягаются по устойчивой модели: -is, -is, -it в единственном числе и -issons, -issez, -issent во множественном. Характерный признак — сочетание -iss-.'],
  'present-g3-ir': ['Глаголы третьей группы на -ir распадаются', 'Глаголы третьей группы на -ir образуют несколько устойчивых семейств. Удобнее запоминать не один общий шаблон, а модели partir, ouvrir и venir вместе с похожими глаголами.'],
  'constr-futur-proche': ['Futur proche строится так', 'Futur proche строится по схеме aller в présent + infinitif. Je vais partir можно перевести как «я собираюсь уехать» или «я скоро уеду». Особенно часто эта конструкция используется для планов и намерений, связанных с текущей ситуацией.'],
  'constr-passe-recent': ['Passé récent строится так', 'Passé récent строится по схеме venir в présent + de + infinitif. Je viens de manger значит «я только что поел».'],
  'constr-en-train': ['Во французском нет отдельной формы', 'Чтобы специально подчеркнуть, что действие происходит в данный момент, используют être en train de + infinitif: je suis en train de travailler. Во многих случаях обычного présent достаточно.'],
  'constr-modaux': ['Три модальных глагола присоединяют', 'Pouvoir, vouloir и devoir ставятся перед инфинитивом без предлога: je peux venir, je veux partir, je dois travailler. Все три глагола имеют неправильные формы настоящего времени.'],
  'constr-il-faut': ['В безличных оборотах il не обозначает', 'В безличных оборотах il не обозначает конкретного человека или предмет. Например, il faut значит «нужно», а il pleut — «идёт дождь».'],
  'constr-savoir-connaitre': ['Русское «знать» распадается', 'Русскому «знать» во французском соответствуют два основных глагола. Savoir употребляется, когда речь идёт о факте или умении, connaître — когда кто-то знаком с человеком, местом или предметом.'],
  'constr-pronominaux': ['Местоименные глаголы всегда идут', 'У местоименных глаголов перед личной формой стоит местоимение, которое меняется вместе с лицом: je me lave, tu te lèves, nous nous couchons. В словаре такие глаголы записываются с se.'],
  'passe-compose-avoir': ['Passé composé строится из вспомогательного', 'Passé composé образуется из avoir или être в présent и participe passé основного глагола. Большинство глаголов употребляется с avoir.'],
  'passe-compose-etre': ['Небольшая группа непереходных глаголов', 'Некоторые глаголы образуют passé composé с être: je suis allé, elle est venue, nous sommes partis. Их лучше запомнить как отдельную группу: одного значения движения для выбора вспомогательного недостаточно.'],
  'choix-auxiliaire': ['Некоторые глаголы употребляются и с être', 'Некоторые глаголы могут образовывать passé composé и с être, и с avoir. Выбор зависит от того, употреблён глагол самостоятельно или имеет прямое дополнение: il est sorti, но il a sorti la voiture.'],
  'accord-participe': ['В passé composé правила согласования', 'В составных временах причастие ведёт себя по-разному с être и avoir. На этом этапе достаточно запомнить базовое правило: с être оно обычно согласуется с подлежащим, с avoir — обычно нет.'],
  'imparfait': ['Для большинства глаголов imparfait образуется', 'Для большинства глаголов imparfait образуется от формы nous в présent: убираем -ons и добавляем -ais, -ais, -ait, -ions, -iez, -aient.'],
  'imparfait-vs-passe-compose': ['Оба времени часто передаются русским прошедшим', 'И imparfait, и passé composé часто переводятся русским прошедшим временем, поэтому одного перевода недостаточно. Passé composé обычно обозначает отдельное завершённое событие, а imparfait — фон, состояние, привычку или процесс.'],
  'futur-simple': ['Основа будущего времени — сам инфинитив', 'У большинства глаголов futur simple образуется от инфинитива: к основе добавляются окончания -ai, -as, -a, -ons, -ez, -ont. У глаголов на -re конечная e перед окончаниями исчезает.'],
  'futur-irreguliers': ['У самых частотных глаголов основа будущего', 'У ряда частотных глаголов futur simple строится от особой основы: aller → ir-, être → ser-, avoir → aur-. Эти же основы используются в conditionnel présent.'],
  'conditionnel': ['Conditionnel présent собирается', 'Conditionnel présent образуется от той же основы, что futur simple, но с окончаниями imparfait: -ais, -ais, -ait, -ions, -iez, -aient.'],
  'plus-que-parfait': ['Вспомогательный глагол ставится в imparfait', 'Plus-que-parfait образуется из avoir или être в imparfait и participe passé. Оно показывает, что одно действие произошло раньше другого момента в прошлом.'],
  'futur-anterieur': ['Вспомогательный глагол в futur simple', 'Futur antérieur образуется из avoir или être в futur simple и participe passé. Оно показывает, что действие будет завершено раньше другого будущего события или к определённому сроку.'],
  'conditionnel-passe': ['Вспомогательный глагол в conditionnel présent', 'Conditionnel passé образуется из avoir или être в conditionnel présent и participe passé. Часто оно обозначает действие, которое могло бы произойти в прошлом, но не произошло.'],
  'imperatif-present': ['Императив существует только для tu', 'Во французском impératif présent имеет три формы: для tu, nous и vous. Подлежащее не ставится: parle, parlons, parlez.'],
  'imperatif-irreguliers': ['У être, avoir, savoir и vouloir', 'У être, avoir, savoir и vouloir формы impératif présent отличаются от обычных форм présent. Их проще выучить отдельно: sois, aie, sache, veuillez.'],
  'imperatif-passe': ['Вспомогательный глагол ставится в императив', 'Impératif passé образуется из avoir или être в impératif présent и participe passé: aie fini avant midi. Форма редкая и обычно подчёркивает срок, к которому действие должно быть завершено.'],
  'syntax-pronoms-y-en': ['Французские местоимения-дополнения образуют фиксированный порядок', 'Во французском местоимение нужно не только правильно выбрать, но и поставить на нужное место. Y и en заменяют разные типы дополнений, а при нескольких местоимениях порядок фиксирован.'],
  'syntax-prepositions': ['Управление во французском часто нельзя вывести', 'После французского глагола может требоваться à, de или вообще никакой предлог. Это не всегда совпадает с русским, поэтому полезно запоминать глагол сразу вместе с его конструкцией.'],
  'syntax-participe-cod': ['С avoir причастие обычно не согласуется', 'С avoir participe passé обычно остаётся неизменным. Но если прямое дополнение стоит перед причастием, причастие согласуется с ним в роде и числе.'],
  'syntax-si': ['Главная ловушка — не отдельное время', 'В условных предложениях с si важно правильно сочетать времена в условии и результате. В трёх основных моделях conditionnel непосредственно после si не ставится.'],
  'syntax-past-contrast': ['Здесь три прошедших времени сравниваются', 'Imparfait, passé composé и plus-que-parfait могут встретиться в одном рассказе. Выбор зависит от роли действия: фон или процесс, завершённое событие либо событие, которое произошло ещё раньше.'],
  'syntax-time-markers': ['Русское «уже три года»', 'Depuis, pendant, il y a, ça fait и pour по-разному показывают длительность и точку отсчёта. От выбранной конструкции часто зависит и время глагола.'],
  'subj-present-formation': ['Возьмите форму ils в настоящем времени', 'Для большинства глаголов формы je, tu, il/elle и ils/elles в subjonctif présent образуются от основы формы ils в présent. Формы nous и vous часто используют другую основу.'],
  'subj-present-irreguliers': ['У нескольких частотных глаголов стандартная схема', 'У нескольких частотных глаголов subjonctif présent имеет особые основы, которые нельзя полностью получить по общей схеме. Эти формы лучше запомнить отдельно.'],
  'subj-volonte': ['После ряда выражений желания', 'После ряда выражений желания, требования и необходимости употребляется subjonctif: vouloir que, demander que, il faut que. Такие конструкции удобнее запоминать целиком.'],
  'subj-emotion-doute': ['Subjonctif требуется после выражений чувства', 'Subjonctif часто употребляется после выражений эмоции, сомнения и неуверенности. При этом событие может быть вполне реальным: наклонение показывает отношение говорящего, а не «нереальность» события.'],
  'subj-conjonctions': ['Некоторые устойчивые союзы надёжно требуют', 'После ряда союзов употребляется subjonctif: pour que, avant que, bien que, à condition que и других. Их удобнее запоминать как готовые конструкции.'],
  'subj-passe': ['Вспомогательный глагол ставится в subjonctif présent', 'Subjonctif passé образуется из avoir или être в subjonctif présent и participe passé. Оно употребляется в тех же типах конструкций, что и subjonctif présent, но обозначает уже завершённое действие.'],
  'litt-passe-simple': ['Passé simple выполняет в повествовании', 'Passé simple характерно прежде всего для письменного повествования: романов, исторических текстов и сказок. В современной разговорной речи оно встречается редко, поэтому важнее всего научиться узнавать его при чтении.'],
  'litt-subjonctif-imparfait': ['Эти формы нужны прежде всего для чтения', 'Subjonctif imparfait и plus-que-parfait встречаются главным образом в классической, литературной и очень формальной речи. Для повседневного общения активно употреблять их обычно не требуется.'],
};

edit('data/lessons.ts', source => {
  for (const [id, [title, summary]] of Object.entries(META)) {
    source = editLesson(source, id, chunk => {
      chunk = setField(chunk, 'title', title);
      chunk = setField(chunk, 'summary', summary);
      const intro = INTROS[id];
      if (intro) chunk = replaceBodyContaining(chunk, intro[0], intro[1]);
      return chunk;
    });
  }

  const headingEdits = [
    ['present-trois-groupes', 'Первая группа: -er', 'Первая группа: глаголы на -er'],
    ['present-trois-groupes', 'Вторая группа: -ir с расширением -iss-', 'Вторая группа: глаголы на -ir с -iss-'],
    ['present-trois-groupes', 'Третья группа: всё остальное', 'Третья группа: остальные глаголы'],
    ['present-trois-groupes', 'Подлежащее обычно обязательно', 'Подлежащее обычно не опускается'],
    ['present-etre-avoir', 'Формы на -tes', 'Формы vous êtes, vous faites и vous dites'],
    ['present-g2', 'Откуда они берутся', 'Типичные глаголы второй группы'],
    ['present-g3-ir', 'Тип partir: теряют согласную', 'Тип partir: основа меняется в единственном числе'],
    ['constr-futur-proche', 'Чем отличается от futur simple', 'Futur proche и futur simple'],
    ['constr-en-train', 'Действие рассматривается как процесс', 'Когда конструкция особенно уместна'],
    ['constr-savoir-connaitre', 'Циркумфлекс', 'Написание connaître'],
    ['imparfait-vs-passe-compose', 'Passé composé — событие', 'Passé composé: завершённое событие'],
    ['imparfait-vs-passe-compose', 'Imparfait — фон', 'Imparfait: фон, состояние или привычка'],
    ['imparfait-vs-passe-compose', 'Подсказки, а не переключатели', 'Слова-подсказки'],
    ['futur-simple', 'Чередования доходят и сюда', 'Изменения основы'],
    ['futur-irreguliers', 'Удвоенное -rr-', 'Основы с двойным r'],
    ['conditionnel', 'Не путать с futur', 'Futur или conditionnel'],
    ['conditionnel-passe', 'Полная условная конструкция', 'Условие в прошлом'],
    ['choix-auxiliaire', 'Смысл меняется вместе с вспомогательным', 'Сравните значения'],
    ['imperatif-present', 'Отрицание отдельного спряжения не требует', 'Отрицательная форма'],
    ['imperatif-passe', 'Вспомогательный по общему правилу', 'Выбор вспомогательного'],
    ['syntax-pronoms-y-en', 'Порядок', 'Порядок местоимений'],
    ['syntax-prepositions', 'Один глагол — разные связи', 'Один глагол — разные предлоги'],
    ['syntax-participe-cod', 'COD после причастия', 'Прямое дополнение после причастия'],
    ['syntax-participe-cod', 'COD перед причастием', 'Прямое дополнение перед причастием'],
    ['syntax-si', 'Несбывшееся прошлое', 'Нереальное условие в прошлом'],
    ['subj-volonte', 'Важное ограничение', 'Если подлежащее одно и то же'],
    ['subj-conjonctions', 'Список', 'Частотные союзы'],
    ['subj-conjonctions', 'Опасная пара', 'Avant que и après que'],
    ['litt-passe-simple', 'Что нужно уметь на практике', 'Что достаточно знать для чтения'],
    ['litt-subjonctif-imparfait', 'Зачем это знать', 'Что важно узнавать при чтении'],
    ['litt-subjonctif-imparfait', 'Plus-que-parfait сослагательного', 'Subjonctif plus-que-parfait'],
  ];
  for (const [id, from, to] of headingEdits) source = editLesson(source, id, chunk => heading(chunk, from, to));

  source = editLesson(source, 'present-trois-groupes', chunk => {
    chunk = replaceBodyContaining(chunk, 'Первая группа — самая многочисленная', 'К первой группе относится большинство глаголов на -er; главное исключение — aller. В présent убираем -er и добавляем окончания -e, -es, -e, -ons, -ez, -ent. У parler формы je parle, tu parles, il parle и ils parlent произносятся одинаково, хотя пишутся по-разному.');
    chunk = replaceBodyContaining(chunk, 'Во множественном числе между основой', 'Ко второй группе относятся регулярные глаголы на -ir, у которых во множественном числе появляется -iss-: nous finissons, vous finissez, ils finissent. Именно -iss- помогает отличить их от многих глаголов третьей группы на -ir.');
    chunk = replaceBodyContaining(chunk, 'Сюда попадают глаголы на -re', 'К третьей группе относятся все остальные глаголы: глаголы на -re и -oir, а также многие глаголы на -ir без -iss-. В этой группе много неправильных форм, поэтому дальше они разбираются по отдельным моделям.');
    chunk = replaceBodyContaining(chunk, 'В обычной личной фразе французский не опускает', 'Во французском перед личной формой глагола обычно нужно явно назвать подлежащее: je parle, Paul parle. Одной формы parle обычно недостаточно. В impératif подлежащее, наоборот, не ставится: Parle !');
    return chunk;
  });

  source = editLesson(source, 'present-g2', chunk => replaceBodyContaining(chunk, 'Группа продуктивна', 'Во второй группе много глаголов со значением изменения состояния: grandir — «расти», rougir — «краснеть». К ней также относятся частотные finir, choisir, réussir, réfléchir и obéir.'));
  source = editLesson(source, 'constr-savoir-connaitre', chunk => replaceBodyContaining(chunk, 'Обычно присоединяет существительное', 'Connaître обычно употребляется с существительным или местоимением: je connais Paris, je connais cette femme. Если нужно сказать, что вы знаете какой-то факт, обычно используется savoir: je sais qu’il est parti.'));
  source = editLesson(source, 'passe-compose-etre', chunk => replaceBodyContaining(chunk, 'Это главное отличие от avoir', 'С être participe passé согласуется с подлежащим в роде и числе: il est sorti, elle est sortie, elles sont sorties.'));
  source = editLesson(source, 'imparfait', chunk => replaceBodyContaining(chunk, 'У être основа ét-', 'У être особая основа ét-: j’étais, nous étions. У безличных falloir и pleuvoir нет формы nous, поэтому основы fall- и pleuv- тоже нужно запомнить отдельно.'));
  source = editLesson(source, 'imparfait-vs-passe-compose', chunk => replaceBodyContaining(chunk, 'Завершённое действие, продвигающее рассказ', 'Passé composé выделяет отдельное завершённое событие и отвечает на вопрос «что произошло?»: hier, j’ai vu un film.'));
  source = editLesson(source, 'imparfait-vs-passe-compose', chunk => replaceBodyContaining(chunk, 'Обстановка, привычка, длящееся состояние', 'Imparfait описывает фон, состояние, привычку или действие в процессе: quand j’étais petit, je parlais souvent avec lui.'));
  source = editLesson(source, 'futur-irreguliers', chunk => replaceBodyContaining(chunk, 'У courir, mourir, pouvoir и voir', 'В основах courir, mourir, pouvoir и voir пишется двойное r: courr-, mourr-, pourr-, verr-. На слух это почти не заметно, поэтому написание лучше запомнить отдельно.'));
  source = editLesson(source, 'conditionnel', chunk => replaceBodyContaining(chunk, 'Разница только в окончании', 'У futur simple и conditionnel présent часто одна и та же основа, но разные окончания: je serai — «я буду», je serais — «я был бы». В речи формы могут звучать очень похоже, поэтому важен контекст.'));
  source = editLesson(source, 'choix-auxiliaire', chunk => replaceBodyContaining(chunk, 'Чаще всего это monter', 'Так могут употребляться monter, descendre, sortir, rentrer, retourner, passer и некоторые другие глаголы. Если есть прямое дополнение, обычно используется avoir; без него в соответствующем значении — être.'));
  source = editLesson(source, 'subj-emotion-doute', chunk => replaceBodyContaining(chunk, 'Ключевая пара', 'Сравните: je pense qu’il viendra — говорящий считает событие вероятным; je ne pense pas qu’il vienne — говорящий подчёркивает сомнение. После отрицания возможен и indicatif, если факт всё же утверждается.'));
  source = editLesson(source, 'subj-conjonctions', chunk => replaceBodyContaining(chunk, 'Avant que требует subjonctif', 'После avant que употребляется subjonctif, а после après que по нормативному правилу — indicatif: avant qu’il parte, но après qu’il est parti.'));
  source = editLesson(source, 'litt-passe-simple', chunk => replaceBodyContaining(chunk, 'Активно образовывать passé simple', 'Для обычного общения активно образовывать passé simple почти не требуется. При чтении важнее уверенно узнавать наиболее частые формы, особенно формы третьего лица.'));
  source = editLesson(source, 'litt-passe-simple', chunk => replaceBodyContaining(chunk, 'Составная пара к passé simple', 'Passé antérieur образуется из avoir или être в passé simple и participe passé. Оно встречается в книжном повествовании, часто после quand, dès que и других временных союзов.'));

  return source;
});

edit('data/grammar-drills.ts', source => {
  source = source
    .replace("title: 'Y / EN и местоимения',", "title: 'Y, en и местоимения',")
    .replace("subtitle: 'Порядок и замена дополнений',", "subtitle: 'Выбор местоимения и порядок слов',")
    .replace("title: 'Предлоги после глаголов',", "title: 'Предлоги после глаголов',")
    .replace("subtitle: 'à, de или без предлога',", "subtitle: 'à, de или без предлога',")
    .replace("title: 'Причастие и прямое дополнение',", "title: 'Причастие и прямое дополнение',")
    .replace("subtitle: 'Когда причастие меняет род и число',", "subtitle: 'Согласование с дополнением перед причастием',")
    .replace("title: 'Si: три модели',", "title: 'Условные предложения с si',")
    .replace("subtitle: 'Реальное, гипотетическое и прошлое условие',", "subtitle: 'Три основные модели',")
    .replace("title: 'Выбор прошедшего времени',", "title: 'Три прошедших времени',")
    .replace("subtitle: 'imparfait, passé composé или plus-que-parfait',", "subtitle: 'Выбор времени по контексту',");

  if (!source.includes('function polishedExplanation(')) {
    const anchor = 'function materialize(lessonId: GrammarLessonId, raw: RawQuestion): GrammarQuizQuestion {';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Russian polish: grammar materialize anchor missing');
    const helper = `function polishedExplanation(lessonId: GrammarLessonId, raw: RawQuestion): string {\n  const answer = raw.answer.trim();\n  const prompt = raw.prompt;\n  const speech = raw.speech ?? '';\n\n  if (lessonId === 'syntax-pronoms-y-en') {\n    if (answer === 'y') return 'Y заменяет дополнение с à, когда речь идёт о месте, предмете или идее.';\n    if (answer === 'en') return 'En обычно заменяет дополнение с de. Если указано количество, число остаётся в предложении.';\n    if (/^(?:Donne|Parle|Prends|Vas)-/u.test(answer)) return 'В утвердительном impératif местоимения ставятся после глагола и присоединяются через дефис.';\n    if (/^(?:Ne|N’|N')/u.test(answer)) return 'В отрицательной форме местоимения стоят перед спрягаемым глаголом.';\n    if (/\\b(?:lui|leur)\\b/u.test(answer) && /\\b(?:le|la|les)\\b/u.test(answer)) return 'При двух дополнениях le, la или les ставится перед lui или leur.';\n    if (/\\b(?:lui|leur)\\b/u.test(answer) && /\\ben\\b/u.test(answer)) return 'Если вместе употребляются lui/leur и en, сначала ставится lui/leur, затем en.';\n    return \`Здесь важно и выбрать правильное местоимение, и поставить его в нужное место. Правильный вариант: «\${answer}».\`;\n  }\n\n  if (lessonId === 'syntax-prepositions') {\n    if (answer === '—') return 'После этого глагола дополнение или инфинитив присоединяется без предлога. Такую модель лучше запоминать целиком.';\n    return \`После этого глагола в данной конструкции нужен предлог «\${answer}». Управление лучше запоминать вместе с глаголом.\`;\n  }\n\n  if (lessonId === 'syntax-participe-cod') {\n    if (prompt.includes('___ chanter')) return 'В конструкции faire + infinitif причастие fait остаётся неизменным.';\n    if (prompt.includes('(parler)') || prompt.includes('(téléphoner)')) return 'У parler и téléphoner местоимение se является косвенным дополнением, поэтому причастие не согласуется.';\n    if (prompt.includes('s’est ___ les mains')) return 'Прямое дополнение les mains стоит после причастия, поэтому lavé остаётся без согласования.';\n    if (prompt.includes('Elle s’est ___.')) return 'В se laver без другого прямого дополнения причастие согласуется с elle: lavée.';\n    if (prompt.includes('(rencontrer)')) return 'В se rencontrer местоимение se является прямым дополнением и относится к elles, поэтому нужно rencontrées.';\n    const before = /\\bque\\b|qu[’']|\\bles ai\\b|l[’']ai|Quels|Quelle|Cette porte|Les photos/u.test(prompt);\n    if (before) return \`Прямое дополнение стоит перед причастием, поэтому с avoir причастие согласуется с ним: «\${answer}».\`;\n    return 'Прямое дополнение стоит после причастия, поэтому с avoir согласования нет.';\n  }\n\n  if (lessonId === 'syntax-si') {\n    if (/avais su|avait étudié|étions partis|m[’']avais appelé|aviez réservé|était venue|avais été|avions su/u.test(speech)) return 'Для нереального условия в прошлом используется si + plus-que-parfait; результат ставится в conditionnel passé.';\n    if (/j[’']avais plus|habitions|parlait français|j[’']étais toi|pouvais choisir|connaissais|magasin était/u.test(speech)) return 'Для гипотезы о настоящем или будущем используется si + imparfait; результат ставится в conditionnel présent.';\n    return 'В реальном условии после si употребляется présent. В главной части возможны présent, futur simple или impératif — по смыслу.';\n  }\n\n  if (lessonId === 'syntax-past-contrast') {\n    if (/^(avait|avaient|avions|aviez|étais|était|étaient)\\b/u.test(answer) && answer.includes(' ')) return 'Это действие произошло раньше другого момента в прошлом, поэтому нужен plus-que-parfait.';\n    if (/^(ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont)\\b/u.test(answer) && answer.includes(' ')) return 'Здесь действие представлено как отдельное завершённое событие, поэтому нужен passé composé.';\n    return 'Здесь описывается фон, состояние, привычка или действие в процессе, поэтому нужен imparfait.';\n  }\n\n  if (lessonId === 'syntax-time-markers') {\n    const key = answer.toLowerCase();\n    if (key === 'depuis') return 'Depuis показывает, что действие или состояние началось раньше и продолжается до точки отсчёта.';\n    if (key === 'pendant') return 'Pendant обозначает длительность ограниченного периода, который рассматривается как целое.';\n    if (key === 'il y a') return 'Il y a + отрезок времени означает «столько-то времени назад».';\n    if (key === 'pour') return 'Pour + срок обозначает запланированную или предполагаемую длительность.';\n    if (key === 'ça fait') return 'Ça fait + длительность + que показывает, как долго продолжается ситуация.';\n    if (key === 'que') return 'В конструкции ça fait + длительность + que перед придаточной частью ставится que.';\n  }\n\n  const existing = editorialExplanation(lessonId, raw);\n  return /[А-Яа-яЁё]/u.test(existing) ? existing : \`Правильный вариант: «\${answer}».\`;\n}\n\n`;
    source = source.slice(0, at) + helper + source.slice(at);
  }
  source = source.replace('    explanation: editorialExplanation(lessonId, raw),', '    explanation: polishedExplanation(lessonId, raw),');
  return source;
});

edit('app/lesson/[id].tsx', source => {
  source = source
    .replace('>Отработка по глаголам</Text>', '>Короткие тренировки</Text>')
    .replace(
      '            Короткие подходы по одному глаголу. Медаль — за лучший результат:\n            бронза от 70%, серебро от 90%, золото за без ошибок.',
      '            Отработайте каждый ключевой глагол отдельно или всю тему сразу. Лучший результат сохраняется:\n            бронза — от 70%, серебро — от 90%, золото — 100%.',
    )
    .replace('>Тренировка темы</Text>', '>Тренировка всей темы</Text>')
    .replace('                Все глаголы базы', '                Использовать все глаголы')
    .replace(
      '                Тренировка возьмёт времена темы, но глаголы — из всей базы.\n                Зачёт и подходы это не затрагивает.',
      '                В тренировке останутся времена этой темы, но глаголы будут взяты из всей базы.\n                На зачёт и короткие тренировки эта настройка не влияет.',
    )
    .replace(
      '              Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.',
      '              Зачёт проверяет, можете ли вы самостоятельно написать ключевые формы без вариантов ответа.',
    )
    .replace(
      '              Зачем: сдача автоматически открывает следующую тему. Это контрольная точка, а не источник новых форм — сначала для этого есть таблицы и тренировки выше.',
      '              После успешного зачёта откроется следующая тема. Новых форм здесь нет: сначала изучите таблицы и потренируйтесь выше.',
    );
  return source;
});

edit('data/examples.ts', source => {
  const edits = [
    ["ru: 'Он побежит марафонскую дистанцию.'", "ru: 'Он пробежит марафон.'"],
    ["ru: 'Я буду знать ответ завтра.'", "ru: 'Завтра я узнаю ответ.'"],
    ["ru: 'Она имеет три брата.'", "ru: 'У неё три брата.'"],
    ["ru: 'Я имею время.'", "ru: 'У меня есть время.'"],
    ["ru: 'Он сделал ошибку.'", "ru: 'Он допустил ошибку.'"],
  ];
  for (const [from, to] of edits) source = source.replaceAll(from, to);
  return source;
});

console.log('Polished Russian wording across all 43 lessons, grammar feedback and lesson UI.');
