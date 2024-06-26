import { Box, TextField } from "@mui/material";

import useGraphSearchBehavior from "../../hooks/graph-search";
import { SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS } from "../../constants/advanced-search";
import SchemaAutocomplete from "../SchemaSearch/SchemaAutocomplete";

export default function SchemaSearchFormRow() {
  const { error, loading, clearSearchError } = useGraphSearchBehavior();

  const handleSubmit = () => {
    console.log("SchemaAutocomplete submitted!");
  };

  return (
    <Box display={{ display: "flex", width: "100%" }}>
      <Box sx={{ flexGrow: 1, margin: 1 }}>
        <SchemaAutocomplete
          state={undefined}
          error={error}
          loading={loading}
          clearError={clearSearchError}
          onSubmit={handleSubmit}
        ></SchemaAutocomplete>
      </Box>
      <TextField
        color="secondary"
        label="Limit"
        name="limit"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{ inputProps: { min: 1, max: 1000 } }}
      ></TextField>
      <TextField
        color="secondary"
        label="Skip"
        name="skip"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{ inputProps: { min: 1 } }}
      ></TextField>
    </Box>
  );
}
