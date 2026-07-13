export function safe<T>(callable: () => T) {
  try {
    return { data: callable() }
  } catch (error) {
    return { error }
  }
}

export async function safeAsync<T, E = any>(callable: () => Promise<T>) {
  try {
    return { data: await callable() }
  } catch (error) {
    return { error: error as E }
  }
}
