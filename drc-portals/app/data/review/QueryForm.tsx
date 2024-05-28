'use client'
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import { usePathname, useRouter } from 'next/navigation'
import { schemaToDCC, tableToName} from "@/app/data/review/utils";


export default function QueryForm() {
    
    const router = useRouter();
    const pathname = usePathname();

    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    const updateSchemaParam = (event: any, value: { schema: string, label: string } | null) => {
        if (value) {
            setSelectedSchema(value.schema);
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set('schema_name', value.schema);
            router.push(pathname + '?' + newSearchParams.toString());
        }
    }

    const updateTableParam = (event: any, value: { table: string, label: string } | null) => {
        if (value) {
            setSelectedTable(value.table);
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set('table_name', value.table);
            router.push(pathname + '?' + newSearchParams.toString());
        }
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Autocomplete
                        id="dccSelect"
                        options={schemaToDCC}
                        getOptionLabel={(option) => option.label}
                        onChange={updateSchemaParam}
                        value={schemaToDCC.find((option) => option.schema === selectedSchema) || null}
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
                        onChange={updateTableParam}
                        value={tableToName.find((option) => option.table === selectedTable) || null}
                        sx={{ width: '100%' }}
                        renderInput={(params) => <TextField {...params} label="Schema Table" />}
                    />
                    <Typography variant="body1">Selected Table: {selectedTable}</Typography>
                </Grid>
            </Grid>
        </>
    );
}
