import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import CheckIcon from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import { useCallback, useRef, useState } from "react";

const TemplateBoxButton = styled(Button)(() => ({
  borderRadius: 0,
  minWidth: 0,
  width: 20,
  height: 20,
  p: 0,
}));

interface CypherDisplayBoxProps {
  title?: string;
  cypher: string;
}

export default function CypherDisplayBox({
  title,
  cypher,
}: CypherDisplayBoxProps) {
  const timeoutRef = useRef<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([cypher], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cypher.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = useCallback(async () => {
    try {
      // Cancel any pending timer
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      await navigator.clipboard.writeText(cypher);
      setIsCopied(true);

      // Start a new timer
      timeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        timeoutRef.current = null; // Optional cleanup
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }, [cypher, setIsCopied]);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {title ? (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      ) : null}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 220,
          p: 1.5,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            p: 0.5,
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderTop: "none",
            borderRight: "none",
            borderColor: "divider",
            borderRadius: "0 0 0 1",
            "& svg": {
              m: 0.5,
            },
            [`& .${dividerClasses.root}`]: {
              mx: 0.5,
            },
          }}
        >
          <TemplateBoxButton onClick={handleDownload}>
            <DownloadIcon fontSize="small" />
          </TemplateBoxButton>
          <Divider orientation="vertical" flexItem />
          <TemplateBoxButton onClick={handleCopy}>
            {isCopied ? (
              <CheckIcon fontSize="small" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </TemplateBoxButton>
        </Box>

        <Typography
          variant="body2"
          component="pre"
          sx={{
            mt: 4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "monospace",
            margin: 0,
            paddingRight: "60px", // To ensure the text doesn't overlap with the buttons
          }}
        >
          {cypher}
        </Typography>
      </Paper>
    </Box>
  );
}
