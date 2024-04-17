import Image from 'next/image';
import Typography from '@mui/material/Typography'
import { ElevatedIconButton } from "./Buttons";
import { HomeLink } from '../misc/HomeLink';
export const Logo = ({title, color, size}: {title: string, color: "primary"| "secondary" | "inherit", size?: "small" | "large"}) => (
    <HomeLink>
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
    </HomeLink>
)