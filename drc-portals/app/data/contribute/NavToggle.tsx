'use client'
import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography'
import { usePathname } from 'next/navigation'

export default function ColorToggleButton({ userAdmin, loggedIn, registered }: { userAdmin: boolean, loggedIn: boolean, registered: boolean }) {
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
            <ToggleButton value="/data/contribute/documentation" href="/data/contribute/documentation">
                <Typography variant="nav" align='center'>DOCUMENTATION</Typography>
            </ToggleButton>
            <ToggleButton value={"/data/contribute/form"} href={"/data/contribute/form"}
                disabled={!registered || !loggedIn}
                sx={{
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#c0c0c0"
                    }
                }}>
                <Typography variant="nav" align='center' color={(registered && loggedIn) ? 'secondary' : 'grey'}>
                    DATA AND METADATA UPLOAD FORM
                </Typography>
            </ToggleButton>
            <ToggleButton value={"/data/contribute/urlform"} href={"/data/contribute/urlform"}
                disabled={!registered || !loggedIn}
                sx={{
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#c0c0c0"
                    }
                }}>
                <Typography variant="nav" align='center' color={(registered && loggedIn) ? 'secondary' : 'grey'}>
                    CODE ASSETS UPLOAD FORM
                </Typography>
            </ToggleButton>
            <ToggleButton value={"/data/contribute/uploaded"} href={"/data/contribute/uploaded"}
                disabled={!registered || !loggedIn}
                sx={{
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#c0c0c0"
                    }
                }}>
                <Typography variant="nav" align='center' color={(registered && loggedIn) ? 'secondary' : 'grey'}>
                    UPLOADED ASSETS
                </Typography>
            </ToggleButton>
            {userAdmin && <ToggleButton value={"/data/contribute/admin"} href={"/data/contribute/admin"}
                disabled={!registered || !loggedIn}
                sx={{
                    "&.Mui-disabled": {
                        background: "#eaeaea",
                        color: "#c0c0c0"
                    }
                }}>
                <Typography variant="nav" align='center' color={(registered && loggedIn) ? 'secondary' : 'grey'}>
                    ADMIN
                </Typography>
            </ToggleButton>}
        </ToggleButtonGroup>
    );
}