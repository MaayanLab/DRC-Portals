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
                <Typography variant="nav" align='center'>DATA AND METADATA UPLOAD FORM</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/urlform" href="/data/contribute/urlform">
                <Typography variant="nav" align='center'>CODE ASSETS FORM</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/uploaded" href="/data/contribute/uploaded">
                <Typography variant="nav" align='center'>UPLOADED ASSETS</Typography>
            </ToggleButton>
            <ToggleButton value="/data/contribute/documentation" href="/data/contribute/documentation">
                <Typography variant="nav" align='center'>DOCUMENTATION</Typography>
            </ToggleButton>
            {userAdmin && <ToggleButton value="/data/contribute/admin" href="/data/contribute/admin">
                <Typography variant="nav" align='center'>ADMIN</Typography>
            </ToggleButton>
            }
        </ToggleButtonGroup>
    );
}