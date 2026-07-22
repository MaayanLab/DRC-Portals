export type Result<T, E = any> = { data: T } | { error: E }

export function safe<T, E = any>(callable: () => T): Result<T, E> {
  try {
    return { data: callable() }
  } catch (error) {
    return { error: error as E }
  }
}

export async function safeAsync<T, E = any>(callable: () => Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await callable() }
  } catch (error) {
    return { error: error as E }
  }
}
