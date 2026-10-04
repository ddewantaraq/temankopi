# Teman Kopi

Offline-first Bahasa Indonesia PWA for coffee field screening (**Small AI**).

- On-device vision via **TensorFlow.js** (WASM)
- Fail-safe: uncertain → ask a penyuluh (no guessing)
- Local observations in IndexedDB + store-and-forward sync demo
- No backend required for the MVP

**Production:** https://temankopi.vercel.app

> If the URL asks you to log in to Vercel, disable **Deployment Protection** for this project in the Vercel dashboard (Settings → Deployment Protection → Standard Protection off for Production), so phones can open/install the PWA.

## Develop

```bash
npm install
npm run train:bootstrap   # generates public/models/teman-kopi
npm run dev
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

```bash
# Colab: upload decafia.zip + prepare_decafia.py + train.py + export_tfjs.py
# Or locally:
python3 training/prepare_decafia.py --source /tmp/decafia_raw --out training/data/decafia_remapped
python3 training/train.py --data-dir training/data/decafia_remapped --out training/artifacts/teman_kopi_keras.keras
python3 training/export_tfjs.py --model training/artifacts/teman_kopi_keras.keras --out public/models/teman-kopi
```

## Deploy

```bash
npm run build
npx vercel --prod --yes
```
