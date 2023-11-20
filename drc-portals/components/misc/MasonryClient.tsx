'use client'
import React from 'react';
import Masonry from '@mui/lab/Masonry';

export default function MasonryClient ({children, defaultHeight}: 
    {
        children: React.ReactNode[],
        defaultHeight: number
    }) {
    return (
        <Masonry columns={3} 
            defaultHeight={defaultHeight}
            defaultColumns={3}
            defaultSpacing={1}
        >
            {children}
        </Masonry>
    )
}