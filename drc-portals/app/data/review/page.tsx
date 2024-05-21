'use client'
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import prisma from '@/lib/prisma';
import { QueryForm } from './QueryForm';

export default function ReviewPage() {
    const [tableData, setTableData] = useState([]);

    const fetchData = async (query) => {
        try {
            const result = await prisma.$queryRaw(query);
            setTableData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleQueryGenerated = (query) => {
        fetchData(query);
    };

    return (
        <>
            <QueryForm onQueryGenerated={handleQueryGenerated} />
            {tableData.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6">Table Data</Typography>
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