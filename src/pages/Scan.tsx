import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Capture } from '../camera/Capture'
import { buildDecision } from '../decision/engine'
import { ensureDefaultPlot } from '../db/schema'
import { saveObservation } from '../db/observations'
import { classifyImage } from '../inference/classifier'
import { id as t } from '../i18n/id'

const SYMPTOM_KEYS = Object.keys(t.symptoms) as (keyof typeof t.symptoms)[]
const STAGE_KEYS = Object.keys(t.stages) as (keyof typeof t.stages)[]

export function Scan() {
  const navigate = useNavigate()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [stage, setStage] = useState<keyof typeof t.stages>('vegetative')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAnalyze = useMemo(() => Boolean(dataUrl && imageEl && !busy), [dataUrl, imageEl, busy])

  function toggleSymptom(key: string) {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    )
  }

  async function onAnalyze() {
    if (!imageEl || !dataUrl) return
    setBusy(true)
    setError(null)
    try {
      const plot = await ensureDefaultPlot()
      const classification = await classifyImage(imageEl)
      const decision = buildDecision({
        label: classification.label,
        confidence: classification.confidence,
        symptoms,
        stage,
        qualityFail: classification.qualityFail,
      })

      const id = await saveObservation({
        plotId: plot.id!,
        imageDataUrl: dataUrl,
        label: classification.label,
        confidence: classification.confidence,
        scores: classification.scores,
        symptoms,
        stage,
        nextActions: decision.nextActions,
        summary: decision.summary,
        qualityFail: classification.qualityFail,
      })

      navigate(`/hasil/${id}`)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal menganalisis. Pastikan model sudah terunduh.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <Link to="/" className="back">
          ← Beranda
        </Link>
        <h2>{t.scan.title}</h2>
      </header>

      <Capture
        onCapture={(url, img) => {
          setDataUrl(url)
          setImageEl(img)
        }}
      />

      <section className="panel">
        <h3>{t.scan.symptomsTitle}</h3>
        <div className="chips">
          {SYMPTOM_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${symptoms.includes(key) ? 'active' : ''}`}
              onClick={() => toggleSymptom(key)}
            >
              {t.symptoms[key]}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>{t.scan.stageTitle}</h3>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as keyof typeof t.stages)}
        >
          {STAGE_KEYS.map((key) => (
            <option key={key} value={key}>
              {t.stages[key]}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="error">{error}</p>}

      <button
        type="button"
        className="btn primary large"
        disabled={!canAnalyze}
        onClick={() => void onAnalyze()}
      >
        {busy ? t.scan.analyzing : t.scan.analyze}
      </button>
    </main>
  )
}
