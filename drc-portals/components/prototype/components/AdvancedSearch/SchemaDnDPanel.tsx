"use client";

import HelpIcon from "@mui/icons-material/Help";
import { Box, Paper, Tooltip, Typography } from "@mui/material";

import {
  HELPER_TOOLTIP_SLOT_PROPS,
  NODE_HELPER_TEXT,
  RELATIONSHIP_HELPER_TEXT,
} from "../../constants/advanced-search";
import { NODE_LABELS, RELATIONSHIP_TYPES } from "../../constants/neo4j";
import { CFDE_DARK_BLUE } from "../../constants/shared";
import {
  createNodeElement,
  createRelationshipElement,
} from "../../utils/shared";

export default function SchemaDnDPanel() {
  return (
    <Paper
      sx={{
        background: "#fff",
        height: "100%",
        width: "100%",
        padding: "12px 24px",
        overflow: "auto",
      }}
      elevation={0}
    >
      <div
        className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 mb-4"
        style={{ borderColor: CFDE_DARK_BLUE }}
      >
        <Typography variant="h5" color="secondary">
          Nodes
        </Typography>
        <Tooltip
          title={NODE_HELPER_TEXT}
          arrow
          placement="right"
          slotProps={HELPER_TOOLTIP_SLOT_PROPS}
        >
          <HelpIcon color="secondary" />
        </Tooltip>
      </div>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {Array.from(NODE_LABELS).map((label) =>
          createNodeElement(label, undefined, { margin: 2 })
        )}
      </Box>
      <div
        className="flex flex-row align-middle justify-between items-center border-b border-b-slate-400 my-4"
        style={{ borderColor: CFDE_DARK_BLUE }}
      >
        <Typography variant="h5" color="secondary">
          Relationships
        </Typography>
        <Tooltip
          title={RELATIONSHIP_HELPER_TEXT}
          arrow
          placement="right"
          slotProps={HELPER_TOOLTIP_SLOT_PROPS}
        >
          <HelpIcon color="secondary" />
        </Tooltip>
      </div>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {Array.from(RELATIONSHIP_TYPES).map((type) =>
          createRelationshipElement(type, { margin: 2 })
        )}
      </Box>
    </Paper>
  );
}
