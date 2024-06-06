export function safe<T>(callable: () => T) {
  try {
    return { data: callable() }
  } catch (error) {
    return { error }
  }
}

export async function safeAsync<T>(callable: () => Promise<T>) {
  try {
    return { data: await callable() }
  } catch (error) {
    return { error }
  }
}
