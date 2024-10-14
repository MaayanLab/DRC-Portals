import React, { useEffect, useState } from 'react';
import { Box, Checkbox, FormControl, FormHelperText, FormLabel, Typography } from '@mui/material';
interface Option {
  value: string;
  label: string;
}
interface CheckboxGridProps {
  options: Option[];
  fieldName: string;
  value: string | string[];
  onChange: (fieldName: string, value: string | string[]) => void;
  columns?: number;
  label: string;
  multiple?: boolean;
  required?: boolean;
}

const CheckboxGrid: React.FC<CheckboxGridProps> = ({
  options,
  fieldName,
  value,
  onChange,
  columns = 5,
  label,
  multiple = false,
  required = false,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : [value as string]) : [value as string]
  );

  const [touched, setTouched] = useState(false);
  useEffect(() => {
    setSelectedValues(
      multiple ? (Array.isArray(value) ? value : [value as string]) : [value as string]
    );
  }, [value, multiple]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const isChecked = event.target.checked;
    let updatedValues: string[];
    if (multiple) {
      updatedValues = isChecked
        ? [...selectedValues, newValue]
        : selectedValues.filter(v => v !== newValue);
    } else {
      updatedValues = [newValue];
    }
    setSelectedValues(updatedValues);
    setTouched(true);
    onChange(fieldName, multiple ? updatedValues : updatedValues[0]);
  };

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);
  const showError = required && touched && selectedValues.length === 0;

  return (
    <FormControl component="fieldset" className="w-full" required={required} error={showError}>
      <Box className="flex align-text-bottom">
        <FormLabel component="legend" className="mb-2 flex items-end">
          <Typography variant="h6">
            {label}
          </Typography>
          {!required && (
            <Typography
              variant='caption'
              className="ml-4"
              style={{ marginBottom: 1, marginLeft: 4 }}
            >
              (If applicable)
            </Typography>
          )}
        </FormLabel>
        <Box mt={1}>
          {required && !touched && (
            <FormHelperText error>This field is required</FormHelperText>
          )}
        </Box>
      </Box>
      <div
        className="flex flex-wrap grid-cols-${columns} gap-4 max-w-fit mx-auto"
        style={{ maxWidth: `${columns * 200}px` }}
      >
        {options.map(({ value, label }) => (
          <label key={value} className=" space-x-2 whitespace-nowrap">
            <Checkbox
              checked={isSelected(value)}
              onChange={handleCheckboxChange}
              value={value}
              color="secondary"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </FormControl>
  );
};
export default CheckboxGrid;