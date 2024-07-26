'use client'
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download'; // Ensure you have @mui/icons-material installed

interface DRSBundleButtonProps {
  data?: { [key: string]: string | bigint | number }[];
}

const DRSBundleButton: React.FC<DRSBundleButtonProps> = ({ data }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Memoize the access_urls based on data
  const access_urls = React.useMemo(() => data?.filter(({ access_url }) => !!access_url).map(({ access_url }) => access_url), [data]);

  // Handle the copy to clipboard action
  const handleDRSBundle = React.useCallback(() => {
    if (ref.current) {
      console.log(JSON.stringify({ data, access_urls }));
      ref.current.value = access_urls?.join('\n') || '';
      ref.current.select();
      ref.current.setSelectionRange(0, 99999); // For mobile devices
      window.navigator.clipboard.writeText(ref.current.value);
    }
  }, [access_urls]);

  // Return early if no data is available, ensuring hooks are still called
  if (!data || data.length === 0) return null;

  return (
    <>
      <textarea ref={ref} className="hidden" />
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleDRSBundle}
        disabled={!access_urls?.length}
      >
        Copy DRS Bundle
      </Button>
    </>
  );
};

export default DRSBundleButton;
