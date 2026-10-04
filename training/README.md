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

```bash
npm run train:bootstrap
```

## Colab GPU (recommended)

1. Runtime → GPU  
2. Upload:
   - `/content/decafia.zip` (from `~/Downloads/decafia.zip`)
   - `/content/training/prepare_decafia.py`
   - `/content/training/train.py`
   - `/content/training/export_tfjs.py`
3. Upload and open `training/colab_train_teman_kopi.ipynb`  
4. Run all cells top-to-bottom (missing files raise `FileNotFoundError`)  
   - Install cell pins `numpy<2` + `tensorflowjs==4.22.0` (avoids Colab `np.object` export crash; may take a few minutes)  
5. Download `/content/teman-kopi-tfjs.zip` → extract into `public/models/teman-kopi/`  
6. `npm run build && npx vercel --prod --yes`

## Local CLI (same pipeline)

```bash
unzip ~/Downloads/decafia.zip -d /tmp/decafia_raw
python3 training/prepare_decafia.py --source /tmp/decafia_raw --out training/data/decafia_remapped
python3 training/train.py --data-dir training/data/decafia_remapped --epochs 8 --out training/artifacts/teman_kopi_keras.keras
python3 training/export_tfjs.py --model training/artifacts/teman_kopi_keras.keras --out public/models/teman-kopi
```

Optional metrics:

```bash
python3 training/evaluate.py --model training/artifacts/teman_kopi_keras.keras --data-dir training/data/decafia_remapped/val
```

### External validation (optional)

- RoCoLe: https://data.mendeley.com/datasets/c5yvn32dzg/2  
- BRACOL: https://data.mendeley.com/datasets/yy2k5y8mxg/1 (use only if zip passes `unzip -t`)
