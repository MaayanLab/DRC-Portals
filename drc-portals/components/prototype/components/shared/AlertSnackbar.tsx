import { Alert, AlertColor, Snackbar, SnackbarOrigin } from "@mui/material";

interface AlertSnackbarProps extends SnackbarOrigin {
  open: boolean;
  message: string;
  autoHideDuration?: number;
  severity: AlertColor;
  handleClose: () => void;
}

export default function AlertSnackbar(cmpProps: AlertSnackbarProps) {
  const {
    open,
    message,
    autoHideDuration,
    severity,
    vertical,
    horizontal,
    handleClose,
  } = cmpProps;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: vertical,
        horizontal: horizontal,
      }}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    >
      <Alert sx={{ width: "100%" }} severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
