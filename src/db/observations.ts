import { db, type Observation, type ScreeningLabel } from './schema'

export async function saveObservation(
  data: Omit<Observation, 'id' | 'synced' | 'createdAt'> & { synced?: boolean },
): Promise<number> {
  return db.observations.add({
    ...data,
    createdAt: new Date().toISOString(),
    synced: data.synced ?? false,
  })
}

export async function listObservations(): Promise<Observation[]> {
  return db.observations.orderBy('createdAt').reverse().toArray()
}

export async function countBySyncStatus() {
  const all = await db.observations.toArray()
  const synced = all.filter((o) => o.synced).length
  return { total: all.length, synced, pending: all.length - synced }
}

export async function markAllPendingSynced(): Promise<number> {
  const pending = await db.observations.filter((o) => !o.synced).toArray()
  await Promise.all(pending.map((o) => db.observations.update(o.id!, { synced: true })))
  return pending.length
}

export function isValidLabel(value: string): value is ScreeningLabel {
  return ['healthy', 'pest_like', 'disease_like', 'uncertain'].includes(value)
}
