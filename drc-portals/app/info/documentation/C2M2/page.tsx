import { Grid, Typography } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchC2m2Markdown, LinkRenderer, HeadingRenderer } from '@/components/misc/ReactMarkdownRenderers'
import { readFileSync } from 'fs'

const toc = `
  ## Table of Contents
  * [Introduction](#introduction)
  * [Resources](#resources)
  * [Frictionless Data Packages](#frictionless-data-packages)
  * [Identifiers](#identifiers)
  * [C2M2 Tables](#c2m2-tables)
  * [Reference Tables](#reference-tables)
  * [Submission Prep Script](#submission-prep-script)
  * [Datapackage Submission](#datapackage-submission)
  * [Tutorial](#tutorial)
`

export default async function C2M2Page() {
  const intro = readFileSync(
    'app/info/documentation/markdown/C2M2-intro.md', 
    {encoding:'utf8', flag:'r'}
  ) 

  let c2m2Tables = await fetchC2m2Markdown(
    'C2M2-Table-Summary.md'
  )
  c2m2Tables = c2m2Tables
    .replaceAll('./', './C2M2/') // redirect links to correct subpage
    .replaceAll('osf.io/vzgx9', 'osf.io/3sra4') // replace outdated schema link
    .replaceAll('/submission-prep-script', '#submission-prep-script') // redirect links to correct page section

  const referenceTables = readFileSync(
    'app/info/documentation/markdown/C2M2-reference-tables.md',
    {encoding: 'utf-8', flag:'r'}
  )

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
      '18 May 2023]](https://osf.io/7qdz4)'
    )
    .replace( // update to most recent ontology files
      '8 Mar 2023]](https://osf.io/bq6k9/files/)',  
      '24 May 2023]](https://osf.io/bq6k9/files/)'
    )
    .split('This script is under')[0]

  const tutorial = readFileSync(
    'app/info/documentation/markdown/C2M2-tutorial.md', 
    {encoding:'utf8', flag:'r'}
  )

  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item xs={12}>
        <Typography variant="h1" color="secondary.dark">C2M2</Typography>
      </Grid>
      <Grid item sx={{mb:5}}>
        <br/>
        <ReactMarkdown 
          skipHtml
          remarkPlugins={[remarkGfm]}
          components={{ 
            a: LinkRenderer,
            h2: HeadingRenderer,
            h3: HeadingRenderer
        }} className="prose">
          {''.concat(
            toc, // table of contents
            intro, // intro
            c2m2Tables, // C2M2 table descriptions from original docs
            referenceTables, // C2M2 reference tables
            '\n## Submission Prep Script\n*Sourced from the [CFDE-CC Documentation Wiki]' // header and source for submission prep section
              + '(https://github.com/nih-cfde/published-documentation/wiki/submission-prep-script)*\n', 
            submissionPrep, // datapackage preparation 
            tutorial, // overview of steps
            '\n#### Return to [Documentation](./)'
          )}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}