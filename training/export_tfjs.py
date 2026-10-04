#!/usr/bin/env python3
"""Convert a Keras .keras / SavedModel artifact to TensorFlow.js layers format."""

from __future__ import annotations

import argparse
from pathlib import Path

import tensorflow as tf

try:
    import tensorflowjs as tfjs
except AttributeError as exc:
    raise SystemExit(
        "tensorflowjs failed to import (often NumPy>=2 on Colab). "
        'Run: pip install "numpy<2" "tensorflowjs==4.22.0" then retry.\n'
        f"Original error: {exc}"
    ) from exc


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model",
        type=Path,
        default=Path(__file__).parent / "artifacts" / "teman_kopi_keras.keras",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "public" / "models" / "teman-kopi",
    )
    args = parser.parse_args()

    model = tf.keras.models.load_model(args.model)
    args.out.mkdir(parents=True, exist_ok=True)
    tfjs.converters.save_keras_model(model, str(args.out))
    print(f"Exported TF.js model to {args.out}")


if __name__ == "__main__":
    main()
