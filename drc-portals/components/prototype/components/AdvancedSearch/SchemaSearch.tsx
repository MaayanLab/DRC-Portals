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

import { PathElement, SearchPath } from "@/lib/neo4j/types";

import { ROW_SPACING } from "../../constants/advanced-search";
import { SelectedPathElement } from "../../interfaces/schema-search";
import { getSchemaSearchValue } from "../../utils/advanced-search";

import GraphSchemaLink from "../GraphSchemaLink";

import SchemaSearchFormRow from "./SchemaSearchFormRow";
import SettingsPropertyForm from "./SettingsPropertyForm";

const ENTITY_DETAILS_WIDTH = 4;
const PATH_LIST_WIDTH = 12;

export default function SchemaSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState<SearchPath[]>(
    getSchemaSearchValue(searchParams, () => {
      console.warn("Schema search params are malformed.");
    }) || []
  );
  const [selectedElement, setSelectedElement] =
    useState<SelectedPathElement | null>(null);

  const handleSubmit = () => {
    const query = btoa(JSON.stringify(value));
    const queryParams: { [key: string]: any } = {};
    value.forEach((row) => {
      row.elements.forEach((element) => {
        element.filters.forEach((filter) => {
          queryParams[filter.paramName] = filter.value;
        });
      });
    });

    router.push(
      `/data/c2m2/graph/search?schema_q=${query}&cy_params=${btoa(
        JSON.stringify(queryParams)
      )}`
    );
  };

  const updatePath = (index: number) => (newValue: SearchPath) => {
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
    element: PathElement,
    elementIdx: number,
    pathIdx: number
  ) => {
    setSelectedElement({ element, elementIdx, pathIdx });
  };

  const shiftPath = (index: number) => (shiftUp: boolean) => {
    const updatedValue = [...value];
    const newIndex = shiftUp ? index - 1 : index + 1;

    updatedValue.splice(newIndex, 0, updatedValue.splice(index, 1)[0]);
    setValue(updatedValue);
    setSelectedElement(null);
  };

  const handleElementUpdated = (updatedElement: PathElement) => {
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
      <Grid item xs={12}>
        <Typography variant="body1">
          C2M2 Graph Schema Search allows you to easily search the C2M2 graph
          database by constructing queries without needing to write Cypher code.
          Start by using the autocomplete search bars to add nodes and
          relationships to your query. As you select a node or relationship, the
          dropdown lists will update to show only the options that are connected
          to your current selection, helping you build a valid query step by
          step.
        </Typography>
        <br />
        <Typography variant="body1">
          You can add multiple "paths" to your search, with each path building
          on the results of the previous one. If needed, you can also apply
          filters or set limits on the results for more precise searches. Once
          you're ready, simply submit your query, and the results will be
          displayed in an interactive graph. This tool helps you navigate the
          database efficiently, even if you're unfamiliar with the underlying
          graph structure. If you would like to view a represenatation of the
          graph structure, please visit the <GraphSchemaLink></GraphSchemaLink>{" "}
          page
        </Typography>
      </Grid>
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
              isFirst={index === 0}
              isLast={index === value.length - 1}
              onShift={shiftPath(index)}
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
