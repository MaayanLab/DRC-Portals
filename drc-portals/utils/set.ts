export default function set_difference<T>(A: Set<T>, B: Set<T>) {
  const C = new Set<T>()
  A.forEach(a => {
    if (!B.has(a)) C.add(a)
  })
  return C
}
