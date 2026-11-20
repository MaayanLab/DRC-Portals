import { createTheme } from "@mui/material/styles";
import { Inter, DM_Sans, Montserrat, Hanken_Grotesk } from "next/font/google";

export const dm_sans = DM_Sans({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});
export const inter = Inter({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
export const montserrat = Montserrat({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

export const hanken_grotesk = Hanken_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const text2_cypher_theme = createTheme({
  typography: {
    fontFamily: hanken_grotesk.style.fontFamily,
    h1: {
      fontSize: 40,
      fontStyle: "normal",
      fontWeight: 500,
    },
    h2: {
      fontSize: 32,
      fontWeight: 500,
      fontStyle: "normal",
    },
    h3: {
      fontSize: 24,
      fontStyle: "normal",
      fontWeight: 500,
    },
    h4: {
      fontSize: 22,
      fontStyle: "normal",
      fontWeight: 500,
    },
    h5: {
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: 500,
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
      fontFamily: dm_sans.style.fontFamily,
      fontSize: 16,
      fontWeight: 500,
    },
    body2: {
      fontFamily: dm_sans.style.fontFamily,
      fontSize: 15,
      fontWeight: 500,
    },
    caption: {
      fontSize: 14,
      fontStyle: "normal",
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: "#2D5986",
      light: "#9cbcde",
      dark: "#122436",
    },
    secondary: {
      main: "#C3E1E6",
      light: "#DBEDF0",
      dark: "#84A9AE",
    },
  },
});
