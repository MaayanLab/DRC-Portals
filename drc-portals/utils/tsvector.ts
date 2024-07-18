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
  const trigrams = new Set<string>()
  for (let i = 0, j = 3; j <= s.length; i++, j++) {
    const ngram = s.slice(i, j)
    if (ngram.endsWith('  ')) continue
    trigrams.add(ngram)
  }
  return trigrams
}

export function tsvector_intersect(a: Set<string>, b: Set<string>) {
  const intersection = new Set<string>()
  // choose the smaller index to loop through
  if (a.size < b.size) {
    // collect all intersecting trigrams
    a.forEach(el => {
      if (b.has(el)) intersection.add(el)
    })
  } else {
    // collect all intersecting trigrams
    b.forEach(el => {
      if (a.has(el)) intersection.add(el)
    })
  }
  return intersection
}

/**
 * Given trigrams, we can create an efficient search index by storing
 *  trigrams as keys and the documents as values, allowing us to
 *  directly lookup the set of documents given the query trigram regardless
 *  of how many documents there are.
 */
export function tsvector_search_index_insert(search_index: Map<string, Set<string>>, document: string) {
  // all trigrams from this document are registered into the search index
  tsvector(document).forEach(trgrm => {
    const docs = search_index.get(trgrm)
    if (!docs) search_index.set(trgrm, new Set([document]))
    else docs.add(document)
  })
}

/**
 * Map<TRIGRAM, Set<DOCUMENT>>
 */
export function tsvector_search_index(documents: string[] = []) {
  const search_index = new Map<string, Set<string>>()
  documents.forEach(document => tsvector_search_index_insert(search_index, document))
  return search_index
}

/**
 * Search for a query in a search index, returns results ordered by relevance
 */
export function tsvector_search_index_search(search_index: Map<string, Set<string>>, query: string) {
  const docHits = Array.from(
    // get trigrams for the query string
    tsvector(query)
  ).reduce((counts, trgrm) => {
    const docs = search_index.get(trgrm)
    if (docs !== undefined) {
      // each document with matching trigrams gets a "hit"
      docs.forEach(doc => counts.set(doc, (counts.get(doc) ?? 0) + 1))
    }
    return counts
  }, new Map<string, number>)
  const docs = Array.from(docHits.keys())
  // sort documents by most trigram hits
  docs.sort((a, b) => (docHits.get(b)??0) - (docHits.get(a)??0))
  return docs
}
