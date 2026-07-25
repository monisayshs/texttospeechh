import os
from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), 'public')
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Brand Colors: Primary Blue #3B82F6, Accent Cyan #06B6D4, Dark #0B0D17
COLOR_BLUE = (59, 130, 246)
COLOR_CYAN = (6, 182, 212)
COLOR_WHITE = (255, 255, 255)
COLOR_DARK = (11, 13, 23)
COLOR_MUTED = (142, 155, 176)

def create_brand_icon(size):
    """Draw a clean, modern speech/soundwave emblem for TextToSpeechH AI."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    padding = max(1, size // 16)
    radius = max(2, size // 5)
    
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=COLOR_BLUE
    )

    bar_width = max(2, size // 10)
    center_y = size // 2

    bar_h = max(2, size // 12)
    draw.rectangle([padding * 2, center_y - bar_h, size - padding * 2, center_y + bar_h], fill=COLOR_CYAN)

    x1 = size // 3 - bar_width
    draw.rounded_rectangle([x1, size // 4, x1 + bar_width, size * 3 // 4], radius=bar_width//2, fill=COLOR_WHITE)

    x2 = size // 2 - bar_width // 2
    draw.rounded_rectangle([x2, size // 6, x2 + bar_width, size * 5 // 6], radius=bar_width//2, fill=COLOR_WHITE)

    x3 = size * 2 // 3
    draw.rounded_rectangle([x3, size // 3, x3 + bar_width, size * 2 // 3], radius=bar_width//2, fill=COLOR_WHITE)

    return img

def create_og_image(width=1200, height=630):
    """Generate high quality 1200x630 OpenGraph social preview image."""
    img = Image.new("RGBA", (width, height), COLOR_DARK)
    draw = ImageDraw.Draw(img)

    # Decorative background glow circles
    draw.ellipse([-100, -100, 400, 400], fill=(59, 130, 246, 30))
    draw.ellipse([800, 300, 1300, 800], fill=(6, 182, 212, 30))

    # Glassmorphism central card
    card_margin_x = 100
    card_margin_y = 80
    draw.rounded_rectangle(
        [card_margin_x, card_margin_y, width - card_margin_x, height - card_margin_y],
        radius=32,
        fill=(22, 27, 46, 220),
        outline=(255, 255, 255, 35),
        width=2
    )

    # Draw Brand Icon Emblem inside OG card
    icon = create_brand_icon(140)
    img.paste(icon, (160, 150), icon)

    # Draw Text Headings
    # Draw Brand Title
    draw.text((330, 155), "TextToSpeechH", fill=COLOR_WHITE, font_size=64)
    draw.text((820, 155), "AI", fill=COLOR_CYAN, font_size=64)

    # Subtitle Tagline
    draw.text((330, 240), "Free Ultra-Realistic AI Voice Generator", fill=COLOR_BLUE, font_size=28)
    draw.text((330, 290), "Convert Text to Speech Online | MP3 Downloads & 10,000 Word Queue", fill=COLOR_MUTED, font_size=20)

    # Social & Domain Footer
    draw.text((330, 370), "https://texttospeechh.com  |  Instagram: @webxpert.ai", fill=COLOR_WHITE, font_size=22)

    return img

print("Generating PNG, ICO & OpenGraph OG-Image Brand Assets...")

# 1. Favicons
create_brand_icon(16).save(os.path.join(PUBLIC_DIR, 'favicon-16x16.png'))
icon_32 = create_brand_icon(32)
icon_32.save(os.path.join(PUBLIC_DIR, 'favicon-32x32.png'))
icon_32.save(os.path.join(PUBLIC_DIR, 'favicon.ico'))

# 2. Apple Touch Icon
create_brand_icon(180).save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'))

# 3. Android / PWA Icons
icon_192 = create_brand_icon(192)
icon_192.save(os.path.join(PUBLIC_DIR, 'android-chrome-192x192.png'))
icon_192.save(os.path.join(PUBLIC_DIR, 'icon-192.png'))

icon_512 = create_brand_icon(512)
icon_512.save(os.path.join(PUBLIC_DIR, 'android-chrome-512x512.png'))
icon_512.save(os.path.join(PUBLIC_DIR, 'icon-512.png'))

# 4. OpenGraph OG Image (1200x630)
og_img = create_og_image(1200, 630)
og_img.save(os.path.join(PUBLIC_DIR, 'og-image.png'))

print("   [OK] All PNG, ICO & 1200x630 OG-Image Assets Generated Successfully!")
