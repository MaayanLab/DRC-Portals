import classNames from "classnames"

function getHighlights({ search, text }: { search?: string, text: string }) {
  const highlights: { highlight: boolean, text: string }[] = []
  if (!text) return []
  if (!search) return [{ highlight: false, text }]
  const textLower = text.toLocaleLowerCase()
  search = search.toLocaleLowerCase()
  let i = 0, j = 0
  while (i < textLower.length-1) {
    j = textLower.indexOf(search, i)
    if (j === -1) break
    else {
      if (i !== j) highlights.push({ highlight: false, text: text.slice(i, j) })
      highlights.push({ highlight: true, text: text.slice(j, j+search.length) })
      i = j + search.length
    }
  }
  if (i !== search.length-1) highlights.push({ highlight: false, text: text.slice(i) })
  return highlights
}

export function Highlight({ search, text }: { search?: string, text: string }) {
  return <>{getHighlights({ search, text }).map(({ highlight, text }, i) => <span key={i} className={classNames({'font-bold': highlight})}>{text}</span>)}</>
}
