import json
import os
import shutil
import subprocess
from pathlib import Path

from PIL import Image

from demo_cases import discover_demos


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT.parent / "Assets"
PAPER = ROOT.parent / "paper" / "PrismPhys"
PUBLIC = ROOT / "public"
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
FONT = os.environ.get(
    "FONT", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
)
METHODS = ("GT", "PrismPhys", "PhysTwin", "MatPhys", "ReconPhys")
DEMOS = discover_demos(ASSETS)


def run(arguments):
    subprocess.run([str(argument) for argument in arguments], check=True)


def image_sources():
    for name in (
        "teaser",
        "method_overview",
        "ambiphys_qualitative",
        "phystwin_qualitative",
    ):
        source = PAPER / "fig" / f"{name}.png"
        for width in (960, 1600, 2400):
            output = PUBLIC / "images" / f"{name}-{width}.webp"
            with Image.open(source) as image:
                height = round(image.height * width / image.width)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                resized.save(output, "WEBP", quality=84, method=6)


def demo_rows(demo):
    if demo["kind"] == "ambi":
        case = ASSETS / "AmbiPhys-Bench-SkyBlue" / demo["path"]
        source = next(case.glob("source_same__*"))
        target = next(case.glob("target_cross__*"))
        return (
            (source, f"Source: {source.name.split('__')[1]}", demo["sourceView"]),
            (target, f"Target: {target.name.split('__')[1]}", demo["sourceView"]),
        )
    case = ASSETS / "PhysTwin" / "cases" / demo["path"] / "videos"
    views = sorted(path for path in case.iterdir() if path.is_dir())
    return tuple((case, f"View {index + 1}", view.name) for index, view in enumerate(views))


def make_demo(demo):
    rows = demo_rows(demo)
    command = [FFMPEG, "-v", "error", "-y"]
    for directory, _, view in rows:
        for method in METHODS:
            command.extend(["-i", directory / view / f"{method}.mp4"])

    filters = []
    for index, (_, label, _) in enumerate(rows):
        label = label.replace(":", r"\:")
        for method_index in range(len(METHODS)):
            input_index = index * len(METHODS) + method_index
            filters.append(
                f"[{input_index}:v]scale=256:256:force_original_aspect_ratio=decrease,"
                f"pad=256:256:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1[v{input_index}]"
            )
        inputs = "".join(f"[v{index * 5 + method}]" for method in range(5))
        chain = (
            f"{inputs}xstack=inputs=5:layout=0_0|256_0|512_0|768_0|1024_0:shortest=1,"
            "pad=1280:316:0:32:color=white"
        )
        for method_index, method in enumerate(METHODS):
            chain += (
                f",drawtext=fontfile='{FONT}':text='{method}':fontcolor=0x17212b:fontsize=18:"
                f"x={method_index * 256}+(256-tw)/2:y=7"
            )
        chain += (
            f",drawtext=fontfile='{FONT}':text='{label}':fontcolor=0x52606d:fontsize=16:x=16:y=291"
        )
        filters.append(f"{chain}[row{index}]")
    filters.append("[row0][row1]vstack=inputs=2[out]")

    output = PUBLIC / "videos" / f"{demo['id']}.mp4"
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[out]",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "21",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            output,
        ]
    )
    run(command)
    poster_png = PUBLIC / "videos" / f"{demo['id']}.png"
    run(
        [
            FFMPEG,
            "-v",
            "error",
            "-y",
            "-ss",
            "1.5",
            "-i",
            output,
            "-frames:v",
            "1",
            poster_png,
        ]
    )
    with Image.open(poster_png) as poster:
        poster.save(
            PUBLIC / "videos" / f"{demo['id']}.webp",
            "WEBP",
            quality=84,
            method=6,
        )
    poster_png.unlink()
    metadata = {
        key: value
        for key, value in demo.items()
        if key not in {"kind", "path", "sourceView"}
    }
    metadata.update(
        {
            "video": f"videos/{demo['id']}.mp4",
            "poster": f"videos/{demo['id']}.webp",
        }
    )
    return metadata


def main():
    for directory in (PUBLIC / "images", PUBLIC / "videos", PUBLIC / "paper"):
        directory.mkdir(parents=True, exist_ok=True)
    image_sources()
    manifest = [make_demo(demo) for demo in DEMOS]
    (ROOT / "src" / "data").mkdir(exist_ok=True)
    (ROOT / "src" / "data" / "demos.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    )
    shutil.copy2(PAPER / "main.pdf", PUBLIC / "paper" / "PrismPhys.pdf")
    print(f"Prepared 12 paper images and {len(manifest)} comparison videos.")


if __name__ == "__main__":
    main()
