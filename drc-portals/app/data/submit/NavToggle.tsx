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
            <ToggleButton value={"/submit/form"} href={"/data/submit/form"}
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
            <ToggleButton value={"/submit/urlform"} href={"/data/submit/urlform"}
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
            <ToggleButton value={"/submit/uploaded"} href={"/data/submit/uploaded"}
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
            {userAdmin && <ToggleButton value={"/submit/admin"} href={"/data/submit/admin"}
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