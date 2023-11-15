import { useState } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Session } from 'next-auth';
import { Typography } from '@mui/material';
// some code taken from MUI

function stringToColor(string: string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }
  
  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  }

  
export default function Signin ({session}: {session?: Session}) {
    return (
        <>
            <Link href="/auth/signin">
            <Button color="secondary">
                SIGN UP
            </Button>
            </Link>
            <Link href="/auth/signin">
            <Button color="secondary" variant="outlined">
                LOGIN
            </Button>
            </Link>
        </>
    )
}