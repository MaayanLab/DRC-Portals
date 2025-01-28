import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LinkRenderer } from '@/components/misc/ReactMarkdownRenderers'

export async function fetchC2m2Markdown( doc: string ) { 
  const prefix = 'https://raw.githubusercontent.com/wiki/nih-cfde/published-documentation/'
  return (
    fetch(prefix.concat(doc))
      .then((res) => res.text())
      .then((text) => text)
      .catch((err) => "\n\n`Error fetching external content`")
  )
}

export async function C2m2Table() {
  let c2m2Tables = await fetchC2m2Markdown(
    'C2M2-Table-Summary.md'
  )
  c2m2Tables = c2m2Tables
    .replaceAll('./', './C2M2/') // redirect links to correct subpage
    .replaceAll('osf.io/vzgx9', 'osf.io/3sra4') // replace outdated schema link
    .replaceAll('/submission-prep-script', '#submission-prep-script') // redirect links to correct page section
  return (
    <ReactMarkdown 
      skipHtml
      remarkPlugins={[remarkGfm]}
      components={{ 
        a: LinkRenderer
    }} className="prose">
      {c2m2Tables}
    </ReactMarkdown>
  )
}

export async function C2m2SubmissionPrep() {
  let submissionPrep = await fetchC2m2Markdown(
    'submission-prep-script.md'
  )
  submissionPrep = submissionPrep
    .replace('## Overview', '') // remove original page header
    .replace('## Usage', '### General Steps') // make this a subsection
    .replace('python prepare_C2M2_submission.py', 'prepare_C2M2_submission.py') // remove extra "python"
    .replace( // redirect link to C2M2 table summary
      '[C2M2 table wiki](https://github.com/nih-cfde/published-documentation/wiki/C2M2-Table-Summary)', 
      '[C2M2 table summary](#c2m2-tables)'
    )
    .replace( // update to most recent prep script
      '8 Mar 2023]](https://osf.io/c67sp/)',  
      '28 August 2024]](https://osf.io/7qdz4)'
    )
    .replace( // update to most recent ontology files
      '8 Mar 2023]](https://osf.io/bq6k9/files/)',  
      '28 August 2024]](https://osf.io/bq6k9/files/)'
    )
    .split('This script is under')[0]
  return (
    <ReactMarkdown 
      skipHtml
      remarkPlugins={[remarkGfm]}
      components={{ 
        a: LinkRenderer
    }} className="prose">
      {submissionPrep}
    </ReactMarkdown>
  )
}