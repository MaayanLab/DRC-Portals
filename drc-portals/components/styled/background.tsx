'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Container } from '@mui/material'

export default function Background({children, background="#DBE0ED"}: {children: React.ReactNode, background?: string}) {
    const pathname = usePathname()
    if ( pathname !== '/data' && pathname !== 'info') {
        return(
            <div  style={{background: `linear-gradient(180deg, #FFFFFF 0%, ${background} 100%)`, flexGrow: 1}}>
                <Container maxWidth="lg">
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