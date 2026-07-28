# -*- coding: utf-8 -*-
import json, os, re, unicodedata

# (инфинитив, перевод) — частотное ядро французского глагола
CORE = """
être:быть|avoir:иметь|faire:делать|dire:говорить, сказать|aller:идти, ехать|voir:видеть
savoir:знать, уметь|pouvoir:мочь|vouloir:хотеть|venir:приходить|devoir:быть должным
prendre:брать|trouver:находить|donner:давать|falloir:быть нужным|parler:говорить
mettre:класть, ставить|passer:проходить, проводить|regarder:смотреть|croire:верить, считать
aimer:любить|penser:думать|demander:просить, спрашивать|rester:оставаться|tenir:держать
porter:нести, носить|sembler:казаться|laisser:оставлять, позволять|rendre:возвращать, делать
entendre:слышать|attendre:ждать|sortir:выходить|comprendre:понимать|connaître:знать, быть знакомым
arriver:прибывать, случаться|chercher:искать|revenir:возвращаться|appeler:звать, называть
partir:уезжать, уходить|devenir:становиться|permettre:позволять|commencer:начинать
montrer:показывать|essayer:пробовать, пытаться|écrire:писать|lire:читать|ouvrir:открывать
perdre:терять|entrer:входить|jouer:играть|monter:подниматься|apprendre:учить, узнавать
suivre:следовать|tomber:падать|recevoir:получать|répondre:отвечать|vivre:жить
manger:есть, кушать|boire:пить|dormir:спать|courir:бежать|mourir:умирать|naître:рождаться
offrir:предлагать, дарить|servir:служить, подавать|sentir:чувствовать, пахнуть
choisir:выбирать|finir:заканчивать|réussir:добиваться успеха|remplir:наполнять
grandir:расти|obéir:подчиняться|réfléchir:размышлять|agir:действовать|punir:наказывать
saisir:хватать|nourrir:кормить|guérir:лечить, выздоравливать|avertir:предупреждать
établir:устанавливать|définir:определять|unir:объединять|applaudir:аплодировать
bâtir:строить|ralentir:замедлять|obtenir:получать, добиваться|maintenir:поддерживать
retenir:удерживать, запоминать|appartenir:принадлежать|contenir:содержать|soutenir:поддерживать
prévenir:предупреждать|parvenir:достигать|survenir:происходить внезапно|convenir:подходить
remettre:откладывать, вручать|promettre:обещать|admettre:допускать|soumettre:подчинять
transmettre:передавать|commettre:совершать|omettre:упускать|reprendre:возобновлять
surprendre:удивлять|entreprendre:предпринимать|comprendre:понимать|descendre:спускаться
vendre:продавать|défendre:защищать, запрещать|dépendre:зависеть|prétendre:утверждать
répandre:распространять|mordre:кусать|tordre:крутить|perdre:терять|fondre:таять
correspondre:соответствовать|confondre:путать|interrompre:прерывать|rompre:разрывать
corrompre:развращать|battre:бить|combattre:сражаться|débattre:обсуждать|abattre:сваливать
connaître:знать|reconnaître:узнавать|paraître:казаться|apparaître:появляться
disparaître:исчезать|conduire:вести, водить|produire:производить|construire:строить
détruire:разрушать|traduire:переводить|introduire:вводить|réduire:сокращать
cuire:варить, печь|séduire:соблазнять|craindre:бояться|plaindre:жалеть|peindre:красить, писать
atteindre:достигать|éteindre:тушить|joindre:соединять|rejoindre:присоединяться
contraindre:принуждать|recevoir:получать|apercevoir:замечать|décevoir:разочаровывать
concevoir:задумывать|percevoir:воспринимать|acquérir:приобретать|conquérir:завоёвывать
couvrir:покрывать|découvrir:открывать, обнаруживать|souffrir:страдать|ouvrir:открывать
mentir:лгать|repartir:снова уезжать|ressentir:испытывать|desservir:обслуживать
cueillir:собирать, срывать|accueillir:принимать, встречать|fuir:убегать|s'enfuir:сбегать
suivre:следовать|poursuivre:преследовать|écrire:писать|décrire:описывать|inscrire:записывать
lire:читать|élire:избирать|rire:смеяться|sourire:улыбаться|plaire:нравиться|taire:умалчивать
vaincre:побеждать|convaincre:убеждать|conclure:заключать|résoudre:решать|coudre:шить
moudre:молоть|valoir:стоить|pleuvoir:идти (о дожде)|envoyer:посылать|renvoyer:отсылать обратно
travailler:работать|habiter:жить, обитать|étudier:изучать|écouter:слушать|acheter:покупать
vendre:продавать|payer:платить|coûter:стоить|dépenser:тратить|gagner:выигрывать, зарабатывать
compter:считать|calculer:вычислять|mesurer:измерять|peser:весить|remarquer:замечать
observer:наблюдать|noter:отмечать|oublier:забывать|rappeler:напоминать|souvenir:вспоминать
imaginer:воображать|rêver:мечтать, видеть сны|espérer:надеяться|préférer:предпочитать
désirer:желать|souhaiter:желать|décider:решать|choisir:выбирать|accepter:принимать
refuser:отказывать|proposer:предлагать|présenter:представлять|expliquer:объяснять
raconter:рассказывать|répéter:повторять|traduire:переводить|prononcer:произносить
annoncer:объявлять|déclarer:заявлять|affirmer:утверждать|nier:отрицать|avouer:признаваться
mentir:лгать|promettre:обещать|jurer:клясться|remercier:благодарить|féliciter:поздравлять
saluer:приветствовать|inviter:приглашать|accompagner:сопровождать|rencontrer:встречать
quitter:покидать|abandonner:бросать|retourner:возвращаться|rentrer:возвращаться домой
voyager:путешествовать|visiter:посещать|marcher:ходить, работать|avancer:продвигаться
reculer:отступать|traverser:пересекать|tourner:поворачивать|arrêter:останавливать
continuer:продолжать|terminer:завершать|achever:завершать|durer:длиться|attendre:ждать
préparer:готовить|cuisiner:готовить еду|goûter:пробовать на вкус|servir:подавать
nettoyer:чистить|laver:мыть|essuyer:вытирать|ranger:убирать|jeter:бросать
casser:ломать|réparer:чинить|construire:строить|dessiner:рисовать|peindre:красить
chanter:петь|danser:танцевать|jouer:играть|gagner:выигрывать|perdre:проигрывать
courir:бегать|nager:плавать|sauter:прыгать|voler:летать, красть|conduire:водить
ouvrir:открывать|fermer:закрывать|allumer:включать|éteindre:выключать|appuyer:нажимать
tirer:тянуть|pousser:толкать|lever:поднимать|baisser:опускать|porter:носить
apporter:приносить|emporter:уносить|amener:приводить|emmener:уводить|ramener:приводить обратно
mener:вести|promener:выгуливать|conduire:вести|guider:направлять|suivre:следовать
appeler:звонить, звать|téléphoner:звонить|répondre:отвечать|demander:спрашивать
interroger:допрашивать|questionner:расспрашивать|discuter:обсуждать|bavarder:болтать
crier:кричать|pleurer:плакать|rire:смеяться|sourire:улыбаться|dormir:спать
se réveiller:просыпаться|se lever:вставать|se coucher:ложиться|s'habiller:одеваться
se laver:мыться|se promener:гулять|se dépêcher:торопиться|s'arrêter:останавливаться
s'asseoir:садиться|se souvenir:помнить|se tromper:ошибаться|s'appeler:называться
commencer:начинать|changer:менять|bouger:двигаться|obliger:обязывать|diriger:руководить
exiger:требовать|juger:судить|partager:делить|mélanger:смешивать|plonger:нырять
corriger:исправлять|encourager:поощрять|engager:нанимать|protéger:защищать|songer:помышлять
venger:мстить|allonger:удлинять|lancer:бросать|placer:помещать|remplacer:заменять
renoncer:отказываться|forcer:заставлять|percer:пробивать|tracer:чертить|effacer:стирать
menacer:угрожать|exercer:упражнять|espérer:надеяться|céder:уступать|posséder:обладать
compléter:дополнять|inquiéter:беспокоить|considérer:рассматривать|exagérer:преувеличивать
libérer:освобождать|opérer:оперировать|tolérer:терпеть|différer:отличаться|gérer:управлять
régler:регулировать|sécher:сушить|célébrer:праздновать|pénétrer:проникать|révéler:раскрывать
accélérer:ускорять|geler:замораживать|peler:чистить от кожуры|modeler:лепить|marteler:молотить
racheter:выкупать|haleter:задыхаться|épeler:произносить по буквам|renouveler:обновлять
atteler:запрягать|projeter:проектировать|feuilleter:листать|rejeter:отвергать
balayer:подметать|effrayer:пугать|employer:нанимать, употреблять|ennuyer:надоедать
aboyer:лаять|noyer:топить|tutoyer:обращаться на «ты»|appuyer:опираться, нажимать
""".strip()

