import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function RoleSelect(props: { role: string | undefined, formData: {
    role: string;
    DCC: string;
}, setFormData: any}) {
    const [role, setRole] = React.useState('');
    const roles = [
        'User',
        'Uploader',
        'DCC Approver',
        'DRC Approver',
        "Admin"
    ]

    const handleChange = (event: SelectChangeEvent) => {
        setRole(event.target.value as string);
        props.setFormData({ ...props.formData, [event.target.name]: event.target.value })
    };

    return (
        // <Box sx={{ minWidth: 120 }}>
            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label" sx={{ fontSize: 16 }}>Role</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={role}
                    label="Role"
                    onChange={handleChange}
                    sx={{ fontSize: 16 }}
                    name='role'
                >
                    {roles.map((role) => {
                        return <MenuItem key={role} value={role} sx={{ fontSize: 16 }}>{role}</MenuItem>
                    })}
                </Select>
            </FormControl>
        // </Box>
    );
}