"use client";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpIcon from "@mui/icons-material/Help";
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
  Tooltip,
  Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

import { PROPERTY_OPERATORS } from "../../constants/schema-search";
import { BasePropertyFilter } from "../../interfaces/schema-search";
import { SearchBarOption } from "../../types/schema-search";
import {
  createPropertyFilter,
  getEntityProperties,
  getPropertyOperators,
  isRelationshipOption,
} from "../../utils/schema-search";
import {
  createNodeElement,
  createRelationshipElement,
} from "../../utils/shared";

interface SettingsPropertyFormProps {
  value: SearchBarOption;
  liftValue: (value: SearchBarOption) => void;
}

const KEY_INFO =
  "Elements with identical keys will be treated as the same entity, even across paths. This is especially useful to find nodes connected to three or more relationships!";

// TODO: Need to implement dynamic property type evaluation so we can filter on number, bool, date, etc.
export default function SettingsPropertyForm(
  cmpProps: SettingsPropertyFormProps
) {
  const { liftValue } = cmpProps;
  const [value, setValue] = useState<SearchBarOption>(cmpProps.value);
  const [key, setKey] = useState(cmpProps.value.key || "");
  const [keyError, setKeyError] = useState(false);
  const [keyErrorHelpText, setKeyErrorHelpText] = useState<string | null>(null);
  const [properties, setProperties] = useState(
    getEntityProperties(cmpProps.value)
  );

  useEffect(() => {
    setValue(cmpProps.value);
    setProperties(getEntityProperties(cmpProps.value));
    setKey(cmpProps.value.key || "");
  }, [cmpProps.value]);

  const handleAddFilterClick = () => {
    const updatedValue = { ...value };
    const newFilter = createPropertyFilter(updatedValue.name);

    // Only continue if we could create a new filter
    if (newFilter !== undefined) {
      updatedValue.filters.push(newFilter);
      liftValue(updatedValue);
      setValue(updatedValue);
    } else {
      console.warn(`Could not create filter for entity ${value.name}!`);
    }
  };

  const updateKey = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("updateKey");
    setKey(event.target.value);

    if (!/^[A-Za-z]/.test(event.target.value)) {
      setKeyError(true);
      setKeyErrorHelpText("Keys must start with a letter.");
    } else if (!/^[A-Za-z0-9_]+$/.test(event.target.value)) {
      setKeyError(true);
      setKeyErrorHelpText(
        "Keys must only contain alphanumerics and underscores."
      );
    } else {
      setKeyError(false);
      setKeyErrorHelpText(null);

      const updatedValue = { ...value };
      updatedValue.key = event.target.value;
      liftValue(updatedValue);
      setValue(updatedValue);
    }
  };

  const deleteFilter = (index: number) => () => {
    const updatedValue = { ...value };
    updatedValue.filters.splice(index, 1);
    liftValue(updatedValue);
    setValue(updatedValue);
  };

  const updateFilter = (index: number, update: Partial<BasePropertyFilter>) => {
    const updatedValue = { ...value };
    updatedValue.filters[index] = {
      ...updatedValue.filters[index],
      ...update,
    };
    liftValue(updatedValue);
    setValue(updatedValue);
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

  return (
    <Box component="form">
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", marginBottom: 1 }}>
          {isRelationshipOption(value) ? (
            <>
              <Typography sx={{ alignContent: "center", marginRight: 1 }}>
                Relationship Type:
              </Typography>
              {createRelationshipElement(value.name)}
            </>
          ) : (
            <>
              <Typography sx={{ alignContent: "center", marginRight: 1 }}>
                Node Label:
              </Typography>
              {createNodeElement(value.name)}
            </>
          )}
        </Box>
        {isRelationshipOption(value) ? null : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  alignContent: "center",
                  marginRight: 1,
                  paddingTop: "16.5px",
                }}
              >
                Element Key:
              </Typography>
            </Box>
            <TextField
              id="settings-prop-form-key-field"
              color="secondary"
              label="Key"
              variant="outlined"
              error={keyError}
              helperText={keyErrorHelpText}
              value={key}
              sx={{ maxWidth: "202px" }}
              inputProps={{ sx: { backgroundColor: "#fff" } }}
              onChange={updateKey}
            />
            <Box sx={{ paddingTop: "16.5px" }}>
              <Tooltip title={KEY_INFO} arrow placement="top">
                <HelpIcon color="secondary" />
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
      {properties?.length ? (
        <>
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
                  sx={{ backgroundColor: "#fff" }}
                  value={filter.value}
                  onChange={updateFilterValue(filterIdx)}
                />
                <Box sx={{ alignContent: "center" }}>
                  <IconButton
                    aria-label="delete filter from element"
                    color="error"
                    onClick={deleteFilter(filterIdx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
          <Box
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              marginY: 1,
            }}
          >
            <Button
              color="secondary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              sx={{
                "&.MuiButtonBase-root:hover": {
                  bgcolor: "transparent",
                },
                padding: 0,
                textTransform: "none",
              }}
              onClick={handleAddFilterClick}
            >
              Add a property filter
            </Button>
          </Box>
        </>
      ) : (
        <Typography>
          This {isRelationshipOption(value) ? "relationship" : "node"} has no
          possible properties on which to filter.
        </Typography>
      )}
    </Box>
  );
}
