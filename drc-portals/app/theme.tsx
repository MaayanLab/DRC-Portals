import { createTheme } from "@mui/material"

export const cfde_theme = createTheme({
    typography: {
        fontFamily: 'DM Sans',
        h1: {
            fontSize: 56,
            fontStyle: "normal",
            fontWeight: 700,
        },
        h2: {
            fontSize: 36,
            fontWeight: 700,
            fontStyle: "normal",
        },
        h3: {
            fontSize: 24,
            fontFamily: 'Sans-Serif',
            fontStyle: "normal",
            fontWeight: 700,
        },
        h4: {
            fontSize: 22,
            fontFamily: 'Inter',
            fontStyle: "normal",
            fontWeight: 600,
        },
        subtitle1: {
            fontSize: 20,
            fontWeight: 500,
        },
        subtitle2: {
            fontFamily: 'Montserrat',
            fontSize: 14,
            fontWeight: 600,
        },
        caption: {
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 500,
        },
        nav: {
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 500,
            textTransform: "uppercase",
        },
        footer: {
            fontSize: 16,
            fontFamily: 'Inter',
            fontStyle: "normal",
            fontWeight: 400,
        },
    },
    palette: {
        primary: {
            main: "#372C72",
            light: "#a399d8",
            dark: "#261f50"
        },
        secondary: {
            main: "#0B6EE5",
            light: "#98c4fa",
            dark: "#084da0"
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
                root: {
                  // Some CSS
                  textTransform: "none"
                },
              },
        }
    }
})

declare module '@mui/material/styles' {
    interface TypographyVariants {
      nav: React.CSSProperties;
      footer: React.CSSProperties;
    }
  
    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
      nav?: React.CSSProperties;
      footer?: React.CSSProperties;
    }

    interface Palette {
        paperGray: Palette['primary'];
    }

    interface PaletteOptions {
        paperGray?: PaletteOptions['primary'];
    }
  }
  
  // Update the Typography's variant prop options
  declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
      nav: true;
      footer: true;
    }
  }
  