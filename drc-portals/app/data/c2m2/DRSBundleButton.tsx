'use client'
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download'; // Ensure you have @mui/icons-material installed

interface DRSBundleButtonProps {
  data?: { [key: string]: string | bigint | number }[];
}

const DRSBundleButton: React.FC<DRSBundleButtonProps> = ({ data }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const access_urls = React.useMemo(() => data?.filter(({access_url}) => !!access_url).map(({ access_url }) => access_url), [data])
  if (!data || data.length == 0) return null; // Render nothing if data is undefined

  const handleDRSBundle = React.useCallback(() => {
    if (!ref.current) return
    console.log(JSON.stringify({ data, access_urls }))
    Object.assign(ref.current, { value: access_urls?.join('\n') })
    ref.current.select();
    ref.current.setSelectionRange(0, 99999); // For mobile devices
    window.navigator.clipboard.writeText(ref.current.value);
  }, [ref, access_urls]);

  return (
    <>
      <textarea
        ref={ref}
        className="hidden"
      />
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
