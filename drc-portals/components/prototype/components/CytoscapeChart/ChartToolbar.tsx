import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { IconButton, Paper, Tooltip } from "@mui/material";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/system";

type ChartToolbarProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
};

export default function ChartToolbar(chartToolbarProps: ChartToolbarProps) {
  const { onZoomIn, onZoomOut, onFit } = chartToolbarProps;

  const ToolbarIconBtn = styled(IconButton)({
    borderRadius: 1,
  });

  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        color: "text.secondary",
        "& svg": {
          borderRadius: 1,
        },
      }}
    >
      <Tooltip title="Zoom In" arrow>
        <ToolbarIconBtn
          aria-label="zoom-in"
          disabled={onZoomIn === undefined}
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Tooltip title="Zoom Out" arrow>
        <ToolbarIconBtn
          aria-label="zoom-in"
          disabled={onZoomOut === undefined}
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </ToolbarIconBtn>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Fit Graph" arrow>
        <ToolbarIconBtn
          aria-label="zoom-in"
          disabled={onFit === undefined}
          onClick={onFit}
        >
          <FitScreenIcon />
        </ToolbarIconBtn>
      </Tooltip>
    </Paper>
  );
}
