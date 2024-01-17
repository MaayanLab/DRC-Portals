import Link from 'next/link';
import Image from 'next/image';
import Typography from '@mui/material/Typography'
import { ElevatedIconButton } from "./Buttons";

export const Logo = ({href, title, color, size}: {href: string, title: string, color: "primary"| "secondary" | "inherit", size?: "small" | "large"}) => (
    <Link href={href} className='flex items-center space-x-3'>
        <div>
        <ElevatedIconButton
            aria-label="menu"
            sx={{width: size === 'large' ? 56: 35, height: size === 'large' ? 56: 35}}
        >
            <Image style={{marginLeft: -2, padding: 2,  objectFit: "contain"}} fill={true} alt="cfde-logo" src="/img/favicon.png" />
        </ElevatedIconButton>
        </div>
        <div>
            <Typography variant={size==='large'?'cfde':'cfde_small'} color={color}>{title}</Typography>
        </div>
    </Link>
)