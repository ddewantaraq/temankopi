import { useEffect, useId, useRef, useState } from 'react'
import { useT } from '../i18n/LocaleContext'
import { isOnline } from '../sync/queue'

export function OnlineBadge() {
  const t = useT()
  const [online, setOnline] = useState(isOnline())
  const [open, setOpen] = useState(false)
  const clusterRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const sync = () => setOnline(isOnline())
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const root = clusterRef.current
      if (root && !root.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="status-cluster" ref={clusterRef}>
      <span className={`badge ${online ? 'online' : 'offline'}`}>
        <span className="dot" />
        {online ? t.online : t.offline}
      </span>
      <button
        type="button"
        className="info-btn"
        aria-label={t.status.pwaInfoLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">i</span>
      </button>
      {open ? (
        <div id={panelId} className="info-popover" role="dialog" aria-label={t.status.pwaInfoTitle}>
          <strong>{t.status.pwaInfoTitle}</strong>
          <p>{t.status.pwaInfoBody}</p>
        </div>
      ) : null}
    </div>
  )
}
