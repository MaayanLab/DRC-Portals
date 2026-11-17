/** Public data only: process-local snapshots survive database outages, not app restarts. */
export function createLastGoodCache({ ttlMs = 60_000, timeoutMs = 3000 } = {}) {
  const entries = new Map<string, { value: unknown, updated: number }>()
  const pending = new Map<string, Promise<unknown>>()

  return async function get<T>(key: string, load: () => PromiseLike<T>, available = true): Promise<T | undefined> {
    const entry = entries.get(key)
    if (!available || (entry && Date.now() - entry.updated < ttlMs)) {
      return entry?.value as T | undefined
    }
    let request = pending.get(key)
    if (!request) {
      request = (async () => {
        let timer: ReturnType<typeof setTimeout> | undefined
        try {
          const value = await Promise.race([
            Promise.resolve().then(load),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(new Error('Public data refresh timed out')), timeoutMs)
            }),
          ])
          entries.set(key, { value, updated: Date.now() })
          return value
        } catch (error) {
          console.error(`Unable to refresh public data: ${key}`, error)
          return entries.get(key)?.value
        } finally {
          clearTimeout(timer)
          pending.delete(key)
        }
      })()
      pending.set(key, request)
    }
    return await request as T | undefined
  }
}
