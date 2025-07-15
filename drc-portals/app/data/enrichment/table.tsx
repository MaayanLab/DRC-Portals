'use client'
import { Button, Dialog, DialogContent, DialogTitle, TextField, Typography, Box } from "@mui/material";
import { 
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarExport,
} from "@mui/x-data-grid";
import { useState } from "react";

const OverlapDialog = ({row}: {
    row: {
        overlapping_set: Array<string>,
        overlap: string
    }
}) => {
    const [open, setOpen] = useState(false)
    return <><Button variant="outlined" color="secondary" onClick={()=>setOpen(!open)}><Typography>{row.overlap}</Typography></Button>
            <Dialog
                open={open}
                onClose={()=>setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle><Typography variant="h4">Overlaps</Typography></DialogTitle>
                <DialogContent>
                    <TextField
                    value={row.overlapping_set.join("\n")}
                    multiline
                    />
                </DialogContent>
            </Dialog>
        </>
}
const header: GridColDef[] = [
    {
        field: 'enrichr_label',
        headerName: "Term",
        flex: 1,
        // style: {flexDirection: "row"},
        align: "left"
    },
	{
        field: 'library',
        headerName: "Library",
        flex: 1,
        // style: {flexDirection: "row"},
        align: "left"
    },
    {
        field: 'pval',
        headerName: "p-value",
        align: "left"
    },
    {
        field: 'qval',
        headerName: "q-value",
        align: "left"
    },
    {
        field: 'zscore',
        headerName: "z-score",
        align: "left"
    },
    {
        field: 'combined_score',
        headerName: "combined score",
        align: "left"
    },
    {
        field: 'overlapping_set',
        headerName: "overlaps",
        align: "left",
        valueGetter: ({row})=>{
            return row.overlapping_set.join(";")
        },
        renderCell: ({row})=><OverlapDialog row={row}/>
    }
]

export function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{padding: 2}}>
        <GridToolbarQuickFilter variant="outlined" placeholder="Search Results"/>
        <GridToolbarExport sx={{color: "secondary.main"}}/>
      </GridToolbarContainer>
    );
  }


const NetworkTable = ({sorted_entries, columns}:{sorted_entries:Array<{[key:string]:any}>, columns: {[key:string]: boolean}}) => {
    console.log(sorted_entries)
    console.log(header.filter(i=>columns[i.field]))
    return (
         <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                components={{ Toolbar: CustomToolbar }}
                sortingOrder={['desc', 'asc']}
                rows={sorted_entries}
                columns={header.filter(i=>columns[i.field])}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={[5, 10, 25, 100]}
                // disableColumnMenu
                // autoHeight
                sx={{
                    '.MuiDataGrid-columnHeaders': {
                        color: 'dataGrid.contrastText',
                        backgroundColor: 'dataGrid.main',
                        borderRadius: "1rem 1rem 0 0",
                    },
                    borderRadius: "0 0 4px 4px",
                    '.MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                }}
            />
        </Box>
    )
}

export default NetworkTable