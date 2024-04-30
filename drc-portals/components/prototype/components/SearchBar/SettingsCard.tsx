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

import { PROPERTY_MAP } from "../../constants/neo4j";
import { SearchBarOption } from "../../interfaces/search-bar";
import {
  createEntityElement,
  isRelationshipOption,
} from "../../utils/search-bar";

import SettingsPropertyForm from "./SettingsPropertyForm";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

// TODO: Could add `next` and `prev` here, which would enable us to allow the user to change the label/type of the entity.
export interface SettingsCardProps {
  value: SearchBarOption;
  liftValue: (value: SearchBarOption) => void;
  deleteValue: () => void;
}

export default function SettingsCard(settingsCardProps: SettingsCardProps) {
  const { liftValue, deleteValue } = settingsCardProps;
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(settingsCardProps.value);
  const [element, setElement] = useState(
    createEntityElement(settingsCardProps.value)
  );

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
    setValue(settingsCardProps.value);
    setElement(createEntityElement(settingsCardProps.value));
  }, [settingsCardProps.value]);

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
          {PROPERTY_MAP.has(value.name) ? (
            <SettingsPropertyForm value={value} liftValue={liftValue} />
          ) : (
            <Typography>
              This {isRelationshipOption(value) ? "relationship" : "node"} has
              no possible properties on which to filter.
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
