import { createTheme } from "@mui/material"
import { Inter, DM_Sans, Montserrat, Hanken_Grotesk } from 'next/font/google'

export const dm_sans = DM_Sans({ 
    weight: ['500', '700'],
    subsets: ['latin'],
    display: 'swap',
})
export const inter = Inter({ 
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})
export const montserrat = Montserrat({ 
    weight: ['600'],
    subsets: ['latin'],
    display: 'swap',
})

export const hanken_grotesk = Hanken_Grotesk({
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})


export const cfde_theme = createTheme({
    typography: {
        fontFamily: hanken_grotesk.style.fontFamily,
        h1: {
            fontSize: 52,
            fontStyle: "normal",
            fontWeight: 600,
        },
        h2: {
            fontSize: 36,
            fontWeight: 600,
            fontStyle: "normal",
        },
        h3: {
            fontSize: 24,
            fontStyle: "normal",
            fontWeight: 700,
        },
        h4: {
            fontSize: 22,
            fontStyle: "normal",
            fontWeight: 600,
        },
        cfde: {
            fontFamily: inter.style.fontFamily,
            fontSize: 24,
            fontStyle: "normal",
            fontWeight: 700,
        },
        subtitle1: {
            fontSize: 20,
            fontWeight: 500,
        },
        subtitle2: {
            fontSize: 14,
            fontWeight: 600,
        },
        body1: {
            fontFamily: dm_sans.style.fontFamily,
            fontSize: 24,
            fontWeight: 500,
        },
        body2: {
            fontFamily: dm_sans.style.fontFamily,
            fontSize: 20,
            fontWeight: 500,
        },
        caption: {
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 500,
        },
        nav: {
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#336699"
        },
        footer: {
            fontFamily: inter.style.fontFamily,
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 400,
        },
        stats_h3: {
            fontSize: 24,
            fontStyle: "normal",
            fontWeight: 500,
            color: "#9E9E9E"
        },
        stats_sub: {
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 500,
            color: "#9E9E9E"
        },
    },
    palette: {
        primary: {
            main: "#C3E1E6",
            light: "#DBEDF0",
            dark: "#84A9AE"
        },
        secondary: {
            main: "#336699",
            light: "#81A1C1",
            dark: "#1F3D5C"
        },
        tertiary: {
            main: "#7187C3"
        },
        paperGray: {
            main: "#FAFAFA",
            light: "#fdfdfd",
            dark: "#afafaf"
        }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                // Name of the slot
                root: {
                  // Some CSS
                  background: "#FFF",
                  boxShadow: "none"
                },
              },
        },
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    borderRadius: 120,
                    ...(ownerState.variant === 'contained' &&
                      ownerState.color === 'primary' && {
                        backgroundColor: '#C3E1E6',
                        color: '#336699',
                      }),
                    ...(ownerState.variant === 'contained' &&
                      ownerState.color === 'tertiary' && {
                        backgroundColor: '#7187C3',
                        color: '#FFFFFF',
                      }),
                  }),
              },
        }
    }
})

declare module '@mui/material/styles' {
    interface TypographyVariants {
      cfde: React.CSSProperties;
      nav: React.CSSProperties;
      footer: React.CSSProperties;
      stats_h3: React.CSSProperties;
      stats_sub: React.CSSProperties;
    }
  
    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
      cfde?: React.CSSProperties;
      nav?: React.CSSProperties;
      footer?: React.CSSProperties;
      stats_h3?: React.CSSProperties;
      stats_sub?: React.CSSProperties;
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

  declare module "@mui/material" {
    interface ButtonPropsColorOverrides {
        tertiary: true;
    }
  }
  
  // Update the Typography's variant prop options
  declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
      cfde: true;
      nav: true;
      footer: true;
      stats_h3: true;
      stats_sub: true;
    }
  }
  