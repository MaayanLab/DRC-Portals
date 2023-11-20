import { useState } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Session } from 'next-auth';
import { SignInLink } from '@/lib/auth/links';
// some code taken from MUI

export default function Signin ({session}: {session?: Session}) {
    return (
        <SignInLink>
            <Button color="secondary" variant="outlined">
                LOGIN
            </Button>
        </SignInLink>
    )
}