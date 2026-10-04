#!/usr/bin/env python3
"""Export Teman Kopi Keras model to TensorFlow.js **graph** format.

Keras 3 MobileNetV3 layers JSON is not loadable in TF.js (batch_shape, inbound_nodes,
hardSilu, squeeze-excite shapes). Graph export via SavedModel avoids that.

  pip install \"tensorflow>=2.15,<2.20\" \"tensorflowjs==4.22.0\"
  python training/export_tfjs.py --model path/to/teman_kopi_keras.keras --out public/models/teman-kopi

`--patch-only` remains for legacy layers-model.json repair (not used for current graph export).
"""

from __future__ import annotations

import argparse
import json
import shutil
import tempfile
from pathlib import Path
from typing import Any


def _clean_inbound_kwargs(kwargs: dict[str, Any]) -> dict[str, Any]:
    clean: dict[str, Any] = {}
    for key, value in kwargs.items():
        if value is None or key == "mask":
            continue
        clean[key] = value
    return clean


def _convert_inbound_nodes(nodes: Any, stats: dict[str, int]) -> Any:
    if not isinstance(nodes, list) or not nodes:
        return nodes
    if isinstance(nodes[0], list):
        return nodes

    converted: list[Any] = []
    for node in nodes:
        if not isinstance(node, dict):
            continue
        args = node.get("args") or []
        kwargs = _clean_inbound_kwargs(node.get("kwargs") or {})
        inbound: list[Any] = []
        for index, arg in enumerate(args):
            if not isinstance(arg, dict) or arg.get("class_name") != "__keras_tensor__":
                continue
            history = (arg.get("config") or {}).get("keras_history")
            if not isinstance(history, list) or len(history) < 3:
                continue
            tensor_kwargs = kwargs if index == 0 else {}
            inbound.append([history[0], history[1], history[2], tensor_kwargs])
        if inbound:
            converted.append(inbound)
            stats["inbound_nodes"] += 1
    return converted


def patch_keras3_for_tfjs(obj: Any, stats: dict[str, int] | None = None) -> Any:
    """Legacy LayersModel JSON patch (Keras 3 → TF.js). Prefer graph export instead."""
    if stats is None:
        stats = {"batch_shape": 0, "dtype_policy": 0, "inbound_nodes": 0, "hard_silu": 0}

    if isinstance(obj, dict):
        out: dict[str, Any] = {}
        for key, value in obj.items():
            if key == "batch_shape":
                out["batchInputShape"] = patch_keras3_for_tfjs(value, stats)
                stats["batch_shape"] += 1
                continue
            if key == "inbound_nodes":
                nested = patch_keras3_for_tfjs(value, stats)
                out[key] = _convert_inbound_nodes(nested, stats)
                continue
            if key == "activation" and value in ("hard_silu", "hard_swish"):
                out[key] = "hardSilu"
                stats["hard_silu"] += 1
                continue
            if key == "dtype" and isinstance(value, dict) and (
                value.get("class_name") == "DTypePolicy"
                or (
                    isinstance(value.get("config"), dict)
                    and value.get("config", {}).get("name")
                    in ("float32", "float16", "bfloat16")
                )
            ):
                name = "float32"
                cfg = value.get("config")
                if isinstance(cfg, dict) and isinstance(cfg.get("name"), str):
                    name = cfg["name"]
                out[key] = name
                stats["dtype_policy"] += 1
                continue
            out[key] = patch_keras3_for_tfjs(value, stats)
        return out

    if isinstance(obj, list):
        return [patch_keras3_for_tfjs(item, stats) for item in obj]

    return obj


def _count_batch_shape(obj: Any) -> int:
    if isinstance(obj, dict):
        n = 1 if "batch_shape" in obj else 0
        return n + sum(_count_batch_shape(v) for v in obj.values())
    if isinstance(obj, list):
        return sum(_count_batch_shape(v) for v in obj)
    return 0


def patch_model_json(model_json: Path) -> dict[str, int]:
    if not model_json.is_file():
        raise SystemExit(f"model.json not found: {model_json}")

    data = json.loads(model_json.read_text(encoding="utf-8"))
    stats: dict[str, int] = {
        "batch_shape": 0,
        "dtype_policy": 0,
        "inbound_nodes": 0,
        "hard_silu": 0,
    }
    patched = patch_keras3_for_tfjs(data, stats)
    model_json.write_text(json.dumps(patched), encoding="utf-8")

    remaining = _count_batch_shape(patched)
    if remaining:
        raise SystemExit(
            f"Patch incomplete: {remaining} batch_shape key(s) remain in {model_json}"
        )

    print(
        f"Patched {model_json}: "
        f"batch_shape→batchInputShape={stats['batch_shape']}, "
        f"dtype_policy→str={stats['dtype_policy']}, "
        f"inbound_nodes={stats['inbound_nodes']}, "
        f"hard_silu→hardSilu={stats['hard_silu']}"
    )
    return stats


def export_keras_to_tfjs(model_path: Path, out_dir: Path) -> None:
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

    if not model_path.is_file():
        raise SystemExit(f"Model not found: {model_path}")

    model = tf.keras.models.load_model(model_path)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Clear previous TF.js artifacts (keep labels.json if present)
    labels_path = out_dir / "labels.json"
    labels_backup = labels_path.read_text(encoding="utf-8") if labels_path.is_file() else None
    for child in out_dir.iterdir():
        if child.name == "labels.json":
            continue
        if child.is_file():
            child.unlink()
        elif child.is_dir():
            shutil.rmtree(child)

    with tempfile.TemporaryDirectory(prefix="teman-kopi-savedmodel-") as tmp:
        saved = Path(tmp) / "saved_model"
        # Keras 3: model.export; fallback to tf.saved_model.save
        try:
            model.export(str(saved))
        except Exception:
            tf.saved_model.save(model, str(saved))

        tfjs.converters.convert_tf_saved_model(str(saved), str(out_dir))

    if labels_backup is not None:
        labels_path.write_text(labels_backup, encoding="utf-8")
    elif not labels_path.is_file():
        labels_path.write_text(
            json.dumps(
                {
                    "labels": ["healthy", "pest_like", "disease_like"],
                    "inputSize": 224,
                    "note": "MobileNetV3Small trained on DECAFIA / CoffeeLeaf-CO; TF.js graph export",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    model_json = out_dir / "model.json"
    if not model_json.is_file():
        raise SystemExit(f"TF.js export missing model.json at {model_json}")

    meta = json.loads(model_json.read_text(encoding="utf-8"))
    fmt = meta.get("format") or meta.get("modelTopology", {}).get("format")
    print(f"Exported TF.js graph model to {out_dir}")
    print(f"  format hint: {meta.get('format', 'graph-model/unknown')}")
    print(f"Check: {model_json}")


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
    parser.add_argument(
        "--patch-only",
        action="store_true",
        help="Legacy: patch a LayersModel model.json (prefer full graph re-export).",
    )
    args = parser.parse_args()

    if args.patch_only:
        patch_model_json(args.out / "model.json")
        return

    export_keras_to_tfjs(args.model, args.out)


if __name__ == "__main__":
    main()
