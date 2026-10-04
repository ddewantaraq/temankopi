import Dexie, { type Table } from 'dexie'

export type ScreeningLabel = 'healthy' | 'pest_like' | 'disease_like' | 'uncertain'

export interface Plot {
  id?: number
  name: string
  crop: string
  areaHa?: number
  stage?: string
  createdAt: string
}

export interface Observation {
  id?: number
  plotId: number
  createdAt: string
  imageDataUrl: string
  label: ScreeningLabel
  confidence: number
  scores: Record<string, number>
  symptoms: string[]
  stage: string
  nextActions: string[]
  summary: string
  synced: boolean
  qualityFail?: boolean
}

class TemanKopiDB extends Dexie {
  plots!: Table<Plot, number>
  observations!: Table<Observation, number>

  constructor() {
    super('teman-kopi')
    this.version(1).stores({
      plots: '++id, name, createdAt',
      observations: '++id, plotId, createdAt, synced, label',
    })
  }
}

export const db = new TemanKopiDB()

export async function ensureDefaultPlot(): Promise<Plot> {
  const existing = await db.plots.toCollection().first()
  if (existing) return existing
  const id = await db.plots.add({
    name: 'Kebun Kopi 01',
    crop: 'Kopi',
    areaHa: 2,
    stage: 'vegetative',
    createdAt: new Date().toISOString(),
  })
  return (await db.plots.get(id))!
}
