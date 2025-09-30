declare global {
  var singletons: any
}

/**
 * Evaluate callback only once, store in globals by key
 */
export default function singleton<T>(key: string, identity: () => T): T {
  if (!global.singletons) global.singletons = {}
  if (!(key in global.singletons)) global.singletons[key] = identity()
  return global.singletons[key] as T
}
