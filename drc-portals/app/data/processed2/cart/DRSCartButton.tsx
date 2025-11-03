'use client'
import React from 'react';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Ensure you have @mui/icons-material installed
import { setLocalStorage } from '@/utils/localstorage';
import { unique } from '@/utils/array';
import { parse_url } from '../utils';

export function FetchDRSCartButton(props: { count?: number }) {
  const handleDRSBundle = React.useCallback(() => {
    const url = parse_url(window.location)
    // TODO: get query and add it to localstorage
    // setLocalStorage('drs-cart', cart => unique([
    //   ...(cart || '').split('\n'),
    //   ...[props.access_url ?? '']
    // ].filter(item => !!item)).join('\n'))
    alert('Coming soon!')
  }, []);
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartIcon />}
        onClick={handleDRSBundle}
        disabled={!props.count}
      >
        ADD {props.count && props.count.toLocaleString()} MATCHING FILES TO CART
      </Button>
    </>
  );
};

export function DRSCartButton(props: { access_url?: string }) {
  const handleDRSBundle = React.useCallback(() => {
    setLocalStorage('drs-cart', cart => unique([
      ...(cart || '').split('\n'),
      ...[props.access_url ?? '']
    ].filter(item => !!item)).join('\n'))
  }, [props.access_url]);
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ShoppingCartIcon />}
        onClick={handleDRSBundle}
        disabled={!props.access_url}
      >
        Add to Cart
      </Button>
    </>
  );
};
