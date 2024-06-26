"use client";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { Box, Button, Grid } from "@mui/material";

import SchemaDnDPanel from "./SchemaDnDPanel";
import SchemaSearchFormRow from "./SchemaSearchFormRow";

export default function AdvancedSchemaSearch() {
  return (
    <Grid container sx={{ height: "640px" }}>
      <Grid item xs={3} sx={{ height: "inherit" }}>
        <SchemaDnDPanel></SchemaDnDPanel>
      </Grid>
      <Grid item xs={9} spacing={2} sx={{ height: "inherit" }}>
        <SchemaSearchFormRow></SchemaSearchFormRow>
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
          >
            Add a path
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row-reverse",
            width: "100%",
          }}
        >
          <Button variant="contained" color="secondary">
            Advanced Search
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
