"use client"

import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import * as React from 'react';
import { Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import RoleSelect from './RoleSelect';
import MultiSelect from './MultiSelect';
import { FaUserPlus } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { createOneUser, deleteUsers, updateUserInfo } from './actions';
import { $Enums, Prisma } from '@prisma/client';



export interface UserInfo {
    id: number;
    name: string | null;
    email: string | null;
    dcc: string | null;
    role: string | null;
}

export type updateForm = {
    role: string,
    DCC: string,
    index: number
}


const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'dcc', headerName: 'DCC', width: 300 },
    { field: 'role', headerName: 'Role', width: 200 },

];

const dccs = [
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
]

export default function DataTable(props: {
    rows: {
        id: number;
        name: string | null;
        email: string | null;
        dcc: string | null;
        role: string;
    }[], users: {
        id: string;
        name: string | null;
        email: string | null;
        emailVerified: Date | null;
        image: string | null;
        dcc: string | null;
        role: $Enums.Role;
    }[]
}) {
    const [selection, setSelection] = React.useState<UserInfo[]>([]);
    const [createFormData, setCreateFormData] = React.useState({ name: '', email: '', role: '', DCC: '' });
    const [updateFormData, setUpdateFormData] = React.useState<updateForm[]>([]);

    // get selected rows
    const onRowsSelectionHandler = (ids: GridRowSelectionModel) => {
        const selectedRowsData = ids.map((id) => props.rows.find((row) => row.id === id)) as UserInfo[]
        setSelection(selectedRowsData)
        const newUpdateFormData = ids.map((id) => { return { role: '', DCC: '', index: id as number - 1 } })
        setUpdateFormData(newUpdateFormData)
    };

    const usersSelected = React.useMemo(
        () => {
            return (selection.length > 0) ? true : false
        },
        [selection]
    );

    // user creation 
    const [createOpen, setCreateOpen] = React.useState(false);
    const handleCreateClose = () => setCreateOpen(false);
    const handleCreate = React.useCallback(() => {
        setCreateOpen(true)
    }, []);
    const createSingleUser = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (createFormData.role === '' || createFormData.name === '' || createFormData.email === '' || createFormData.DCC === '') {
            alert('Missing field')
        } else {
            createOneUser(createFormData)
            alert('User Creation Successful')
        }
        setCreateFormData({ name: '', email: '', role: '', DCC: '' })
    }


    // user update
    const [updateOpen, setUpdateOpen] = React.useState(false);
    const handleUpdateClose = () => setUpdateOpen(false);
    const handleUpdate = React.useCallback(() => {
        setUpdateOpen(true)
    }, []);
    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        updateUserInfo(updateFormData, props.users)
        alert('User Information Updated')
    };

    // user delete
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deleteUsers(selection, props.users)
    };


    return (
        <>
            <Grid container spacing={2}>
                {!usersSelected && <Button color='tertiary' onClick={handleCreate}> <FaUserPlus size={20} /> Create New User</Button>}
                <div>
                    <Dialog open={createOpen} onClose={handleCreateClose} fullWidth component="form">
                        <DialogTitle>Create a User</DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', '& > :not(style)': { m: 1 } }}
                                justifyContent='center'
                            >
                                <TextField
                                    id="input-name"
                                    label="Name"
                                    name='name'
                                    required
                                    inputProps={{ style: { fontSize: 16 } }}
                                    InputLabelProps={{ style: { fontSize: 16 } }}
                                    onBlur={(evt) => {
                                        setCreateFormData({ ...createFormData, [evt.target.name]: evt.target.value })
                                    }}
                                />
                                <TextField
                                    id="input-email"
                                    label="Email"
                                    name='email'
                                    inputProps={{ style: { fontSize: 16 } }}
                                    InputLabelProps={{ style: { fontSize: 16 } }}
                                    required
                                    onBlur={(evt) => {
                                        setCreateFormData({ ...createFormData, [evt.target.name]: evt.target.value })
                                    }}
                                />
                                <RoleSelect role={''} type='createUserForm' formData={createFormData} setFormData={setCreateFormData} />
                                <MultiSelect
                                    name='DCC'
                                    label="DCC"
                                    options={dccs}
                                    formData={createFormData}
                                    setFormData={setCreateFormData}
                                    type='createUserForm'
                                    index={0}
                                />
                                <Button variant="contained" color="tertiary" onClick={createSingleUser} sx={{ justifySelf: "center" }}>
                                    Create User
                                </Button>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button color="tertiary" onClick={handleCreateClose}>Done</Button>
                        </DialogActions>
                    </Dialog>
                </div>
                {usersSelected && <Button color='tertiary' onClick={handleUpdate}><FaUserPen size={20} /> Update User Info</Button>}
                <div>
                    <Dialog open={updateOpen} onClose={handleUpdateClose} fullWidth component="form">
                        <DialogTitle>Update User Info</DialogTitle>
                        <DialogContent>
                            {selection.map((user, index) => {
                                return <form className='border mx-2 my-2' key={index}>
                                    <Grid container spacing={4} className='p-3' justifyContent="center">
                                        <>
                                            <Grid item>
                                                <Typography variant='body2'>{user.name}</Typography>
                                                <Chip label={user.role?.toString()} />
                                            </Grid>
                                            <Grid item>
                                                <RoleSelect role={user.role?.toString()} type={'updateUserForm'} formData={updateFormData} setFormData={setUpdateFormData} index={index} />
                                            </Grid>
                                            <Grid item>
                                                <MultiSelect
                                                    name='DCC'
                                                    label="DCC"
                                                    options={dccs}
                                                    defaultValue={user.dcc?.split(',')}
                                                    formData={updateFormData}
                                                    setFormData={setUpdateFormData}
                                                    type='updateUserForm'
                                                    index={index}
                                                />
                                            </Grid>
                                        </>
                                    </Grid>
                                </form>
                            })}
                            <div className='flex justify-center mb-2'>
                                <Button variant="contained" color="tertiary" onClick={e => { handleSubmit(e) }}>Update Users</Button>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button color="tertiary" onClick={handleUpdateClose}>Done</Button>
                        </DialogActions>
                    </Dialog>
                </div>
                {usersSelected && <Button color='tertiary' onClick={handleDelete}><MdDelete size={20} /> Delete Users </Button>}
            </Grid>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={props.rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)}
                    sx={{ fontSize: 14 }}
                />
            </div>
        </>

    );
}