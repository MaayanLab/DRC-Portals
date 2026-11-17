import { Alert } from '@mui/material'

export default function ServiceInterruption() {
  return (
    <Alert severity="warning" role="status" sx={{ width: '100%', my: 2 }}>
      We're experiencing a temporary service interruption. Some data and features
      are currently unavailable. Previously loaded data may be out of date. Please check back later.
    </Alert>
  )
}
