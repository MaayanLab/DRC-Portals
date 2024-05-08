'use client'
import React from 'react';
import Masonry from '@mui/lab/Masonry';

export default function MasonryClient ({children, defaultHeight, columns=3}: 
    {
        children: React.ReactNode[],
        defaultHeight: number,
        columns?: number
    }) {
    return (
        <Masonry columns={columns} 
            defaultHeight={defaultHeight}
            defaultColumns={3}
            defaultSpacing={1}
        >
            {children}
        </Masonry>
    )
}