'use client';
import { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { schemaToDCC } from '@/app/data/review/utils';

interface SchemaFilterProps {
    selectedFilter?: string;
}

export default function SchemaFilter({ selectedFilter }: SchemaFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFilter) {
            setSelectedSchema(selectedFilter);
        }
    }, [selectedFilter]);

    const updateSchemaParam = (event: any, value: { schema: string, label: string } | null) => {
        if (value) {
            setSelectedSchema(value.schema);
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set('schema_name', value.schema);
            router.push(pathname + '?' + newSearchParams.toString());
        }
    };

    return (
        <Grid item xs={6}>
            <Autocomplete
                id="schemaSelect"
                options={schemaToDCC}
                getOptionLabel={(option) => option.label}
                onChange={updateSchemaParam}
                value={schemaToDCC.find((option) => option.schema === selectedSchema) || null}
                sx={{ width: '100%' }}
                renderInput={(params) => <TextField {...params} label="DCC" />}
            />
            <br></br>
        </Grid>
    );
}
