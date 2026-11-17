'use client'

import { Button, Stack, Typography } from '@mui/material'
import Link from 'next/link'

export default function Error({ retry }: { error: Error & { digest?: string }, retry: () => void }) {
  return (
    <Stack spacing={2} sx={{ p: 3, width: '100%' }}>
      <Typography>This page could not be loaded. You can try again or continue browsing the site.</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={retry}>Try again</Button>
        <Button component={Link} href="/">Return home</Button>
        <Button component={Link} href="/data/documentation">Documentation</Button>
      </Stack>
    </Stack>
  )
}
