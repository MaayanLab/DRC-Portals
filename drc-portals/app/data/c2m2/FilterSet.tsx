'use client'
import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip
import { styled, lighten, darken } from '@mui/system';
import { useRouter } from 'next/navigation';
import { Typography } from '@mui/material';

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

export default function FilterSet({ id, filterList, filter_title, example_query, maxCount }: { id: string, filterList: FilterObject[], filter_title: string, example_query: string, maxCount: number }) {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<FilterObject[]>([]);
  const [filterIndex, setFilterIndex] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedFiltersForAutocomplete, setSelectedFiltersForAutocomplete] = useState<FilterObject[]>([]);

  const options = filterList.map((option) => {
    const firstLetter = option.name[0].toUpperCase();
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      ...option,
    };
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    const updatedSelectedFilters = filterList.filter(filter => {
      return currentFilters.includes(`${id}:${filter.name}`);
    });

    setSelectedFilters(updatedSelectedFilters);
    setSelectedFiltersForAutocomplete(updatedSelectedFilters);
  }, [filterList, id]);

  useEffect(() => {
    localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
    setSelectedFiltersForAutocomplete(selectedFilters);
  }, [selectedFilters]);

  const generateFilterIndex = () => {
    const index = new Set<string>();
    filterList.forEach(filter => {
      index.add(filter.name.charAt(0).toUpperCase());
    });
    return Array.from(index);
  };

  if (filterList.length > 50 && filterIndex.length === 0) {
    setFilterIndex(generateFilterIndex());
  }

  const applyFilters = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('C2M2MainSearchTbl_p');
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    const otherFilters = currentFilters.filter(filter => !filter.startsWith(`${id}:`));

    const newFiltersForCurrentId = selectedFilters.map(filter => `${id}:${filter.name}`);

    const updatedFilters = [...otherFilters, ...newFiltersForCurrentId];

    searchParams.set('t', updatedFilters.join('|'));
    searchParams.set('p', '1');
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl);
  };

  const handleDelete = (filterToDelete: FilterObject) => {
    const updatedFilters = selectedFilters.filter(filter => filter.id !== filterToDelete.id);
    setSelectedFilters(updatedFilters);

    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    const otherFilters = currentFilters.filter(filter => !filter.startsWith(`${id}:${filterToDelete.name}`));

    if (otherFilters.length > 0) {
      searchParams.set('t', otherFilters.join('|'));
    } else {
      searchParams.delete('t');
    }

    router.push(`${window.location.pathname}?${searchParams.toString()}`);
  };

  const getFilteredOptions = () => {
    if (!selectedLetter) {
      return filterList;
    } else {
      return filterList.filter(filter => filter.name.charAt(0).toUpperCase() === selectedLetter);
    }
  };

  const chunkArray = (array: string[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const indexRows = chunkArray(filterIndex, 8);

  const disableAutocomplete = options.length === 0 || selectedFilters.length === filterList.length;
  
  return (
    <>
    <Typography color="secondary" variant="h6">{filter_title}</Typography>
    {options.length > 0 && (
      <Autocomplete
        multiple
        autoComplete
        disableCloseOnSelect
        limitTags={3}
        id="filterSet"
        options={options
          .filter(option => !selectedFiltersForAutocomplete.some(filter => filter.id === option.id))
          .sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))
        }
        noOptionsText="" // Empty text to avoid showing "No more options"
        freeSolo={false} // Disable free text input
        groupBy={(option) => getFirstLetter(option)}
        getOptionLabel={(option) => `${option.name}`}
        value={selectedFiltersForAutocomplete}
        onChange={(event, newValue) => {
          const validNewValue = newValue.filter((val): val is FilterObject => typeof val !== 'string');
          setSelectedFilters(validNewValue);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Tooltip title={option.name} key={option.id}>
              <Chip
                variant="outlined"
                label={option.name}
                size="medium"
                {...getTagProps({ index })}
                onDelete={() => handleDelete(option)}
                sx={{
                  backgroundColor: theme => theme.palette.mode === 'light' ? '#f1f1f1' : '#333', // Lighter background
                  color: 'navy', // Navy blue text
                  fontWeight: 'bold', // Bold text
                  borderColor: theme => theme.palette.mode === 'light' ? '#e0e0e0' : '#555', // Very light border
                }}
              />
            </Tooltip>
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={example_query}
            disabled={disableAutocomplete} // Disable input if disableAutocomplete is true
            InputProps={{
              ...params.InputProps,
              // Conditionally hide the input field's text entry area (not the tags or the full Autocomplete)
              /* inputProps: {
                ...params.inputProps,
                style: { 
                  display: selectedFiltersForAutocomplete.length > 0 || disableAutocomplete ? 'none' : 'block' 
                },
              }, */
            }}
            sx={{
              backgroundColor: theme => theme.palette.mode === 'light' ? '#f7f7f7' : '#424242', // Lighter background for input field
              '& .MuiInputBase-input::placeholder': {
                color: theme => theme.palette.text.primary, // Darker example text
                opacity: 0.8,
              },
              '& .MuiAutocomplete-popupIndicator': {
                display: disableAutocomplete ? 'none' : 'flex', // Hide arrow if no options or all selected
                color: theme => theme.palette.text.primary,
                fontWeight: 'bold', // Increase prominence of downward arrow
              },
            }}
          />
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        sx={{ width: 'auto' }}
        onBlur={() => {
          applyFilters();
        }}
      />
    )}
  </>
  
  );
}
