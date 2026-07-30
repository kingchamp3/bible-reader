from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
STORE_ASSETS = ROOT / "play-store" / "assets"
FOREGROUND_PATH = ASSETS / "android-icon-foreground-v2.png"
BACKGROUND_COLOR = "#24463D"
CANVAS_SIZE = 1024
FEATURE_GRAPHIC_SIZE = (1024, 500)


def korean_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    font_names = ["malgunbd.ttf", "malgun.ttf"] if bold else ["malgun.ttf", "malgunbd.ttf"]
    for font_name in font_names:
        font_path = Path("C:/Windows/Fonts") / font_name
        if font_path.exists():
            return ImageFont.truetype(font_path, size)
    raise FileNotFoundError("Malgun Gothic font was not found in C:/Windows/Fonts.")


def resized_foreground(size: int) -> Image.Image:
    foreground = Image.open(FOREGROUND_PATH).convert("RGBA")
    return foreground.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    STORE_ASSETS.mkdir(parents=True, exist_ok=True)

    foreground = resized_foreground(CANVAS_SIZE)
    background = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), BACKGROUND_COLOR)
    background.convert("RGB").save(ASSETS / "android-icon-background-v2.png", optimize=True)

    icon = Image.alpha_composite(background, foreground)
    icon.convert("RGB").save(ASSETS / "icon-v2.png", optimize=True)
    icon.resize((512, 512), Image.Resampling.LANCZOS).save(
        STORE_ASSETS / "icon-512.png",
        optimize=True,
    )

    foreground.save(ASSETS / "splash-icon-v2.png", optimize=True)

    alpha = foreground.getchannel("A")
    monochrome = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 0))
    monochrome.putalpha(alpha)
    monochrome.save(ASSETS / "android-icon-monochrome-v2.png", optimize=True)

    feature_graphic = Image.new("RGB", FEATURE_GRAPHIC_SIZE, BACKGROUND_COLOR)
    draw = ImageDraw.Draw(feature_graphic)
    draw.rectangle((0, 0, 410, FEATURE_GRAPHIC_SIZE[1]), fill="#1D3932")
    draw.rectangle((430, 128, 436, 372), fill="#B7934F")

    feature_foreground = foreground.resize((460, 460), Image.Resampling.LANCZOS)
    feature_graphic.paste(feature_foreground, (-10, 20), feature_foreground)

    title_font = korean_font(62, bold=True)
    subtitle_font = korean_font(24)
    draw.text((490, 174), "성경을 읽다", font=title_font, fill="#FFFDF7")
    draw.text((493, 264), "오프라인 성경 읽기", font=subtitle_font, fill="#D8E7DC")
    feature_graphic.save(STORE_ASSETS / "feature-graphic-1024x500.png", optimize=True)


if __name__ == "__main__":
    main()
