import type { QuizQuestion } from './types';
import { shuffle } from './verbs';

export const GRAMMAR_LESSON_IDS = [
  'syntax-pronoms-y-en',
  'syntax-prepositions',
  'syntax-participe-cod',
  'syntax-si',
  'syntax-past-contrast',
  'syntax-time-markers',
] as const;

export type GrammarLessonId = (typeof GRAMMAR_LESSON_IDS)[number];
export const GRAMMAR_EXAM_QUESTIONS = 20;
export const GRAMMAR_PRACTICE_QUESTIONS = 20;

export interface GrammarQuizQuestion extends QuizQuestion {
  prompt: string;
  headerTitle: string;
  headerSubtitle: string;
  explanation: string;
  speechText?: string;
}

interface RawQuestion {
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
  speech?: string;
}

function q(
  prompt: string,
  answer: string,
  options: string[],
  explanation: string,
  speech?: string,
): RawQuestion {
  return { prompt, answer, options, explanation, speech };
}

const BANKS: Record<GrammarLessonId, { title: string; subtitle: string; questions: RawQuestion[] }> = {
  'syntax-pronoms-y-en': {
    title: 'Y / EN и местоимения',
    subtitle: 'Порядок и замена дополнений',
    questions: [
      q('Замените «à ce problème»: Je pense à ce problème. → Je ___ pense.', 'y', ['y', 'en', 'le', 'lui'], 'y заменяет à + вещь/идею: penser à quelque chose → y penser.', "J'y pense."),
      q('Замените «de ce projet»: Nous parlons de ce projet. → Nous ___ parlons.', 'en', ['en', 'y', 'le', 'lui'], 'en заменяет de + существительное: parler de quelque chose → en parler.', 'Nous en parlons.'),
      q('Замените «à Paris»: Tu vas à Paris ? — Oui, j’___ vais.', 'y', ['y', 'en', 'le', 'lui'], 'y заменяет место с à: aller à Paris → y aller.', "J'y vais."),
      q('Замените «de Lyon»: Il revient de Lyon. → Il ___ revient.', 'en', ['en', 'y', 'le', 'lui'], 'en заменяет источник с de: revenir de Lyon → en revenir.', 'Il en revient.'),
      q('Замените «trois frères»: J’ai trois frères. → J’___ ai trois.', 'en', ['en', 'y', 'les', 'leur'], 'При количестве существительное заменяется на en, а число остаётся.', "J'en ai trois."),
      q('Замените дополнения: Je donne le livre à Marie.', 'Je le lui donne.', ['Je le lui donne.', 'Je lui le donne.', 'Je lui en donne.', 'Je le donne lui.'], 'Перед глаголом порядок: le/la/les → lui/leur.', 'Je le lui donne.'),
      q('Замените дополнения: Il montre les photos à ses amis.', 'Il les leur montre.', ['Il les leur montre.', 'Il leur les montre.', 'Il les montre leur.', 'Il leur en montre.'], 'les стоит перед leur: il les leur montre.', 'Il les leur montre.'),
      q('Замените дополнения в отрицании: Je ne donne pas le dossier à Paul.', 'Je ne le lui donne pas.', ['Je ne le lui donne pas.', 'Je ne lui le donne pas.', 'Je le ne lui donne pas.', 'Je ne le donne lui pas.'], 'В отрицании блок местоимений остаётся перед глаголом: ne + le + lui + verbe + pas.', 'Je ne le lui donne pas.'),
      q('Утвердительный impératif: Donne ce livre à Marie !', 'Donne-le-lui !', ['Donne-le-lui !', 'Le lui donne !', 'Donne-lui-le !', 'Donne-le à lui !'], 'В утвердительном impératif местоимения уходят после глагола: donne-le-lui.', 'Donne-le-lui !'),
      q('Утвердительный impératif: Parle de ce problème à Paul !', 'Parle-lui-en !', ['Parle-lui-en !', 'Parle-en-lui !', 'Lui en parle !', 'Parle-le-lui !'], 'После утвердительного impératif: verbe + lui/leur + en.', 'Parle-lui-en !'),
      q('Выберите нормативную форму: «Иди туда!»', 'Vas-y !', ['Vas-y !', 'Va-y !', 'Vas-en !', 'Va lui !'], 'У va перед y/en возвращается -s ради благозвучия: vas-y, vas-en.', 'Vas-y !'),
      q('Замените «du pain»: Prends du pain !', 'Prends-en !', ['Prends-en !', 'Prends-y !', 'En prends !', 'Prend-en !'], 'en заменяет de/du/des; в утвердительном impératif стоит после глагола.', 'Prends-en !'),
      q('Замените «de ça»: Je ne parle pas de ça.', 'Je n’en parle pas.', ['Je n’en parle pas.', 'Je n’y parle pas.', 'Je ne le parle pas.', 'Je ne lui parle pas.'], 'parler de → en parler; en стоит между ne и глаголом.', "Je n'en parle pas."),
      q('Замените «à la politique»: Il s’intéresse à la politique.', 'Il s’y intéresse.', ['Il s’y intéresse.', 'Il en s’intéresse.', 'Il s’en intéresse.', 'Il lui s’intéresse.'], 'y ставится после возвратного местоимения: il s’y intéresse.', "Il s'y intéresse."),
      q('Замените «de cette histoire»: Je me souviens de cette histoire.', 'Je m’en souviens.', ['Je m’en souviens.', 'Je me y souviens.', 'J’y me souviens.', 'Je la me souviens.'], 'se souvenir de → s’en souvenir.', "Je m'en souviens."),
      q('Замените «de temps»: Elle a besoin de temps.', 'Elle en a besoin.', ['Elle en a besoin.', 'Elle y a besoin.', 'Elle le besoin.', 'Elle lui a besoin.'], 'avoir besoin de → en avoir besoin.', 'Elle en a besoin.'),
      q('Замените «à cette idée»: Nous réfléchissons à cette idée.', 'Nous y réfléchissons.', ['Nous y réfléchissons.', 'Nous en réfléchissons.', 'Nous la réfléchissons.', 'Nous lui réfléchissons.'], 'réfléchir à quelque chose → y réfléchir.', 'Nous y réfléchissons.'),
      q('Замените «des conséquences»: Tu parles des conséquences.', 'Tu en parles.', ['Tu en parles.', 'Tu y parles.', 'Tu les parles.', 'Tu leur parles.'], 'parler de/des → en parler.', 'Tu en parles.'),
      q('Замените два дополнения: Je prête ma voiture à mes parents.', 'Je la leur prête.', ['Je la leur prête.', 'Je leur la prête.', 'Je leur en prête.', 'Je la prête leur.'], 'la (COD) предшествует leur (COI).', 'Je la leur prête.'),
      q('Замените два дополнения: Nous envoyons les documents à Paul.', 'Nous les lui envoyons.', ['Nous les lui envoyons.', 'Nous lui les envoyons.', 'Nous en lui envoyons.', 'Nous les envoyons lui.'], 'les → lui: оба стоят перед глаголом в порядке les puis lui.', 'Nous les lui envoyons.'),
      q('Выберите форму: «Не ходи туда!»', 'N’y va pas !', ['N’y va pas !', 'Ne va-y pas !', 'N’en va pas !', 'Y ne va pas !'], 'В отрицательном impératif местоимение снова стоит перед глаголом: n’y va pas.', "N'y va pas !"),
      q('Выберите форму: «Не говори мне об этом!»', 'Ne m’en parle pas !', ['Ne m’en parle pas !', 'Ne parle-m’en pas !', 'Ne me parle-en pas !', 'N’en me parle pas !'], 'В отрицательном impératif: ne + me + en + verbe + pas.', "Ne m'en parle pas !"),
      q('Замените «à ses collègues» и «de la décision»: Il parle de la décision à ses collègues.', 'Il leur en parle.', ['Il leur en parle.', 'Il en leur parle.', 'Il les en parle.', 'Il leur y parle.'], 'Когда вместе COI и en: lui/leur стоит перед en.', 'Il leur en parle.'),
      q('Замените «de l’argent»: Nous n’avons plus d’argent.', 'Nous n’en avons plus.', ['Nous n’en avons plus.', 'Nous n’y avons plus.', 'Nous ne l’avons plus.', 'Nous en n’avons plus.'], 'en стоит перед вспомогательным/личной формой: nous n’en avons plus.', "Nous n'en avons plus."),
    ],
  },

  'syntax-prepositions': {
    title: 'À / DE / без предлога',
    subtitle: 'Управление французских глаголов',
    questions: [
      q('Il essaie ___ comprendre.', 'de', ['de', 'à', '—', 'pour'], 'essayer de + infinitif.', 'Il essaie de comprendre.'),
      q('Elle réussit ___ résoudre le problème.', 'à', ['à', 'de', '—', 'pour'], 'réussir à + infinitif.', 'Elle réussit à résoudre le problème.'),
      q('Nous décidons ___ partir demain.', 'de', ['de', 'à', '—', 'pour'], 'décider de + infinitif.', 'Nous décidons de partir demain.'),
      q('Tu apprends ___ conduire.', 'à', ['à', 'de', '—', 'pour'], 'apprendre à + infinitif.', 'Tu apprends à conduire.'),
      q('Il refuse ___ répondre.', 'de', ['de', 'à', '—', 'pour'], 'refuser de + infinitif.', 'Il refuse de répondre.'),
      q('J’hésite ___ lui parler.', 'à', ['à', 'de', '—', 'pour'], 'hésiter à + infinitif.', "J'hésite à lui parler."),
      q('Elle évite ___ sortir tard.', 'de', ['de', 'à', '—', 'pour'], 'éviter de + infinitif.', 'Elle évite de sortir tard.'),
      q('Nous continuons ___ travailler.', 'à', ['à', 'de', '—', 'pour'], 'continuer à est ici la construction ciblée; continuer de existe aussi dans certains usages, donc ce item entraîne la construction la plus courante.', 'Nous continuons à travailler.'),
      q('Il arrête ___ fumer.', 'de', ['de', 'à', '—', 'pour'], 'arrêter de + infinitif = cesser de faire.', 'Il arrête de fumer.'),
      q('Je pense ___ changer de travail.', 'à', ['à', 'de', '—', 'pour'], 'penser à + infinitif = envisager.', 'Je pense à changer de travail.'),
      q('Elle rêve ___ voyager en Afrique.', 'de', ['de', 'à', '—', 'pour'], 'rêver de + infinitif.', 'Elle rêve de voyager en Afrique.'),
      q('Vous acceptez ___ attendre ?', 'de', ['de', 'à', '—', 'pour'], 'accepter de + infinitif.', 'Vous acceptez d’attendre ?'),
      q('Il promet ___ revenir.', 'de', ['de', 'à', '—', 'pour'], 'promettre de + infinitif.', 'Il promet de revenir.'),
      q('Je préfère ___ rester ici.', '—', ['—', 'de', 'à', 'pour'], 'préférer + infinitif sans préposition.', 'Je préfère rester ici.'),
      q('Nous voulons ___ partir.', '—', ['—', 'de', 'à', 'pour'], 'vouloir + infinitif sans préposition.', 'Nous voulons partir.'),
      q('Elle peut ___ venir demain.', '—', ['—', 'de', 'à', 'pour'], 'pouvoir + infinitif sans préposition.', 'Elle peut venir demain.'),
      q('J’attends ___ Paul.', '—', ['—', 'à', 'de', 'pour'], 'attendre quelqu’un: pas de à en français.', "J'attends Paul."),
      q('Nous écoutons ___ le professeur.', '—', ['—', 'à', 'de', 'pour'], 'écouter quelqu’un: COD direct.', 'Nous écoutons le professeur.'),
      q('Elle cherche ___ ses clés.', '—', ['—', 'à', 'de', 'pour'], 'chercher quelque chose: pas de préposition.', 'Elle cherche ses clés.'),
      q('Je téléphone ___ Marie.', 'à', ['à', 'de', '—', 'pour'], 'téléphoner à quelqu’un.', 'Je téléphone à Marie.'),
      q('Il parle ___ son frère.', 'à', ['à', 'de', '—', 'pour'], 'parler à quelqu’un = s’adresser à une personne.', 'Il parle à son frère.'),
      q('Il parle ___ son travail.', 'de', ['de', 'à', '—', 'pour'], 'parler de quelque chose = traiter un sujet.', 'Il parle de son travail.'),
      q('Elle aide son fils ___ faire ses devoirs.', 'à', ['à', 'de', '—', 'pour'], 'aider quelqu’un à + infinitif.', 'Elle aide son fils à faire ses devoirs.'),
      q('Le médecin lui conseille ___ se reposer.', 'de', ['de', 'à', '—', 'pour'], 'conseiller à quelqu’un de + infinitif: ici lui représente déjà la personne.', 'Le médecin lui conseille de se reposer.'),
    ],
  },

  'syntax-participe-cod': {
    title: 'Participe passé + COD',
    subtitle: 'Согласование по позиции дополнения',
    questions: [
      q('Les lettres que j’ai ___ hier sont sur la table. (écrire)', 'écrites', ['écrit', 'écrite', 'écrits', 'écrites'], 'Avec avoir, le participe s’accorde avec le COD placé avant: les lettres → écrites.', "Les lettres que j'ai écrites hier sont sur la table."),
      q('Ces films, je les ai ___. (voir)', 'vus', ['vu', 'vue', 'vus', 'vues'], 'les = films, masculin pluriel, placé avant → vus.', 'Ces films, je les ai vus.'),
      q('Marie, je l’ai ___ ce matin. (voir)', 'vue', ['vu', 'vue', 'vus', 'vues'], 'l’ = Marie, féminin singulier, placé avant → vue.', "Marie, je l'ai vue ce matin."),
      q('J’ai ___ Marie ce matin. (voir)', 'vu', ['vu', 'vue', 'vus', 'vues'], 'Le COD Marie est après le participe: pas d’accord avec avoir.', "J'ai vu Marie ce matin."),
      q('Les pommes que nous avons ___ étaient excellentes. (manger)', 'mangées', ['mangé', 'mangée', 'mangés', 'mangées'], 'les pommes est COD antéposé, féminin pluriel → mangées.', 'Les pommes que nous avons mangées étaient excellentes.'),
      q('Nous avons ___ les pommes. (manger)', 'mangé', ['mangé', 'mangée', 'mangés', 'mangées'], 'COD après le participe → mangé reste invariable.', 'Nous avons mangé les pommes.'),
      q('La chanson que j’ai ___ hier. (entendre)', 'entendue', ['entendu', 'entendue', 'entendus', 'entendues'], 'la chanson est COD avant le participe → entendue.', "La chanson que j'ai entendue hier."),
      q('Les histoires qu’il a ___. (raconter)', 'racontées', ['raconté', 'racontée', 'racontés', 'racontées'], 'qu’ reprend les histoires, féminin pluriel → racontées.', "Les histoires qu'il a racontées."),
      q('Elle s’est ___. (laver)', 'lavée', ['lavé', 'lavée', 'lavés', 'lavées'], 'Dans se laver sans autre COD, se est COD et renvoie à elle → lavée.', "Elle s'est lavée."),
      q('Elle s’est ___ les mains. (laver)', 'lavé', ['lavé', 'lavée', 'lavés', 'lavées'], 'les mains est COD placé après; se est COI ici → pas d’accord: lavé.', "Elle s'est lavé les mains."),
      q('Elles se sont ___. (parler)', 'parlé', ['parlé', 'parlée', 'parlés', 'parlées'], 'parler à quelqu’un: se est COI, donc pas d’accord.', 'Elles se sont parlé.'),
      q('Ils se sont ___. (téléphoner)', 'téléphoné', ['téléphoné', 'téléphonée', 'téléphonés', 'téléphonées'], 'téléphoner à quelqu’un: se est COI → téléphoné invariable.', 'Ils se sont téléphoné.'),
      q('Elles se sont ___. (rencontrer)', 'rencontrées', ['rencontré', 'rencontrée', 'rencontrés', 'rencontrées'], 'rencontrer quelqu’un: se est COD → accord avec elles.', 'Elles se sont rencontrées.'),
      q('Les mains qu’elle s’est ___. (laver)', 'lavées', ['lavé', 'lavée', 'lavés', 'lavées'], 'les mains est COD placé avant par que → accord féminin pluriel.', "Les mains qu'elle s'est lavées."),
      q('Les erreurs que j’ai ___. (faire)', 'faites', ['fait', 'faite', 'faits', 'faites'], 'COD les erreurs placé avant → faites.', "Les erreurs que j'ai faites."),
      q('J’ai ___ des erreurs. (faire)', 'fait', ['fait', 'faite', 'faits', 'faites'], 'COD après le participe → fait.', "J'ai fait des erreurs."),
      q('Les chansons qu’elle a ___ chanter aux enfants. (faire)', 'fait', ['fait', 'faite', 'faits', 'faites'], 'Le participe fait suivi d’un infinitif dans la construction causative faire + infinitif est invariable.', "Les chansons qu'elle a fait chanter aux enfants."),
      q('La robe qu’elle a ___. (acheter)', 'achetée', ['acheté', 'achetée', 'achetés', 'achetées'], 'la robe est COD avant le participe → achetée.', "La robe qu'elle a achetée."),
      q('Quels livres avez-vous ___ ? (lire)', 'lus', ['lu', 'lue', 'lus', 'lues'], 'quels livres est COD placé avant → lus.', 'Quels livres avez-vous lus ?'),
      q('Quelle décision ont-ils ___ ? (prendre)', 'prise', ['pris', 'prise', 'prises', 'prisent'], 'quelle décision est COD féminin singulier placé avant → prise.', 'Quelle décision ont-ils prise ?'),
      q('Les photos ? Je ne les ai pas ___. (prendre)', 'prises', ['pris', 'prise', 'prises', 'prisent'], 'les = photos, féminin pluriel, avant le participe → prises.', 'Les photos ? Je ne les ai pas prises.'),
      q('Cette porte, qui l’a ___ ? (ouvrir)', 'ouverte', ['ouvert', 'ouverte', 'ouverts', 'ouvertes'], 'l’ reprend cette porte, COD féminin singulier avant → ouverte.', 'Cette porte, qui l’a ouverte ?'),
      q('Les portes qu’on a ___ ce matin. (ouvrir)', 'ouvertes', ['ouvert', 'ouverte', 'ouverts', 'ouvertes'], 'qu’ = les portes, COD féminin pluriel avant → ouvertes.', "Les portes qu'on a ouvertes ce matin."),
      q('On a ___ les portes ce matin. (ouvrir)', 'ouvert', ['ouvert', 'ouverte', 'ouverts', 'ouvertes'], 'les portes est après le participe → ouvert reste invariable.', 'On a ouvert les portes ce matin.'),
    ],
  },

  'syntax-si': {
    title: 'Si: три модели',
    subtitle: 'Реальное, гипотетическое и прошлое условие',
    questions: [
      q('Si tu ___ demain, je serai content. (venir)', 'viens', ['viens', 'viendras', 'venais', 'viendrais'], 'Après si dans une condition réelle: présent, jamais futur simple ici.', 'Si tu viens demain, je serai content.'),
      q('Si j’ai le temps, je ___ ce soir. (passer)', 'passerai', ['passerai', 'passerais', 'passais', 'suis passé'], 'si + présent peut mener au futur simple dans la principale.', "Si j'ai le temps, je passerai ce soir."),
      q('Si tu es fatigué, ___ ! (se reposer)', 'repose-toi', ['repose-toi', 'te reposeras', 'te reposerais', 'reposais-toi'], 'Condition réelle: si + présent peut être suivi d’un impératif.', 'Si tu es fatigué, repose-toi !'),
      q('Si j’___ plus de temps, je voyagerais davantage. (avoir)', 'avais', ['avais', 'aurais', 'ai', 'aurai'], 'Hypothèse présente: si + imparfait → conditionnel présent.', "Si j'avais plus de temps, je voyagerais davantage."),
      q('Si nous habitions près de la mer, nous ___ tous les jours. (nager)', 'nagerions', ['nagerions', 'nagions', 'nagerons', 'avons nagé'], 'Principale d’une hypothèse: conditionnel présent.', 'Si nous habitions près de la mer, nous nagerions tous les jours.'),
      q('Si elle ___ français, elle travaillerait à Paris. (parler)', 'parlait', ['parlait', 'parlerait', 'parlera', 'a parlé'], 'Après si pour l’irréel/hypothétique présent: imparfait.', 'Si elle parlait français, elle travaillerait à Paris.'),
      q('Si j’étais toi, je ne ___ pas ça. (faire)', 'ferais', ['ferais', 'faisais', 'ferai', 'fasse'], 'Si + imparfait → conditionnel présent.', "Si j'étais toi, je ne ferais pas ça."),
      q('Si tu pouvais choisir, où ___-tu ? (aller)', 'irais', ['irais', 'allais', 'iras', 'es allé'], 'La conséquence hypothétique prend le conditionnel présent.', 'Si tu pouvais choisir, où irais-tu ?'),
      q('Si j’___, je serais venu. (savoir)', 'avais su', ['avais su', 'aurais su', 'savais', 'ai su'], 'Irréel du passé: si + plus-que-parfait → conditionnel passé.', "Si j'avais su, je serais venu."),
      q('Si elle avait étudié, elle ___ l’examen. (réussir)', 'aurait réussi', ['aurait réussi', 'avait réussi', 'réussirait', 'a réussi'], 'Conséquence irréelle passée: conditionnel passé.', "Si elle avait étudié, elle aurait réussi l'examen."),
      q('Si nous ___ plus tôt, nous n’aurions pas raté le train. (partir)', 'étions partis', ['étions partis', 'serions partis', 'partions', 'sommes partis'], 'Après si pour un passé non réalisé: plus-que-parfait.', "Si nous étions partis plus tôt, nous n'aurions pas raté le train."),
      q('Si tu m’avais appelé, je t’___ . (aider)', 'aurais aidé', ['aurais aidé', 'avais aidé', 'aiderais', 'ai aidé'], 'La principale prend le conditionnel passé.', "Si tu m'avais appelé, je t'aurais aidé."),
      q('Quelle phrase est correcte ?', 'Si j’avais de l’argent, j’achèterais cette voiture.', ['Si j’avais de l’argent, j’achèterais cette voiture.', 'Si j’aurais de l’argent, j’achèterais cette voiture.', 'Si j’aurai de l’argent, j’achèterais cette voiture.', 'Si j’avais de l’argent, j’achèterai cette voiture.'], 'Jamais conditionnel juste après si dans ce type d’hypothèse.', "Si j'avais de l'argent, j'achèterais cette voiture."),
      q('Quelle phrase est correcte ?', 'Si tu viens, nous mangerons ensemble.', ['Si tu viens, nous mangerons ensemble.', 'Si tu viendras, nous mangerons ensemble.', 'Si tu viendrais, nous mangerons ensemble.', 'Si tu venais, nous mangerons ensemble.'], 'Condition réelle future: si + présent, futur dans la principale.', 'Si tu viens, nous mangerons ensemble.'),
      q('Quelle phrase est correcte ?', 'Si tu avais écouté, tu aurais compris.', ['Si tu avais écouté, tu aurais compris.', 'Si tu aurais écouté, tu avais compris.', 'Si tu écoutais, tu aurais compris.', 'Si tu as écouté, tu aurais compris.'], 'Irréel passé: plus-que-parfait après si, conditionnel passé ensuite.', 'Si tu avais écouté, tu aurais compris.'),
      q('Si on ___ maintenant, on arrivera avant midi. (partir)', 'part', ['part', 'partira', 'partirait', 'partait'], 'Après si dans une condition réalisable: présent.', 'Si on part maintenant, on arrivera avant midi.'),
      q('Si je connaissais son numéro, je l’___ . (appeler)', 'appellerais', ['appellerais', 'appelais', 'appellerai', 'ai appelé'], 'Imparfait dans la condition → conditionnel présent dans le résultat.', "Si je connaissais son numéro, je l'appellerais."),
      q('Si vous aviez réservé, vous ___ une table. (avoir)', 'auriez eu', ['auriez eu', 'aviez eu', 'auriez', 'avez eu'], 'Condition passée non réalisée → conditionnel passé.', 'Si vous aviez réservé, vous auriez eu une table.'),
      q('Si elle ___ hier, elle aurait vu Paul. (venir)', 'était venue', ['était venue', 'serait venue', 'venait', 'est venue'], 'Après si pour l’irréel du passé: plus-que-parfait.', 'Si elle était venue hier, elle aurait vu Paul.'),
      q('Si tu ___ besoin d’aide, appelle-moi. (avoir)', 'as', ['as', 'auras', 'aurais', 'avais'], 'Condition réelle + impératif: si + présent.', "Si tu as besoin d'aide, appelle-moi."),
      q('Si le magasin était ouvert, nous y ___. (aller)', 'irions', ['irions', 'allions', 'irons', 'sommes allés'], 'Hypothèse présente: imparfait → conditionnel présent.', 'Si le magasin était ouvert, nous y irions.'),
      q('Si j’avais été moins fatigué, je ___ avec vous. (sortir)', 'serais sorti', ['serais sorti', 'étais sorti', 'sortirais', 'suis sorti'], 'Irréel passé: conditionnel passé dans la principale.', "Si j'avais été moins fatigué, je serais sorti avec vous."),
      q('Si vous ___ ce message, répondez-moi. (recevoir)', 'recevez', ['recevez', 'recevrez', 'recevriez', 'receviez'], 'Condition réelle: présent après si, impératif dans la principale.', 'Si vous recevez ce message, répondez-moi.'),
      q('Si nous avions su la vérité, nous ___ autrement. (agir)', 'aurions agi', ['aurions agi', 'avions agi', 'agirions', 'agissions'], 'Plus-que-parfait → conditionnel passé.', 'Si nous avions su la vérité, nous aurions agi autrement.'),
    ],
  },

  'syntax-past-contrast': {
    title: 'Три прошедших времени',
    subtitle: 'Imparfait / passé composé / plus-que-parfait',
    questions: [
      q('Quand je suis arrivé, il ___ déjà. (manger)', 'avait mangé', ['mangeait', 'a mangé', 'avait mangé'], 'L’action de manger est antérieure à mon arrivée → plus-que-parfait.', 'Quand je suis arrivé, il avait déjà mangé.'),
      q('Quand j’étais petit, je ___ au parc tous les jours. (aller)', 'allais', ['allais', 'suis allé', 'étais allé'], 'Habitude et arrière-plan dans le passé → imparfait.', "Quand j'étais petit, j'allais au parc tous les jours."),
      q('Hier, j’___ ce film pour la première fois. (voir)', 'ai vu', ['voyais', 'ai vu', 'avais vu'], 'Événement ponctuel et achevé → passé composé.', "Hier, j'ai vu ce film pour la première fois."),
      q('Il ___ quand je suis sorti. (pleuvoir)', 'pleuvait', ['pleuvait', 'a plu', 'avait plu'], 'La pluie forme le décor pendant l’événement «je suis sorti» → imparfait.', 'Il pleuvait quand je suis sorti.'),
      q('J’ai compris qu’il me ___. (mentir)', 'avait menti', ['mentait', 'a menti', 'avait menti'], 'Le mensonge précède le moment où j’ai compris → plus-que-parfait.', "J'ai compris qu'il m'avait menti."),
      q('Soudain, la porte ___. (s’ouvrir)', 's’est ouverte', ['s’ouvrait', 's’est ouverte', 's’était ouverte'], 'Soudain introduit ici un événement qui fait avancer le récit → passé composé.', "Soudain, la porte s'est ouverte."),
      q('Tous les étés, nous ___ chez nos grands-parents. (passer)', 'passions', ['passions', 'avons passé', 'avions passé'], 'Répétition habituelle dans le passé → imparfait.', 'Tous les étés, nous passions chez nos grands-parents.'),
      q('Avant ce voyage, je n’___ jamais l’océan. (voir)', 'avais vu', ['voyais', 'ai vu', 'avais vu'], 'Avant un repère passé, l’expérience antérieure prend le plus-que-parfait.', "Avant ce voyage, je n'avais jamais vu l'océan."),
      q('La semaine dernière, nous ___ le projet. (finir)', 'avons fini', ['finissions', 'avons fini', 'avions fini'], 'Période terminée + action achevée → passé composé.', 'La semaine dernière, nous avons fini le projet.'),
      q('Elle ___ tranquillement quand le téléphone a sonné. (lire)', 'lisait', ['lisait', 'a lu', 'avait lu'], 'Action en cours interrompue par un événement → imparfait.', 'Elle lisait tranquillement quand le téléphone a sonné.'),
      q('Le train était déjà parti quand nous ___ à la gare. (arriver)', 'sommes arrivés', ['arrivions', 'sommes arrivés', 'étions arrivés'], 'Notre arrivée est l’événement-repère; le départ était antérieur.', 'Le train était déjà parti quand nous sommes arrivés à la gare.'),
      q('Quand nous sommes arrivés, le train ___. (partir)', 'était déjà parti', ['partait déjà', 'est déjà parti', 'était déjà parti'], 'Le départ a eu lieu avant notre arrivée → plus-que-parfait.', 'Quand nous sommes arrivés, le train était déjà parti.'),
      q('À cette époque, il ___ à Lyon. (habiter)', 'habitait', ['habitait', 'a habité', 'avait habité'], 'État/cadre à une époque passée → imparfait.', 'À cette époque, il habitait à Lyon.'),
      q('En 2022, il ___ à Lyon pendant six mois, puis il est parti. (habiter)', 'a habité', ['habitait', 'a habité', 'avait habité'], 'Période bornée et terminée, présentée comme un bloc → passé composé.', 'En 2022, il a habité à Lyon pendant six mois, puis il est parti.'),
      q('Je ne pouvais pas entrer: j’___ mes clés. (oublier)', 'avais oublié', ['oubliais', 'ai oublié', 'avais oublié'], 'L’oubli est la cause antérieure de l’impossibilité → plus-que-parfait.', "Je ne pouvais pas entrer: j'avais oublié mes clés."),
      q('Pendant que nous ___, quelqu’un a frappé à la porte. (dîner)', 'dînions', ['dînions', 'avons dîné', 'avions dîné'], 'Pendant que introduit ici une action en cours → imparfait.', 'Pendant que nous dînions, quelqu’un a frappé à la porte.'),
      q('Il ___ trois fois cette semaine-là. (téléphoner)', 'a téléphoné', ['téléphonait', 'a téléphoné', 'avait téléphoné'], 'Nombre d’occurrences borné → passé composé.', 'Il a téléphoné trois fois cette semaine-là.'),
      q('Elle connaissait déjà Paris parce qu’elle y ___. (vivre)', 'avait vécu', ['vivait', 'a vécu', 'avait vécu'], 'L’expérience de vivre à Paris précède le repère «elle connaissait» → plus-que-parfait.', 'Elle connaissait déjà Paris parce qu’elle y avait vécu.'),
      q('Le soleil ___ et les oiseaux chantaient. (briller)', 'brillait', ['brillait', 'a brillé', 'avait brillé'], 'Description du décor → imparfait.', 'Le soleil brillait et les oiseaux chantaient.'),
      q('Puis il ___ son manteau et il est sorti. (prendre)', 'a pris', ['prenait', 'a pris', 'avait pris'], 'Suite d’événements achevés qui fait avancer le récit → passé composé.', 'Puis il a pris son manteau et il est sorti.'),
      q('Elle était fatiguée parce qu’elle ___ toute la nuit. (travailler)', 'avait travaillé', ['travaillait', 'a travaillé', 'avait travaillé'], 'La cause est accomplie avant l’état «était fatiguée» → plus-que-parfait.', 'Elle était fatiguée parce qu’elle avait travaillé toute la nuit.'),
      q('Quand le professeur est entré, les étudiants ___. (parler)', 'parlaient', ['parlaient', 'ont parlé', 'avaient parlé'], 'Action déjà en cours au moment de l’entrée → imparfait.', 'Quand le professeur est entré, les étudiants parlaient.'),
      q('À huit heures exactement, le cours ___. (commencer)', 'a commencé', ['commençait', 'a commencé', 'avait commencé'], 'Événement ponctuel à un moment précis → passé composé.', 'À huit heures exactement, le cours a commencé.'),
      q('À huit heures dix, le cours ___. (commencer)', 'avait déjà commencé', ['commençait déjà', 'a déjà commencé', 'avait déjà commencé'], 'À 8h10, le début est déjà antérieur → plus-que-parfait.', 'À huit heures dix, le cours avait déjà commencé.'),
    ],
  },

  'syntax-time-markers': {
    title: 'Depuis / pendant / il y a',
    subtitle: 'Длительность и точка отсчёта',
    questions: [
      q('J’habite ici ___ trois ans.', 'depuis', ['depuis', 'pendant', 'il y a', 'pour'], 'depuis + durée: situation commencée avant et toujours vraie maintenant.', "J'habite ici depuis trois ans."),
      q('J’ai travaillé à Lyon ___ deux ans, puis je suis parti.', 'pendant', ['pendant', 'depuis', 'il y a', 'pour'], 'pendant mesure une durée terminée.', "J'ai travaillé à Lyon pendant deux ans, puis je suis parti."),
      q('Je l’ai vu ___ deux jours.', 'il y a', ['il y a', 'depuis', 'pendant', 'pour'], 'il y a + durée situe un événement à X temps avant maintenant.', "Je l'ai vu il y a deux jours."),
      q('Je pars à Montréal ___ deux semaines.', 'pour', ['pour', 'depuis', 'pendant', 'il y a'], 'pour indique ici la durée prévue d’un séjour à venir.', 'Je pars à Montréal pour deux semaines.'),
      q('___ trois ans que j’habite ici.', 'Ça fait', ['Ça fait', 'Depuis', 'Pendant', 'Il y a'], 'ça fait + durée + que exprime une situation toujours en cours.', "Ça fait trois ans que j'habite ici."),
      q('Il apprend le français ___ janvier.', 'depuis', ['depuis', 'pendant', 'il y a', 'pour'], 'depuis + point de départ: l’action continue.', 'Il apprend le français depuis janvier.'),
      q('Nous avons attendu ___ une heure.', 'pendant', ['pendant', 'depuis', 'il y a', 'pour'], 'Durée bornée d’une action achevée → pendant.', 'Nous avons attendu pendant une heure.'),
      q('Elle est arrivée ___ dix minutes.', 'il y a', ['il y a', 'depuis', 'pendant', 'pour'], 'Événement ponctuel dix minutes avant maintenant → il y a.', 'Elle est arrivée il y a dix minutes.'),
      q('Il restera chez nous ___ quelques jours.', 'pendant', ['pendant', 'depuis', 'il y a', 'ça fait'], 'Pour une durée de séjour envisagée comme intervalle, pendant est possible et naturel ici.', 'Il restera chez nous pendant quelques jours.'),
      q('Je suis malade ___ lundi.', 'depuis', ['depuis', 'pendant', 'il y a', 'pour'], 'État commencé lundi et encore vrai → depuis.', 'Je suis malade depuis lundi.'),
      q('Il a été malade ___ trois jours.', 'pendant', ['pendant', 'depuis', 'il y a', 'pour'], 'État terminé et durée complète → pendant.', 'Il a été malade pendant trois jours.'),
      q('Nous nous sommes rencontrés ___ cinq ans.', 'il y a', ['il y a', 'depuis', 'pendant', 'pour'], 'Rencontre ponctuelle dans le passé → il y a.', 'Nous nous sommes rencontrés il y a cinq ans.'),
      q('Nous nous connaissons ___ cinq ans.', 'depuis', ['depuis', 'il y a', 'pendant', 'pour'], 'Relation commencée il y a cinq ans et toujours valable → depuis.', 'Nous nous connaissons depuis cinq ans.'),
      q('___ que je travaille ici, j’ai beaucoup appris.', 'Depuis', ['Depuis', 'Pendant', 'Il y a', 'Pour'], 'depuis que + proposition marque le point de départ d’une situation qui se prolonge.', 'Depuis que je travaille ici, j’ai beaucoup appris.'),
      q('Il a dormi ___ tout le voyage.', 'pendant', ['pendant', 'depuis', 'il y a', 'pour'], 'pendant + nom délimite l’intervalle où l’action a eu lieu.', 'Il a dormi pendant tout le voyage.'),
      q('Je n’ai pas fumé ___ deux mois.', 'depuis', ['depuis', 'pendant', 'il y a', 'pour'], 'Avec une négation, depuis peut mesurer le temps écoulé depuis la dernière occurrence.', "Je n'ai pas fumé depuis deux mois."),
      q('J’ai arrêté de fumer ___ deux mois.', 'il y a', ['il y a', 'depuis', 'pendant', 'pour'], 'arrêter est un événement ponctuel situé deux mois avant maintenant → il y a.', "J'ai arrêté de fumer il y a deux mois."),
      q('___ combien de temps habitez-vous ici ?', 'Depuis', ['Depuis', 'Pendant', 'Il y a', 'Pour'], 'Depuis combien de temps ? demande la durée d’une situation encore en cours.', 'Depuis combien de temps habitez-vous ici ?'),
      q('___ combien de temps avez-vous travaillé là-bas ?', 'Pendant', ['Pendant', 'Depuis', 'Il y a', 'Pour'], 'La période de travail est présentée comme terminée → pendant combien de temps.', 'Pendant combien de temps avez-vous travaillé là-bas ?'),
      q('Il part en Chine ___ un an.', 'pour', ['pour', 'depuis', 'il y a', 'ça fait'], 'pour + durée prévue: il part avec l’intention d’y rester un an.', 'Il part en Chine pour un an.'),
      q('Ça fait six mois ___ nous n’avons pas vu Paul.', 'que', ['que', 'depuis', 'pendant', 'il y a'], 'Structure fixe: ça fait + durée + que + proposition.', "Ça fait six mois que nous n'avons pas vu Paul."),
      q('Elle étudie ___ ce matin.', 'depuis', ['depuis', 'pendant', 'il y a', 'pour'], 'L’action a commencé ce matin et continue au moment où l’on parle.', 'Elle étudie depuis ce matin.'),
      q('Elle a étudié ___ toute la matinée.', 'pendant', ['pendant', 'depuis', 'il y a', 'pour'], 'Toute la matinée est un intervalle terminé → pendant.', 'Elle a étudié pendant toute la matinée.'),
      q('Le train est parti ___ cinq minutes.', 'il y a', ['il y a', 'depuis', 'pendant', 'pour'], 'Départ ponctuel cinq minutes avant maintenant → il y a.', 'Le train est parti il y a cinq minutes.'),
    ],
  },
};

