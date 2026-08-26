'use client';
import React from 'react';
import createCache from '@emotion/cache';
import { useSearchParams, useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { cfde_theme  as dark_theme } from './theme-dark';
import { cfde_theme  as light_theme } from './theme-light';
import Background from './background';
import { AppBar, Box, Button, Stack, Typography } from '@mui/material';
import { ModeSwitch } from './Switch';

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export default function ThemeRegistry(props:{options:any, children:any}) {
    const { options, children } = props;
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') || 'light'
    const [{ cache, flush }] = React.useState(() => {
      const cache = createCache(options);
      cache.compat = true;
      const prevInsert = cache.insert;
      let inserted: string[] = [];
      cache.insert = (...args) => {
        const serialized = args[1];
        if (cache.inserted[serialized.name] === undefined) {
          inserted.push(serialized.name);
        }
        return prevInsert(...args);
      };
      const flush = () => {
        const prevInserted = inserted;
        inserted = [];
        return prevInserted;
      };
      return { cache, flush };
    });
  
    useServerInsertedHTML(() => {
      const names = flush();
      if (names.length === 0) {
        return null;
      }
      let styles = '';
      for (const name of names) {
        styles += cache.inserted[name];
      }
      return (
        <style
          key={cache.key}
          data-emotion={`${cache.key} ${names.join(' ')}`}
          dangerouslySetInnerHTML={{
            __html: styles,
          }}
        />
      );
    });
  
    return (
      <CacheProvider value={cache}>
        <ThemeProvider theme={mode === 'light'? light_theme: dark_theme}>
          <CssBaseline />
          <Background background={mode === "light" ? 'white': 'black'}>
            <Box sx={{display: "flex", justifyContent: "flex-end"}}>
              <div>
                {/* <Button href={`${mode==='light'?'/?mode=dark':'/'}`} 
                  sx={{color: mode==='light'? "#333": "#F9F6EE"}}
                >View in {mode === 'light' ? 'Dark': 'Light'} Mode</Button> */}
                <ModeSwitch/>
              </div>
            </Box>
            <AppBar position="static" sx={{paddingLeft: 1, pt: 3, pb: 5, background: "transparent"}}>
            <Stack sx={{justifyContent: "center", alignItems: "center"}}>
              {/* <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                <Image style={{filter: "brightness(0) invert()"}} width={200} height={50} alt="cfde-logo" src={'/img/cfde-noglow.png'} />
                <Typography variant='caption' sx={{color: "oklch(85% .16 195)", fontSize: 20}}>NIH Common Fund</Typography>
                <Typography variant="h1" sx={{color: "oklch(85% .16 195)"}}>The Common Fund Data Ecosystem (CFDE)</Typography>
              </Stack> */}
              {/* <Image style={{filter: "brightness(0.1) invert()"}} width={200} height={50} alt="cfde-logo" src={'/img/cfde-noglow.png'} /> */}
              <img src={mode === 'light'? "/img/cfde-noglow.png": "/img/CFDE-glow.jpg"} alt="logo" style={{height: 100, width:180}}/>
              <Typography variant="h1" sx={{textAlign: "center"}}><b>The Common Fund Data Ecosystem (CFDE)</b></Typography>
            </Stack>
            </AppBar>
            {children}
            
          </Background>
        </ThemeProvider>
      </CacheProvider>
    );
  }