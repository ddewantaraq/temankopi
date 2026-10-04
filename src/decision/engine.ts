import guidanceEn from '../data/guidance.en.json'
import guidanceId from '../data/guidance.id.json'
import type { ScreeningLabel } from '../db/schema'
import type { Locale } from '../i18n'

export interface DecisionInput {
  label: ScreeningLabel
  confidence: number
  symptoms: string[]
  stage: string
  qualityFail?: boolean
}

export interface DecisionOutput {
  title: string
  summary: string
  nextActions: string[]
  disclaimer: string
  showAskExpert: boolean
  showRetake: boolean
}

const GUIDANCE = {
  id: guidanceId,
  en: guidanceEn,
} as const

export function buildDecision(input: DecisionInput, locale: Locale = 'id'): DecisionOutput {
  const guidance = GUIDANCE[locale] ?? GUIDANCE.id
  const entry = guidance.labels[input.label] ?? guidance.labels.uncertain
  const actions = [...entry.actions]

  if (input.label === 'uncertain' || input.qualityFail) {
    return {
      title: guidance.labels.uncertain.title,
      summary: guidance.labels.uncertain.summary,
      nextActions: guidance.labels.uncertain.actions,
      disclaimer: guidance.disclaimer,
      showAskExpert: true,
      showRetake: true,
    }
  }

  for (const symptom of input.symptoms) {
    const hint = guidance.symptomHints[symptom as keyof typeof guidance.symptomHints]
    if (hint && !actions.includes(hint)) {
      actions.push(hint)
    }
  }

  if (input.stage === 'harvest') {
    actions.push(guidance.harvestNote)
  }

  const safeActions = actions.filter((a) => {
    const lower = a.toLowerCase()
    return !guidance.bannedPatterns.some((b) => lower.includes(b.toLowerCase()))
  })

  return {
    title: entry.title,
    summary: entry.summary,
    nextActions: safeActions,
    disclaimer: guidance.disclaimer,
    showAskExpert: true,
    showRetake: false,
  }
}
