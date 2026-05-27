import React from 'react'
import { Grid } from '@mui/material'
import { LiverSearchField } from './LiverSearchField'
import Script from 'next/script'

export default function LiverPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Broad site-shell header */}
            <div id="site-header"></div>
            <Script src="https://cdn.jsdelivr.net/gh/broadinstitute/site-shell@main/dist/site-shell.js" strategy="afterInteractive" />

            <Grid container>
                {/* Top bar with breadcrumb left, search right */}
                <Grid item xs={12} container justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1, borderBottom: '1px solid #ccc' }}>
                    <Grid item>
                        <span style={{ fontSize: 12, color: '#666' }}>
                            LIVER PORTAL › SEARCH
                        </span>
                    </Grid>
                    <Grid item>
                        <LiverSearchField />
                    </Grid>
                </Grid>

                {/* Main content */}
                <Grid item xs={12} sx={{ p: 2 }}>
                    {children}
                </Grid>
            </Grid>

            {/* Broad site-shell footer */}
            <div id="site-footer"></div>
        </>
    )
}