"use client"

import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridToolbar, GridTreeNodeWithRender } from '@mui/x-data-grid';
import * as React from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import RoleSelect from './RoleSelect';
import MultiSelect from './MultiSelect';
import { FaUserPlus } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { createOneUser, deleteUsers, updateUserInfo } from './actions';
import type { DCC, User } from '@prisma/client'
import ActionAlert from './ActionAlert';

export interface UserInfo {
    id: number;
    name: string | null;
    email: string | null;
    dcc: string | null;
    role: string | null;
    dccs: DCC[]
}

export type updateForm = {
    role: string,
    DCC: string,
    index: number
}

export type creationForm = {
     name: string,
      email: string, 
      role: string, 
      DCC: string[] 
    }

export type ActionStatus = {
    success?: {
        selected: boolean;
        message: string
    },
    error?: {
        selected: boolean;
        message: string
    },
}




export default function DataTable({rows, users, dccMapping} : {
    rows: {
        id: number;
        name: string | null;
        email: string | null;
        role: string;
        dccs: DCC[]
    }[], users: User[],
    dccMapping: { [key: string]: string };
}) {
    const [selection, setSelection] = React.useState<UserInfo[]>([]);
    const [createFormData, setCreateFormData] = React.useState<creationForm>({ name: '', email: '', role: '', DCC: [] });
    const [updateFormData, setUpdateFormData] = React.useState<updateForm[]>([]);
    const [status, setStatus] = React.useState<ActionStatus>({})

    const RenderDCCOptions = ({ params }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender> }) => {
        const DCCOptions = params.row.dccs.map((dccObject: DCC) => dccObject.short_label)
        return (
            <Box>
                {DCCOptions.map((option: string) => <Chip key={option} label={option} sx={{margin:0.5}}/>)}
            </Box>  
        )
    }
    
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex:0.2 },
        { field: 'name', headerName: 'Name', flex:0.5 },
        { field: 'email', headerName: 'Email', flex:0.8 },
        { field: 'dcc', headerName: 'DCC', flex:1, renderCell: params => {
            return <RenderDCCOptions params={params} />
        }, },
        { field: 'role', headerName: 'Role', flex:0.5 },
    ];


    // get selected rows 
    const onRowsSelectionHandler = (ids: GridRowSelectionModel) => {
        const selectedRowsData = ids.map((id) => rows.find((row) => row.id === id)) as UserInfo[]
        setSelection(selectedRowsData)
        const newUpdateFormData = selectedRowsData.map((row) => { return { role: '', DCC: row.dccs.map((dccObj) => dccObj.short_label).toString(), index: row.id as number - 1 } })
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
        if (createFormData.role === '' || createFormData.name === '' || createFormData.email === '' || createFormData.DCC.length === 0) {
            setStatus(({ error: { selected: true, message: 'Missing Field in User Creation. Please fill out all fields' } }))
        } else {
            createOneUser(createFormData)
                .then(() => { setStatus(() => ({ success: { selected: true, message: 'User Created' } })) })
                .catch(error => { console.log({ error }); setStatus(({ error: { selected: true, message: 'Error in creating user. Please try again' } })) })
        }
        setCreateFormData({ name: '', email: '', role: '', DCC: [] })
    }


    // user update
    const [updateOpen, setUpdateOpen] = React.useState(false);
    const handleUpdateClose = () => setUpdateOpen(false);
    const handleUpdate = React.useCallback(() => {
        setUpdateOpen(true)
    }, []);
    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        updateUserInfo(updateFormData, users)
            .then(() => { setStatus(() => ({ success: { selected: true, message: 'User Information Updated' } })) })
            .catch(error => { console.log({ error }); setStatus(({ error: { selected: true, message: 'Error in updating user information. Please try again' } })) })
    };

    // user delete
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deleteUsers(selection, users)
            .then(() => { setStatus(() => ({ success: { selected: true, message: 'User Deleted' } })) })
            .catch(error => { console.log({ error }); setStatus(({ error: { selected: true, message: 'Error in deleting user Please try again' } })) })
    };


    return (
        <>
            <Grid container spacing={2} sx={{ ml: 3 }}>
                {!usersSelected && <Button color='tertiary' onClick={handleCreate}> <FaUserPlus size={20} /> Create New User</Button>}
                <div>
                    <Dialog open={createOpen} onClose={handleCreateClose} fullWidth>
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
                                    type='email'
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
                                    options={Object.keys(dccMapping)}
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
                    <Dialog open={updateOpen} onClose={handleUpdateClose} fullWidth>
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
                                                    options={Object.keys(dccMapping)}
                                                    defaultValue={user.dccs.map((dccObject) => dccObject.short_label ? dccObject.short_label: '')}
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
            <ActionAlert status={status} />
            <div style={{ width: '100%' }}>
                <DataGrid
                    getRowHeight={() => 'auto'}
                    rows={rows}
                    columns={columns} 
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    disableColumnFilter
                    disableColumnSelector
                    disableDensitySelector
                    slotProps={{
                        toolbar: {
                          csvOptions: { disableToolbarButton: true },
                          printOptions: { disableToolbarButton: true },
                          showQuickFilter: true,
                        },
                      }}
                    slots={{ toolbar: GridToolbar }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)}
                    sx={{
                        fontSize: 14,
                        '& .MuiDataGrid-cell': {
                            backgroundColor: "white",
                            whiteSpace: 'normal !important',
                            wordWrap: 'break-word !important',
                        },
                        '.MuiDataGrid-columnHeader': {
                            backgroundColor: '#C9D2E9',
                        },
                        '.MuiDataGrid-columnHeaderTitle': {
                            whiteSpace: 'normal !important',
                            wordWrap: 'break-word !important',
                            lineHeight: "normal",
                            fontWeight: 700
                        },
                        ml: 3
                    }}
                />
            </div>
        </>
    );
}