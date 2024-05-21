import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import { generateQueryForReview, schemaToDCC, tableToName } from '../c2m2/utils';

export function QueryForm({ onQueryGenerated }) {
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);

    const schemaToDCC = [
        {schema: '_4dn', label: '4DN'}
    ]

    const tableToName = [
        {table: 'anatomy', label: 'Anatomy'}
    ]

    const handleSchemaChange = (event, newValue) => {
        setSelectedSchema(newValue ? newValue.schema : null);
    };

    const handleTableChange = (event, newValue) => {
        setSelectedTable(newValue ? newValue.table : null);
    };

    const handleSubmit = () => {
        if (selectedSchema && selectedTable) {
            const query = generateQueryForReview(selectedSchema, selectedTable);
            onQueryGenerated(query);
        }
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
            <button onClick={handleSubmit}>Generate Query</button>
        </>
    );
}