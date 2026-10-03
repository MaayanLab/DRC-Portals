export type Result<T, E = any> = { data: T, error: undefined } | { data: undefined, error: E }

export function safe<T, E = any>(callable: () => T) {
  try {
    return { data: callable() } as Result<T, E>
  } catch (error) {
    return { error: error as E } as Result<T, E>
  }
}

export async function safeAsync<T, E = any>(callable: () => Promise<T>) {
  try {
    return { data: await callable() } as Result<T, E>
  } catch (error) {
    return { error: error as E } as Result<T, E>
  }
}