# Глаголы третьей группы на -ir (все прочие -ir считаем второй группой)
G3_IR = {
 'venir','tenir','partir','sortir','dormir','servir','mentir','sentir','courir','mourir',
 'ouvrir','offrir','couvrir','souffrir','découvrir','recouvrir','entrouvrir','rouvrir',
 'cueillir','accueillir','recueillir','fuir','acquérir','conquérir','requérir',
 'devenir','revenir','obtenir','maintenir','retenir','appartenir','contenir',
 'soutenir','prévenir','parvenir','survenir','convenir','intervenir','repartir',
 'ressentir','consentir','pressentir','démentir','desservir','resservir','asservir',
 'endormir','rendormir','assaillir','tressaillir','défaillir','saillir','faillir',
 'bouillir','vêtir','revêtir','dévêtir','repentir',
 "s'enfuir",'souvenir','se souvenir',
}
# Спрягаются с être
ETRE = {
 'aller','venir','arriver','partir','sortir','entrer','rentrer','monter','descendre','tomber',
 'rester','retourner','naître','mourir','devenir','revenir','parvenir','survenir','apparaître',
 'repartir','intervenir',
}
DOUBLE = {  # -eler/-eter с удвоением согласной
 'appeler','rappeler','interpeller','jeter','rejeter','projeter','épeler','renouveler',
 'atteler','dételer','feuilleter','cacheter','décacheter','étiqueter','empaqueter',
 'ensorceler','morceler','niveler','amonceler','chanceler','ficeler','grommeler','museler',
 'ruisseler','carreler','breveter','banqueter','souffleter','voleter','hoqueter','caqueter',
 "s'appeler",
}
GRAVE_ELER = {  # -eler/-eter с è
 'acheter','geler','peler','modeler','marteler','racheter','haleter','congeler','dégeler',
 'celer','déceler','receler','ciseler','démanteler','écarteler','crocheter','fureter','harceler',
}

