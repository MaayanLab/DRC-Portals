'use client'
import React from 'react';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Ensure you have @mui/icons-material installed
import { setLocalStorage } from '@/utils/localstorage';
import { unique } from '@/utils/array';

export default function DRSCartButton(props: { persistent_id?: string, access_url?: string }) {
  const access_url = props.access_url ?? props.persistent_id
  const handleDRSBundle = React.useCallback(() => {
    setLocalStorage('drs-cart', cart => unique([
      ...(cart || '').split('\n'),
      ...[access_url ?? '']
    ].filter(item => !!item)).join('\n'))
  }, [props.access_url]);
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartIcon />}
        onClick={handleDRSBundle}
        disabled={!access_url}
      >
        Add to Cart
      </Button>
    </>
  );
};
