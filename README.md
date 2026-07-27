# Spanish Verbs Trainer

Автономный тренажёр испанских глаголов для Android.

## Охват

2129 глаголов, 20 времён, 251 222 личные формы плюс герундий и причастие для каждого
глагола. Формы не хранятся в базе, а выводятся по правилам из `data/verbs.metadata.json`
(инфинитив, перевод, признаки неправильности) кодом в `data/conjugator.ts`.

| Наклонение | Времена |
| --- | --- |
| Indicativo | presente, pretérito indefinido, pretérito imperfecto, futuro, condicional |
| Indicativo (составные) | pretérito perfecto, pluscuamperfecto, pretérito anterior, futuro perfecto, condicional perfecto |
| Subjuntivo | presente, imperfecto на `-ra`, imperfecto на `-se`, futuro |
| Subjuntivo (составные) | pretérito perfecto, pluscuamperfecto на `-ra` и на `-se`, futuro perfecto |
| Imperativo | afirmativo, negativo |

Составные времена собираются из `haber` и причастия. У императива нет формы 1-го лица
ед. ч. — она помечена `absent` и не показывается в таблице и не попадает в квиз.
Спряжения считаются лениво, при первом обращении к глаголу: списку и поиску нужны
только инфинитив и перевод.

## Локальный запуск

```bash
npm install
npm start
```

## Проверки

```bash
npm run typecheck
npm run test:data
```

## APK через GitHub Actions

После push в `main` workflow **Android APK** собирает установочный APK и прикладывает его к запуску как artifact.
