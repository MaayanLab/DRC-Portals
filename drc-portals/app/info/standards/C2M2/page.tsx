import { Grid, Typography, Link } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import { LinkRenderer, HeadingRenderer } from '@/components/misc/ReactMarkdownRenderers'
import path from 'path'
import { readFileSync } from 'fs'

export default function C2M2Docs() {
  const markdown = readFileSync(
    path.resolve('app/info/standards/C2M2', './C2M2.md'), 
    {encoding:'utf8', flag:'r'}
  )
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item xs={12}>
        <Typography variant="h1" color="secondary.dark">C2M2 Overview</Typography>
      </Grid>
      <Grid item xs={12} sx={{mb:2}}>
        <Typography fontStyle="italic" color="secondary">Partially adapted from <Link 
            color="secondary" 
            href="https:docs.nih-cfde.org/en/latest/c2m2/draft-C2M2_specification/">
          CFDE C2M2 Documentation</Link> 
        </Typography>
      </Grid>
      <Grid item sx={{mb:5}}>
        <ReactMarkdown 
          components={{ 
            a: LinkRenderer,
            h2: HeadingRenderer,
            h3: HeadingRenderer
        }} className="prose">
          {markdown}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}