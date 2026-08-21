import type { Person, Tense } from './types';

/**
 * Пример употребления формы в живой фразе.
 *
 * Референсное приложение показывает «местоимение + словоформа» (Il boirait.) —
 * это ровно то, что и так строит генератор, поэтому здесь фразы с настоящим
 * контекстом: дополнением, обстоятельством, союзом, который и вызывает нужное
 * время. `person` указывает, какую строку таблицы спряжения подсвечивать.
 */
export interface Example {
  verbId: string;
  tense: Tense;
  person: Person;
  fr: string;
  ru: string;
}

export const EXAMPLES: Example[] = [
  // ── Présent ──────────────────────────────────────────────────────────────
  { verbId: 'être', tense: 'present', person: 'je', fr: 'Je suis en retard.', ru: 'Я опаздываю.' },
  { verbId: 'être', tense: 'present', person: 'vous', fr: 'Vous êtes des nôtres ?', ru: 'Вы с нами?' },
  { verbId: 'avoir', tense: 'present', person: 'je', fr: "J'ai vingt ans.", ru: 'Мне двадцать лет.' },
  { verbId: 'avoir', tense: 'present', person: 'ils', fr: 'Ils ont raison.', ru: 'Они правы.' },
  { verbId: 'aller', tense: 'present', person: 'je', fr: 'Je vais au marché.', ru: 'Я иду на рынок.' },
  { verbId: 'aller', tense: 'present', person: 'tu', fr: 'Comment vas-tu ?', ru: 'Как ты?' },
  { verbId: 'faire', tense: 'present', person: 'vous', fr: 'Que faites-vous ce soir ?', ru: 'Что вы делаете сегодня вечером?' },
  { verbId: 'faire', tense: 'present', person: 'il', fr: 'Il fait froid dehors.', ru: 'На улице холодно.' },
  { verbId: 'dire', tense: 'present', person: 'vous', fr: 'Vous dites la vérité.', ru: 'Вы говорите правду.' },
  { verbId: 'parler', tense: 'present', person: 'je', fr: 'Je parle un peu français.', ru: 'Я немного говорю по-французски.' },
  { verbId: 'travailler', tense: 'present', person: 'nous', fr: 'Nous travaillons ensemble.', ru: 'Мы работаем вместе.' },
  { verbId: 'habiter', tense: 'present', person: 'il', fr: 'Il habite à Lyon.', ru: 'Он живёт в Лионе.' },
  { verbId: 'finir', tense: 'present', person: 'nous', fr: 'Nous finissons le travail.', ru: 'Мы заканчиваем работу.' },
  { verbId: 'choisir', tense: 'present', person: 'tu', fr: 'Tu choisis toujours le plus cher.', ru: 'Ты всегда выбираешь самое дорогое.' },
  { verbId: 'prendre', tense: 'present', person: 'je', fr: 'Je prends le train de huit heures.', ru: 'Я еду поездом в восемь.' },
  { verbId: 'prendre', tense: 'present', person: 'ils', fr: 'Ils prennent leur temps.', ru: 'Они не торопятся.' },
  { verbId: 'venir', tense: 'present', person: 'tu', fr: "D'où viens-tu ?", ru: 'Откуда ты?' },
  { verbId: 'partir', tense: 'present', person: 'je', fr: 'Je pars demain matin.', ru: 'Я уезжаю завтра утром.' },
  { verbId: 'boire', tense: 'present', person: 'nous', fr: 'Nous buvons du thé.', ru: 'Мы пьём чай.' },
  { verbId: 'manger', tense: 'present', person: 'nous', fr: 'Nous mangeons à midi.', ru: 'Мы обедаем в полдень.' },
  { verbId: 'commencer', tense: 'present', person: 'nous', fr: 'Nous commençons le cours.', ru: 'Мы начинаем урок.' },
  { verbId: 'ouvrir', tense: 'present', person: 'il', fr: 'Il ouvre la fenêtre.', ru: 'Он открывает окно.' },
  { verbId: 'connaître', tense: 'present', person: 'il', fr: 'Il connaît bien la ville.', ru: 'Он хорошо знает город.' },
  { verbId: 'savoir', tense: 'present', person: 'je', fr: 'Je sais nager.', ru: 'Я умею плавать.' },
  { verbId: 'pouvoir', tense: 'present', person: 'je', fr: 'Je peux vous aider.', ru: 'Я могу вам помочь.' },
  { verbId: 'vouloir', tense: 'present', person: 'il', fr: 'Il veut partir tout de suite.', ru: 'Он хочет уйти сразу же.' },
  { verbId: 'devoir', tense: 'present', person: 'nous', fr: 'Nous devons rentrer.', ru: 'Нам надо возвращаться.' },
  { verbId: 'acheter', tense: 'present', person: 'je', fr: "J'achète du pain.", ru: 'Я покупаю хлеб.' },
  { verbId: 'appeler', tense: 'present', person: 'il', fr: "Il appelle un taxi.", ru: 'Он вызывает такси.' },
  { verbId: 'payer', tense: 'present', person: 'je', fr: 'Je paye par carte.', ru: 'Я плачу картой.' },
  { verbId: 'nettoyer', tense: 'present', person: 'il', fr: 'Il nettoie la cuisine.', ru: 'Он убирает кухню.' },
  { verbId: 'se laver', tense: 'present', person: 'je', fr: 'Je me lave les mains.', ru: 'Я мою руки.' },
  { verbId: 'se lever', tense: 'present', person: 'il', fr: 'Il se lève à six heures.', ru: 'Он встаёт в шесть.' },
  { verbId: "s'appeler", tense: 'present', person: 'je', fr: "Je m'appelle Marie.", ru: 'Меня зовут Мари.' },
  { verbId: 'falloir', tense: 'present', person: 'il', fr: 'Il faut partir maintenant.', ru: 'Надо уходить сейчас.' },
  { verbId: 'pleuvoir', tense: 'present', person: 'il', fr: 'Il pleut depuis ce matin.', ru: 'Дождь идёт с утра.' },

  // ── Imparfait ────────────────────────────────────────────────────────────
  { verbId: 'être', tense: 'imparfait', person: 'je', fr: "Quand j'étais petit, tout semblait grand.", ru: 'Когда я был маленьким, всё казалось большим.' },
  { verbId: 'avoir', tense: 'imparfait', person: 'nous', fr: 'Nous avions le temps à cette époque.', ru: 'В то время у нас было время.' },
  { verbId: 'faire', tense: 'imparfait', person: 'il', fr: 'Il faisait beau tous les jours.', ru: 'Каждый день была хорошая погода.' },
  { verbId: 'parler', tense: 'imparfait', person: 'ils', fr: 'Ils parlaient à voix basse.', ru: 'Они говорили вполголоса.' },
  { verbId: 'manger', tense: 'imparfait', person: 'je', fr: 'Je mangeais toujours à la même table.', ru: 'Я всегда ел за одним и тем же столом.' },
  { verbId: 'manger', tense: 'imparfait', person: 'nous', fr: 'Nous mangions vers huit heures.', ru: 'Мы ужинали около восьми.' },
  { verbId: 'aller', tense: 'imparfait', person: 'nous', fr: 'Nous allions à la mer chaque été.', ru: 'Каждое лето мы ездили на море.' },
  { verbId: 'habiter', tense: 'imparfait', person: 'il', fr: 'Elle habitait au dernier étage.', ru: 'Она жила на последнем этаже.' },
  { verbId: 'travailler', tense: 'imparfait', person: 'tu', fr: 'Tu travaillais trop à cette époque.', ru: 'Ты тогда слишком много работал.' },
  { verbId: 'lire', tense: 'imparfait', person: 'il', fr: 'Il lisait pendant que je cuisinais.', ru: 'Он читал, пока я готовил.' },
  { verbId: 'prendre', tense: 'imparfait', person: 'je', fr: 'Je prenais le bus tous les matins.', ru: 'Я каждое утро ездил на автобусе.' },
  { verbId: 'commencer', tense: 'imparfait', person: 'je', fr: 'Je commençais à comprendre.', ru: 'Я начинал понимать.' },

  // ── Passé composé ────────────────────────────────────────────────────────
  { verbId: 'faire', tense: 'passeCompose', person: 'je', fr: "J'ai fait une erreur.", ru: 'Я допустил ошибку.' },
  { verbId: 'parler', tense: 'passeCompose', person: 'nous', fr: 'Nous avons parlé pendant deux heures.', ru: 'Мы проговорили два часа.' },
  { verbId: 'prendre', tense: 'passeCompose', person: 'il', fr: 'Il a pris la mauvaise route.', ru: 'Он поехал не по той дороге.' },
  { verbId: 'voir', tense: 'passeCompose', person: 'tu', fr: 'Tu as vu ce film ?', ru: 'Ты видел этот фильм?' },
  { verbId: 'dire', tense: 'passeCompose', person: 'vous', fr: 'Vous avez dit quelque chose ?', ru: 'Вы что-то сказали?' },
  { verbId: 'écrire', tense: 'passeCompose', person: 'je', fr: "J'ai écrit trois lettres.", ru: 'Я написал три письма.' },
  { verbId: 'lire', tense: 'passeCompose', person: 'ils', fr: 'Ils ont lu tout le livre.', ru: 'Они прочитали всю книгу.' },
  { verbId: 'boire', tense: 'passeCompose', person: 'nous', fr: 'Nous avons bu un café ensemble.', ru: 'Мы выпили вместе кофе.' },
  { verbId: 'finir', tense: 'passeCompose', person: 'je', fr: "J'ai fini mon travail.", ru: 'Я закончил работу.' },
  { verbId: 'aller', tense: 'passeCompose', person: 'je', fr: 'Je suis allé au cinéma.', ru: 'Я ходил в кино.' },
  { verbId: 'aller', tense: 'passeCompose', person: 'ils', fr: 'Ils sont allés très loin.', ru: 'Они ушли очень далеко.' },
  { verbId: 'venir', tense: 'passeCompose', person: 'il', fr: 'Il est venu sans prévenir.', ru: 'Он пришёл без предупреждения.' },
  { verbId: 'partir', tense: 'passeCompose', person: 'nous', fr: 'Nous sommes partis à l’aube.', ru: 'Мы уехали на рассвете.' },
  { verbId: 'sortir', tense: 'passeCompose', person: 'il', fr: 'Il est sorti sans rien dire.', ru: 'Он вышел, ничего не сказав.' },
  { verbId: 'arriver', tense: 'passeCompose', person: 'vous', fr: 'Vous êtes arrivés en avance.', ru: 'Вы приехали заранее.' },
  { verbId: 'tomber', tense: 'passeCompose', person: 'il', fr: 'Il est tombé dans l’escalier.', ru: 'Он упал на лестнице.' },
  { verbId: 'naître', tense: 'passeCompose', person: 'je', fr: 'Je suis né en hiver.', ru: 'Я родился зимой.' },
  { verbId: 'mourir', tense: 'passeCompose', person: 'ils', fr: 'Ils sont morts la même année.', ru: 'Они умерли в один год.' },
  { verbId: 'rester', tense: 'passeCompose', person: 'nous', fr: 'Nous sommes restés jusqu’à la fin.', ru: 'Мы остались до конца.' },
  { verbId: 'se laver', tense: 'passeCompose', person: 'il', fr: 'Il s’est lavé les mains.', ru: 'Он вымыл руки.' },
  { verbId: 'se lever', tense: 'passeCompose', person: 'je', fr: 'Je me suis levé très tôt.', ru: 'Я встал очень рано.' },
  { verbId: 'monter', tense: 'passeCompose', person: 'il', fr: 'Il est monté au dernier étage.', ru: 'Он поднялся на последний этаж.' },
  { verbId: 'descendre', tense: 'passeCompose', person: 'nous', fr: 'Nous sommes descendus à pied.', ru: 'Мы спустились пешком.' },

  // ── Passé simple ─────────────────────────────────────────────────────────
  { verbId: 'être', tense: 'passeSimple', person: 'il', fr: 'Il fut roi pendant trente ans.', ru: 'Он был королём тридцать лет.' },
  { verbId: 'avoir', tense: 'passeSimple', person: 'il', fr: 'Il eut soudain une idée.', ru: 'Вдруг у него появилась мысль.' },
  { verbId: 'faire', tense: 'passeSimple', person: 'ils', fr: 'Ils firent halte au village.', ru: 'Они остановились в деревне.' },
  { verbId: 'dire', tense: 'passeSimple', person: 'il', fr: 'Il dit ces mots et se tut.', ru: 'Он произнёс эти слова и умолк.' },
  { verbId: 'prendre', tense: 'passeSimple', person: 'il', fr: 'Il prit la plume et signa.', ru: 'Он взял перо и подписал.' },
  { verbId: 'venir', tense: 'passeSimple', person: 'ils', fr: 'Ils vinrent de très loin.', ru: 'Они пришли издалека.' },
  { verbId: 'voir', tense: 'passeSimple', person: 'il', fr: 'Il vit la mer pour la première fois.', ru: 'Он впервые увидел море.' },
  { verbId: 'parler', tense: 'passeSimple', person: 'il', fr: 'Il parla longuement de son voyage.', ru: 'Он долго рассказывал о своём путешествии.' },
  { verbId: 'naître', tense: 'passeSimple', person: 'il', fr: 'Il naquit un soir d’automne.', ru: 'Он родился осенним вечером.' },

  // ── Futur simple ─────────────────────────────────────────────────────────
  { verbId: 'être', tense: 'futurSimple', person: 'je', fr: 'Je serai là à huit heures.', ru: 'Я буду там в восемь.' },
  { verbId: 'avoir', tense: 'futurSimple', person: 'tu', fr: 'Tu auras une réponse demain.', ru: 'Ответ ты получишь завтра.' },
  { verbId: 'aller', tense: 'futurSimple', person: 'nous', fr: 'Nous irons ensemble.', ru: 'Мы пойдём вместе.' },
  { verbId: 'faire', tense: 'futurSimple', person: 'il', fr: 'Il fera ce qu’il voudra.', ru: 'Он сделает, что захочет.' },
  { verbId: 'venir', tense: 'futurSimple', person: 'ils', fr: 'Ils viendront vers midi.', ru: 'Они придут около полудня.' },
  { verbId: 'voir', tense: 'futurSimple', person: 'vous', fr: 'Vous verrez, c’est facile.', ru: 'Вот увидите, это просто.' },
  { verbId: 'pouvoir', tense: 'futurSimple', person: 'tu', fr: 'Tu pourras revenir plus tard.', ru: 'Ты сможешь вернуться позже.' },
  { verbId: 'savoir', tense: 'futurSimple', person: 'nous', fr: 'Nous saurons la vérité bientôt.', ru: 'Скоро мы узнаем правду.' },
  { verbId: 'parler', tense: 'futurSimple', person: 'je', fr: 'Je parlerai au directeur.', ru: 'Я поговорю с директором.' },
  { verbId: 'finir', tense: 'futurSimple', person: 'nous', fr: 'Nous finirons avant la nuit.', ru: 'Мы закончим до ночи.' },
  { verbId: 'acheter', tense: 'futurSimple', person: 'je', fr: "J'achèterai le billet ce soir.", ru: 'Я куплю билет сегодня вечером.' },
  { verbId: 'appeler', tense: 'futurSimple', person: 'je', fr: 'Je t’appellerai demain.', ru: 'Я позвоню тебе завтра.' },
  { verbId: 'envoyer', tense: 'futurSimple', person: 'je', fr: 'Je vous enverrai le document.', ru: 'Я пришлю вам документ.' },
  { verbId: 'courir', tense: 'futurSimple', person: 'il', fr: 'Il courra le marathon.', ru: 'Он побежит марафон.' },

  // ── Conditionnel ─────────────────────────────────────────────────────────
  { verbId: 'vouloir', tense: 'conditionnel', person: 'je', fr: 'Je voudrais un café, s’il vous plaît.', ru: 'Я бы хотел кофе, пожалуйста.' },
  { verbId: 'pouvoir', tense: 'conditionnel', person: 'vous', fr: 'Pourriez-vous répéter ?', ru: 'Не могли бы вы повторить?' },
  { verbId: 'aimer', tense: 'conditionnel', person: 'je', fr: 'J’aimerais vous poser une question.', ru: 'Я хотел бы задать вам вопрос.' },
  { verbId: 'être', tense: 'conditionnel', person: 'il', fr: 'Ce serait plus simple ainsi.', ru: 'Так было бы проще.' },
  { verbId: 'avoir', tense: 'conditionnel', person: 'nous', fr: 'Nous aurions besoin de plus de temps.', ru: 'Нам нужно было бы больше времени.' },
  { verbId: 'venir', tense: 'conditionnel', person: 'il', fr: 'Si tu l’invitais, il viendrait.', ru: 'Если бы ты его позвал, он бы пришёл.' },
  { verbId: 'faire', tense: 'conditionnel', person: 'je', fr: 'À ta place, je ferais autrement.', ru: 'На твоём месте я поступил бы иначе.' },
  { verbId: 'devoir', tense: 'conditionnel', person: 'tu', fr: 'Tu devrais te reposer.', ru: 'Тебе стоило бы отдохнуть.' },

  // ── Plus-que-parfait ─────────────────────────────────────────────────────
  { verbId: 'faire', tense: 'plusQueParfait', person: 'il', fr: 'Il avait fait ses valises avant mon arrivée.', ru: 'Он собрал чемоданы до моего приезда.' },
  { verbId: 'parler', tense: 'plusQueParfait', person: 'nous', fr: 'Nous avions déjà parlé de cela.', ru: 'Мы уже говорили об этом.' },
  { verbId: 'partir', tense: 'plusQueParfait', person: 'ils', fr: 'Quand je suis arrivé, ils étaient déjà partis.', ru: 'Когда я приехал, они уже уехали.' },
  { verbId: 'savoir', tense: 'plusQueParfait', person: 'je', fr: 'Si j’avais su, je serais venu.', ru: 'Если бы я знал, я бы пришёл.' },
  { verbId: 'aller', tense: 'plusQueParfait', person: 'il', fr: 'Elle était allée le chercher.', ru: 'Она пошла за ним.' },

  // ── Passé antérieur ──────────────────────────────────────────────────────
  { verbId: 'parler', tense: 'passeAnterieur', person: 'il', fr: 'Quand il eut parlé, tous se turent.', ru: 'Когда он договорил, все смолкли.' },
  { verbId: 'finir', tense: 'passeAnterieur', person: 'ils', fr: 'Dès qu’ils eurent fini, ils sortirent.', ru: 'Как только они закончили, они вышли.' },
  { verbId: 'partir', tense: 'passeAnterieur', person: 'il', fr: 'À peine fut-il parti que l’orage éclata.', ru: 'Едва он ушёл, как разразилась гроза.' },

  // ── Futur antérieur ──────────────────────────────────────────────────────
  { verbId: 'finir', tense: 'futurAnterieur', person: 'je', fr: 'Quand j’aurai fini, je t’appellerai.', ru: 'Когда закончу, я тебе позвоню.' },
  { verbId: 'partir', tense: 'futurAnterieur', person: 'ils', fr: 'Ils seront partis avant midi.', ru: 'Они уедут до полудня.' },
  { verbId: 'faire', tense: 'futurAnterieur', person: 'tu', fr: 'Tu auras tout fait en une heure.', ru: 'Ты всё сделаешь за час.' },
  { verbId: 'arriver', tense: 'futurAnterieur', person: 'nous', fr: 'Nous serons arrivés avant la nuit.', ru: 'Мы приедем до наступления ночи.' },

  // ── Conditionnel passé ───────────────────────────────────────────────────
  { verbId: 'devoir', tense: 'conditionnelPasse', person: 'tu', fr: 'Tu aurais dû me prévenir.', ru: 'Ты должен был меня предупредить.' },
  { verbId: 'faire', tense: 'conditionnelPasse', person: 'je', fr: 'J’aurais fait la même chose.', ru: 'Я поступил бы так же.' },
  { verbId: 'venir', tense: 'conditionnelPasse', person: 'il', fr: 'Il serait venu si tu l’avais appelé.', ru: 'Он пришёл бы, если бы ты его позвал.' },
  { verbId: 'pouvoir', tense: 'conditionnelPasse', person: 'nous', fr: 'Nous aurions pu gagner.', ru: 'Мы могли бы выиграть.' },

  // ── Subjonctif présent ───────────────────────────────────────────────────
  { verbId: 'être', tense: 'subjPresent', person: 'tu', fr: 'Il faut que tu sois à l’heure.', ru: 'Нужно, чтобы ты был вовремя.' },
  { verbId: 'avoir', tense: 'subjPresent', person: 'il', fr: 'Je doute qu’il ait raison.', ru: 'Сомневаюсь, что он прав.' },
  { verbId: 'aller', tense: 'subjPresent', person: 'je', fr: 'Il veut que j’aille avec lui.', ru: 'Он хочет, чтобы я пошёл с ним.' },
  { verbId: 'faire', tense: 'subjPresent', person: 'nous', fr: 'Il faut que nous fassions vite.', ru: 'Нам надо действовать быстро.' },
  { verbId: 'venir', tense: 'subjPresent', person: 'il', fr: 'Je ne pense pas qu’il vienne.', ru: 'Не думаю, что он придёт.' },
  { verbId: 'pouvoir', tense: 'subjPresent', person: 'je', fr: 'Parle plus fort pour que je puisse entendre.', ru: 'Говори громче, чтобы я мог слышать.' },
  { verbId: 'savoir', tense: 'subjPresent', person: 'tu', fr: 'Je suis content que tu saches nager.', ru: 'Я рад, что ты умеешь плавать.' },
  { verbId: 'partir', tense: 'subjPresent', person: 'il', fr: 'Partons avant qu’il parte.', ru: 'Уйдём до того, как он уйдёт.' },
  { verbId: 'prendre', tense: 'subjPresent', person: 'vous', fr: 'Il vaut mieux que vous preniez le train.', ru: 'Лучше вам поехать поездом.' },
  { verbId: 'vouloir', tense: 'subjPresent', person: 'il', fr: 'Bien qu’il veuille aider, il ne peut pas.', ru: 'Хотя он хочет помочь, он не может.' },

  // ── Subjonctif passé ─────────────────────────────────────────────────────
  { verbId: 'venir', tense: 'subjPasse', person: 'il', fr: 'Je suis content qu’il soit venu.', ru: 'Я рад, что он пришёл.' },
  { verbId: 'finir', tense: 'subjPasse', person: 'tu', fr: 'Il faut que tu aies fini avant ce soir.', ru: 'Нужно, чтобы ты закончил до вечера.' },
  { verbId: 'faire', tense: 'subjPasse', person: 'ils', fr: 'Je doute qu’ils aient fait le nécessaire.', ru: 'Сомневаюсь, что они сделали необходимое.' },
  { verbId: 'partir', tense: 'subjPasse', person: 'je', fr: 'Elle regrette que je sois parti si tôt.', ru: 'Она жалеет, что я ушёл так рано.' },

  // ── Subjonctif imparfait ─────────────────────────────────────────────────
  { verbId: 'être', tense: 'subjImparfait', person: 'il', fr: 'Il fallait qu’il fût présent.', ru: 'Нужно было, чтобы он присутствовал.' },
  { verbId: 'avoir', tense: 'subjImparfait', person: 'il', fr: 'On craignait qu’il n’eût tout perdu.', ru: 'Опасались, что он всё потерял.' },
  { verbId: 'parler', tense: 'subjImparfait', person: 'il', fr: 'Il attendait qu’elle parlât.', ru: 'Он ждал, когда она заговорит.' },

  // ── Subjonctif plus-que-parfait ──────────────────────────────────────────
  { verbId: 'parler', tense: 'subjPlusQueParfait', person: 'il', fr: 'Bien qu’il eût parlé toute la nuit, il ne semblait pas fatigué.', ru: 'Хотя он проговорил всю ночь, он не казался уставшим.' },
  { verbId: 'être', tense: 'subjPlusQueParfait', person: 'il', fr: 'Nul ne croyait qu’il eût été là.', ru: 'Никто не верил, что он там был.' },

  // ── Impératif présent ────────────────────────────────────────────────────
  { verbId: 'être', tense: 'imperatifPresent', person: 'tu', fr: 'Sois patient !', ru: 'Будь терпелив!' },
  { verbId: 'avoir', tense: 'imperatifPresent', person: 'vous', fr: 'Ayez confiance.', ru: 'Доверьтесь.' },
  { verbId: 'aller', tense: 'imperatifPresent', person: 'tu', fr: 'Va voir toi-même !', ru: 'Сходи посмотри сам!' },
  { verbId: 'parler', tense: 'imperatifPresent', person: 'tu', fr: 'Parle plus lentement.', ru: 'Говори медленнее.' },
  { verbId: 'venir', tense: 'imperatifPresent', person: 'vous', fr: 'Venez avec nous !', ru: 'Пойдёмте с нами!' },
  { verbId: 'faire', tense: 'imperatifPresent', person: 'nous', fr: 'Faisons une pause.', ru: 'Давайте сделаем перерыв.' },
  { verbId: 'savoir', tense: 'imperatifPresent', person: 'vous', fr: 'Sachez que je ne céderai pas.', ru: 'Знайте, что я не уступлю.' },
  { verbId: 'vouloir', tense: 'imperatifPresent', person: 'vous', fr: 'Veuillez patienter un instant.', ru: 'Будьте добры подождать минуту.' },
  { verbId: 'ouvrir', tense: 'imperatifPresent', person: 'tu', fr: 'Ouvre la porte, s’il te plaît.', ru: 'Открой дверь, пожалуйста.' },
  { verbId: 'se laver', tense: 'imperatifPresent', person: 'tu', fr: 'Lave-toi les mains !', ru: 'Вымой руки!' },

  // ── Impératif passé ──────────────────────────────────────────────────────
  { verbId: 'finir', tense: 'imperatifPasse', person: 'tu', fr: 'Aie fini avant mon retour.', ru: 'Закончи до моего возвращения.' },
  { verbId: 'partir', tense: 'imperatifPasse', person: 'vous', fr: 'Soyez partis avant huit heures.', ru: 'Успейте уехать до восьми.' },
];

const BY_VERB = new Map<string, Example[]>();
for (const example of EXAMPLES) {
  const list = BY_VERB.get(example.verbId) ?? [];
  list.push(example);
  BY_VERB.set(example.verbId, list);
}

/** Примеры для глагола; если задано время — только для него. */
export function examplesFor(verbId: string, tense?: Tense): Example[] {
  const all = BY_VERB.get(verbId) ?? [];
  return tense ? all.filter(example => example.tense === tense) : all;
}

export function hasExamples(verbId: string): boolean {
  return BY_VERB.has(verbId);
}
