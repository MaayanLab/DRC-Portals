import { Stack } from "@mui/material";
import { CFDECrossPair } from '.prisma/client/gsc'
import { DataGrid, GridColDef, GridToolbarExport, GridToolbarDensitySelector, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import React from "react";


function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Stack sx={{justifyContent: 'space-between', width: '100%'}} direction={'row'}>
            <div>
                <GridToolbarColumnsButton color="secondary" />
                <GridToolbarFilterButton color="secondary" />
                <GridToolbarDensitySelector color="secondary" />
                <GridToolbarExport color="secondary" />
            </div>
            <GridToolbarQuickFilter color="secondary"/>
        </Stack>
      </GridToolbarContainer>
    )
  }
  
export function CrossingTable({ rows, columns }: { rows: CFDECrossPair[], columns: GridColDef[] }) {
    // remove gene sets that are too large (> 3000 genes)
    rows = rows.filter((row) => row.n_genes1 < 1500 && row.n_genes2 < 1500)
    if (rows.length > 0 && rows[0].lib_1 == 'user_sets') {
        columns = columns.slice(0, -1)
    }
    return (
            <DataGrid
                getRowHeight={() => 'auto'}
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    sorting: {
                        sortModel: [{ field: 'pvalue', sort: 'asc' }],
                    },
                    filter: {
                        filterModel: {
                          items: [],
                          quickFilterExcludeHiddenColumns: true,
                        },
                      }
                }}
                slots={{ toolbar: CustomToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                sx={{
                    '.MuiDataGrid-columnHeader': {
                        backgroundColor: '#C9D2E9',
                    },
                    '.MuiDataGrid-columnHeaderTitle': {
                        whiteSpace: 'normal !important',
                        wordWrap: 'break-word !important',
                        lineHeight: "normal",
                        fontWeight: 700
                    },
                    "& .MuiDataGrid-columnHeader": {
                        // Forced to use important since overriding inline styles
                        height: "unset !important",
                        padding: 1
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        // Forced to use important since overriding inline styles
                        maxHeight: "168px !important"
                    },
                    '.MuiDataGrid-cell': {
                        whiteSpace: 'normal !important',
                        wordWrap: 'break-word !important',
                        justifyContent: 'center'
                    },
                    '& .super-app-theme--header': {
                        padding: 2,
                        fontSize: 13,
                    },
                }}
            />
    )
}