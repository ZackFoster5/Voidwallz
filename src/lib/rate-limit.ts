type Counter = { count: number; resetAt: number }
const store = new Map<string, Counter>()

export async function rateLimit(key: string, limit: number, windowSec: number) {
  const now = Date.now()
  const cur = store.get(key)
  if (!cur || cur.resetAt < now) {
    const resetAt = now + windowSec * 1000
    const next: Counter = { count: 1, resetAt }
    store.set(key, next)
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (cur.count < limit) {
    cur.count += 1
    return { allowed: true, remaining: limit - cur.count, resetAt: cur.resetAt }
  }

  return { allowed: false, remaining: 0, resetAt: cur.resetAt }
}
