# -*- coding: utf-8 -*-
"""
Рисует иконки приложения из палитры constants/colors.ts.

Мотив — три окончания инфинитива, по которым делятся группы французского
глагола (-er, -ir, -re), и аксан над ними: диакритика в этом приложении
предмет отдельной настройки, так что она же и опознавательный знак.

Запуск: python3 scripts/generate-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets'
FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

PRIMARY = (37, 99, 235, 255)      # colors.primary — #2563EB
ON_PRIMARY = (255, 255, 255, 255)  # colors.primaryForeground

SIZE = 1024
ENDINGS = ['-er', '-ir', '-re']


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def draw_mark(size: int, scale: float = 1.0) -> Image.Image:
    """Знак на прозрачном фоне: три окончания столбиком и аксан над ними."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    font_size = int(size * 0.19 * scale)
    font = ImageFont.truetype(FONT_PATH, font_size)
    line_gap = int(font_size * 1.16)

    # Высота блока из трёх строк, чтобы отцентрировать его вместе с аксаном.
    accent_h = int(font_size * 0.34)
    block_h = line_gap * (len(ENDINGS) - 1) + font_size + accent_h
    top = (size - block_h) // 2 + accent_h

    widest = max(draw.textlength(text, font=font) for text in ENDINGS)

    # Аксан: короткий наклонный штрих ровно над «e» первой строки, чтобы
    # верхнее окончание читалось как «-ér».
    stroke_w = max(2, int(font_size * 0.115))
    ax = size / 2 + widest * 0.02
    ay = top - accent_h * 0.55
    draw.line(
        [(ax - accent_h * 0.34, ay + accent_h * 0.46), (ax + accent_h * 0.34, ay - accent_h * 0.46)],
        fill=ON_PRIMARY,
        width=stroke_w,
    )

    for index, text in enumerate(ENDINGS):
        width = draw.textlength(text, font=font)
        draw.text(
            (size / 2 - width / 2, top + index * line_gap),
            text,
            font=font,
            fill=ON_PRIMARY,
        )
    return layer


def write(image: Image.Image, name: str) -> None:
    path = ASSETS / name
    image.save(path, 'PNG', optimize=True)
    print(f'  {name:22} {image.size[0]}×{image.size[1]}  {path.stat().st_size / 1024:.1f} КБ')


def main() -> None:
    ASSETS.mkdir(exist_ok=True)
    print('иконки:')

    # Основная: скруглённый квадрат с фоном, знак во всю площадь.
    icon = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    plate = Image.new('RGBA', (SIZE, SIZE), PRIMARY)
    icon.paste(plate, (0, 0), rounded_mask(SIZE, int(SIZE * 0.22)))
    icon.alpha_composite(draw_mark(SIZE))
    write(icon, 'icon.png')

    # Адаптивная: только передний план, фон задаётся в app.json.
    # Android обрезает её маской, поэтому знак ужимаем в безопасную зону.
    write(draw_mark(SIZE, scale=0.62), 'adaptive-icon.png')

    # Заставка: тот же знак покрупнее, фон снова из app.json.
    write(draw_mark(SIZE, scale=0.78), 'splash-icon.png')

    # Favicon: плитка целиком, мелкий размер — скругление меньше.
    favicon = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    favicon.paste(plate, (0, 0), rounded_mask(SIZE, int(SIZE * 0.16)))
    favicon.alpha_composite(draw_mark(SIZE, scale=1.1))
    write(favicon.resize((48, 48), Image.LANCZOS), 'favicon.png')


if __name__ == '__main__':
    main()
