const STORAGE_KEY = 'teman-kopi.onboarding.v1'

/** True when user finished or skipped onboarding (persists across PWA remounts). */
export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'done'
  } catch {
    return false
  }
}

/** Mark onboarding complete (finish or skip). */
export function markOnboardingDone(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'done')
  } catch {
    // private mode / quota — UI may re-show; acceptable
  }
}
