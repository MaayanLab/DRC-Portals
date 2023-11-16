'use client'

import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

// TODO: just inherit theme from root?
export default function ThemedStack({ children }: React.PropsWithChildren<{}>) {
  return (
    <Stack
      divider={<Divider flexItem > OR </Divider>}
      spacing={2}
      alignItems="center"
      className='p-5'
      border={1}
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
        p: 1,
        m: 1,
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
      }}
    >
      {children}
    </Stack>
  )
}