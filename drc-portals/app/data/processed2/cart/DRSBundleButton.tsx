'use client'
import React from 'react';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Ensure you have @mui/icons-material installed

export default function DRSBundleButton(props: { data?: string[] }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const handleDRSBundle = React.useCallback(() => {
    if (!props.data) return
    if (ref.current) {
      ref.current.value = props.data.join('\n') || '';
      ref.current.select();
      ref.current.setSelectionRange(0, 99999); // For mobile devices
      window.navigator.clipboard.writeText(ref.current.value);
    }
  }, [ref, props.data]);
  if (!props.data) return null
  return (
    <>
      <textarea ref={ref} className="hidden" />
      <Button
        variant="contained"
        color="primary"
        startIcon={<ContentCopyIcon />}
        onClick={handleDRSBundle}
        disabled={!props.data.length}
      >
        Copy DRS Bundle
      </Button>
    </>
  )
}
