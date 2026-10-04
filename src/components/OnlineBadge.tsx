import { useEffect, useState } from 'react'
import { useT } from '../i18n/LocaleContext'
import { isOnline } from '../sync/queue'

export function OnlineBadge() {
  const t = useT()
  const [online, setOnline] = useState(isOnline())

  useEffect(() => {
    const sync = () => setOnline(isOnline())
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  return (
    <span className={`badge ${online ? 'online' : 'offline'}`}>
      <span className="dot" />
      {online ? t.online : t.offline}
    </span>
  )
}
