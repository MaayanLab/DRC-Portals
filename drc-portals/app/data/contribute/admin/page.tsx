"use client"
import * as React from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { createOneUser, getAdminUser, getUsers, updateUserInfo } from './getUsers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { FaUserPlus, FaUserFriends } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { LuRefreshCcw } from "react-icons/lu";
import RoleSelect from './RoleSelect';
import MultiSelect from './MultiSelect';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

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

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    // border: '1px solid #000',
    boxShadow: 24,
    p: 4,
};

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
    const { data: session, status } = useSession()

    if (status === "authenticated") {
        getAdminUser(session).then((user) => {
            if (user?.role != 'ADMIN') {
                return  // TODO: show access denied when the user is not an admin
            }
        })
    }


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


    const [createOpen, setCreateOpen] = React.useState(false);
    const handleCreateClose = () => setCreateOpen(false);
    const handleCreate = useCallback(() => {
        setCreateOpen(true)
    }, []);
    const createSingleUser = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        console.log(createFormData)
        if (createFormData.role === '' || createFormData.name === '' || createFormData.email === '' || createFormData.DCC === '') {
            alert('Missing field')
        } else {
            createOneUser(createFormData)
            alert('User Creation Successful')
        }
    }

    const [updateOpen, setUpdateOpen] = React.useState(false);
    const handleUpdateClose = () => setUpdateOpen(false);
    const handleUpdate = useCallback(() => {
        setUpdateOpen(true)
    }, []);

    useEffect(() => {
        // get all users from database
        getUsers().then((users) => {
            const rows = users.map((user, index) => {
                return { id: index + 1, name: user.name, email: user.email, dcc: user.dcc, role: user.role.toString() }
            });
            setUsers(users)
            setRows(rows)
        });
    }, [])


    const [formData, setFormData] = useState({ role: '', DCC: '' });
    const [createFormData, setCreateFormData] = useState({ name:'', email: '', role: '', DCC: '' });


    const onRowsSelectionHandler = (ids: GridRowSelectionModel) => {
        const selectedRowsData = ids.map((id) => rows.find((row) => row.id === id)) as UserInfo[]
        setSelection(selectedRowsData)
    };

    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>, user: UserInfo) => {
        event.preventDefault();
        if (formData.role === '') {
            alert('Missing field. Fill out role for given user')
        } else {
            updateUserInfo(formData, users[user.id - 1].id)
            alert('User Informtion Updated')
        }

    };


    const router = useRouter();
    const handleRefresh = () => {
        router.refresh()
    };
    

    return (
        <Container className="mt-10 justify-content-center" sx={{ mb: 5 }}>
            <Typography variant="h3" className='text-center p-5'>Users</Typography>
            <Grid container spacing={2}>
            <Button color="tertiary" onClick={handleRefresh}> <LuRefreshCcw size={20}/></Button>
            {!usersSelected && <Button color='tertiary' onClick={handleCreate}> <FaUserPlus size={20} /> Create New User</Button>}
            <div>
                <Dialog open={createOpen} onClose={handleCreateClose} fullWidth component="form">
                    <DialogTitle>Create a User</DialogTitle>
                    <DialogContent>
                        <Box
                            component="form"
                            noValidate
                            autoComplete="off"
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
                                onChange={(evt) => {
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
                                onChange={(evt) => {
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
                            <Button variant="contained" color="tertiary" onClick={createSingleUser}  sx={{ justifySelf: "center" }}>
                                Create User
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button color="tertiary" onClick={handleCreateClose}>Done</Button>
                    </DialogActions>
                </Dialog>
            </div>
            {!usersSelected && <Button color='tertiary'><FaUserFriends size={20} /> Create Many Users</Button>}
            {usersSelected && <Button color='tertiary' onClick={handleUpdate}><FaUserPen size={20} /> Update User Info</Button>}
            <div>
                <Dialog open={updateOpen} onClose={handleUpdateClose} fullWidth component="form">
                    <DialogTitle>Update User Info</DialogTitle>
                    <DialogContent>
                        {selection.map((user) => {
                            return <>
                                <form className='border mx-2 my-2'>
                                    <Grid container spacing={4} className='p-3' justifyContent="center">
                                        <Grid item >
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
                                    </Grid>
                                    <div className='flex justify-center mb-2'>
                                        <Button variant="contained" color="tertiary" onClick={e => { handleSubmit(e, user)}}>Update</Button>
                                    </div>

                                </form>

                            </>

                        })}
                    </DialogContent>
                    <DialogActions>
                        <Button color="tertiary" onClick={handleUpdateClose}>Done</Button>
                        {/* <Button type='submit'>Update</Button> */}
                    </DialogActions>
                </Dialog>
            </div>
            </Grid>
            
            <div style={{ height: 400, width: '100%' }}>
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