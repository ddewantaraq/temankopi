import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listObservations } from '../db/observations'
import type { Observation } from '../db/schema'
import { getSyncSummary, syncPendingObservations } from '../sync/queue'
import { id as t } from '../i18n/id'

export function History() {
  const [rows, setRows] = useState<Observation[]>([])
  const [pending, setPending] = useState(0)
  const [synced, setSynced] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  async function refresh() {
    const list = await listObservations()
    setRows(list)
    const summary = await getSyncSummary()
    setPending(summary.pending)
    setSynced(summary.synced)
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onSync() {
    const result = await syncPendingObservations()
    if (!result.online) {
      setMessage('Masih offline — observasi tetap tersimpan lokal.')
      return
    }
    setMessage(
      result.synced > 0
        ? `${result.synced} observasi ditandai tersinkron (store-and-forward demo).`
        : 'Tidak ada antrean yang menunggu.',
    )
    await refresh()
  }

  return (
    <main className="page">
      <header className="topbar">
        <Link to="/" className="back">
          ← Beranda
        </Link>
        <h2>{t.history.title}</h2>
      </header>

      <section className="sync-bar">
        <div>
          <strong>
            {synced} {t.history.syncedCount}
          </strong>
          <span>
            {pending} {t.history.pendingCount}
          </span>
        </div>
        <button type="button" className="btn secondary" onClick={() => void onSync()}>
          {t.history.syncNow}
        </button>
      </section>

      {message && <p className="info">{message}</p>}

      {rows.length === 0 ? (
        <p className="muted">{t.history.empty}</p>
      ) : (
        <ul className="history-list">
          {rows.map((row) => (
            <li key={row.id}>
              <Link to={`/hasil/${row.id}`}>
                <img src={row.imageDataUrl} alt="" />
                <div>
                  <strong>{t.labels[row.label]}</strong>
                  <p>
                    {new Date(row.createdAt).toLocaleString('id-ID')} ·{' '}
                    {row.synced ? t.history.synced : t.history.pending}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
