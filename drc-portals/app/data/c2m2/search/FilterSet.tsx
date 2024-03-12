'use client'
import * as React from 'react';
import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useSearchParams } from "next/navigation";
import SearchFilter from "./SearchFilter";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionDetails } from '@mui/material';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FilterObject = {
  id: string;
  name: string;
  count: number;
};

export default function FilterSet({ id, filterList, filter_title, example_query }: { id: string, filterList: FilterObject[], filter_title: string, example_query: string }) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Function to handle accordion expansion
  const handleChange = (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : null);
  };

  // Ref to the accordion div for click outside detection
  const accordionRef = React.useRef<HTMLDivElement>(null);

  // Click outside handler
  const handleClickOutside = (event: MouseEvent) => {
    if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
      setExpanded(null);
    }
  };

  // Effect to add and remove click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get unique starting letters for pagination
  const startingLetters = Array.from(new Set(filterList.map(filter => filter.name[0].toUpperCase())));

  // Filter the list based on selected starting letter
  const filteredList = selectedLetter ? filterList.filter(filter => filter.name.toUpperCase().startsWith(selectedLetter)) : filterList;

  return (
    <div ref={accordionRef}>
      <Accordion expanded={expanded === filter_title} onChange={handleChange(filter_title)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{filter_title+" ("+filterList.length+")"}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {filterList.length > 50 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
              {startingLetters.map(letter => (
                <button key={letter} onClick={() => setSelectedLetter(letter)} style={{ marginRight: '10px', marginBottom: '10px' }}>{letter}</button>
              ))}
            </div>
          )}
          <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={filteredList}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            renderOption={(props, option: FilterObject, { selected }) => (
              <SearchFilter id={`${id}:${option.name}`} count={option.count} label={option.id} />
            )}
            style={{ width: 'auto' }}
            renderInput={(params) => (
              <TextField {...params} placeholder={example_query} />
            )}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
