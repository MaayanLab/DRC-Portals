'use client'
import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography'
import { usePathname } from 'next/navigation'

export default function ColorToggleButton({ userAdmin }: { userAdmin: boolean }) {
    const pathname = usePathname()
    const [menuItem, setMenuItem] = React.useState(pathname);
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newItem: string,
    ) => {
        setMenuItem(newItem);
    };

    return (
        <ToggleButtonGroup
            orientation='vertical'
            color="secondary"
            value={menuItem}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
        >
            <ToggleButton value="/data/contribute/form" href="/data/contribute/form">
                <Typography variant="nav">DATA AND METADATA UPLOAD FORM</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/urlform" href="/data/contribute/urlform">
                <Typography variant="nav">CODE ASSETS UPLOAD FORM</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/uploaded" href="/data/contribute/uploaded">
                <Typography variant="nav">UPLOADED FILES</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/documentation" href="/data/contribute/documentation">
                <Typography variant="nav">DOCUMENTATION</Typography>
            </ToggleButton>
            {/* <ToggleButton value="/data/contribute/account" href="/data/contribute/account">
                <Typography variant="nav">MY ACCOUNT</Typography>
            </ToggleButton> */}
            {userAdmin && <ToggleButton value="/data/contribute/admin" href="/data/contribute/admin">
                <Typography variant="nav">ADMIN</Typography>
            </ToggleButton>
            }
        </ToggleButtonGroup>
    );
}