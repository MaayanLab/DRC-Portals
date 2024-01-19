import { Grid, Typography, Link } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import path from 'path'
import { readFileSync } from 'fs'

export default function PWBMetanodeDocs() {
  const markdown = readFileSync(
    path.resolve('app/info/standards/PWBMetanodes', './PWBMetanodes.md'), 
    {encoding:'utf8', flag:'r'}
  )
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item xs={12}>
        <Typography variant="h1" color="secondary.dark">Playbook Partnership Workflow Builder Metanodes</Typography>
      </Grid>
      <Grid item sx={{mb:5}}>
        <br/>
        <ReactMarkdown className="prose">
          {markdown}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}