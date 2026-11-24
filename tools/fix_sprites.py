"""캐릭터 포즈 PNG 후처리. 사용: python tools/fix_sprites.py <폴더 또는 파일>... [--scale 파일=배율]

- 1024x1536이 아니면 같은 비율로 리사이즈한다(프리멀티플라이 방식이라 가장자리 후광이 생기지 않는다).
- 알파 250 이상은 255로 올리고, 완전히 투명한 픽셀의 RGB는 0으로 비운다.
- --scale 로 지정한 파일은 발 위치(인물 아래 끝, 가로 중심)를 유지한 채 인물을 줄이거나 키운다.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

W, H = 1024, 1536


def premul_resize(img, size):
    a = np.asarray(img.convert("RGBA")).astype(np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    chans = [Image.fromarray(a[..., i], mode="F").resize(size, Image.LANCZOS) for i in range(4)]
    b = np.stack([np.asarray(c) for c in chans], axis=-1).clip(0, 1)
    alpha = b[..., 3:4]
    rgb = np.where(alpha > 1e-4, b[..., :3] / np.maximum(alpha, 1e-4), 0).clip(0, 1)
    out = np.concatenate([rgb, alpha], axis=-1)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA")


def clean(img):
    a = np.asarray(img.convert("RGBA")).copy()
    a[..., 3][a[..., 3] >= 250] = 255
    a[..., 3][a[..., 3] <= 3] = 0
    a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")


def rescale_figure(img, k):
    a = np.asarray(img)
    ys, xs = np.nonzero(a[..., 3] > 8)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = img.crop((x0, y0, x1, y1))
    nw, nh = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
    small = premul_resize(crop, (nw, nh))
    canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cx = (x0 + x1) / 2
    canvas.paste(small, (round(cx - nw / 2), y1 - nh))
    return canvas


def main():
    args = sys.argv[1:]
    scales = {}
    paths = []
    i = 0
    while i < len(args):
        if args[i] == "--scale":
            name, k = args[i + 1].rsplit("=", 1)
            scales[Path(name).resolve()] = float(k)
            i += 2
        else:
            paths.append(Path(args[i]))
            i += 1
    files = []
    for p in paths:
        files += sorted(p.glob("*.png")) if p.is_dir() else [p]
    for f in files:
        if "_src" in f.stem or f.stem == "ref_sheet":
            continue
        img = Image.open(f).convert("RGBA")
        note = []
        if img.size != (W, H):
            note.append(f"{img.size[0]}x{img.size[1]}->{W}x{H}")
            img = premul_resize(img, (W, H))
        img = clean(img)
        k = scales.get(f.resolve())
        if k:
            img = clean(rescale_figure(img, k))
            note.append(f"scale {k}")
        img.save(f, optimize=True)
        print(f"{f.parent.name}/{f.name}: {', '.join(note) or 'clean'}  {f.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
