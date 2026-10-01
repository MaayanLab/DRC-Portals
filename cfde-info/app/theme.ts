'use client';
import { createTheme } from '@mui/material/styles';
import { DM_Sans, Hanken_Grotesk } from 'next/font/google';


const hanken_grotesk = Hanken_Grotesk({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

export const dm_sans = DM_Sans({ 
    weight: ['300', '400', '500', '700'],
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
    
        footer: {
            fontFamily: dm_sans.style.fontFamily,
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 400,
            color: "#FFF"
        },
  },
  components: {
    MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                    padding: "8px 16px",
                    ...(ownerState.variant === 'contained' &&
                      ownerState.color === 'primary' && {
                        backgroundColor: '#C3E1E6',
                        color: '#2D5986',
                      }),
                  }),
              },
        }
  }
});

declare module '@mui/material/styles' {
    interface TypographyVariants {
      cfde: React.CSSProperties;
      cfde_small: React.CSSProperties;
      nav: React.CSSProperties;
      nav_highlighted: React.CSSProperties;
      nav_clicked: React.CSSProperties;
      footer: React.CSSProperties;
      stats_h3: React.CSSProperties;
      stats_sub: React.CSSProperties;
      stats_sub_small: React.CSSProperties;
    }
  
    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
      cfde?: React.CSSProperties;
      cfde_small?: React.CSSProperties;
      nav?: React.CSSProperties;
      nav_highlighted?: React.CSSProperties;
      nav_clicked?: React.CSSProperties;
      footer?: React.CSSProperties;
      stats_h3?: React.CSSProperties;
      stats_sub?: React.CSSProperties;
      stats_sub_small?: React.CSSProperties;
    }

    interface Palette {
        paperGray: Palette['primary'];
        tertiary: Palette['primary'];
    }

    interface PaletteOptions {
        paperGray?: PaletteOptions['primary'];
        tertiary?: PaletteOptions['primary'];
    }
  }

  declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
      cfde: true;
      cfde_small: true;
      nav: true;
      nav_highlighted: true;
      nav_clicked: true;
      footer: true;
      stats_h3: true;
      stats_sub: true;
      stats_sub_small: true;
    }
  }

export default theme;