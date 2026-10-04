import guidance from '../data/guidance.json'
import type { ScreeningLabel } from '../db/schema'

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

const SYMPTOM_HINTS: Record<string, string> = {
  holes: 'Daun berlubang mendukung pemeriksaan hama di lapangan.',
  insects: 'Serangga terlihat — prioritaskan cek tanaman sekitar.',
  spots: 'Bintik pada daun — amati apakah pola menyebar.',
  discoloration: 'Perubahan warna daun — bandingkan dengan daun sehat di plot yang sama.',
  fruit: 'Masalah pada buah — dokumentasikan dan konsultasikan ke penyuluh.',
  slowGrowth: 'Pertumbuhan lambat — catat riwayat cuaca/lahan untuk penyuluh.',
}

export function buildDecision(input: DecisionInput): DecisionOutput {
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

  // Enrich with farmer-reported symptoms (observational only — never prescriptions).
  for (const symptom of input.symptoms) {
    const hint = SYMPTOM_HINTS[symptom]
    if (hint && !actions.includes(hint)) {
      actions.push(hint)
    }
  }

  if (input.stage === 'harvest') {
    actions.push('Dokumentasikan observasi pascapanen untuk dibahas dengan penyuluh.')
  }

  // Strip anything that looks like banned prescription language.
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
