import ar from '../messages/ar.json'
import es from '../messages/es.json'

type Messages = typeof ar
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

const messages: Record<string, DeepPartial<Messages>> = { ar, es }

function getNestedValue(obj: any, keys: string[]): string | undefined {
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return typeof current === 'string' ? current : undefined
}

export function t(locale: string, key: string, vars?: Record<string, string | number>): string {
  const lang = messages[locale] ?? messages['ar']
  const parts = key.split('.')
  const value = getNestedValue(lang, parts)

  if (!value) return key

  if (!vars) return value

  return value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export function dir(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
