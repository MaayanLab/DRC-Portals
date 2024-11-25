'use client'
import React from 'react';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Ensure you have @mui/icons-material installed

interface DRSBundleButtonProps {
  data?: { [key: string]: string | bigint | number }[];
}

function unique(L: string[]): string[] {
  const S = new Set()
  const U: string[] = []
  for (const el of L) {
    if (S.has(el)) continue
    S.add(el)
    U.push(el)
  }
  return U
}

const DRSBundleCartButton: React.FC<DRSBundleButtonProps> = ({ data }) => {
  // Memoize the access_urls based on data
  const access_urls = React.useMemo(() => data?.filter(({ access_url }) => !!access_url).map(({ access_url }) => access_url as string), [data]);

  // Handle the copy to clipboard action
  const handleDRSBundle = React.useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('drs-cart', unique([
        ...(localStorage.getItem('drs-cart') || '').split('\n'),
        ...(access_urls ?? []),
      ].filter(item => !!item)).join('\n'))
    }
  }, [access_urls]);

  // Return early if no data is available, ensuring hooks are still called
  if (!data || data.length === 0) return null;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartIcon />}
        onClick={handleDRSBundle}
        disabled={!access_urls?.length}
      >
        Add to Cart
      </Button>
    </>
  );
};

export default DRSBundleCartButton;
