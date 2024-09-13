'use client'
import { styled } from '@mui/system';

export const BlurSmall = styled('div')({
    background: '#7187C3',
    opacity: 0.6,
    width: '360px',
    height: '360px',
    borderRadius: '352px',
    filter: 'blur(1000px)'
  });

export const BlurBig = styled('div')({
    background: '#C3E1E6',
    opacity: 0.6,
    width: '560px',
    height: '560px',
    borderRadius: '352px',
    filter: 'blur(1000px)'
  });