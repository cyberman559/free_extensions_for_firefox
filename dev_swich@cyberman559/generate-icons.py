#!/usr/bin/env python3
"""Генерация PNG-иконок для Dev Switch."""

from PIL import Image, ImageDraw, ImageFont
import os

icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(icons_dir, exist_ok=True)

def create_icon(base_name, bg_color, circle_color, text_color, glow_color=None):
    """Создаёт PNG-иконку 96x96."""
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = 16
    
    # Фон
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=bg_color)
    
    cx, cy = size // 2, size // 2
    circle_r = size // 2 - 12
    
    # Свечение
    if glow_color:
        for i in range(3, 0, -1):
            alpha = 30 // i
            glow_rgba = (glow_color[0], glow_color[1], glow_color[2], alpha)
            glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            glow_draw = ImageDraw.Draw(glow_img)
            glow_draw.ellipse(
                [cx - circle_r - i*2, cy - circle_r - i*2,
                 cx + circle_r + i*2, cy + circle_r + i*2],
                fill=glow_rgba
            )
            img = Image.alpha_composite(img, glow_img)
    
    # Круг
    draw.ellipse([cx - circle_r, cy - circle_r, cx + circle_r, cy + circle_r], fill=circle_color)
    draw.ellipse([cx - circle_r, cy - circle_r, cx + circle_r, cy + circle_r], outline=text_color, width=3)
    
    # Буква "D"
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 38)
        except (IOError, OSError):
            font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), "D", font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2
    ty = (size - th) // 2 - bbox[1]
    draw.text((tx, ty), "D", fill=text_color, font=font)
    
    # Индикаторная точка
    if glow_color:
        dot_r = 6
        dot_x, dot_y = size - 20, 20
        draw.ellipse([dot_x - dot_r - 1, dot_y - dot_r - 1, dot_x + dot_r + 1, dot_y + dot_r + 1],
                      outline=(255, 255, 255, 200), width=2)
        draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=glow_color)
    
    # Сохраняем в разных размерах
    for target_size in [48, 96]:
        resized = img.resize((target_size, target_size), Image.LANCZOS)
        out_path = os.path.join(icons_dir, f"{base_name}-{target_size}.png")
        resized.save(out_path, "PNG")
        print(f"  ✓ {base_name}-{target_size}.png")

print("Генерация иконок...")

# Активная — яркая зелёная
create_icon("icon-active", (26, 58, 26, 255), (26, 90, 26, 255), (63, 185, 80, 255), (63, 185, 80, 255))

# Неактивная — тусклая серая
create_icon("icon-inactive", (30, 30, 46, 255), (40, 40, 55, 255), (72, 79, 88, 255))

print("Готово!")
