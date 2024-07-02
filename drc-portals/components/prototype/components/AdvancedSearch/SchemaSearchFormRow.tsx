import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, TextField } from "@mui/material";
import { ChangeEvent } from "react";

import { SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS } from "../../constants/advanced-search";
import { SchemaSearchPath } from "../../interfaces/schema-search";
import { SearchBarOption } from "../../types/schema-search";

import SchemaAutocomplete from "./SchemaAutocomplete";

interface SchemaSearchFormRowProps {
  value: SchemaSearchPath;
  onChange: (value: SchemaSearchPath) => void;
  onDelete: () => void;
}

export default function SchemaSearchFormRow(
  cmpProps: SchemaSearchFormRowProps
) {
  const { value, onChange, onDelete } = cmpProps;

  const onAutocompleteChange = (newElements: SearchBarOption[]) => {
    onChange({
      ...value,
      elements: newElements,
    });
  };

  const onLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value);
    onChange({
      ...value,
      limit: Number.isNaN(newLimit) ? 1 : newLimit,
    });
  };

  const onSkipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSkip = parseInt(event.target.value);
    onChange({
      ...value,
      skip: Number.isNaN(newSkip) ? 1 : newSkip,
    });
  };

  return (
    <Box display={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={{ flexGrow: 1, margin: 1, maxWidth: "630px" }}>
        <SchemaAutocomplete
          value={value.elements}
          onChange={onAutocompleteChange}
        ></SchemaAutocomplete>
      </Box>
      <TextField
        value={value.limit}
        color="secondary"
        label="Limit"
        name="limit"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{
          sx: {
            backgroundColor: "#fff",
          },
          inputProps: { min: 1, max: 1000 },
        }}
        onChange={onLimitChange}
      ></TextField>
      <TextField
        value={value.skip}
        color="secondary"
        label="Skip"
        name="skip"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{
          sx: {
            backgroundColor: "#fff",
          },
          inputProps: { min: 1 },
        }}
        onChange={onSkipChange}
      ></TextField>
      <Box sx={{ alignContent: "center" }}>
        <IconButton aria-label="delete path" color="error" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
