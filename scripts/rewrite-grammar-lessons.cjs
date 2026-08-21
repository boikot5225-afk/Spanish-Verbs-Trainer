const fs = require('node:fs');

const path = 'data/lessons.ts';
let source = fs.readFileSync(path, 'utf8');

function replaceLesson(id, replacement) {
  const re = new RegExp(`  \\{\\n    id: '${id}',[\\s\\S]*?\\n    practice:`, 'u');
  if (!re.test(source)) throw new Error(`Grammar rewrite: lesson ${id} not found`);
  source = source.replace(re, `${replacement}\n    practice:`);
}

replaceLesson('syntax-prepositions', String.raw`  {
    id: 'syntax-prepositions',
    block: 'syntax',
    title: 'Предлоги после глаголов',
    summary: 'Когда после глагола нужен à, de, а когда ничего не нужно',
    sections: [
      {
        body:
          'Во французском предлог после глагола часто нельзя угадать по русскому переводу. Поэтому полезнее запоминать не отдельное слово, а короткую конструкцию целиком: réussir à faire, essayer de faire, vouloir faire.',
      },
      {
        heading: 'Если дальше стоит другой глагол',
        body:
          'Второй глагол ставится в начальной форме — infinitif: faire «делать», partir «уезжать», venir «приходить». Первый глагол определяет, будет перед этим infinitif предлог à, de или никакого предлога.',
      },
      {
        heading: 'С à',
        bullets: [
          'réussir à faire — суметь сделать, добиться результата: Elle réussit à ouvrir la porte. — Ей удаётся открыть дверь.',
          'apprendre à faire — учиться делать: J’apprends à conduire. — Я учусь водить.',
          'hésiter à faire — колебаться, стоит ли делать: Il hésite à répondre. — Он не решается ответить.',
          'penser à faire — помнить / подумать о том, чтобы сделать: Pense à fermer la fenêtre. — Не забудь закрыть окно.',
        ],
      },
      {
        heading: 'С de',
        bullets: [
          'essayer de faire — пытаться сделать: J’essaie de comprendre. — Я пытаюсь понять.',
          'décider de faire — решить сделать: Nous décidons de partir. — Мы решаем уехать.',
          'refuser de faire — отказаться делать: Il refuse de répondre. — Он отказывается отвечать.',
          'arrêter de faire — перестать делать: Elle arrête de fumer. — Она перестаёт курить.',
        ],
      },
      {
        heading: 'Без предлога',
        bullets: [
          'vouloir partir — хотеть уехать: Je veux partir. — Я хочу уехать.',
          'pouvoir venir — мочь прийти: Tu peux venir. — Ты можешь прийти.',
          'préférer rester — предпочитать остаться: Je préfère rester ici. — Я предпочитаю остаться здесь.',
        ],
      },
      {
        heading: 'Перед существительным тоже бывают различия',
        bullets: [
          'attendre Paul — ждать Поля; предлог à не нужен.',
          'écouter le professeur — слушать преподавателя; предлог à не нужен.',
          'parler à Paul — говорить с Полем / обращаться к Полю.',
          'parler de Paul — говорить о Поле.',
        ],
      },
      {
        heading: 'Как это запоминать',
        body:
          'Учите связку целиком: penser à, parler de, attendre quelqu’un. Не пытайтесь каждый раз переводить русский предлог во французский — соответствие часто будет неправильным.',
      },
    ],`);

replaceLesson('syntax-pronoms-y-en', String.raw`  {
    id: 'syntax-pronoms-y-en',
    block: 'syntax',
    title: 'Местоимения y и en',
    summary: 'Как не повторять дополнения с à и de',
    sections: [
      {
        body:
          'Эта тема становится понятнее после предлогов. Если глагол требует à или de, повторяющееся дополнение часто можно заменить коротким местоимением y или en.',
      },
      {
        heading: 'y: место или à + предмет / идея',
        bullets: [
          'Tu vas à Paris ? — Oui, j’y vais. — Ты едешь в Париж? — Да, я туда еду.',
          'Tu penses à ton examen ? — Oui, j’y pense. — Ты думаешь об экзамене? — Да, думаю о нём.',
          'Il s’intéresse à la politique. → Il s’y intéresse. — Он интересуется политикой. → Он ею интересуется.',
        ],
        body:
          'С людьми y обычно не используют: penser à Marie → penser à elle, а не y penser, если речь именно о Марии.',
      },
      {
        heading: 'en: de + дополнение',
        bullets: [
          'Tu parles de ce film ? — Oui, j’en parle. — Ты говоришь об этом фильме? — Да, я о нём говорю.',
          'Il revient de Lyon. → Il en revient. — Он возвращается из Лиона. → Он возвращается оттуда.',
          'Elle a besoin de temps. → Elle en a besoin. — Ей нужно время. → Оно ей нужно / ей это нужно.',
        ],
      },
      {
        heading: 'en с количеством',
        body:
          'Если существительное связано с количеством, en заменяет само существительное, а число остаётся: J’ai trois frères. → J’en ai trois. — У меня три брата. → У меня их трое.',
      },
      {
        heading: 'Где стоят y и en',
        body:
          'В обычном предложении они стоят перед спрягаемым глаголом: J’y vais. J’en parle. Je n’y vais pas. Je n’en parle pas.',
      },
      {
        heading: 'Если местоимений два',
        bullets: [
          'Je donne le livre à Marie. → Je le lui donne. — Я даю книгу Мари. → Я даю её ей.',
          'Il montre les photos à ses amis. → Il les leur montre. — Он показывает фотографии друзьям. → Он показывает их им.',
          'Il parle de la décision à ses collègues. → Il leur en parle. — Он говорит коллегам о решении. → Он говорит им об этом.',
        ],
        body:
          'Пока достаточно запомнить три полезные последовательности: le/la/les перед lui/leur; lui/leur перед en; y перед en. Сложный порядок в impératif лучше учить отдельно после самого impératif.',
      },
    ],`);

