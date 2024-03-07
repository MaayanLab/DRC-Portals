'use client'
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download'; // Ensure you have @mui/icons-material installed

interface DownloadButtonProps {
  data?: { [key: string]: string | bigint | number }[];
  filename?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, filename = 'data.json' }) => {
  if (!data || data.length == 0) return null; // Render nothing if data is undefined

  const handleDownload = () => {
    // Convert data to JSON format
    const json = JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append the link to the body
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up

    // Revoke the blob URL
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
    >
      Download JSON
    </Button>
  );
};

export default DownloadButton;
