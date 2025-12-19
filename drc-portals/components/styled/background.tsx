'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Container } from '@mui/material'

export default function Background({children, background="#DBE0ED"}: {children: React.ReactNode, background?: string}) {
    const pathname = usePathname()
    if ( pathname !== '/data' && pathname !== 'info') {
        return(
            <div style={{background: `linear-gradient(180deg, #FFFFFF 0%, ${background} 100%)`, flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: '1em', marginTop: '1em', marginBottom: '1em', overflow: 'hidden' }}>
                    {children}
                </Container>
            </div>
        )
    }
    return(
        <Container maxWidth="lg">
            {children}
        </Container>
    )
    
  }