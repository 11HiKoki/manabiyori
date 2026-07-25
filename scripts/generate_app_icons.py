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
LAVENDER = "#8E7A9E"


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
    shadow_draw.rounded_rectangle(box((238, 358, 786, 704)), radius=p(64), fill=(42, 33, 24, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(p(18)))
    image.alpha_composite(shadow)

    draw.rounded_rectangle(box((234, 338, 790, 684)), radius=p(68), fill=SURFACE, outline=BORDER, width=p(12))
    draw.rounded_rectangle(box((276, 382, 512, 638)), radius=p(42), fill="#FFFFFF", outline=BORDER, width=p(10))
    draw.rounded_rectangle(box((512, 382, 748, 638)), radius=p(42), fill="#FFFFFF", outline=BORDER, width=p(10))
    draw.line(box((512, 390, 512, 640)), fill=BORDER, width=p(9))
    draw.arc(box((330, 438, 496, 610)), start=196, end=338, fill=GREEN, width=p(12))
    draw.arc(box((528, 438, 694, 610)), start=202, end=344, fill=GREEN, width=p(12))

    draw.line(box((512, 418, 512, 264)), fill=GREEN_DARK, width=p(22))
    draw_leaf(image, (p(456), p(315)), (p(98), p(54)), -28, GREEN)
    draw_leaf(image, (p(576), p(315)), (p(98), p(54)), 28, GREEN)

    draw.ellipse(box((664, 206, 746, 288)), fill="#F2E4C9", outline=AMBER, width=p(10))
    draw.line(box((705, 174, 705, 198)), fill=AMBER, width=p(8))
    draw.line(box((705, 296, 705, 320)), fill=AMBER, width=p(8))
    draw.line(box((632, 247, 656, 247)), fill=AMBER, width=p(8))
    draw.line(box((754, 247, 778, 247)), fill=AMBER, width=p(8))

    draw.rounded_rectangle(box((376, 716, 648, 754)), radius=p(20), fill="#DCE8D8")
    draw.ellipse(box((348, 234, 376, 262)), fill=LAVENDER)
    draw.ellipse(box((618, 694, 642, 718)), fill=AMBER)
    draw.ellipse(box((434, 694, 456, 716)), fill=GREEN)
    draw.line(box((388, 754, 636, 754)), fill=TEXT, width=p(8))


def create_icon(path, size=1024, transparent=False):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0) if transparent else BG)
    draw_mark(image, size / 1024)
    image.save(path)


def main():
    ASSETS.mkdir(exist_ok=True)
    create_icon(ASSETS / "icon.png", 1024, transparent=False)
    create_icon(ASSETS / "adaptive-icon.png", 1024, transparent=True)
    icon = Image.open(ASSETS / "icon.png")
    icon.crop((156, 132, 868, 844)).resize((256, 256), Image.Resampling.LANCZOS).save(ASSETS / "brand-icon.png")
    icon.resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png")


if __name__ == "__main__":
    main()
