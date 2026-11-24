"""배포용 WebP를 원본 옆에 만든다. 사용: py -3 tools/optimize_images.py  (그다음 node tools/make-lists.mjs)

원본 PNG/JPG는 그대로 두고 같은 이름의 .webp를 만든다. 게임은 .webp가 있으면 그것만 내려받는다.
원본이 webp보다 새로울 때만 다시 만든다(--force 로 전부 다시).

- 캐릭터 포즈: 게임이 메모리에서 768px 높이로 줄여 쓰므로 512x768로 줄인다.
- 기술 아이콘: 256x256. 효과·소품: 원래 크기. 배경·타이틀: 1920x1080 그대로.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "assets"
FORCE = "--force" in sys.argv


def premul_resize(img, size):
    if img.size == size:
        return img
    a = np.asarray(img.convert("RGBA")).astype(np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    chans = [Image.fromarray(a[..., i], mode="F").resize(size, Image.LANCZOS) for i in range(4)]
    b = np.stack([np.asarray(c) for c in chans], axis=-1).clip(0, 1)
    alpha = b[..., 3:4]
    rgb = np.where(alpha > 1e-4, b[..., :3] / np.maximum(alpha, 1e-4), 0).clip(0, 1)
    return Image.fromarray((np.concatenate([rgb, alpha], axis=-1) * 255 + 0.5).astype(np.uint8), "RGBA")


def jobs():
    for f in sorted((ROOT / "char").glob("*/*.png")):
        if "_src" in f.stem or f.stem == "ref_sheet":
            continue
        yield f, (512, 768), 86
    for f in sorted((ROOT / "ui").glob("*.png")):
        yield f, (256, 256), 88
    for f in sorted((ROOT / "fx").glob("*.png")):
        yield f, None, 86
    for f in sorted(list((ROOT / "bg").glob("*.jpg")) + list((ROOT / "ui").glob("*.jpg"))):
        yield f, None, 80


def main():
    before = after = made = 0
    for src, size, q in jobs():
        dst = src.with_suffix(".webp")
        before += src.stat().st_size
        if FORCE or not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            img = Image.open(src)
            if src.suffix.lower() == ".png":
                img = img.convert("RGBA")
                if size:
                    img = premul_resize(img, size)
                img.save(dst, "WEBP", quality=q, alpha_quality=92, method=6)
            else:
                img.convert("RGB").save(dst, "WEBP", quality=q, method=6)
            made += 1
        after += dst.stat().st_size
    print(f"만든 파일 {made}개, 원본 합계 {before / 1048576:.1f}MB -> WebP 합계 {after / 1048576:.1f}MB")


if __name__ == "__main__":
    main()
