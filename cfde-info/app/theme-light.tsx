import { createTheme } from "@mui/material"
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

const ibm_plex_sans = IBM_Plex_Sans({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

const ibm_plex_mono = IBM_Plex_Mono({
    weight: ['100', '300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})




export const cfde_theme = createTheme({
    typography: {
        fontFamily: ibm_plex_sans.style.fontFamily,
        h1: {
            fontSize: 65,
            fontStyle: "normal",
            fontWeight: 500,
            color: "#333"
        },
        h2: {
            fontSize: 40,
            fontWeight: 500,
            fontStyle: "normal",
            color: "#333",
        },
        h3: {
            fontSize: 30,
            fontStyle: "normal",
            fontWeight: 600,
            color: "#333",
        },
        h4: {
            fontSize: 22,
            fontStyle: "normal",
            fontWeight: 500,
        },
        h5: {
            fontSize: 25,
            color: "#333",
            fontStyle: "normal",
            fontWeight: 100,
        },
        cfde: {
            fontSize: "40px",
            fontStyle: "normal",
            fontWeight: 500,
            textTransform: "uppercase"
        },
        cfde_small: {
            fontSize: 24,
            fontStyle: "normal",
            fontWeight: 500,
            textTransform: "uppercase"
        },
        subtitle1: {
            fontSize: 16,
            fontWeight: 500,
        },
        subtitle2: {
            fontSize: 15,
            fontWeight: 500,
        },
        body1: {
            fontSize: 20,
            color: "#333",
            fontStyle: "normal",
            fontWeight: 100,
        },
        body2: {
            fontSize: 18,
            color: "#333",
            fontStyle: "normal",
            fontWeight: 100,
        },
        caption: {
            fontFamily: ibm_plex_mono.style.fontFamily,
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 500,
        },
        nav: {
            fontSize: 18,
            color: "#2D5986",
            fontStyle: "normal",
            fontWeight: 100,
        },
        nav_highlighted: {
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#FFF",
            backgroundColor: "#2D5986",
            paddingLeft: 5,
            paddingRight: 5,
            marginRight: 2,
            // textDecoration: 'underline',
            // textDecorationThickness: 2,
            // textDecorationColor: "#FFF"
        },
        nav_clicked: {
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#000",
            backgroundColor: "#A5B4DB",
            paddingLeft: 5,
            paddingRight: 5,
            marginRight: 2,
            // textDecoration: 'underline',
            // textDecorationThickness: 2,
            // textDecorationColor: "#FFF"
        },
        footer: {
            fontFamily: ibm_plex_mono.style.fontFamily,
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
        stats_sub_small: {
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 500,
            color: "#9E9E9E"
        },
    },
    palette: {
        primary: {
            main: "#1f548a",
            light: "#90bae6",
            dark: "#0c2237",
            contrastText: "#FFF"
        },
        secondary: {
            main: "#6c3a77",
            light: "#cba5d3",
            dark: "#2b1730",
            contrastText: "#fff"
        },
        tertiary: {
            main: "#2D5986",
            light: "#9cbcde",
            dark: "#122436"
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
                  boxShadow: "none",
                },
              },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    borderRadius: "0px 0px 0px 0px",
                    background: "#C9D2E9"
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    borderColor: '#2D5986',
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    background: '#333',
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: "#B7C3E2",
                    '&.Mui-checked': {
                        color: "#2D5986",
                    },
                    '& .MuiSvgIcon-root': { 
                        fontSize: 20,
                    }
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.color === 'tertiary' &&
                     {
                        color: '#2D5986',
                      }),
                  }),
            }
        },
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                    padding: "8px 16px",
                    color: "#2D5986",
                    ...(ownerState.variant === 'contained' &&
                      ownerState.color === 'primary' && {
                        backgroundColor: '#C3E1E6',
                        color: '#2D5986',
                      }),
                    ...(ownerState.variant === 'contained' &&
                      ownerState.color === 'tertiary' && {
                        backgroundColor: '#2D5986',
                        color: '#FFFFFF',
                      }),
                  }),
              },
        },
        MuiChip: {
            styleOverrides: {
                // Name of the slot
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    borderRadius: 120,
                    fontWeight: 600,
                    padding: "10px 16px",
                    ...(ownerState.variant === 'filled' &&
                      ownerState.color === 'primary' && {
                        backgroundColor: '#C3E1E6',
                        color: '#2D5986',
                      }),
                    ...(ownerState.variant === 'filled' &&
                      ownerState.color === 'tertiary' && {
                        backgroundColor: '#2D5986',
                        color: '#FFFFFF',
                      }),
                  }),
              },
        }, 
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    "& .MuiInputBase-root, & .MuiInputLabel-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                      fontSize: "1rem"
                    },
              },
            },
        },
        MuiPaper: {
            variants: [
                {
                    props: {
                        variant: 'rounded-top'
                    },
                    style: {
                        borderTopLeftRadius: '1rem',
                        borderTopRightRadius: '1rem',
                    },
                }
            ],
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    "&:before": {
                       display: "none"
                    }
              },
            },   
        },
        MuiCard: {
            styleOverrides: {
                root: {
                backgroundColor: '#F9F6EE', // Change default background color
                borderWidth: 2,  
                borderColor: "oklch(100% 0 0 / .12)"
                },
            },
        }
    }
})

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

  declare module "@mui/material" {
    interface ButtonPropsColorOverrides {
        tertiary: true;
    }

    interface ChipPropsColorOverrides {
        tertiary: true;
    }
  }
  
  // Update the Typography's variant prop options
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

  
  declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
      "rounded-top": true;
    }
  }
