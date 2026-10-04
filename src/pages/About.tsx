import { Link } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import bps from '../data/bps-coffee.json'
import nasa from '../data/nasa-demo.json'
import sources from '../data/sources.json'
import { formatMessage } from '../i18n'
import { useT } from '../i18n/LocaleContext'

export function About() {
  const t = useT()

  return (
    <main className="page about">
      <header className="topbar">
        <Link to="/" className="back">
          {t.backHome}
        </Link>
        <h2>{t.about.title}</h2>
        <LanguageToggle />
      </header>

      <section className="panel">
        <h3>{t.appName}</h3>
        <p>{t.about.runtime}</p>
        <p>{t.about.modelBlurb}</p>
      </section>

      <section className="panel">
        <h3>{t.about.guardrailsTitle}</h3>
        <ul>
          {t.about.guardrails.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>{t.about.limitationsTitle}</h3>
        <ul>
          {t.about.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
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
          </a>
          {' — '}
          {formatMessage(t.about.nasaBody, {
            location: nasa.location.name,
            temp: nasa.summary.avgTempC,
            rain: nasa.summary.totalRainfallMm,
            interpretation: nasa.summary.interpretation,
          })}
        </p>
        <p>
          <a href={bps.sourceUrl} target="_blank" rel="noreferrer">
            BPS
          </a>
          {' — '}
          {formatMessage(t.about.bpsBody, { problem: bps.problemLink })}
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
