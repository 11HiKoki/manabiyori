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
GREEN_SOFT = "#DCE8D8"
AMBER_SOFT = "#F2E4C9"


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
    shadow_draw.rounded_rectangle(box((178, 168, 846, 884)), radius=p(160), fill=(42, 33, 24, 30))
    shadow = shadow.filter(ImageFilter.GaussianBlur(p(24)))
    image.alpha_composite(shadow)

    draw.rounded_rectangle(box((162, 136, 862, 866)), radius=p(176), fill=SURFACE, outline=BORDER, width=p(20))

    # A single journal page reads more clearly than thin book lines at small sizes.
    draw.rounded_rectangle(box((282, 250, 742, 810)), radius=p(96), fill="#FFFFFF", outline=BORDER, width=p(18))
    fold = box((640, 250, 742, 250, 742, 352))
    draw.polygon([fold[0:2], fold[2:4], fold[4:6]], fill=AMBER_SOFT)
    draw.line(box((640, 250, 742, 352)), fill=BORDER, width=p(12))

    draw.rounded_rectangle(box((440, 210, 584, 392)), radius=p(54), fill=GREEN)
    draw.rounded_rectangle(box((488, 206, 536, 430)), radius=p(24), fill=GREEN_DARK)
    draw_leaf(image, (p(440), p(270)), (p(112), p(64)), -24, GREEN)
    draw_leaf(image, (p(586), p(270)), (p(112), p(64)), 24, GREEN)

    draw.rounded_rectangle(box((362, 474, 660, 510)), radius=p(18), fill=GREEN_DARK)
    draw.rounded_rectangle(box((362, 570, 660, 606)), radius=p(18), fill=GREEN)
    draw.rounded_rectangle(box((362, 666, 572, 702)), radius=p(18), fill=GREEN_SOFT)

    draw.ellipse(box((668, 184, 760, 276)), fill=AMBER_SOFT, outline=AMBER, width=p(14))
    draw.rounded_rectangle(box((352, 760, 672, 800)), radius=p(20), fill=PAGE_SHADOW)
    draw.line(box((388, 800, 636, 800)), fill=TEXT, width=p(12))


def create_icon(path, size=1024, transparent=False):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0) if transparent else BG)
    draw_mark(image, size / 1024)
    image.save(path)


def main():
    ASSETS.mkdir(exist_ok=True)
    create_icon(ASSETS / "icon.png", 1024, transparent=False)
    create_icon(ASSETS / "adaptive-icon.png", 1024, transparent=True)
    icon = Image.open(ASSETS / "icon.png")
    icon.crop((116, 116, 908, 908)).resize((256, 256), Image.Resampling.LANCZOS).save(ASSETS / "brand-icon.png")
    Image.open(ASSETS / "brand-icon.png").resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png")


if __name__ == "__main__":
    main()
