import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { Fab, Tooltip } from "@mui/material";

interface ReturnBtnProps {
  onClick: () => void;
}

export default function ReturnBtn(cmpProps: ReturnBtnProps) {
  const { onClick } = cmpProps;
  return (
    <Tooltip title="Return to Path Search" arrow placement="left">
      <Fab
        aria-label="return-to-search"
        color="secondary"
        size="medium"
        onClick={onClick}
      >
        <KeyboardReturnIcon />
      </Fab>
    </Tooltip>
  );
}
