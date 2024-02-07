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
import Link from 'next/link'


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FilterObject = {
  id: string;
  name: string;
  count: number;
};

export default function FilterSet({ id, filterList, filter_title }: { id: string, filterList: FilterObject[], filter_title: string }) {
  const rawSearchParams = useSearchParams()
  const { searchParams } = React.useMemo(() => {
    const searchParams = new URLSearchParams(rawSearchParams)
    return { searchParams }
  }, [rawSearchParams]);
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={filterList}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      value={[]} // Initialize with an empty array
      onChange={(event, newValue: FilterObject[]) => {

        newValue.forEach(option => {
          const currentRawFilters = searchParams.get('t');
          const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];
          const currentFilterSet = currentFilters.includes(option.id);
          const newFilters = currentFilterSet ? currentFilters.filter(t => t !== option.id) : [...currentFilters, option.id];
          searchParams.set('t', newFilters.join('|'));
          searchParams.set('p', '1');
        });
        // Navigate to the updated URL with the selected filters
        window.location.href = `?${searchParams.toString()}`;
      }}
      renderOption={(props, option: FilterObject) => (
        <FormControlLabel
          control={
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              onChange={() => { }}
            />
          }
          label={<Typography variant='body2' color='secondary'>{option.id} ({option.count.toLocaleString()})</Typography>}
        />
      )}
      style={{ width: 'auto' }}
      renderInput={(params) => (
        <TextField {...params} label={filter_title} placeholder={filter_title} />
      )}
    />
  );
}

/* export default function FilterSet({ id, filterList, filter_title }: { id: string, filterList: FilterObject[], filter_title: string }) {
  console.log("Length of filterList passed")
  console.log(filterList.length)



  const [selectedItems, setSelectedItems] = useState<FilterObject[]>([]);

  const handleToggleItem = (filt: FilterObject) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(filt)) {
        return prevSelectedItems.filter(item => item !== filt);
      } else {
        return [...prevSelectedItems, filt];
      }
    });
  };*/
/* const rawSearchParams = useSearchParams()
const { searchParams, currentFilterSet } = React.useMemo(() => {
  const searchParams = new URLSearchParams(rawSearchParams)
  const currentRawFilters = searchParams.get('t')
  const currentFilters = currentRawFilters ? currentRawFilters.split('|') : []
  const currentFilterSet = currentFilters.includes(id)
  const newFilters = currentFilterSet ? currentFilters.filter(t => t !== id) : [...currentFilters, id]
  searchParams.set('t', newFilters.join('|'))
  searchParams.set('p', '1')
  return { searchParams, currentFilterSet }
}, [id, rawSearchParams]) */
/*const rawSearchParams = useSearchParams();
const { searchParams } = React.useMemo(() => {
  const searchParams = new URLSearchParams(rawSearchParams);
  return { searchParams };
}, [rawSearchParams]);

return (
  <Autocomplete
    multiple
    id="checkboxes-tags-demo"
    options={filterList}
    disableCloseOnSelect
    getOptionLabel={(option) => option.name}
    value={selectedItems}
    onChange={(event, newValue) => {
      setSelectedItems(newValue);
    }}
    renderOption={(props, option: FilterObject) => {
      const currentRawFilters = searchParams.get('t');
      const currentFilters = currentRawFilters ? currentRawFilters.split('|') : [];
      const currentFilterSet = currentFilters.includes(option.id);
      const newFilters = currentFilterSet ? currentFilters.filter(t => t !== option.id) : [...currentFilters, option.id]
      searchParams.set('t', newFilters.join('|'))
      searchParams.set('p', '1')

      return (
        <Link href={`?${searchParams.toString()}`}>
          <FormControlLabel
            control={
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}

                onChange={() => handleToggleItem(option)}
              />
            }
            label={<Typography variant='body2' color='secondary'>{option.id} ({option.count.toLocaleString()})</Typography>}
            checked={currentFilterSet}
          />
        </Link>
      );
    }}
    style={{ width: 'auto' }}
    renderInput={(params) => (
      <TextField {...params} label={filter_title} placeholder={filter_title} />
    )}
  />
);
} 



/* export default function FilterSet({ id, filterList, filter_title }: { id: string, filterList: FilterObject[], filter_title: string }) {
  console.log("Length of filterList passed")
  console.log(filterList.length)
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={filterList}
      disableCloseOnSelect
      //getOptionLabel={(option) => option.name}
      // <Link href={`?${searchParams.toString()}`}>
      //<FormControlLabel control={<Checkbox />} label={<Typography variant='body2' color='secondary'>{label} ({count.toLocaleString()})</Typography>} checked={currentfilterListet} />
      //</Link>
      renderOption={(props, option, { selected }) => (
        <li>
          {filterList.map((filt) =>
            <SearchFilter key={`${id}-${filt.name}`} id={`${id}:${filt.name}`} count={filt.count} label={filt.name} />
          )}
        </li>
      )}
      style={{ width: 'auto' }}
      renderInput={(params) => (
        <TextField {...params} label={filter_title} placeholder={filter_title} />
      )}
    />
  );
} */

