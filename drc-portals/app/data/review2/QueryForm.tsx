'use client'
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import { generateQueryForReview, schemaToDCC, tableToName } from '../c2m2/utils';

export default function QueryForm() {

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
        </>
    );
}   