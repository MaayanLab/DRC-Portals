import { Box, LinearProgress } from '@mui/material'

export default function Loading() {
  return (
    <Box sx={{ width: '100%', minHeight: 160, py: 3 }}>
      <LinearProgress aria-label="Loading page" />
    </Box>
  )
}
