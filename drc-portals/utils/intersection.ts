export default function intersection<T>(A: T[], B: T[], keyfunc: (record: T) => string) {
  if (A.length < B.length) {
    const BS = new Set(B.map(keyfunc))
    return A.filter(a => BS.has(keyfunc(a)))
  } else {
    const AS = new Set(A.map(keyfunc))
    return B.filter(b => AS.has(keyfunc(b)))
  }
}