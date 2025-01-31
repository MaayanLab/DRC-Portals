"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { CytoscapeNodeData } from "../interfaces/cy";
import { createNodeLabels, createNodeProperties } from "../utils/cy";

interface GraphEntityDetailsContainerProps {
  entityDetails: CytoscapeNodeData;
  onCloseDetails: () => void;
}

export default function GraphEntityDetails(
  cmpProps: GraphEntityDetailsContainerProps
) {
  const { onCloseDetails } = cmpProps;
  const [entityDetails, setEntityDetails] = useState(cmpProps.entityDetails);

  useEffect(() => {
    setEntityDetails(cmpProps.entityDetails);
  }, [cmpProps.entityDetails]);

  return (
    <Paper
      sx={{
        background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)",
        height: "100%",
        width: "100%",
        padding: "12px 24px",
        overflow: "auto",
      }}
      elevation={0}
    >
      {/* Need align-items: center */}
      <div className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 mb-4">
        <Typography variant="h5">Entity Details</Typography>
        <IconButton onClick={onCloseDetails}>
          <CloseIcon />
        </IconButton>
      </div>
      <Box sx={{ overflow: "auto" }}>
        {entityDetails.neo4j === undefined ? (
          <Typography>No details available to show.</Typography>
        ) : (
          <>
            {entityDetails.neo4j.labels === undefined ? (
              <Typography>No labels found on this node.</Typography>
            ) : (
              createNodeLabels(entityDetails)
            )}
            {entityDetails.neo4j.properties === undefined ? (
              <Typography>No properties found on this node.</Typography>
            ) : (
              createNodeProperties(entityDetails, { variant: "body2" })
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
