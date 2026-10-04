import { Link } from 'react-router-dom'
import bps from '../data/bps-coffee.json'
import nasa from '../data/nasa-demo.json'
import sources from '../data/sources.json'
import { id as t } from '../i18n/id'

export function About() {
  return (
    <main className="page about">
      <header className="topbar">
        <Link to="/" className="back">
          ← Beranda
        </Link>
        <h2>{t.about.title}</h2>
      </header>

      <section className="panel">
        <h3>{t.appName}</h3>
        <p>{t.about.runtime}</p>
        <p>
          Model on-device 3 kelas (sehat / kemungkinan hama / kemungkinan penyakit) lewat
          TensorFlow.js, plus gerbang keyakinan & kualitas foto. Pipeline pelatihan BRACOL →
          MobileNetV3Small tersedia di <code>training/</code> (Colab / train.py).
        </p>
      </section>

      <section className="panel">
        <h3>{t.about.guardrailsTitle}</h3>
        <ul>
          <li>
            Jika keyakinan &lt; 55% atau dua skor teratas saling dekat →{' '}
            <strong>Belum cukup yakin — tanya penyuluh</strong> (bukan menebak).
          </li>
          <li>Foto gelap/buram/kurang jelas ditolak sebelum inferensi.</li>
          <li>Tidak ada diagnosis spesies pasti dan tidak ada resep pestisida/dosis.</li>
          <li>Petani + penyuluh tetap pengambil keputusan.</li>
        </ul>
      </section>

      <section className="panel">
        <h3>{t.about.limitationsTitle}</h3>
        <ul>
          <li>Data pelatihan utama (BRACOL) bukan khusus Indonesia — ada domain gap.</li>
          <li>Varietas kopi, kamera, dan kondisi lapangan berbeda dapat menurunkan akurasi.</li>
          <li>Hasil hanya skrining untuk langkah observasi berikutnya.</li>
        </ul>
      </section>

      <section className="panel">
        <h3>{t.about.sourcesTitle}</h3>
        <ul className="source-list">
          {sources.vision.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
              <span>{s.role}</span>
              {'doi' in s && s.doi ? <code>DOI {s.doi}</code> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>{t.about.contextTitle}</h3>
        <p>
          <a href={nasa.sourceUrl} target="_blank" rel="noreferrer">
            NASA POWER
          </a>{' '}
          — plot demo {nasa.location.name}: suhu rata-rata {nasa.summary.avgTempC}°C, curah
          hujan periode {nasa.summary.totalRainfallMm} mm. {nasa.summary.interpretation}
        </p>
        <p>
          <a href={bps.sourceUrl} target="_blank" rel="noreferrer">
            BPS
          </a>{' '}
          — {bps.problemLink}
        </p>
        <ul>
          {bps.regions.map((r) => (
            <li key={r.name}>
              <strong>{r.name}</strong>: {r.highlight}
            </li>
          ))}
        </ul>
        {sources.context.map((c) => (
          <p key={c.id}>
            <a href={c.url} target="_blank" rel="noreferrer">
              {c.name}
            </a>
            : {c.role}
          </p>
        ))}
      </section>
    </main>
  )
}
