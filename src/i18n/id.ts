export const id = {
  appName: 'Teman Kopi',
  tagline: 'Asisten AI lapangan offline untuk petani kopi',
  online: 'Online',
  offline: 'Offline',
  langId: 'ID',
  langEn: 'EN',
  langLabel: 'Bahasa',
  backHome: '← Beranda',
  home: {
    scan: 'Periksa Tanaman',
    history: 'Riwayat',
    about: 'Tentang Model',
    plotLabel: 'Lahan Saya',
    defaultPlot: 'Kebun Kopi 01',
    observations: 'observasi',
    waitingSync: 'menunggu sinkron',
    eyebrow: 'Small AI · Offline',
  },
  scan: {
    title: 'Periksa Tanaman',
    capture: 'Ambil Foto',
    retake: 'Foto Ulang',
    gallery: 'Pilih dari Galeri',
    symptomsTitle: 'Gejala yang terlihat',
    stageTitle: 'Tahap tanaman',
    analyze: 'Analisis',
    analyzing: 'Menganalisis di perangkat…',
    tip: 'Pastikan daun terlihat jelas dan cahaya cukup.',
    errorAnalyze: 'Gagal menganalisis. Pastikan model sudah terunduh.',
  },
  symptoms: {
    discoloration: 'Daun berubah warna',
    spots: 'Bintik pada daun',
    holes: 'Daun berlubang',
    insects: 'Serangga terlihat',
    fruit: 'Buah bermasalah',
    slowGrowth: 'Pertumbuhan lambat',
  },
  stages: {
    vegetative: 'Vegetatif',
    flowering: 'Berbunga',
    fruiting: 'Berbuah',
    harvest: 'Panen / pascapanen',
  },
  result: {
    title: 'Hasil Skrining',
    loading: 'Memuat hasil…',
    confidence: 'Keyakinan model',
    nextSteps: 'Langkah berikutnya',
    save: 'Simpan Observasi',
    saved: 'Tersimpan offline',
    shareExtension: 'Bagikan ke penyuluh',
    askExpert: 'Hubungi penyuluh / tanya orang yang ahli',
    backHome: 'Kembali ke Beranda',
    screeningBadge: 'Skrining lapangan',
    failSafeBadge: 'Fail-safe',
    photoAlt: 'Foto observasi',
    sharePrefix: 'Teman Kopi — observasi lapangan',
    shareResult: 'Hasil',
    shareFooter: '(Bukan diagnosis. Mohon arahan penyuluh.)',
  },
  capture: {
    previewAlt: 'Pratinjau daun kopi',
  },
  history: {
    title: 'Riwayat Lahan',
    empty: 'Belum ada observasi. Mulai dengan Periksa Tanaman.',
    synced: 'Tersinkron',
    pending: 'Menunggu koneksi',
    syncNow: 'Sinkronkan sekarang',
    syncedCount: 'sudah sinkron',
    pendingCount: 'menunggu',
    offlineMsg: 'Masih offline — observasi tetap tersimpan lokal.',
    syncedMsg: '{n} observasi ditandai tersinkron (store-and-forward demo).',
    nonePendingMsg: 'Tidak ada antrean yang menunggu.',
  },
  about: {
    title: 'Tentang Model',
    runtime:
      'Model berjalan di perangkat lewat TensorFlow.js (WASM). Tidak ada API cloud untuk analisis.',
    modelBlurb:
      'Model on-device 3 kelas (sehat / kemungkinan hama / kemungkinan penyakit) lewat TensorFlow.js, plus gerbang keyakinan & kualitas foto. Pipeline pelatihan DECAFIA / CoffeeLeaf-CO (Zenodo) → MobileNetV3Small tersedia di training/ (Colab / train.py).',
    limitationsTitle: 'Keterbatasan',
    guardrailsTitle: 'Fail-safe & manusia di loop',
    sourcesTitle: 'Sumber data',
    contextTitle: 'Konteks Indonesia',
    guardrails: [
      'Jika keyakinan < 55% atau dua skor teratas saling dekat → Belum cukup yakin — tanya penyuluh (bukan menebak).',
      'Foto gelap/buram/kurang jelas ditolak sebelum inferensi.',
      'Tidak ada diagnosis spesies pasti dan tidak ada resep pestisida/dosis.',
      'Petani + penyuluh tetap pengambil keputusan.',
    ],
    limitations: [
      'Data pelatihan utama (DECAFIA / CoffeeLeaf-CO, Kolombia + sumber terbuka) bukan khusus Indonesia — ada domain gap.',
      'Varietas kopi, kamera, dan kondisi lapangan berbeda dapat menurunkan akurasi.',
      'Hasil hanya skrining untuk langkah observasi berikutnya.',
    ],
    nasaBody:
      'plot demo {location}: suhu rata-rata {temp}°C, curah hujan periode {rain} mm. {interpretation}',
    bpsBody: '{problem}',
  },
  labels: {
    healthy: 'Sehat / tidak ada gejala jelas',
    pest_like: 'Kemungkinan gejala hama',
    disease_like: 'Kemungkinan gejala penyakit',
    uncertain: 'Belum cukup yakin',
  },
} as const

export type Messages = {
  -readonly [K in keyof typeof id]: (typeof id)[K] extends string
    ? string
    : (typeof id)[K] extends readonly string[]
      ? readonly string[]
      : {
          -readonly [P in keyof (typeof id)[K]]: (typeof id)[K][P] extends string
            ? string
            : (typeof id)[K][P] extends readonly string[]
              ? readonly string[]
              : string
        }
}

export type LabelKey = keyof typeof id.labels
