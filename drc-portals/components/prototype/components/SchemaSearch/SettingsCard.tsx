"use client";

import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  IconButtonProps,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChangeEvent, useEffect, useState } from "react";

import { PROPERTY_MAP } from "../../constants/neo4j";
import { DEFAULT_QUERY_SETTINGS } from "../../constants/query-builder";
import { SearchBarOption } from "../../types/query-builder";
import {
  createEntityElement,
  isRelationshipOption,
} from "../../utils/query-builder";

import SettingsPropertyForm from "./SettingsPropertyForm";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

// TODO: Could add `next` and `prev` here, which would enable us to allow the user to change the label/type of the entity.
interface SettingsCardProps {
  value: SearchBarOption;
  liftValue: (value: SearchBarOption) => void;
  deleteValue: () => void;
}

export default function SettingsCard(cmpProps: SettingsCardProps) {
  const { liftValue, deleteValue } = cmpProps;
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(cmpProps.value);
  const [element, setElement] = useState(createEntityElement(cmpProps.value));

  const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  useEffect(() => {
    setValue(cmpProps.value);
    setElement(createEntityElement(cmpProps.value));
  }, [cmpProps.value]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleNodeLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value);
    liftValue({
      ...value,
      limit: Number.isNaN(newLimit) ? 1 : newLimit,
    });
  };

  return (
    <Card sx={{ maxWidth: 600 }} variant="outlined">
      <CardActions disableSpacing>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
            {element}
          </Box>
          <IconButton
            aria-label="delete element from path"
            color="error"
            onClick={deleteValue}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {PROPERTY_MAP.has(value.name) ? (
            <SettingsPropertyForm value={value} liftValue={liftValue} />
          ) : (
            <Typography>
              This {isRelationshipOption(value) ? "relationship" : "node"} has
              no possible properties on which to filter.
            </Typography>
          )}
          {isRelationshipOption(value) ? null : (
            <Box
              sx={{
                "& .MuiFormControl-root": { m: "0.35em", width: "25ch" },
                display: "flex",
              }}
            >
              <TextField
                required
                color="secondary"
                label="Limit"
                name="limit"
                type="number"
                value={value.limit || DEFAULT_QUERY_SETTINGS.limit}
                onChange={handleNodeLimitChange}
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
              />
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
