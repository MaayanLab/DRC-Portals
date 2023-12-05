import Link from 'next/link';
import Image from 'next/image';
import Typography from '@mui/material/Typography'
import { ElevatedIconButton } from "./Buttons";

export const Logo = ({href, title, color}: {href: string, title: string, color: "primary"| "secondary" | "inherit"}) => (
    <Link href={href} className='flex items-center space-x-3'>
        <div>
        <ElevatedIconButton
            aria-label="menu"
            sx={{width: 35, height: 35}}
        >
            <Image style={{marginLeft: -2, padding: 2,  objectFit: "contain"}} fill={true} alt="cfde-logo" src="/img/favicon.png" />
        </ElevatedIconButton>
        </div>
        <div>
            <Typography variant='cfde' color={color}>{title}</Typography>
        </div>
    </Link>
)