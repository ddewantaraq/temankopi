#!/usr/bin/env python3
"""Convert a Keras .keras / SavedModel artifact to TensorFlow.js layers format.

Run locally (Python 3.11 or 3.12 recommended):

  pip install "tensorflow>=2.15,<2.20" "tensorflowjs==4.22.0"
  python training/export_tfjs.py --model path/to/teman_kopi_keras.keras --out public/models/teman-kopi
"""

from __future__ import annotations

import argparse
from pathlib import Path

import tensorflow as tf

try:
    import tensorflowjs as tfjs
except AttributeError as exc:
    raise SystemExit(
        "tensorflowjs failed to import (often NumPy>=2 vs older tensorflowjs). "
        'In a Python 3.11/3.12 venv: pip install "numpy<2" "tensorflowjs==4.22.0" then retry.\n'
        f"Original error: {exc}"
    ) from exc
except ImportError as exc:
    raise SystemExit(
        "tensorflowjs is not installed. "
        'Use Python 3.11 or 3.12, then: pip install "tensorflow>=2.15,<2.20" "tensorflowjs==4.22.0"\n'
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

    if not args.model.is_file():
        raise SystemExit(f"Model not found: {args.model}")

    model = tf.keras.models.load_model(args.model)
    args.out.mkdir(parents=True, exist_ok=True)
    tfjs.converters.save_keras_model(model, str(args.out))
    print(f"Exported TF.js model to {args.out}")
    print(f"Check: {args.out / 'model.json'}")


if __name__ == "__main__":
    main()
