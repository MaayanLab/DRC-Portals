'use client';
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

interface DownloadButtonProps {
  data?: object | object[]; // Accepts both an object and an array of objects
  filename?: string;
  name?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, filename = 'data.json', name = 'Download' }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) return null; // Handle empty data

  const handleDownload = () => {
    // Convert data to JSON format
    const json = JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the blob URL
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownload}>
      {name}
    </Button>
  );
};

export default DownloadButton;
