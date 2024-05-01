'use client'
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/CardActions'
import Avatar from "@mui/material/Avatar";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Autocomplete } from "@mui/material";
import TextField from '@mui/material/TextField';
import { useState, useEffect } from "react";
import axios from 'axios';


export default function ReviewPage() {

    const schemaToDCC = [
        { schema: '_4dn', label: '4DN' },
        { schema: 'ercc', label: 'ERCC' },
        { schema: 'glygen', label: 'GlyGen' },
        { schema: 'gtex', label: 'GTex' },
        { schema: 'hmp', label: 'HMP' },
        { schema: 'hubmap', label: 'HuBMAP' },
        { schema: 'idg', label: 'IDG' },
        { schema: 'kidsfirst', label: 'KidsFirst' },
        { schema: 'lincs', label: 'LINCS' },
        { schema: 'metabolomics', label: 'Metabolomics Workbench' },
        { schema: 'motrpac', label: 'MoTrPAC' },
        { schema: 'sparc', label: 'SPARC' }
    ];

    const tableToName = [
        { table: 'analysis_type', label: 'Analysis Type' },
        { table: 'anatomy', label: 'Anatomy' },
        { table: 'assay_type', label: 'Assay Type' },
        { table: 'biosample', label: 'Biosample' },
        { table: 'biosample_disease', label: 'Biosample - Disease' },
        { table: 'biosample_from_subject', label: 'Biosample from Subject' },
        { table: 'biosample_gene', label: 'Biosample - Gene' },
        { table: 'biosample_in_collection', label: 'Biosample in Collection' },
        { table: 'biosample_substance', label: 'Biosample - Substance' },
        { table: 'collection', label: 'Collection' },
        { table: 'collection_anatomy', label: 'Collection - Anatomy' },
        { table: 'collection_compound', label: 'Collection - Compound' },
        { table: 'collection_defined_by_project', label: 'Collection defined by Project' },
        { table: 'collection_disease', label: 'Collection - Disease' },
        { table: 'collection_gene', label: 'Collection - Gene' },
        { table: 'collection_in_collection', label: 'Collection in Collection' },
        { table: 'collection_phenotype', label: 'Collection - Phenotype' },
        { table: 'collection_protein', label: 'Collection - Protein' },
        { table: 'collection_substance', label: 'Collection - Substance' },
        { table: 'collection_taxonomy', label: 'Collection - Taxonomy' },
        { table: 'compound', label: 'Compound' },
        { table: 'data_type', label: 'Data Type' },
        { table: 'dcc', label: 'DCC' },
        { table: 'disease', label: 'Disease' },
        { table: 'file', label: 'File' },
        { table: 'file_describes_biosample', label: 'File describes Biosample' },
        { table: 'file_describes_collection', label: 'File describes Collection' },
        { table: 'file_describes_subject', label: 'File describes Subject' },
        { table: 'file_format', label: 'File Format' },
        { table: 'file_in_collection', label: 'File in Collection' },
        { table: 'gene', label: 'Gene' },
        { table: 'id_namespace', label: 'ID Namespace' },
        { table: 'ncbi_taxonomy', label: 'NCBI Taxonomy' },
        { table: 'phenotype', label: 'Phenotype' },
        { table: 'phenotype_disease', label: 'Phenotype - Disease' },
        { table: 'phenotype_gene', label: 'Phenotype - Gene' },
        { table: 'project', label: 'Project' },
        { table: 'project_in_project', label: 'Project in Project' },
        { table: 'protein', label: 'Protein' },
        { table: 'protein_gene', label: 'Protein - Gene' },
        { table: 'sample_prep_method', label: 'Sample Prep Method' },
        { table: 'subject', label: 'Subject' },
        { table: 'subject_disease', label: 'Subject - Disease' },
        { table: 'subject_in_collection', label: 'Subject in Collection' },
        { table: 'subject_phenotype', label: 'Subject - Phenotype' },
        { table: 'subject_race', label: 'Subject - Race' },
        { table: 'subject_role_taxonomy', label: 'Subject Role Taxonomy' },
        { table: 'subject_substance', label: 'Subject - Substance' },
        { table: 'substance', label: 'Substance' }
    ];

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

    const handleSchemaChange = (event, newValue) => {
        setSelectedSchema(newValue ? newValue.schema : null);
        console.log(newValue)
    };

    const handleTableChange = (event, newValue) => {
        setSelectedTable(newValue ? newValue.table : null);
        console.log(newValue)
    };

    // const preview = await prisma.$queryRawUnsafe(
    //     'SELECT * FROM $1',
    //     selectedSchema
    //     // selectedTable
    // )
    // console.log("---------------------PREVIEW---------------------",preview)

    
    // useEffect(() => {
    //     if (selectedSchema && selectedTable) {
    //         fetchData(selectedSchema, selectedTable)
    //             .then((result) => setTableData(result))
    //             .catch((error) => console.error("Error fetching data:", error));
    //     }
    // }, [selectedSchema, selectedTable]);    

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
            {/* {tableData.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6">{selectedSchema} {selectedTable}</Typography>
                    <TableContainer component={Paper}>
                        <Table>
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
                        </Table>
                    </TableContainer>
                </Grid>
            )} */}
        </Grid>
    </>
);
}