export function isGrammarLessonId(value: string): value is GrammarLessonId {
  return (GRAMMAR_LESSON_IDS as readonly string[]).includes(value);
}

export function grammarBankSize(lessonId: GrammarLessonId): number {
  return BANKS[lessonId].questions.length;
}

function materialize(lessonId: GrammarLessonId, raw: RawQuestion): GrammarQuizQuestion {
  const meta = BANKS[lessonId];
  const uniqueOptions = Array.from(new Set(raw.options));
  if (!uniqueOptions.includes(raw.answer)) uniqueOptions.push(raw.answer);
  return {
    // Реальный id нужен общей инфраструктуре истории/сохранения. Заголовок ниже
    // переопределяется grammar-метаданными, поэтому «parler» пользователю не показывается.
    verbId: 'parler',
    tense: 'present',
    person: 'je',
    correctAnswer: raw.answer,
    options: shuffle(uniqueOptions),
    prompt: raw.prompt,
    headerTitle: meta.title,
    headerSubtitle: meta.subtitle,
    explanation: raw.explanation,
    speechText: raw.speech,
  };
}

export function grammarQuestions(
  lessonId: GrammarLessonId,
  limit = GRAMMAR_PRACTICE_QUESTIONS,
): GrammarQuizQuestion[] {
  return shuffle(BANKS[lessonId].questions)
    .slice(0, Math.min(limit, BANKS[lessonId].questions.length))
    .map(raw => materialize(lessonId, raw));
}

export function grammarExamQuestions(lessonId: GrammarLessonId): GrammarQuizQuestion[] {
  return grammarQuestions(lessonId, GRAMMAR_EXAM_QUESTIONS);
}

export function grammarLessonLabel(lessonId: GrammarLessonId): string {
  return BANKS[lessonId].title;
}
