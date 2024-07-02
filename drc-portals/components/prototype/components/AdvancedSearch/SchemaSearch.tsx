"use client";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { Box, Button, Grid } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { v4 } from "uuid";

import { SchemaSearchPath } from "../../interfaces/schema-search";
import { getSchemaSearchValue } from "../../utils/advanced-search";

import SchemaDnDPanel from "./SchemaDnDPanel";
import SchemaSearchFormRow from "./SchemaSearchFormRow";

export default function SchemaSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState<SchemaSearchPath[]>(
    getSchemaSearchValue(searchParams) || []
  );

  const handleSubmit = () => {
    // Before submitting, make sure every element without a key is given a unique key
    value.forEach((path) =>
      path.elements.forEach((element) => {
        if (element.key === undefined) {
          element.key = v4();
        }
      })
    );

    const query = btoa(JSON.stringify(value));
    router.push(`/data/c2m2/graph/search?schema_q=${query}`);
  };

  const updatePath = (index: number) => (newValue: SchemaSearchPath) => {
    const updatedValue = [...value];
    updatedValue[index] = newValue;
    setValue(updatedValue);
  };

  const deletePath = (index: number) => () => {
    const updatedValue = [...value];
    updatedValue.splice(index, 1);
    setValue(updatedValue);
  };

  const handleAddPath = () => {
    const updatedValue = [...value];
    updatedValue.push({ elements: [], skip: 0, limit: 10 });
    setValue(updatedValue);
  };

  return (
    <Grid container sx={{ height: "640px" }}>
      <Grid item xs={3} sx={{ height: "inherit" }}>
        <SchemaDnDPanel></SchemaDnDPanel>
      </Grid>
      <Grid
        item
        xs={9}
        spacing={2}
        sx={{ height: "inherit", overflowY: "auto" }}
      >
        {value.map((path, index) => (
          <SchemaSearchFormRow
            key={`schema-search-form-row-${index}`}
            value={path}
            onChange={updatePath(index)}
            onDelete={deletePath(index)}
          ></SchemaSearchFormRow>
        ))}
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
            onClick={handleAddPath}
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
          {value.length > 0 ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
            >
              Advanced Search
            </Button>
          ) : null}
        </Box>
      </Grid>
    </Grid>
  );
}
