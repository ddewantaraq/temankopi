# Teman Kopi

Offline-first Bahasa Indonesia PWA for coffee field screening (**Small AI**).

- On-device vision via **TensorFlow.js** (WebGL) — **MobileNetV3Small** trained on **DECAFIA / CoffeeLeaf-CO**
- Fail-safe: uncertain → ask a penyuluh (no guessing)
- Local observations in IndexedDB + store-and-forward sync demo
- No backend required for the MVP

**Production:** https://temankopi.vercel.app

> If the URL asks you to log in to Vercel, disable **Deployment Protection** for this project in the Vercel dashboard (Settings → Deployment Protection → Standard Protection off for Production), so phones can open/install the PWA.

## Develop

```bash
npm install
npm run dev
# Optional synthetic model only: npm run train:bootstrap
# Production weights live in public/models/teman-kopi/ (DECAFIA export)
```

## Demo checklist (judges)

1. Open https://temankopi.vercel.app on phone (install PWA if prompted)
2. Airplane mode ON
3. Periksa Tanaman → foto → gejala → Analisis (local TF.js)
4. See next actions + disclaimer (not a diagnosis)
5. Simpan → Riwayat
6. Blurry/dark photo → **Belum cukup yakin — tanya penyuluh**
7. Go online → Sinkronkan sekarang
8. Tentang Model → DECAFIA / RoCoLe + BPS + NASA POWER links

## Train on DECAFIA (recommended for field accuracy)

1. Use `~/Downloads/decafia.zip` (CoffeeLeaf-CO / Zenodo) — verified OK  
2. See [training/README.md](training/README.md) or `training/colab_train_teman_kopi.ipynb`  
   - **Colab:** steps 1–5 only → download `teman_kopi_keras.keras`  
   - **Local:** TF.js export with Python 3.11/3.12 + `tensorflowjs` (not Colab)

```bash
# After downloading the Keras file from Colab (Python 3.11/3.12 venv):
python training/export_tfjs.py --model ~/Downloads/teman_kopi_keras.keras --out public/models/teman-kopi

# Or full local train + export:
python3.11 training/prepare_decafia.py --source /tmp/decafia_raw --out training/data/decafia_remapped
python3.11 training/train.py --data-dir training/data/decafia_remapped --out training/artifacts/teman_kopi_keras.keras
python3.11 training/export_tfjs.py --model training/artifacts/teman_kopi_keras.keras --out public/models/teman-kopi
```

## Deploy

Everyday: **push or merge to `main`** — Vercel Git integration auto-deploys production (see [DEPLOY.md](DEPLOY.md)).

`npm run build` stamps `public/sw.js` with a cache name hashed from `public/models/teman-kopi/*`, so a new model busts the PWA cache after users open the site online once (no clear-data step).

TF.js ships a **graph-model** export (Keras 3 MobileNetV3 layers JSON is not TF.js-compatible). App loads it with `tf.loadGraphModel`.

Manual fallback only:

```bash
npm run build
npx vercel --prod --yes
```
