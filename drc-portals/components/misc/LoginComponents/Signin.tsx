import { SignInLink } from '@/lib/auth/links';
import Typography from '@mui/material/Typography';

import { Session } from 'next-auth';
// some code taken from MUI

export default function Signin ({session}: {session?: Session}) {
    return (
        <SignInLink>
           <Typography variant="nav">LOGIN</Typography>
        </SignInLink>
    )
}