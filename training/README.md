# Training Teman Kopi

## Primary dataset: DECAFIA / CoffeeLeaf-CO v2 (Zenodo)

- DOI: https://doi.org/10.5281/zenodo.19931903  
- Local zip you prepared: `~/Downloads/decafia.zip` (valid)

Remap YOLO detection labels → image classification:

| DECAFIA | Teman Kopi |
| --- | --- |
| empty label / healthy (`SANAS_*`) | `healthy` |
| `minador`, `coco` | `pest_like` |
| `roya` | `disease_like` |

## Quick bootstrap (demo only — synthetic)

Not used for production. Generates a tiny placeholder under `public/models/teman-kopi/` if you need a model before DECAFIA export.

```bash
npm run train:bootstrap
```

## Recommended: Colab GPU train → local TF.js export

Colab runs **steps 1–5 only** (GPU check, unzip, remap, train). Download the Keras file, then export TF.js on your laptop (avoids Colab `tensorflowjs` / NumPy friction). No pip install cell — Colab’s TensorFlow is enough.

### A. Colab (GPU)

1. Runtime → GPU  
2. Upload:
   - `/content/decafia.zip` (from `~/Downloads/decafia.zip`)
   - `/content/training/prepare_decafia.py`
   - `/content/training/train.py`
3. Upload and open `training/colab_train_teman_kopi.ipynb`  
4. Run cells **1 → 5** top-to-bottom (missing files raise `FileNotFoundError`)  
5. Download `/content/teman_kopi_keras.keras`

### B. Local export (old steps 7–8)

Use **Python 3.11 or 3.12**. System `python3` on some Macs is 3.14 — TensorFlow has no wheels there yet.

**Time (typical Mac):** first-time `pip install` of TensorFlow/tfjs ~5–15+ min; `export_tfjs.py` ~1–5 min; checking `model.json` is seconds.

```bash
cd /path/to/temankopi
python3.11 -m venv .venv-train   # or python3.12
source .venv-train/bin/activate
pip install "tensorflow>=2.15,<2.20" "tensorflowjs==4.22.0"
# If tensorflowjs fails with Protobuf Gencode/Runtime mismatch:
# pip install "protobuf>=6.31.1,<7"
# If tensorflowjs fails with np.object / NumPy errors:
# pip install "numpy<2"

python training/export_tfjs.py \
  --model ~/Downloads/teman_kopi_keras.keras \
  --out public/models/teman-kopi

# Confirm model.json, then build / deploy
test -f public/models/teman-kopi/model.json && npm run build
```

## Full local CLI (train + export on laptop)

```bash
unzip ~/Downloads/decafia.zip -d /tmp/decafia_raw
python3.11 training/prepare_decafia.py --source /tmp/decafia_raw --out training/data/decafia_remapped
python3.11 training/train.py --data-dir training/data/decafia_remapped --epochs 8 --out training/artifacts/teman_kopi_keras.keras
python3.11 training/export_tfjs.py --model training/artifacts/teman_kopi_keras.keras --out public/models/teman-kopi
```

Optional metrics:

```bash
python3.11 training/evaluate.py --model training/artifacts/teman_kopi_keras.keras --data-dir training/data/decafia_remapped/val
```

### External validation (optional)

- RoCoLe: https://data.mendeley.com/datasets/c5yvn32dzg/2  
- BRACOL: https://data.mendeley.com/datasets/yy2k5y8mxg/1 (use only if zip passes `unzip -t`)
