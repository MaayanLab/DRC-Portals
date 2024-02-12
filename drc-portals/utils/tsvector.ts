export class TSVector {
  constructor(public set = new Set<string>()) {}
  add = (other: string) => {
    this.set.add(other)
  }
  intersect(other: TSVector) {
    const intersection = new Set<string>()
    if (this.size < other.size) {
      this.set.forEach(el => {
        if (other.set.has(el)) intersection.add(el)
      })
    } else {
      other.set.forEach(el => {
        if (this.set.has(el)) intersection.add(el)
      })
    }
    return new TSVector(intersection)
  }
  get size() {
    return this.set.size
  }
}

/**
 * tri-gram searching works as follows:
 * Given: "my text"
 *  we produce tokens like so: "  my  text " => {"  m", " my", "my ", "  t", " te", ...}
 * Then we do the same to the search and compute a set overlap.
 * Two spaces are used in front of a word boundary to capture single letter prefix matching,
 *   but two spaces are not used for the postfix of a word boundary.
 * This variant of trigram searching seems to produce the most intuitive results when using
 *  1 or 2 characters for the search.
 */
export function tsvector(s: string) {
  s = s.toLowerCase()
    .replace(/\s+/g, '  ')
    .replace(/^\s*/g, s.length > 1 ? ' ' : '  ')
    .replace(/\s*$/g, '  ')
  const trigrams = new TSVector()
  for (let i = 0, j = 3; j <= s.length; i++, j++) {
    const ngram = s.slice(i, j)
    if (ngram.endsWith('  ')) continue
    trigrams.add(ngram)
  }
  return trigrams
}

/**
 * Given trigrams, we can create an efficient search index by storing
 *  trigrams as keys and the documents as values, allowing us to
 *  directly lookup the set of documents given the query trigram regardless
 *  of how many documents there are
 */
export class TSVectorDB {
  constructor(private db = new Map<string, Set<string>>()) {}
  private _upsert = (trgrm: string, document: string) => {
    const docs = this.db.get(trgrm)
    if (!docs) this.db.set(trgrm, new Set([document]))
    else docs.add(document)
  }
  add = (document: string) => {
    const tsdocument = tsvector(document)
    tsdocument.set.forEach(trgrm => this._upsert(trgrm, document))
  }
  search = (query: string) => {
    const docHits = Array.from(tsvector(query).set).reduce((counts, trgrm) => {
      const docs = this.db.get(trgrm)
      if (docs !== undefined) {
        docs.forEach(doc => counts.set(doc, (counts.get(doc) ?? 0) + 1))
      }
      return counts
    }, new Map<string, number>)
    const docs = Array.from(docHits.keys())
    docs.sort((a, b) => (docHits.get(b)??0) - (docHits.get(a)??0))
    return docs
  }
}
