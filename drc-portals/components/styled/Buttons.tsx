'use client'
import Link from 'next/link';
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/system';

export const ElevatedIconButton = styled(IconButton)({
    boxShadow: '0px 1px 3px 1px rgba(15, 31, 46, 0.15)',
    padding: 3,
    background: "#FFF"
  });

export const Logo = ({href, title, color}: {href: string, title: string, color: "primary"| "secondary" | "inherit"}) => (
    <Link href={href} className='flex items-center space-x-3'>
        <div>
        <ElevatedIconButton
            aria-label="menu"
        >
            <Avatar sx={{ width: 30, height: 30 }} alt="cfde-logo" src="/img/favicon.png" />
        </ElevatedIconButton>
        </div>
        <div>
            <Typography variant='cfde' color={color}>{title}</Typography>
        </div>
    </Link>
)