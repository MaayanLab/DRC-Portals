'use client';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { generateQueryForReview, schemaToDCC, tableToName } from '../c2m2/utils';
import { useEffect } from 'react';
import prisma from '@/lib/prisma';


export function ReviewPage() {
    

    const options = tableToName.map((option) => {
        const firstLetter = option.label[0].toUpperCase();
        return {
            firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
            ...option,
        };
    });

    const [selectedSchema, setSelectedSchema] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState([]);

    const fetchData = async () => {
        if (selectedSchema && selectedTable) {
            try {
                const result = await prisma.$queryRaw(generateQueryForReview(selectedSchema, selectedTable));
                setTableData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    
    const handleSchemaChange = (event, newValue) => {
        setSelectedSchema(newValue ? newValue.schema : null);
    };

    const handleTableChange = (event, newValue) => {
        setSelectedTable(newValue ? newValue.table : null);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Autocomplete
                        id="dccSelect"
                        options={schemaToDCC}
                        getOptionLabel={(option) => option.label}
                        onChange={handleSchemaChange}
                        value={schemaToDCC.find((option) => option.schema === selectedSchema)}
                        sx={{ width: '100%' }}
                        renderInput={(params) => <TextField {...params} label="DCC" />}
                    />
                    <Typography variant="body1">Selected Schema: {selectedSchema}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Autocomplete
                        id="tableSelect"
                        options={tableToName}
                        getOptionLabel={(option) => option.label}
                        onChange={handleTableChange}
                        value={tableToName.find((option) => option.table === selectedTable)}
                        sx={{ width: '100%' }}
                        renderInput={(params) => <TextField {...params} label="Schema Table" />}
                    />
                    <Typography variant="body1">Selected Table: {selectedTable}</Typography>
                </Grid>
            </Grid>
            {tableData.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6">{selectedSchema} {selectedTable}</Typography>
                    <TableContainer component={Table}>
                        <TableHead>
                            <TableRow>
                                {Object.keys(tableData[0]).map((key) => (
                                    <TableCell key={key}>{key}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <TableRow key={index}>
                                    {Object.values(row).map((value, index) => (
                                        <TableCell key={index}>{value}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </Grid>
            )}
        </>
    );
}
