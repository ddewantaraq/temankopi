import { countBySyncStatus, markAllPendingSynced } from '../db/observations'

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/** Demo store-and-forward: mark local observations synced when connectivity returns. */
export async function syncPendingObservations(): Promise<{
  synced: number
  online: boolean
}> {
  if (!isOnline()) {
    return { synced: 0, online: false }
  }
  const synced = await markAllPendingSynced()
  return { synced, online: true }
}

export async function getSyncSummary() {
  const counts = await countBySyncStatus()
  return { ...counts, online: isOnline() }
}
