import { useMemo, useState } from 'react'
import { LanguageToggle } from '../components/LanguageToggle'
import { useT } from '../i18n/LocaleContext'

type StepKind = 'welcome' | 'photo' | 'examples' | 'install'

interface OnboardingCarouselProps {
  onDone: () => void
}

export function OnboardingCarousel({ onDone }: OnboardingCarouselProps) {
  const t = useT()
  const [index, setIndex] = useState(0)

  const steps = useMemo(
    () =>
      [
        {
          kind: 'welcome' as const,
          title: t.onboarding.welcomeTitle,
          body: t.onboarding.welcomeBody,
        },
        {
          kind: 'photo' as const,
          title: t.onboarding.photoTitle,
          body: t.onboarding.photoBody,
        },
        {
          kind: 'examples' as const,
          title: t.onboarding.examplesTitle,
          body: t.onboarding.examplesBody,
        },
        {
          kind: 'install' as const,
          title: t.onboarding.installTitle,
          body: t.onboarding.installBody,
        },
      ] satisfies Array<{ kind: StepKind; title: string; body: string }>,
    [t],
  )

  const step = steps[index]
  const isLast = index >= steps.length - 1
  if (!step) return null

  return (
    <div
      className="onboarding"
      role="dialog"
      aria-modal="true"
      aria-label={t.onboarding.ariaLabel}
    >
      <div className="onboarding-top">
        <p className="onboarding-count">
          {index + 1} / {steps.length}
        </p>
        <LanguageToggle />
      </div>

      <div className="onboarding-body">
        <h1>{step.title}</h1>
        <p className="onboarding-copy">{step.body}</p>

        {step.kind === 'examples' ? (
          <ul className="onboarding-examples">
            <li>
              <img src="/onboarding/leaf_2.jpg" alt={t.onboarding.exampleHealthy} />
              <span>{t.onboarding.exampleHealthy}</span>
            </li>
            <li>
              <img src="/onboarding/leaf_3.jpg" alt={t.onboarding.examplePest} />
              <span>{t.onboarding.examplePest}</span>
            </li>
            <li>
              <img src="/onboarding/leaf_1.jpg" alt={t.onboarding.exampleDisease} />
              <span>{t.onboarding.exampleDisease}</span>
            </li>
          </ul>
        ) : null}
      </div>

      <div className="onboarding-dots" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.kind} className={i === index ? 'active' : ''} />
        ))}
      </div>

      <div className="onboarding-actions">
        <button type="button" className="btn ghost" onClick={onDone}>
          {t.onboarding.skip}
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (isLast) onDone()
            else setIndex((i) => i + 1)
          }}
        >
          {isLast ? t.onboarding.start : t.onboarding.next}
        </button>
      </div>
    </div>
  )
}
