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

type FilterObject = {
  id: string;
  name: string;
  count: number;
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function FilterSet({ id, filterList, filter_title, example_query }: { id: string, filterList: FilterObject[], filter_title: string, example_query: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterObject[]>([]);
  const [filterIndex, setFilterIndex] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedFiltersForAutocomplete, setSelectedFiltersForAutocomplete] = useState<FilterObject[]>([]);

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
  window.location.href = newUrl; // Change the URL and reload the page
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
    <div>
      <Accordion expanded={expanded === filter_title} onChange={(event, isExpanded) => setExpanded(isExpanded ? filter_title : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{`${filter_title} (${filterList.length})`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {filterList.length > 50 && (
            <div>
              {indexRows.map((row, index) => (
                <div key={index} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {row.map(letter => (
                    <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    style={{
                      marginRight: '10px',
                      marginBottom: '10px',
                      color: selectedLetter === letter ? 'blue' : 'inherit', // Change text color to red if selected
                      textDecoration: selectedLetter === letter ? 'underline' : 'none', // Underline if selected

                    }}
                  >
                    {letter}
                  </button>
                  
                  ))}
                </div>
              ))}
            </div>
          )}
          <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={getFilteredOptions()}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            value={selectedFiltersForAutocomplete}
            onChange={(event, newValue) => {
              setSelectedFilters(newValue as FilterObject[]); // Handle selection changes
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} />
                {`${option.id} (${option.count})`}
              </li>
            )}
            style={{ width: 'auto' }}
            renderInput={(params) => (
              <TextField {...params} placeholder={example_query} />
            )}
            renderTags={() => null} // Disable rendering of tags
          />

          <Button onClick={applyFilters} variant="contained" style={{ marginTop: '10px' }}>
            Update
          </Button>
        </AccordionDetails>
      </Accordion>
    </div >
  );
}
