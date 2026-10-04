import { useCallback, useState } from 'react'
import { isOnboardingDone, markOnboardingDone } from './storage'

export function useOnboarding() {
  const [show, setShow] = useState(() => !isOnboardingDone())

  const finish = useCallback(() => {
    markOnboardingDone()
    setShow(false)
  }, [])

  return { show, finish }
}
