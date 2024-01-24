import { Grid, Typography, Link } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import { LinkRenderer, HeadingRenderer } from '@/components/misc/ReactMarkdownRenderers'
import path from 'path'
import { readFileSync } from 'fs'

export default function OpenAPIDocs() {
  const markdown = readFileSync(
    path.resolve('app/info/standards/OpenAPI', './OpenAPI.md'), 
    {encoding:'utf8', flag:'r'}
  )
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item xs={12}>
        <Typography variant="h1" color="secondary.dark">OpenAPI and SmartAPI Overview</Typography>
      </Grid>
      <Grid item sx={{mb:5}}>
        <br/>
        <ReactMarkdown 
        components={{ 
          a: LinkRenderer, 
          h2: HeadingRenderer,
          h3: HeadingRenderer,
        }} className="prose">
          {markdown}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}