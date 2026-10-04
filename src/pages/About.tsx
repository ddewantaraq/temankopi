import { Link } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import sources from '../data/sources.json'
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
        <h3>{t.about.storyTitle}</h3>
        {t.about.story.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="panel">
        <h3>{t.appName}</h3>
        <p>{t.about.runtime}</p>
        <p>{t.about.modelBlurb}</p>
      </section>

      <section className="panel">
        <h3>{t.about.sourcesTitle}</h3>
        <ul className="source-list">
          {sources.vision.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
              <span>{t.about.sourcesRole}</span>
              {'doi' in s && s.doi ? <code>DOI {s.doi}</code> : null}
            </li>
          ))}
        </ul>
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
    </main>
  )
}