replaceLesson('syntax-time-markers', String.raw`  {
    id: 'syntax-time-markers',
    block: 'syntax',
    title: 'Depuis, pendant и il y a',
    summary: 'Как сказать «уже три года», «три года» и «три года назад»',
    sections: [
      {
        body:
          'В русском фразы «живу здесь три года», «жил здесь три года» и «приехал три года назад» похожи. Во французском для них нужны разные слова. Сначала различайте смысл, а уже потом выбирайте конструкцию.',
      },
      {
        heading: 'depuis — началось раньше и всё ещё продолжается',
        bullets: [
          'J’habite ici depuis trois ans. — Я живу здесь уже три года и живу здесь сейчас.',
          'Je travaille ici depuis janvier. — Я работаю здесь с января и продолжаю работать.',
        ],
        body:
          'Когда действие продолжается до настоящего момента, во французском обычно стоит présent: j’habite, je travaille. Русский перевод при этом может содержать «уже».',
      },
      {
        heading: 'pendant — сколько длился или будет длиться период',
        bullets: [
          'J’ai travaillé là pendant deux ans. — Я проработал там два года; этот период закончился.',
          'Je vais rester à Lyon pendant une semaine. — Я пробуду в Лионе неделю.',
        ],
        body:
          'Pendant отвечает на вопрос «как долго?» и рассматривает период целиком. Само слово не означает, что действие обязательно продолжается сейчас.',
      },
      {
        heading: 'il y a — сколько времени назад',
        bullets: [
          'Je l’ai vu il y a deux jours. — Я видел его два дня назад.',
          'Nous sommes arrivés il y a une heure. — Мы приехали час назад.',
        ],
      },
      {
        heading: 'ça fait ... que — ещё один способ сказать «уже»',
        body:
          'Ça fait trois ans que j’habite ici. — Я живу здесь уже три года. По смыслу это близко к J’habite ici depuis trois ans.',
      },
      {
        heading: 'pour — запланированный срок',
        body:
          'С глаголами движения и пребывания pour часто обозначает срок, на который что-то запланировано: Je pars pour deux semaines. — Я уезжаю на две недели. Не заменяйте им автоматически pendant во всех фразах о длительности.',
      },
      {
        heading: 'Сравните четыре фразы',
        bullets: [
          'J’habite ici depuis trois ans. — Я живу здесь уже три года.',
          'J’ai habité ici pendant trois ans. — Я жил здесь три года.',
          'Je suis arrivé ici il y a trois ans. — Я приехал сюда три года назад.',
          'Ça fait trois ans que j’habite ici. — Уже три года, как я здесь живу.',
        ],
      },
    ],`);

replaceLesson('syntax-past-contrast', String.raw`  {
    id: 'syntax-past-contrast',
    block: 'syntax',
    title: 'Прошедшие времена в контексте',
    summary: 'Imparfait, passé composé и plus-que-parfait в одном рассказе',
    sections: [
      {
        body:
          'Эти времена легче различать не по списку сигналов, а по роли события в рассказе. Смотрите, что было фоном, что произошло как отдельное событие и что случилось ещё раньше.',
      },
      {
        heading: 'Один пример сразу с тремя временами',
        body:
          'Il pleuvait quand je suis arrivé. Paul avait déjà mangé. — Шёл дождь, когда я приехал. Поль к тому моменту уже поел.',
      },
      {
        heading: 'Imparfait — фон, состояние, привычка, процесс',
        bullets: [
          'Il pleuvait. — Шёл дождь.',
          'Je lisais quand tu as appelé. — Я читал, когда ты позвонил.',
          'Quand j’étais petit, je jouais ici. — Когда я был маленьким, я здесь играл.',
        ],
      },
      {
        heading: 'Passé composé — отдельное завершённое событие',
        bullets: [
          'La porte s’est ouverte. — Дверь открылась.',
          'Il est entré. — Он вошёл.',
          'Tu as appelé à huit heures. — Ты позвонил в восемь.',
        ],
      },
      {
        heading: 'Plus-que-parfait — произошло ещё раньше другого прошлого',
        bullets: [
          'Quand je suis arrivé, Paul avait déjà mangé. — Когда я приехал, Поль уже поел.',
          'Elle connaissait la ville parce qu’elle y avait vécu. — Она знала город, потому что раньше там жила.',
        ],
      },
      {
        heading: 'Как выбирать',
        bullets: [
          'Событие произошло раньше другой точки в прошлом? → plus-que-parfait.',
          'Это фон, состояние, привычка или действие в процессе? → imparfait.',
          'Это отдельное завершённое событие рассказа? → passé composé.',
        ],
      },
    ],`);

