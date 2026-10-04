import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { buildDecision } from '../decision/engine'
import { db, type Observation } from '../db/schema'
import { id as t } from '../i18n/id'

export function Result() {
  const { id: rawId } = useParams()
  const navigate = useNavigate()
  const [obs, setObs] = useState<Observation | null>(null)

  useEffect(() => {
    const id = Number(rawId)
    if (!id) return
    void db.observations.get(id).then((row) => {
      if (!row) navigate('/')
      else setObs(row)
    })
  }, [rawId, navigate])

  if (!obs) {
    return (
      <main className="page">
        <p>Memuat hasil…</p>
      </main>
    )
  }

  const decision = buildDecision({
    label: obs.label,
    confidence: obs.confidence,
    symptoms: obs.symptoms,
    stage: obs.stage,
    qualityFail: obs.qualityFail,
  })

  const isUncertain = obs.label === 'uncertain'

  return (
    <main className="page result">
      <header className="topbar">
        <Link to="/" className="back">
          ← Beranda
        </Link>
        <h2>Hasil Skrining</h2>
      </header>

      <div className={`result-card ${isUncertain ? 'uncertain' : ''}`}>
        <p className="eyebrow">{isUncertain ? 'Fail-safe' : 'Skrining lapangan'}</p>
        <h1>{decision.title}</h1>
        {!isUncertain && (
          <p className="confidence">
            {t.result.confidence}: {(obs.confidence * 100).toFixed(0)}%
          </p>
        )}
        <p>{decision.summary}</p>
      </div>

      {obs.imageDataUrl && (
        <img className="result-thumb" src={obs.imageDataUrl} alt="Foto observasi" />
      )}

      <section className="panel">
        <h3>{t.result.nextSteps}</h3>
        <ol className="actions">
          {decision.nextActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
      </section>

      <p className="disclaimer">{decision.disclaimer}</p>

      <div className="btn-col">
        {decision.showRetake && (
          <Link className="btn primary large" to="/periksa">
            {t.scan.retake}
          </Link>
        )}
        {decision.showAskExpert && (
          <a
            className="btn secondary large"
            href={`https://wa.me/?text=${encodeURIComponent(
              `Teman Kopi — observasi lapangan\nHasil: ${decision.title}\n${decision.summary}\n(Bukan diagnosis. Mohon arahan penyuluh.)`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.result.askExpert}
          </a>
        )}
        <p className="saved-note">✓ {t.result.saved}</p>
        <Link className="btn ghost" to="/riwayat">
          {t.home.history}
        </Link>
        <Link className="btn ghost" to="/">
          {t.result.backHome}
        </Link>
      </div>
    </main>
  )
}
