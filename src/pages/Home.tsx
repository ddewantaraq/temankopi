import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { OnlineBadge } from '../components/OnlineBadge'
import { ensureDefaultPlot } from '../db/schema'
import { useT } from '../i18n/LocaleContext'
import { getSyncSummary } from '../sync/queue'

export function Home() {
  const t = useT()
  const [plotName, setPlotName] = useState<string>(t.home.defaultPlot)
  const [total, setTotal] = useState(0)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    void (async () => {
      const plot = await ensureDefaultPlot()
      setPlotName(plot.name)
      const summary = await getSyncSummary()
      setTotal(summary.total)
      setPending(summary.pending)
    })()
  }, [])

  return (
    <main className="page home">
      <header className="topbar">
        <OnlineBadge />
        <LanguageToggle />
      </header>

      <section className="hero">
        <p className="eyebrow">{t.home.eyebrow}</p>
        <h1>{t.appName}</h1>
        <p className="lede">{t.tagline}</p>
      </section>

      <section className="plot-chip" aria-label={t.home.plotLabel}>
        <div>
          <p className="muted">{t.home.plotLabel}</p>
          <strong>{plotName}</strong>
        </div>
        <div className="plot-stats">
          <span>
            {total} {t.home.observations}
          </span>
          {pending > 0 && (
            <span className="warn">
              {pending} {t.home.waitingSync}
            </span>
          )}
        </div>
      </section>

      <nav className="home-actions">
        <Link className="btn primary large" to="/periksa">
          {t.home.scan}
        </Link>
        <Link className="btn secondary large" to="/riwayat">
          {t.home.history}
        </Link>
        <Link className="btn ghost" to="/tentang">
          {t.home.about}
        </Link>
      </nav>
    </main>
  )
}
