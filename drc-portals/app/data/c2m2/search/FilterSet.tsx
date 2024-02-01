'use client'
import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useSearchParams } from "next/navigation";
import SearchFilter from "./SearchFilter";


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FilterObject = {
  id: string;
  name: string;
  count: number;
};


export default function FilterSet({ id, filterList, filter_title }: { id: string, filterList: FilterObject[], filter_title: string }) {
  console.log("Length of filterList passed")
  console.log(filterList.length)
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={filterList}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      renderOption={(props, option: FilterObject, { selected }) => (
        <SearchFilter id={`${id}:${option.name}`} count={option.count} label={option.id} />
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

