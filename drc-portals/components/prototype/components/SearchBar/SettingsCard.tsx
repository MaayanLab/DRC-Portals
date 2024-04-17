import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  IconButtonProps,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";

import { SearchBarOption } from "../../interfaces/search-bar";
import { createEntityElement, isRelationshipOption } from "../../utils/search-bar";
import {
  PROPERTY_MAP,
} from "../../constants/neo4j";

import SettingsPropertyForm from "./SettingsPropertyForm";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

// TODO: Could add `next` and `prev` here, which would enable us to allow the user to change the label/type of the entity.
export interface SettingsCardProps {
  value: SearchBarOption;
  liftValue: (value: SearchBarOption) => void;
  deleteValue: () => void;
}

export default function SettingsCard(props: SettingsCardProps) {
  const { liftValue, deleteValue } = props;
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(props.value);
  const [element, setElement] = useState(createEntityElement(props.value));

  useEffect(() => {
    setValue(props.value);
    setElement(createEntityElement(props.value));
  }, [props.value]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
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
          {/* TODO: Relying a bit on the assumption node labels and relationship types don't overlap here... */}
          {PROPERTY_MAP.has(value.name) ? (
            <SettingsPropertyForm value={value} liftValue={liftValue} />
          ) : (
            <Typography>
              This {isRelationshipOption(value) ? "relationship" : "node"} has no
              possible properties on which to filter.
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
