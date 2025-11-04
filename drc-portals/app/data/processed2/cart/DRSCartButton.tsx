'use client'
import React from 'react';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Ensure you have @mui/icons-material installed
import { setLocalStorage } from '@/utils/localstorage';
import { ensure_array, unique } from '@/utils/array';
import { EntityType } from '@/app/data/processed2/utils';

export function FetchDRSCartButton(props: { source_id?: string, search?: string, facet?: string[] | string, count?: number }) {
  const handleDRSBundle = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (props.source_id) params.set('source_id', props.source_id)
    if (props.search) params.set('search', props.search)
    ensure_array(props.facet).forEach(facet => { if (facet) { params.append('facet', facet) } })
    let paramsStr: string | null = params.toString()
    while (paramsStr) {
      const req = await fetch(`/data/processed2/api/entity?${paramsStr}`)
      const res: {
        total: number,
        items: EntityType[],
        next: string | null,
      } = await req.json()
      setLocalStorage('drs-cart', cart => unique([
        ...(cart || '').split('\n'),
        ...res.items.map((item) => item.a_access_url),
      ].filter(access_url => !!access_url)).join('\n'))
      paramsStr = res.next
    }
  }, [props.source_id, props.search, props.facet]);
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
      props.access_url ?? '',
    ].filter(access_url => !!access_url)).join('\n'))
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
