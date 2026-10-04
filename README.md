# Teman Kopi

Offline-first Bahasa Indonesia PWA for coffee field screening (Small AI).

- On-device vision via **TensorFlow.js** (WASM)
- Fail-safe: uncertain → ask a penyuluh (no guessing)
- Local observations in IndexedDB + store-and-forward sync demo
- No backend required for the MVP

## Develop

```bash
npm install
npm run train:bootstrap   # generates public/models/teman-kopi
npm run dev
```

## Train on BRACOL (recommended for accuracy)

1. Download BRACOL: https://data.mendeley.com/datasets/yy2k5y8mxg/1
2. Use `training/colab_train_teman_kopi.ipynb` or:

```bash
python training/train.py --data-dir /path/to/bracol
python training/export_tfjs.py --keras training/artifacts/teman_kopi.keras --out-dir public/models/teman-kopi
```

## Deploy

```bash
npm run build
npx vercel --prod
```
