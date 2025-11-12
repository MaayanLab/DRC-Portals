import React from 'react'

/**
 * Set local storage and ensure the rest of the application gets the StorageEvent
 */
export function setLocalStorage(key: string, update: (oldValue: string | null) => string | null) {
  const oldValue = window.localStorage.getItem(key)
  const newValue = update(oldValue)
  if (newValue === null) {
    window.localStorage.removeItem(key)
  } else {
    window.localStorage.setItem(key, newValue)
  }
  window.dispatchEvent(new StorageEvent('storage', { key, oldValue, newValue }))
}

/**
 * Use localstorage as you would normal react state
 * 
 * const [myState, setMyState] = useLocalStorage('localStorageKey')
 * 
 * Only difference, it must be string|null
 *  & setMyState only takes a value not a callback
 */
export function useLocalStorage(key: string) {
  const [value, _setValue] = React.useState<string | null>(null)
  const storageListener = React.useCallback((evt: StorageEvent) => {
    if (evt.key === key) {
      _setValue(() => evt.newValue)
    }
  }, [key])
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('storage', storageListener)
    _setValue(window.localStorage.getItem(key))
    return () => {window.removeEventListener('storage', storageListener)}
  }, [key])
  const setValue = React.useCallback((update: (oldValue: string | null) => string | null) => setLocalStorage(key, update), [key])
  return [value, setValue] as const
}
