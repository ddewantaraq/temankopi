#!/usr/bin/env python3
"""Remap BRACOL class folders into healthy / pest_like / disease_like splits.

BRACOL download:
  https://data.mendeley.com/datasets/yy2k5y8mxg/1

Point --source at the extracted BRACOL image root (folder that contains class dirs
or train/val/test splits). Mapping:

  healthy      → healthy
  miner / leaf miner / leaf_miner → pest_like
  rust / brown_* / cercospora*    → disease_like
"""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path

PEST = {"miner", "leaf miner", "leaf_miner", "leafminer", "bicho mineiro"}
DISEASE = {
    "rust",
    "leaf rust",
    "leaf_rust",
    "brown leaf spot",
    "brown_leaf_spot",
    "cercospora",
    "cercospora leaf spot",
    "cercospora_leaf_spot",
}
HEALTHY = {"healthy", "sehat", "sanas"}


def map_class(name: str) -> str | None:
    key = name.strip().lower().replace("-", "_")
    key_spaces = key.replace("_", " ")
    if key in HEALTHY or key_spaces in HEALTHY:
        return "healthy"
    if key in PEST or key_spaces in PEST or "miner" in key:
        return "pest_like"
    if key in DISEASE or key_spaces in DISEASE or "rust" in key or "cercospora" in key or "brown" in key:
        return "disease_like"
    return None


def collect_images(root: Path) -> dict[str, list[Path]]:
    buckets: dict[str, list[Path]] = {"healthy": [], "pest_like": [], "disease_like": []}
    for path in root.rglob("*"):
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        # Prefer parent folder name as class
        label = map_class(path.parent.name)
        if label is None:
            label = map_class(path.stem)
        if label:
            buckets[label].append(path)
    return buckets


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).parent / "data" / "bracol_remapped",
    )
    parser.add_argument("--val-ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    buckets = collect_images(args.source)
    for split in ("train", "val"):
        for cls in buckets:
            (args.out / split / cls).mkdir(parents=True, exist_ok=True)

    for cls, files in buckets.items():
        files = list(files)
        random.shuffle(files)
        cut = int(len(files) * (1 - args.val_ratio))
        train_files, val_files = files[:cut], files[cut:]
        for i, src in enumerate(train_files):
            shutil.copy2(src, args.out / "train" / cls / f"{cls}_{i:04d}{src.suffix.lower()}")
        for i, src in enumerate(val_files):
            shutil.copy2(src, args.out / "val" / cls / f"{cls}_{i:04d}{src.suffix.lower()}")
        print(f"{cls}: train={len(train_files)} val={len(val_files)}")

    print(f"Wrote remapped dataset to {args.out}")


if __name__ == "__main__":
    main()
