# -*- coding: utf-8 -*-
"""Исправляет известные ошибки источника после generate-verbs.py.

Скрипт вынесен отдельно, чтобы повторная генерация базы не возвращала
удалённые или неверно классифицированные статьи.
"""

import json
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "data" / "verbs.metadata.json"

with PATH.open(encoding="utf-8") as source:
    verbs = json.load(source)

fixed = []
for verb in verbs:
    verb_id = verb.get("id")

    # В современном учебном словаре используется se souvenir; отдельная статья
    # souvenir с avoir дублирует её и порождает неправильную парадигму.
    if verb_id == "souvenir":
        continue

    # meure — форма subjonctif présent глагола mourir (que je meure), а не
    # инфинитив «двигать». Нужный редкий глагол mouvoir требует отдельной
    # неправильной парадигмы, поэтому ложную статью безопасно удаляем.
    if verb_id == "meure":
        continue

    if verb_id == "asservir":
        verb["group"] = "2"

    if verb_id == "s'enfuir":
        verb["group"] = "3"
        verb["aux"] = "etre"
        verb["pronominal"] = True

    fixed.append(verb)

with PATH.open("w", encoding="utf-8") as destination:
    json.dump(fixed, destination, ensure_ascii=False, indent=1)
    destination.write("\n")

print(f"sanitized verbs: {len(verbs)} -> {len(fixed)}")
