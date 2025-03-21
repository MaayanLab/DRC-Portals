import Link from "@/utils/link"

import Grid from '@mui/material/Grid'

export default async function Home() {
  return (
    <main className="mt-24">
      <Grid container spacing={2}>
        <Grid item xs={6} className="flex items-center justify-center">
          <Link href="/info">Info Page</Link>
        </Grid>
        <Grid item xs={6} className="flex items-center justify-center">
          <Link href="/data">Data Page</Link>
        </Grid>
      </Grid>
    </main>
  )
}