def strip_pron(inf):
    m = re.match(r"^(se |s')", inf)
    return (inf[len(m.group(1)):], True) if m else (inf, False)

def classify(inf):
    bare, pron = strip_pron(inf)
    types = []
    if bare.endswith('er') and bare != 'aller':
        group = '1'
        if bare.endswith('cer'): types.append('-cer')
        if bare.endswith('ger'): types.append('-ger')
        if re.search(r'[ou]yer$', bare): types.append('-yer')
        elif bare.endswith('ayer'): types.append('-ayer')
        if bare in DOUBLE: types.append('ll/tt')
        elif bare in GRAVE_ELER: types.append('e→è')
        else:
            # mener/lever: e в предпоследнем слоге; espérer/céder: é
            stem = bare[:-2]
            # Чередование идёт только в открытом слоге: после гласной должен
            # стоять один согласный, диграф (ch, gn, ph, th) либо неразрывная
            # группа «согласный + r/l» (régler, pénétrer, célébrer).
            # Закрытый слог его блокирует: traverser, venger, fermer.
            m = re.search(
                r'([eé])(?:[^aeiouyàâéèêëîïôûùü]|ch|gn|ph|th|[bcdfgptv][rl])$', stem)
            if m:
                types.append('e→è' if m.group(1) == 'e' else 'é→è')
    elif bare.endswith('ir') and not bare.endswith('oir') and bare not in G3_IR:
        group = '2'
    else:
        group = '3'
    aux = 'etre' if (pron or bare in ETRE) else 'avoir'
    return group, aux, types, pron

def load_pairs():
    """Частотное ядро из CORE плюс расширенный словарь из файла переводов."""
    for chunk in CORE.replace('\n', '|').split('|'):
        chunk = chunk.strip()
        if chunk and ':' in chunk:
            inf, tr = chunk.split(':', 1)
            yield inf.strip(), tr.strip()
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'translations.fr-ru.txt')
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            inf, tr = line.split('=', 1)
            yield inf.strip(), tr.strip()

seen, out = set(), []
for inf, tr in load_pairs():
    if inf in seen: continue
    seen.add(inf)
    group, aux, types, pron = classify(inf)
    entry = {'id': inf, 'infinitive': inf, 'translation': tr,
             'group': group, 'aux': aux, 'types': types}
    if pron: entry['pronominal'] = True
    out.append(entry)

out.sort(key=lambda v: unicodedata.normalize('NFD', v['infinitive'])
                        .encode('ascii', 'ignore').decode())
json.dump(out, open('data/verbs.metadata.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
from collections import Counter
print('verbs:', len(out))
print('groups:', dict(Counter(v['group'] for v in out)))
print('aux   :', dict(Counter(v['aux'] for v in out)))
print('types :', dict(Counter(t for v in out for t in v['types'])))
