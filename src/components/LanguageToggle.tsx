import { useLocale } from '../i18n/LocaleContext'
import type { Locale } from '../i18n'

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  function pick(next: Locale) {
    setLocale(next)
  }

  return (
    <div className="lang-toggle" role="group" aria-label={t.langLabel}>
      <button
        type="button"
        className={locale === 'id' ? 'active' : ''}
        onClick={() => pick('id')}
      >
        {t.langId}
      </button>
      <button
        type="button"
        className={locale === 'en' ? 'active' : ''}
        onClick={() => pick('en')}
      >
        {t.langEn}
      </button>
    </div>
  )
}
