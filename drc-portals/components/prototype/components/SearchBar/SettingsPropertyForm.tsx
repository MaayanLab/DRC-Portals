"use client";

import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import { ChangeEvent, useEffect, useState } from "react";

import { PROPERTY_OPERATORS } from "../../constants/search-bar";
import {
  BasePropertyFilter,
  SearchBarOption,
} from "../../interfaces/search-bar";
import {
  createPropertyFilter,
  getEntityProperties,
  getPropertyOperators,
  isRelationshipOption,
} from "../../utils/search-bar";

export interface SettingsPropertyFormProps {
  value: SearchBarOption;
  liftValue: (value: SearchBarOption) => void;
}

// TODO: Need to implement dynamic property type evaluation so we can filter on number, bool, date, etc.
export default function SettingsPropertyForm(
  cmpProps: SettingsPropertyFormProps
) {
  const { liftValue } = cmpProps;
  const [value, setValue] = useState(cmpProps.value);
  const [properties, setProperties] = useState(
    getEntityProperties(cmpProps.value)
  );

  useEffect(() => {
    setValue(cmpProps.value);
    setProperties(getEntityProperties(cmpProps.value));
  }, [cmpProps.value]);

  const handleAddFilterClick = () => {
    const updatedValue = { ...value };
    const newFilter = createPropertyFilter(updatedValue.name);

    // Only continue if we could create a new filter
    if (newFilter !== undefined) {
      updatedValue.filters.push(newFilter);
      liftValue(updatedValue);
    } else {
      console.warn(`Could not create filter for entity ${value.name}!`);
    }
  };

  const deleteFilter = (index: number) => () => {
    const updatedValue = { ...value };
    updatedValue.filters.splice(index, 1);
    liftValue(updatedValue);
  };

  const updateFilter = (index: number, update: Partial<BasePropertyFilter>) => {
    const updatedValue = { ...value };
    updatedValue.filters[index] = {
      ...updatedValue.filters[index],
      ...update,
    };
    liftValue(updatedValue);
  };

  const updateFilterProperty =
    (index: number) => (event: SelectChangeEvent<string>) => {
      updateFilter(index, {
        // TODO: consider that the value may need to change if the new property is a different type (i.e., string to bool)
        name: event.target.value,
        operator: (PROPERTY_OPERATORS.get(event.target.value) as string[])[0],
      });
    };

  const updateFilterOperator =
    (index: number) => (event: SelectChangeEvent<string>) => {
      updateFilter(index, {
        operator: event.target.value,
      });
    };

  const updateFilterValue =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      updateFilter(index, {
        value: event.target.value,
      });
    };

  return properties?.length ? (
    <Box component="form">
      <Button
        color="secondary"
        startIcon={<AddCircleOutlineRoundedIcon />}
        sx={{
          "&.MuiButtonBase-root:hover": {
            bgcolor: "transparent",
          },
          marginBottom: "0.75em",
          padding: 0,
          textTransform: "none",
        }}
        onClick={handleAddFilterClick}
      >
        Add a property filter
      </Button>
      {value.filters?.map((filter, filterIdx) => {
        return (
          <Box
            key={filterIdx}
            sx={{
              "& .MuiFormControl-root": { m: "0.35em", width: "25ch" },
              display: "flex",
            }}
          >
            <FormControl>
              <InputLabel color="secondary" htmlFor="component-outlined">
                Property
              </InputLabel>
              <Select
                labelId={`name-label-${filterIdx}`}
                id={`name-select-${filterIdx}`}
                color="secondary"
                label="Property"
                value={filter.name}
                onChange={updateFilterProperty(filterIdx)}
              >
                {properties.map((prop, propIdx) => (
                  <MenuItem
                    key={`filter-${filterIdx}-property-${propIdx}`}
                    value={prop}
                  >
                    {prop}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel color="secondary" htmlFor="component-outlined">
                Operator
              </InputLabel>
              <Select
                labelId={`operator-label-${filterIdx}`}
                id={`operator-select-${filterIdx}`}
                color="secondary"
                label="Operator"
                value={filter.operator}
                onChange={updateFilterOperator(filterIdx)}
              >
                {getPropertyOperators(filter.name).map(
                  (operator, operatorIdx) => (
                    <MenuItem
                      key={`filter-${filterIdx}-operator-${operatorIdx}`}
                      value={operator}
                    >
                      {operator}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            <TextField
              id={`value-${filterIdx}`}
              color="secondary"
              label="Value"
              variant="outlined"
              onChange={updateFilterValue(filterIdx)}
              value={filter.value}
            />
            <IconButton
              aria-label="delete filter from element"
              color="error"
              onClick={deleteFilter(filterIdx)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  ) : (
    <Typography>
      This {isRelationshipOption(value) ? "relationship" : "node"} has no
      possible properties on which to filter.
    </Typography>
  );
}
