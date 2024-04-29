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
* [Submission Prep Script](#submission-prep-script)
* [General Steps](#general-steps)
* [Tutorial](#tutorial)
`

export default async function C2M2Page() {
  const intro = readFileSync(
    'app/info/documentation/C2M2/intro.md', 
    {encoding:'utf8', flag:'r'}
  ) 
  const c2m2Tables = await fetchC2m2Markdown(
    'C2M2-Table-Summary.md'
  )
  const submissionPrep = await fetchC2m2Markdown(
    'submission-prep-script.md'
  )
  const tutorial = readFileSync(
    'app/info/documentation/C2M2/tutorial.md', 
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
          remarkPlugins={[remarkGfm]}
          components={{ 
            a: LinkRenderer,
            h2: HeadingRenderer,
            h3: HeadingRenderer
        }} className="prose">
          {''.concat(
            toc, // table of contents
            intro, // intro
            c2m2Tables.replaceAll('./', './C2M2/').replace('/submission-prep-script', '#submission-prep-script'), // C2M2 table descriptions from original docs
            '\n## Submission Prep Script\n',
            '*Sourced from the [CFDE Coordination Center Documentation Wiki](https://github.com/nih-cfde/published-documentation/wiki/submission-prep-script)*\n',
            submissionPrep.replace('## Overview', '').replace('## Usage', '## General Steps').split('This script is under')[0], //
            tutorial, // overview of steps
            '\n#### Return to [Documentation](./)'
          )}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}