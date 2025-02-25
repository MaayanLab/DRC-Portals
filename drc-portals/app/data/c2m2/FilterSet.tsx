'use client'
import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { styled, lighten, darken } from '@mui/system';
import { useRouter } from 'next/navigation';
import { Typography, Box } from '@mui/material';

export type FilterObject = {
  id: string;
  name: string;
  count: number;
};

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor:
    theme.palette.mode === 'light'
      ? lighten(theme.palette.primary.light, 0.85)
      : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
  padding: 0,
});

function getFirstLetter(opt: FilterObject): string {
  return opt.name[0].toUpperCase();
}

export default function FilterSet({ id, filterList, filter_title, example_query }: { id: string, filterList: FilterObject[], filter_title: string, example_query: string }) {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<FilterObject[]>([]);
  const [pendingFilters, setPendingFilters] = useState<FilterObject[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];
    const updatedSelectedFilters = filterList.filter(filter => currentFilters.includes(`${id}:${filter.name}`));
    setSelectedFilters(updatedSelectedFilters);
  }, [filterList, id]);

  const applyFilters = () => {
    if (pendingFilters.length === 0) return;

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('C2M2MainSearchTbl_p');
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];
    const otherFilters = currentFilters.filter(filter => !filter.startsWith(`${id}:`));
    const newFiltersForCurrentId = [...selectedFilters, ...pendingFilters].map(filter => `${id}:${filter.name}`);

    searchParams.set('t', [...otherFilters, ...newFiltersForCurrentId].join('|'));
    searchParams.set('p', '1');
    router.push(`${window.location.pathname}?${searchParams.toString()}`);
    setSelectedFilters(prev => [...prev, ...pendingFilters]);
    setPendingFilters([]);
  };

  const handleDelete = (filterToDelete: FilterObject) => {
    setSelectedFilters(prev => prev.filter(filter => filter.id !== filterToDelete.id));
    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];
    const updatedFilters = currentFilters.filter(filter => !filter.startsWith(`${id}:${filterToDelete.name}`));
    if (updatedFilters.length > 0) {
      searchParams.set('t', updatedFilters.join('|'));
    } else {
      searchParams.delete('t');
    }
    router.push(`${window.location.pathname}?${searchParams.toString()}`);
  };

  // Function to shorten chip labels
  const shortenLabel = (label: string, maxLength = 10) =>
    label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;

  return (
    <>
      {filterList.length > 0 && (
        <>
          <Typography color="secondary" variant="h6">{filter_title}</Typography>
          <Autocomplete
            multiple
            autoComplete
            disableCloseOnSelect
            limitTags={3}
            id="filterSet"
            options={filterList.filter(option => !selectedFilters.includes(option) && !pendingFilters.includes(option))}
            groupBy={(option) => getFirstLetter(option)}
            getOptionLabel={(option) => option.name}
            value={[...selectedFilters, ...pendingFilters]}
            onChange={(event, newValue) => {
              const validNewValue = newValue.filter((val): val is FilterObject => typeof val !== 'string');
              setPendingFilters(validNewValue);
            }}
            renderTags={(value, getTagProps) => (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {value.map((option, index) => (
                  <Tooltip title={option.name} key={option.id}>
                    <Chip
                      variant="outlined"
                      label={shortenLabel(option.name)}
                      size="small"
                      {...getTagProps({ index })}
                      onDelete={() => handleDelete(option)}
                      sx={{
                        backgroundColor: theme => theme.palette.mode === 'light' ? '#f1f1f1' : '#333', // Lighter background
                        color: '#3a577c', // Navy blue text
                        fontWeight: 'bold', // Bold text
                        borderColor: theme => theme.palette.mode === 'light' ? '#e0e0e0' : '#555', // Very light border
                        padding: '0px',
                        height: 'auto',
                      }}
                    />
                  </Tooltip>
                ))}
                {pendingFilters.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={applyFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    Apply
                  </Button>
                )}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder={example_query} />
            )}
            sx={{ width: 'auto', marginBottom: '20px' }}
          />
        </>
      )}
    </>
  );
}
