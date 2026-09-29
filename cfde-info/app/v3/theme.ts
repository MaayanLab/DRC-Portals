'use client';
import { createTheme } from '@mui/material/styles';
import { Hanken_Grotesk } from 'next/font/google';


const hanken_grotesk = Hanken_Grotesk({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a2540',
      dark: '#061729',
    },
    secondary: {
      main: '#38bdf8',
    },
    background: {
      default: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: hanken_grotesk.style.fontFamily,
    h1: {
            fontSize: 'clamp(38px, 5cqw, 72px)',
            fontStyle: "normal",
            fontWeight: 400,
            color: "#F9F6EE",
            
        },
  },
});


export default theme;