replaceLesson('syntax-si', String.raw`  {
    id: 'syntax-si',
    block: 'syntax',
    title: 'Условия с si',
    summary: 'Три основные модели: реальность, гипотеза и несбывшееся прошлое',
    sections: [
      {
        body:
          'В предложении с si важны две части: условие после si и результат. В трёх основных моделях время одной части связано со временем другой.',
      },
      {
        heading: '1. Реальное или вполне возможное условие',
        body:
          'После si ставится présent. В результате часто бывает présent, futur simple или impératif.',
        bullets: [
          'Si tu viens demain, nous mangerons ensemble. — Если ты придёшь завтра, мы поедим вместе.',
          'Si tu as faim, mange. — Если ты голоден, поешь.',
        ],
      },
      {
        heading: '2. Гипотеза о настоящем или будущем',
        body:
          'После si ставится imparfait, а результат — в conditionnel présent.',
        bullets: [
          'Si j’avais le temps, je voyagerais davantage. — Если бы у меня было время, я бы больше путешествовал.',
          'Si nous habitions à Paris, nous prendrions le métro. — Если бы мы жили в Париже, мы бы ездили на метро.',
        ],
      },
      {
        heading: '3. Условие в прошлом, которое уже не сбылось',
        body:
          'После si ставится plus-que-parfait, а результат — в conditionnel passé.',
        bullets: [
          'Si j’avais su, je serais venu. — Если бы я знал, я бы пришёл.',
          'Si elle avait étudié, elle aurait réussi. — Если бы она училась, она бы справилась.',
        ],
      },
      {
        heading: 'Главная ошибка',
        body:
          'Не ставьте conditionnel сразу после si в этих трёх моделях. Неправильно: Si j’aurais le temps... Правильно: Si j’avais le temps, je voyagerais.',
      },
      {
        heading: 'Короткая схема',
        bullets: [
          'si + présent → présent / futur / impératif',
          'si + imparfait → conditionnel présent',
          'si + plus-que-parfait → conditionnel passé',
        ],
      },
    ],`);

replaceLesson('syntax-participe-cod', String.raw`  {
    id: 'syntax-participe-cod',
    block: 'syntax',
    title: 'Согласование participe passé',
    summary: 'Почему j’ai vu, но je l’ai vue и les lettres que j’ai écrites',
    sections: [
      {
        body:
          'С avoir причастие обычно не меняется: J’ai vu Marie. Но если прямое дополнение стоит перед причастием, его род и число могут повлиять на окончание причастия.',
      },
      {
        heading: 'Сначала: что такое прямое дополнение (COD)',
        body:
          'Это дополнение без предлога, которое отвечает здесь на вопрос «кого?» или «что?». В J’ai vu Marie слово Marie — прямое дополнение. Французское сокращение COD означает complément d’objet direct.',
      },
      {
        heading: 'Если COD стоит после причастия',
        bullets: [
          'J’ai écrit les lettres. — Я написал письма. Форма écrit не меняется.',
          'J’ai vu Marie. — Я видел Мари. Форма vu не меняется.',
        ],
      },
      {
        heading: 'Если COD оказался перед причастием',
        bullets: [
          'Les lettres que j’ai écrites. — Письма, которые я написал. Les lettres: женский род, множественное число → écrites.',
          'Ces films, je les ai vus. — Эти фильмы я видел. Les = films: мужской род, множественное число → vus.',
          'Marie, je l’ai vue. — Мари, я её видел. L’ = Marie: женский род → vue.',
        ],
      },
      {
        heading: 'Как решать такое задание',
        bullets: [
          'Найдите прямое дополнение: кого? что?',
          'Проверьте, стоит ли оно перед participe passé.',
          'Если стоит перед, определите его род и число и согласуйте причастие.',
          'Если стоит после, с avoir обычно оставьте причастие без согласования.',
        ],
      },
      {
        heading: 'Местоименные глаголы — отдельная проверка',
        body:
          'У возвратных глаголов сначала нужно понять роль se: Elles se sont lavées, но Elles se sont lavé les mains и Elles se sont parlé. Здесь нельзя пользоваться правилом «être — значит всегда согласовать».',
      },
      {
        heading: 'Отдельное исключение: fait + infinitif',
        body:
          'В конструкции faire + infinitif причастие fait остаётся неизменным: Les chansons qu’elle a fait chanter. — Песни, которые она заставила спеть. Это редкий случай; сначала закрепите основное правило с COD.',
      },
    ],`);

fs.writeFileSync(path, source, 'utf8');
console.log('Rewrote six grammar lessons as teachable Russian lessons.');
