from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

BG = "#F7F3EE"
SURFACE = "#FFFCF7"
BORDER = "#E3D8CA"
TEXT = "#26332F"
GREEN = "#6F8F7B"
GREEN_DARK = "#4F705D"
AMBER = "#C49A55"
PAGE_SHADOW = "#EDE3D6"


def scaled_box(box, scale):
    return tuple(int(value * scale) for value in box)


def draw_leaf(image, center, size, angle, fill):
    cx, cy = center
    width, height = size
    leaf = Image.new("RGBA", (width * 2, height * 2), (0, 0, 0, 0))
    leaf_draw = ImageDraw.Draw(leaf)
    leaf_draw.ellipse((width * 0.3, height * 0.45, width * 1.7, height * 1.35), fill=fill)
    leaf = leaf.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    image.alpha_composite(leaf, (int(cx - leaf.width / 2), int(cy - leaf.height / 2)))


def draw_mark(image, scale=1.0):
    draw = ImageDraw.Draw(image)

    def box(values):
        return scaled_box(values, scale)

    def p(value):
        return int(value * scale)

    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(box((164, 222, 860, 842)), radius=p(150), fill=(42, 33, 24, 30))
    shadow = shadow.filter(ImageFilter.GaussianBlur(p(22)))
    image.alpha_composite(shadow)

    draw.rounded_rectangle(box((150, 194, 874, 818)), radius=p(154), fill=SURFACE, outline=BORDER, width=p(18))

    # A bold open-book shape. It stays legible at launcher and favicon sizes.
    draw.rounded_rectangle(box((224, 390, 498, 704)), radius=p(72), fill="#FFFFFF", outline=BORDER, width=p(16))
    draw.rounded_rectangle(box((526, 390, 800, 704)), radius=p(72), fill="#FFFFFF", outline=BORDER, width=p(16))
    draw.rectangle(box((486, 392, 538, 724)), fill=SURFACE)
    draw.line(box((512, 384, 512, 716)), fill=PAGE_SHADOW, width=p(18))
    draw.arc(box((302, 476, 466, 620)), start=200, end=340, fill=GREEN, width=p(22))
    draw.arc(box((558, 476, 722, 620)), start=200, end=340, fill=GREEN, width=p(22))

    # Sprout for growth and learning.
    draw.rounded_rectangle(box((484, 270, 540, 432)), radius=p(26), fill=GREEN_DARK)
    draw_leaf(image, (p(436), p(322)), (p(122), p(68)), -25, GREEN)
    draw_leaf(image, (p(588), p(322)), (p(122), p(68)), 25, GREEN)

    # Small sun, simplified so it does not turn noisy when scaled down.
    draw.ellipse(box((664, 230, 746, 312)), fill="#F2E4C9", outline=AMBER, width=p(14))
    draw.line(box((706, 196, 706, 222)), fill=AMBER, width=p(10))
    draw.line(box((706, 320, 706, 346)), fill=AMBER, width=p(10))
    draw.line(box((630, 272, 656, 272)), fill=AMBER, width=p(10))
    draw.line(box((754, 272, 780, 272)), fill=AMBER, width=p(10))

    draw.rounded_rectangle(box((354, 748, 670, 792)), radius=p(22), fill="#DCE8D8")
    draw.line(box((394, 792, 630, 792)), fill=TEXT, width=p(12))


def create_icon(path, size=1024, transparent=False):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0) if transparent else BG)
    draw_mark(image, size / 1024)
    image.save(path)


def main():
    ASSETS.mkdir(exist_ok=True)
    create_icon(ASSETS / "icon.png", 1024, transparent=False)
    create_icon(ASSETS / "adaptive-icon.png", 1024, transparent=True)
    icon = Image.open(ASSETS / "icon.png")
    icon.crop((108, 148, 916, 884)).resize((256, 256), Image.Resampling.LANCZOS).save(ASSETS / "brand-icon.png")
    Image.open(ASSETS / "brand-icon.png").resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png")


if __name__ == "__main__":
    main()
