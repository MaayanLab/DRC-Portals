'use client'
import { useState, useEffect } from 'react';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import { usePathname, useRouter } from 'next/navigation';

interface TableFilterProps {
    tableNames: { table: string; label: string }[];
    selectedValue?: { table: string; label: string };
}

export default function TableFilter({ tableNames, selectedValue }: TableFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [selectedTable, setSelectedTable] = useState<string | null>(selectedValue ? selectedValue.table : null);

    useEffect(() => {
        if (selectedValue) {
            setSelectedTable(selectedValue.table);
        }
    }, [selectedValue]);

    const updateTableParam = (event: any, value: { table: string; label: string } | null) => {
        if (value) {
            setSelectedTable(value.table);
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set('table_name', value.table);
            router.push(pathname + '?' + newSearchParams.toString());
        }
    };

    return (
        <Autocomplete
            id="tableSelect"
            options={tableNames}
            getOptionLabel={(option) => option.label}
            onChange={updateTableParam}
            value={tableNames.find((option) => option.table === selectedTable) || null}
            sx={{ width: '100%' }}
            renderInput={(params) => <TextField {...params} label="Schema Table" />}
        />
    );
}
