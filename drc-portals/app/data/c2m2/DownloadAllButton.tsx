'use client'
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import SQL from '@/lib/prisma/raw';  // Import SQL

// Define the type for searchParams
interface DownloadAllButtonProps {
  apiEndpoint: string;
  filename?: string;
  name?: string;
  q?: string;
  t?: { type: string; entity_type: string; }[] | undefined;
}

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({ apiEndpoint, filename = 'data.json', name = 'Download', q, t }) => {
  const handleDownload = async () => {
    try {
      // Convert filterClause to string using JSON.stringify if SQL.toString is not available
      

      // Fetch data from the API endpoint with q and filterClause
      const response = await fetch(apiEndpoint, {
        method: 'POST',  // Use POST method to send q and filterClause in the body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q,
          t,  
          limit: 200000,  // Set the limit as required
        }),  // Send q, filterClause (stringified), and limit in the body
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      // Convert data to JSON format
      const json = JSON.stringify(result, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename ;
      document.body.appendChild(a); // Append the link to the body
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up

      // Revoke the blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
    >
      {name}
    </Button>
  );
};

export default DownloadAllButton;
