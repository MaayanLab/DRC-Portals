import React from 'react'
import { Container } from '@mui/material'

export default function Background({children, background="#DBE0ED"}: {children: React.ReactNode, background?: string}) {
    return(
    <div style={{
        background, 
        // backgroundImage: 'url("/img/umap-bground-1.png")',
        // backgroundPosition: "center",
        // backgroundRepeat: "no-repeat",
        // backgroundSize: "contain",
        // backgroundAttachment: "fixed",
        // background,
        flexGrow: 1, 
        display: 'flex', 
        overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
        </Container>
    </div>
    )
  }