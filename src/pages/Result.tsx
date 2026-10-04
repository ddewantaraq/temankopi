import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { buildDecision } from '../decision/engine'
import { db, type Observation } from '../db/schema'
import { useLocale } from '../i18n/LocaleContext'

export function Result() {
  const { id: rawId } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLocale()
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
        <p>{t.result.loading}</p>
      </main>
    )
  }

  const decision = buildDecision(
    {
      label: obs.label,
      confidence: obs.confidence,
      symptoms: obs.symptoms,
      stage: obs.stage,
      qualityFail: obs.qualityFail,
    },
    locale,
  )

  const isUncertain = obs.label === 'uncertain'
  const shareText = [
    t.result.sharePrefix,
    `${t.result.shareResult}: ${decision.title}`,
    decision.summary,
    t.result.shareFooter,
  ].join('\n')

  return (
    <main className="page result">
      <header className="topbar">
        <Link to="/" className="back">
          {t.backHome}
        </Link>
        <h2>{t.result.title}</h2>
        <LanguageToggle />
      </header>

      <div className={`result-card ${isUncertain ? 'uncertain' : ''}`}>
        <p className="eyebrow">
          {isUncertain ? t.result.failSafeBadge : t.result.screeningBadge}
        </p>
        <h1>{decision.title}</h1>
        {!isUncertain && (
          <p className="confidence">
            {t.result.confidence}: {(obs.confidence * 100).toFixed(0)}%
          </p>
        )}
        <p>{decision.summary}</p>
      </div>

      {obs.imageDataUrl && (
        <img className="result-thumb" src={obs.imageDataUrl} alt={t.result.photoAlt} />
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
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
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
