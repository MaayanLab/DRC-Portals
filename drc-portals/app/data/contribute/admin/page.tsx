"use client"
import * as React from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { createOneUser, deleteUsers, getAdminUser, getUsers, updateUserInfo } from './crudUsers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { FaUserPlus } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import RoleSelect from './RoleSelect';
import MultiSelect from './MultiSelect';
import { useSession } from "next-auth/react"



const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'dcc', headerName: 'DCC', width: 300 },
    { field: 'role', headerName: 'Role', width: 200 },

];

interface UserInfo {
    id: number;
    name: string | null;
    email: string | null;
    dcc: string | null;
    role: string | null;
}


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
    'SPARC'
];

export default function DataTable() {
    const [noAccess, setNoAccess] = useState(true);
    const [isLoading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [rows, setRows] = React.useState<UserInfo[]>([{ id: 0, name: null, email: null, dcc: null, role: null }]);
    const [users, setUsers] = React.useState<{
        id: string;
        name: string | null;
        email: string | null;
        emailVerified: Date | null;
        image: string | null;
        dcc: string | null;
        role: string;
    }[]>([{ id: '', name: null, email: null, emailVerified: null, image: null, dcc: null, role: '' }]);
    const [selection, setSelection] = React.useState<UserInfo[]>([]);
    const usersSelected = useMemo(
        () => {
            return (selection.length > 0) ? true : false
        },
        [selection]
    );
    const [formData, setFormData] = useState({ role: '', DCC: '' });
    const [createFormData, setCreateFormData] = useState({ name: '', email: '', role: '', DCC: '' });

    // check if user is an admin 
    const { data: session, status } = useSession()
    useEffect(() => {
        if (status === "authenticated") {
        getAdminUser(session).then((user) => {
            if (user?.role === 'ADMIN') {
                setNoAccess(false);
            }
        })
    }
    }, [session]);

     // fetch all users from database
    useEffect(() => {
        getUsers().then((users) => {
            const rows = users.map((user, index) => {
                return { id: index + 1, name: user.name, email: user.email, dcc: user.dcc, role: user.role.toString() }
            });
            setUsers(users)
            setRows(rows)
            setLoading(false)
        });
    }, [refresh])

    // get selected rows
    const onRowsSelectionHandler = (ids: GridRowSelectionModel) => {
        const selectedRowsData = ids.map((id) => rows.find((row) => row.id === id)) as UserInfo[]
        setSelection(selectedRowsData)
    };

    // user creation 
    const [createOpen, setCreateOpen] = React.useState(false);
    const handleCreateClose = () => setCreateOpen(false);
    const handleCreate = useCallback(() => {
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
        setRefresh(oldRefresh => oldRefresh + 1)
    }

    // user update
    const [updateOpen, setUpdateOpen] = React.useState(false);
    const handleUpdateClose = () => setUpdateOpen(false);
    const handleUpdate = useCallback(() => {
        setUpdateOpen(true)
    }, []);
    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>, user: UserInfo) => {
        event.preventDefault();
        if (formData.role === '') {
            alert('Missing field. Fill out role for given user')
        } else {
            updateUserInfo(formData, users[user.id - 1].id)
            alert('User Information Updated')
        }
        setFormData({ role: '', DCC: '' })
        setRefresh(oldRefresh => oldRefresh + 1)
    };

    // user delete
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deleteUsers(selection, users)
        setRefresh(oldRefresh => oldRefresh + 1)
    };

    if (isLoading) return <Typography variant='h4'>Loading...</Typography>
    if (noAccess) return <Typography variant='h4'>Access Denied. Not Admin User</Typography>
    return (
        <Container className="mt-10 justify-content-center" sx={{ mb: 5 }}>
            <Typography variant="h3" className='text-center p-5'>Users</Typography>
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
                                <RoleSelect role={''} formData={createFormData} setFormData={setCreateFormData} />
                                <MultiSelect
                                    name='DCC'
                                    label="DCC"
                                    options={dccs}
                                    formData={createFormData}
                                    setFormData={setCreateFormData}
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
                                                <RoleSelect role={user.role?.toString()} formData={formData} setFormData={setFormData} />
                                            </Grid>
                                            <Grid item>
                                                <MultiSelect
                                                    name='DCC'
                                                    label="DCC"
                                                    options={dccs}
                                                    defaultValue={user.dcc?.split(',')}
                                                    formData={formData}
                                                    setFormData={setFormData}
                                                />
                                            </Grid>
                                            </>
                                        </Grid>
                                        <div className='flex justify-center mb-2'>
                                            <Button variant="contained" color="tertiary" onClick={e => { handleSubmit(e, user) }}>Update</Button>
                                        </div>
                                    </form>
                            })}
                        </DialogContent>
                        <DialogActions>
                            <Button color="tertiary" onClick={handleUpdateClose}>Done</Button>
                        </DialogActions>
                    </Dialog>
                </div>
                {usersSelected && <Button color='tertiary' onClick={handleDelete}><MdDelete size={20} /> Delete Users </Button>}
            </Grid>
            <div style={{width: '100%'}}>
                <DataGrid
                    rows={rows}
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
        </Container>

    );
}