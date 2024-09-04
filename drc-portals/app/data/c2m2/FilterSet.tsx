'use client'
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { styled, lighten, darken } from '@mui/system';
import Chip from '@mui/material/Chip';
import { useRouter, useSearchParams } from 'next/navigation';

export type FilterObject = {
  id: string;
  name: string;
  count: number;
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterObject[]>([]);
  const [filterIndex, setFilterIndex] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedFiltersForAutocomplete, setSelectedFiltersForAutocomplete] = useState<FilterObject[]>([]);

  const options = filterList.map((option) => {
    //  console.log(option);
    const firstLetter = option.name[0].toUpperCase();
    const filterCount = option.count;
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      ...option,
    };
  });

  /* // Load selected filters from localStorage when component mounts
  useEffect(() => {
    const storedFilters = localStorage.getItem('selectedFilters');
    if (storedFilters) {
      setSelectedFilters(JSON.parse(storedFilters));
      setSelectedFiltersForAutocomplete(JSON.parse(storedFilters));
    }
  }, []); */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    // Filter out selected filters from URL parameters
    const updatedSelectedFilters = filterList.filter(filter => {
      return currentFilters.includes(`${id}:${filter.name}`);
    });

    setSelectedFilters(updatedSelectedFilters);
    setSelectedFiltersForAutocomplete(updatedSelectedFilters);
  }, [filterList, id]);

  // Save selected filters to localStorage when selectedFilters state changes
  useEffect(() => {
    localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
    setSelectedFiltersForAutocomplete(selectedFilters);
  }, [selectedFilters]);

  // Function to generate filter index
  const generateFilterIndex = () => {
    const index = new Set<string>();
    filterList.forEach(filter => {
      index.add(filter.name.charAt(0).toUpperCase());
    });
    return Array.from(index);
  };

  // Check if filterList exceeds 50, then generate filter index
  if (filterList.length > 50 && filterIndex.length === 0) {
    setFilterIndex(generateFilterIndex());
  }

  // Apply filters logic
  /* const applyFilters = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    // Transform the current filters into a more manageable structure
    const structuredFilters = currentFilters.map(filter => {
      const [type, value] = filter.split(':');
      return { type, value };
    });

    // Determine which filters should be updated or removed
    let updatedFilters = structuredFilters.filter(structuredFilter => {
      // Find if the current structured filter's value is not in the selected filters
      return !selectedFilters.map(filter => filter.name).includes(structuredFilter.value);
    }).map(filteredItem => `${filteredItem.type}:${filteredItem.value}`);

    // Add new filters
    selectedFilters.forEach(filter => {
      const existingFilter = structuredFilters.find(f => f.value === filter.name);
      if (!existingFilter) {
        // Update this line to use the appropriate type for the new filter
        // You might need additional logic here to determine the correct type
        updatedFilters.push(`${id}:${filter.name}`);
      }
    });

    searchParams.set('t', updatedFilters.join('|'));
    searchParams.set('p', '1'); // Reset pagination to page 1
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.location.href = newUrl; // Change the URL and reload the page
  };
 */

  // Apply filters logic
  const applyFilters = () => {
    const searchParams = new URLSearchParams(window.location.search);
    // At this point rest the C2M2MainSearchTbl_p needs to be removed to fix Issue #325
    searchParams.delete('C2M2MainSearchTbl_p');
    const currentRawFilters = searchParams.get('t');
    const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];

    // Filter out existing filters for the current id, keeping all others intact
    const otherFilters = currentFilters.filter(filter => !filter.startsWith(`${id}:`));

    // Prepare new filters for the current id
    const newFiltersForCurrentId = selectedFilters.map(filter => `${id}:${filter.name}`);

    // Combine other filters with new filters for the current id
    const updatedFilters = [...otherFilters, ...newFiltersForCurrentId];

    searchParams.set('t', updatedFilters.join('|'));
    searchParams.set('p', '1'); // Reset pagination to page 1
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl); // Change the URL and reload the page
  };


  // Function to filter options based on selected letter
  const getFilteredOptions = () => {
    if (!selectedLetter) {
      return filterList;
    } else {
      return filterList.filter(filter => filter.name.charAt(0).toUpperCase() === selectedLetter);
    }
  };

  // Function to chunk array into smaller arrays
  const chunkArray = (array: string[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  // Chunk the filterIndex into rows
  const indexRows = chunkArray(filterIndex, 8);

  return (
    <>
      <div>{filter_title}</div>
      <Autocomplete
        // size='small'
        multiple
        autoComplete
        disableCloseOnSelect
        limitTags={3}
        id="filterSet"
        options={options
          .filter(option => !selectedFiltersForAutocomplete.some(filter => filter.id === option.id)) // Filter out already selected options
          .sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))
        }
        noOptionsText="" // This will hide the "No options" text
        freeSolo={options.length > selectedFilters.length} // Disable free text input when all options are selected
        groupBy={(option) => getFirstLetter(option)}
        getOptionLabel={(option) => `${option.name} `} //(${option.count >= maxCount ? `${maxCount}+` : option.count}) put this back for count
        value={selectedFiltersForAutocomplete}
        onChange={(event, newValue) => {
          setSelectedFilters(newValue as FilterObject[]);
          console.log(
            "SELECTED FILTERS :::::::::::::::::::::::::::::::::::::::::::::::::::::::", selectedFilters
          )
          // Call applyFilters function when filters are selected or deselected
          // applyFilters;
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option.name}
              size="medium"
              {...getTagProps({ index })}
              onDelete={undefined}
            />
          ))
        }
        renderInput={(params) => <TextField {...params} size='small' placeholder={example_query} />}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        sx={{ width: 'auto' }}
        onBlur={() => {
          // Reload the page when focus is removed from the Autocomplete component

          applyFilters();
        }}
        disabled={options.length === 0}
      // value={selectedFiltersForAutocomplete}
      // onChange={(event, newValue) => {
      //   setSelectedFilters(newValue as FilterObject[]); // Handle selection changes
      // }}
      // value={selectedFilters} // Bind selected filters to the value prop
      // onChange={handleFilterSelection} // Attach event handler for filter selection
      />
    </>

  );
}