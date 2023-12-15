import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { updateForm } from './DataTable';
import { CreateUserFormData } from './MultiSelect';

type CreateUserFormProps = {
    role: string | undefined, 
    type: 'createUserForm', 
    formData: CreateUserFormData , 
    setFormData: React.Dispatch<React.SetStateAction<CreateUserFormData>>
}

type UpdateUserFormProps = {
    role: string | undefined, 
    type: 'updateUserForm', 
    formData: updateForm[], 
    setFormData: React.Dispatch<React.SetStateAction<updateForm[]>>, 
    index: number }


export default function RoleSelect(props: CreateUserFormProps | UpdateUserFormProps) {
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
        if (props.type === 'createUserForm') {
            props.setFormData({ ...props.formData, [event.target.name]: event.target.value })
        } else if (props.type === 'updateUserForm') {
            const newFormData = [...props.formData]
            newFormData[props.index] = { 'role': event.target.value, 'DCC': props.formData[props.index].DCC, 'index': props.formData[props.index].index }
            props.setFormData(newFormData);

        };
    }

    return (
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
    );
}
