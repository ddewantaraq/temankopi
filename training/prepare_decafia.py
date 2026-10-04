#!/usr/bin/env python3
"""Remap DECAFIA / CoffeeLeaf-CO (YOLO) into Teman Kopi classification folders.

Expected source layout (CoffeeLeaf-CO-v2 / unzipped decafia.zip):

  <root>/
    images/{train,val,test}/*.jpg
    labels/{train,val,test}/*.txt
    data.yaml   # names: 0 roya, 1 coco, 2 minador

Healthy images have empty label files.

Output (same as prepare_bracol.py):

  <out>/
    train/{healthy,pest_like,disease_like}/*.jpg
    val/{healthy,pest_like,disease_like}/*.jpg

Zenodo: https://doi.org/10.5281/zenodo.19931903
"""

from __future__ import annotations

import argparse
import shutil
from collections import Counter
from pathlib import Path

# YOLO class id → Teman Kopi label
CLASS_MAP = {
    0: "disease_like",  # roya (rust)
    1: "pest_like",  # coco (weevil)
    2: "pest_like",  # minador (leaf miner)
}

# If an image has multiple box classes, prefer disease over pest.
PRIORITY = {"disease_like": 2, "pest_like": 1, "healthy": 0}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def find_dataset_root(source: Path) -> Path:
    """Accept the folder that contains images/ + labels/, or a parent (e.g. unzip root)."""
    source = source.expanduser().resolve()
    if not source.exists():
        raise FileNotFoundError(f"Source path does not exist: {source}")
    if (source / "images").is_dir() and (source / "labels").is_dir():
        return source
    candidates = [source / "decafia", source / "CoffeeLeaf-CO-v2"]
    if source.is_dir():
        candidates.extend(sorted(source.iterdir()))
    for candidate in candidates:
        if candidate.is_dir() and (candidate / "images").is_dir() and (candidate / "labels").is_dir():
            return candidate
    raise FileNotFoundError(
        f"Could not find images/ + labels/ under {source}. "
        "Point --source at CoffeeLeaf-CO-v2 or the unzipped decafia folder."
    )


def label_for_image(label_path: Path) -> str:
    if not label_path.is_file():
        return "healthy"
    text = label_path.read_text(encoding="utf-8", errors="ignore").strip()
    if not text:
        return "healthy"

    votes: Counter[str] = Counter()
    for line in text.splitlines():
        parts = line.strip().split()
        if not parts:
            continue
        try:
            cls_id = int(float(parts[0]))
        except ValueError:
            continue
        mapped = CLASS_MAP.get(cls_id)
        if mapped:
            votes[mapped] += 1

    if not votes:
        return "healthy"

    # Highest count; tie-break by PRIORITY
    best = max(votes.keys(), key=lambda k: (votes[k], PRIORITY[k]))
    return best


def collect_split(root: Path, split: str) -> list[tuple[Path, str]]:
    img_dir = root / "images" / split
    lbl_dir = root / "labels" / split
    if not img_dir.is_dir():
        raise FileNotFoundError(f"Missing image split: {img_dir}")
    if not lbl_dir.is_dir():
        raise FileNotFoundError(f"Missing label split: {lbl_dir}")

    pairs: list[tuple[Path, str]] = []
    for img in sorted(img_dir.iterdir()):
        if img.suffix.lower() not in IMAGE_EXTS:
            continue
        label = label_for_image(lbl_dir / f"{img.stem}.txt")
        pairs.append((img, label))
    return pairs


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="Path to CoffeeLeaf-CO-v2 / unzipped decafia root",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).parent / "data" / "decafia_remapped",
    )
    parser.add_argument(
        "--include-test-as-val",
        action="store_true",
        help="Also copy test images into val/ (not recommended for clean eval)",
    )
    args = parser.parse_args()

    root = find_dataset_root(args.source)
    print(f"Dataset root: {root}")

    splits = {"train": "train", "val": "val"}
    if args.include_test_as_val:
        splits["test"] = "val"

    for split_name in ("train", "val"):
        for cls in ("healthy", "pest_like", "disease_like"):
            (args.out / split_name / cls).mkdir(parents=True, exist_ok=True)

    counts: Counter[str] = Counter()
    for src_split, dst_split in splits.items():
        pairs = collect_split(root, src_split)
        if not pairs:
            raise FileNotFoundError(f"No images found in {root / 'images' / src_split}")
        for i, (img, label) in enumerate(pairs):
            dest = args.out / dst_split / label / f"{src_split}_{label}_{i:04d}{img.suffix.lower()}"
            shutil.copy2(img, dest)
            counts[f"{dst_split}/{label}"] += 1

    total = sum(counts.values())
    if total == 0:
        raise FileNotFoundError("Remap produced 0 images.")

    print("Remap OK:")
    for key in sorted(counts):
        print(f"  {key}: {counts[key]}")
    print(f"Total images: {total}")
    print(f"Wrote remapped dataset to {args.out}")
    print("Held-out tip: keep original images/test for evaluate.py later.")


if __name__ == "__main__":
    main()
