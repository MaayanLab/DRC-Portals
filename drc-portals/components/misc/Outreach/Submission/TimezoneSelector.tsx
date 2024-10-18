import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
const timezones = [
    { value: 'ET -5', label: 'North America - Eastern Time (ET)', name: 'America/New_York' },
    { value: 'CT -6', label: 'North America - Central Time (CT)', name: 'America/Chicago' },
    { value: 'MT -7', label: 'North America - Mountain Time (MT)', name: 'America/Denver' },
    { value: 'PT -8', label: 'North America - Pacific Time (PT)', name: 'America/Los_Angeles' },
    { value: 'AKT -9', label: 'North America - Alaska Time (AKT)', name: 'America/Anchorage' },
    { value: 'HAT -10', label: 'North America - Hawaii-Aleutian Time (HAT)', name: 'Pacific/Honolulu' },
    { value: 'GMT +0', label: 'Europe - London (GMT/BST)', name: 'Europe/London' },
    { value: 'CET +1', label: 'Europe - Paris (CET/CEST)', name: 'Europe/Paris' },
    { value: 'JST +9', label: 'Asia - Tokyo (JST)', name: 'Asia/Tokyo' },
    { value: 'CST +8', label: 'Asia - China (CST)', name: 'Asia/Shanghai' },
    { value: 'GST +4', label: 'Asia - Dubai (GST)', name: 'Asia/Dubai' },
    { value: 'AEST +10', label: 'Australia - Sydney (AEST/AEDT)', name: 'Australia/Sydney' },  
];
interface TimezoneSelectorProps {
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
  }
const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ value, onChange }) => {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="timezone-select-label">Timezone *</InputLabel>
      <Select
        labelId="timezone-select-label"
        id="timezone-select"
        value={value}
        label="Timezone"
        onChange={onChange}
        required
        color='primary'
        name="entry.885048810"
      >
        {timezones.map((tz) => (
          <MenuItem key={tz.value} value={tz.value}>
            {tz.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default TimezoneSelector;