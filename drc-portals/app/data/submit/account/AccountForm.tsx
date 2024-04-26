'use client'
import React from 'react'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MultiSelect from './MultiSelect';
import { DCC, User } from '@prisma/client';
import { saveuser } from './saveuser';
import Status, { StatusType } from '../Status'


const names = [
    'LINCS',
    '4DN',
    'A2CPS',
    'ExRNA',
    'GlyGen',
    'GTEx',
    'HMP',
    'HuBMAP',
    'IDG',
    'KidsFirst',
    'MoTrPAC',
    'Metabolomics',
    'SenNet',
    'SPARC'
];


export function AccountForm({ user }: {
    user: User & {
        dccs: DCC[];
    }
}) {

    const [status, setStatus] = React.useState<StatusType>({})
    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', '& > :not(style)': { m: 1, width: '50ch' } }}
            justifyContent='center'
            onSubmit={(evt) => {
                evt.preventDefault()
                saveuser(new FormData(evt.currentTarget), user.id)
                    .then((response) => {
                        if (response.success) {
                            setStatus({ success: { selected: true, message: 'Information successfully updated' } })
                        } else {
                            if (response.error === 'Email already registered in portal on another account') {
                                setStatus({ error: { selected: true, message: response.error } })
                            } else {
                                setStatus({ error: { selected: true, message: response.error ? response?.error : 'Problem updating information' } })
                            }
                        }
                    })
            }}
        >
            <TextField
                // disabled
                id="input-name"
                label="Name"
                name='name'
                defaultValue={user.name}
                inputProps={{ style: { fontSize: 16 } }}
                InputLabelProps={{ style: { fontSize: 16 } }}
            />
            <TextField
                id="input-email"
                label="Email"
                name='email'
                defaultValue={user.email}
                inputProps={{ style: { fontSize: 16 } }}
                InputLabelProps={{ style: { fontSize: 16 } }}
                disabled={user.email ? true : false}
                required
            />
            <MultiSelect
                name='DCC'
                label="DCC"
                options={names}
                defaultValue={user.dccs.map((dccObj) => dccObj.short_label ? dccObj.short_label : '')}
            />
            <TextField
                id="input-role"
                label="Role"
                name='role'
                defaultValue={user.role}
                inputProps={{ style: { fontSize: 16 } }}
                InputLabelProps={{ style: { fontSize: 16 } }}
                disabled
            />

            <Button variant="contained" color="tertiary" type='submit' sx={{ justifySelf: "center" }}>
                Save Changes
            </Button>
            <div style={{ width: '100%' }}>
                <Status status={status} />
            </div>
        </Box>
    )
}