'use client'

import Box, { BoxProps } from '@mui/material/Box';

// TODO: just inherit theme from root?
export default function ThemedBox({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
        p: 1,
        m: 1,
        // fontSize: '0.50rem',
        // fontWeight: '700',
        fontVariant: 'subtitle1',
        ...sx,
      }}
      {...other}
    />
  );
}
