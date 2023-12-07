'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Container } from '@mui/material'

export default function Background({children}: {children: React.ReactNode}) {
    const pathname = usePathname()
    if ( pathname !== '/data' && pathname !== 'info') {
        return(
            <div  style={{background: "linear-gradient(180deg, #FFFFFF 0%, #DBE0ED 100%)"}}>
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