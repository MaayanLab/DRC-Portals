'use client'
import React from 'react';
import Masonry from '@mui/lab/Masonry';
import { useWidth } from './Carousel/helper';
export default function MasonryClient ({children, defaultHeight, columns=3}: 
    {
        children: React.ReactNode[],
        defaultHeight: number,
        columns?: number
    }) {
    const width = useWidth()
    return (
        <Masonry columns={['xs', 'sm'].indexOf(width) > -1 ? 1: columns} 
            defaultHeight={defaultHeight}
            defaultSpacing={1}
            sx={{textAlign: "left"}}
        >
            {children}
        </Masonry>
    )
}