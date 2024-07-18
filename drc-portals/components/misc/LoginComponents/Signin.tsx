import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Session } from 'next-auth';
import { SignInLink } from '@/lib/auth/links';
// some code taken from MUI

export default function Signin ({session}: {session?: Session}) {
    return (
        <SignInLink>
            <Button sx={{padding: "5px 16px"}}size="small" color="secondary" variant="outlined">
            <Typography variant="nav">LOGIN</Typography>
            </Button>
        </SignInLink>
    )
}