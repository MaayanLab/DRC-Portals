"use client";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { v4 } from "uuid";

import { ROW_SPACING } from "../../constants/advanced-search";
import {
  SchemaSearchPath,
  SelectedPathElement,
} from "../../interfaces/schema-search";
import { SearchBarOption } from "../../types/schema-search";
import { getSchemaSearchValue } from "../../utils/advanced-search";

import SchemaSearchFormRow from "./SchemaSearchFormRow";
import SettingsPropertyForm from "./SettingsPropertyForm";

const ENTITY_DETAILS_WIDTH = 4;
const PATH_LIST_WIDTH = 12;

export default function SchemaSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState<SchemaSearchPath[]>(
    getSchemaSearchValue(searchParams) || []
  );
  const [selectedElement, setSelectedElement] =
    useState<SelectedPathElement | null>(null);

  const handleSubmit = () => {
    const query = btoa(JSON.stringify(value));
    router.push(`/data/c2m2/graph/search?schema_q=${query}`);
  };

  const updatePath = (index: number) => (newValue: SchemaSearchPath) => {
    const updatedValue = [...value];
    updatedValue[index] = newValue;
    setValue(updatedValue);
    setSelectedElement(null);
  };

  const deletePath = (index: number) => () => {
    const updatedValue = [...value];
    updatedValue.splice(index, 1);
    setValue(updatedValue);
    setSelectedElement(null);
  };

  const handleAddPath = () => {
    const updatedValue = [...value];
    updatedValue.push({ id: v4(), elements: [], skip: 0, limit: 10 });
    setValue(updatedValue);
    setSelectedElement(null);
  };

  const handleElementSelected = (
    element: SearchBarOption,
    elementIdx: number,
    pathIdx: number
  ) => {
    setSelectedElement({ element, elementIdx, pathIdx });
  };

  const handleElementUpdated = (updatedElement: SearchBarOption) => {
    if (selectedElement !== null) {
      const updatedValue = [...value];
      const updatedPathElements = [
        ...updatedValue[selectedElement.pathIdx].elements,
      ];
      updatedPathElements[selectedElement.elementIdx] = { ...updatedElement };
      updatedValue[selectedElement.pathIdx] = {
        ...updatedValue[selectedElement.pathIdx],
        elements: updatedPathElements,
      };
      setValue(updatedValue);
    }
  };

  return (
    <Grid container rowSpacing={ROW_SPACING}>
      <Grid
        item
        spacing={2}
        xs={
          selectedElement !== null
            ? PATH_LIST_WIDTH - ENTITY_DETAILS_WIDTH
            : PATH_LIST_WIDTH
        }
        sx={{ height: "640px" }}
      >
        <Box sx={{ height: "inherit", overflowY: "auto" }}>
          <Typography variant="h4" color="secondary">
            Find results by adding search paths...
          </Typography>
          {value.map((path, index) => (
            <SchemaSearchFormRow
              key={`schema-search-form-row-${path.id}`}
              value={path}
              onChange={updatePath(index)}
              onDelete={deletePath(index)}
              onElementSelected={(element, elementIdx) =>
                handleElementSelected(element, elementIdx, index)
              }
            ></SchemaSearchFormRow>
          ))}
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
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
              onClick={handleAddPath}
            >
              Add a path
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row-reverse",
              padding: 1,
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
        </Box>
      </Grid>
      {selectedElement === null ? null : (
        <Grid item xs={ENTITY_DETAILS_WIDTH} sx={{ height: "inherit" }}>
          <Paper
            sx={{
              background:
                "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)",
              height: "100%",
              width: "100%",
              padding: "12px 24px",
              overflow: "auto",
            }}
            elevation={0}
          >
            <div className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 mb-2">
              <Typography variant="h5">Element Details</Typography>
              <IconButton onClick={() => setSelectedElement(null)}>
                <CloseIcon />
              </IconButton>
            </div>
            <SettingsPropertyForm
              value={selectedElement.element}
              liftValue={handleElementUpdated}
            ></SettingsPropertyForm>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
