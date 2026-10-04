export const id = {
  appName: 'Teman Kopi',
  tagline: 'Asisten AI lapangan offline untuk petani kopi',
  online: 'Online',
  offline: 'Offline',
  status: {
    pwaInfoLabel: 'Info PWA',
    pwaInfoTitle: 'Instal & pakai tanpa jaringan',
    pwaInfoBody:
      'Pasang Teman Kopi di ponsel lewat browser (Tambahkan ke Layar Utama / Install app). Setelah dibuka sekali saat online, aplikasi dan model tersimpan — skrining tetap bisa jalan tanpa jaringan.',
  },
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
    eyebrow: 'Hemat waktu · Jaga kepercayaan',
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
    storyTitle: 'Cerita di balik model ini',
    story: [
      'Petani kopi Indonesia butuh skrining daun yang bisa jalan offline di ponsel — lalu jembatan yang jelas ke penyuluh, bukan diagnosis yang mengada-ada.',
      'Sayangnya, kumpulan foto daun kopi berlabel dari kebun Indonesia untuk skrining hama/penyakit masih terbatas dan belum cukup tersedia untuk melatih model on-device yang andal.',
      'Karena itu Teman Kopi memulai dari dataset terbuka yang bisa kami kirim hari ini: DECAFIA / CoffeeLeaf-CO. Modelnya dikompres ke TensorFlow.js dan berjalan di perangkat, dengan fail-safe ke penyuluh bila data belum cukup yakin.',
      'Langkah berikutnya: bersama petani dan penyuluh mengumpulkan foto lapangan Indonesia, agar versi model berikutnya lebih dekat dengan kebun di sini.',
    ],
    runtime:
      'Model berjalan di perangkat lewat TensorFlow.js (WebGL). Tidak ada API cloud untuk analisis.',
    modelBlurb:
      'Model produksi: MobileNetV3Small 3 kelas (sehat / kemungkinan hama / kemungkinan penyakit), dilatih hanya pada DECAFIA / CoffeeLeaf-CO, diekspor ke TensorFlow.js (graph-model, WebGL). Ada gerbang keyakinan & kualitas foto.',
    limitationsTitle: 'Keterbatasan & langkah berikutnya',
    guardrailsTitle: 'Fail-safe & manusia di loop',
    sourcesTitle: 'Sumber pelatihan',
    sourcesRole:
      'Satu-satunya dataset yang dipakai melatih model produksi (foto daun kopi lapangan, Kolombia).',
    guardrails: [
      'Jika keyakinan < 55% atau dua skor teratas saling dekat → Belum cukup yakin — tanya penyuluh (bukan menebak).',
      'Foto gelap/buram/kurang jelas ditolak sebelum inferensi.',
      'Tidak ada diagnosis spesies pasti dan tidak ada resep pestisida/dosis.',
      'Petani + penyuluh tetap pengambil keputusan.',
    ],
    limitations: [
      'Foto pelatihan berasal dari Kolombia, bukan kebun Indonesia — ada jarak domain; itulah mengapa fail-safe ke penyuluh penting.',
      'Varietas kopi, kamera ponsel, dan pencahayaan kebun dapat mengubah hasil dibanding angka validasi dataset.',
      'Hasil hanya skrining untuk langkah observasi berikutnya, bukan diagnosis pasti.',
      'Kami ingin membangun dataset daun berlabel dari lapangan Indonesia bersama petani dan penyuluh.',
    ],
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
