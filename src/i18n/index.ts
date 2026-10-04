import { en } from './en'
import { id, type LabelKey, type Messages } from './id'

export type Locale = 'id' | 'en'
export type { LabelKey, Messages }

export const DEFAULT_LOCALE: Locale = 'id'
export const LOCALE_STORAGE_KEY = 'teman-kopi-locale'

export const messages: Record<Locale, Messages> = {
  id,
  en,
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'id' || value === 'en'
}

export function readStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return DEFAULT_LOCALE
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
  return isLocale(raw) ? raw : DEFAULT_LOCALE
}

export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    template,
  )
}

export function localeTag(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'id-ID'
}
