'use client'
import React from 'react';
import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Ensure you have @mui/icons-material installed
import { setLocalStorage } from '@/utils/localstorage';
import { ensure_array, unique } from '@/utils/array';
import trpc from "@/lib/trpc/client"

export function FetchDRSCartButton(props: { source_id?: string, search?: string, facet?: (string | undefined)[] | string | undefined, count?: number }) {
  const search = trpc.search.useMutation()
  const facet = React.useMemo(() => ensure_array(props.facet).filter((f): f is string => !!f), [props.facet])
  const handleDRSBundle = React.useCallback(async () => {
    let cursor: string | undefined
    do {
      const res = await search.mutateAsync({
        source_id: props.source_id,
        search: props.search,
        facet,
        cursor: cursor,
      })
      setLocalStorage('drs-cart', cart => unique([
        ...(cart || '').split('\n'),
        ...res.items.map((item) => item?.a_access_url ?? ''),
      ].filter(access_url => !!access_url)).join('\n'))
      cursor = res.next
    } while (cursor !== undefined)
  }, [props.source_id, props.search, facet])
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

export function DRSCartButton(props: { access_url?: string, responsive?: boolean }) {
  const handleDRSBundle = React.useCallback(() => {
    setLocalStorage('drs-cart', cart => unique([
      ...(cart || '').split('\n'),
      props.access_url ?? '',
    ].filter(access_url => !!access_url)).join('\n'))
  }, [props.access_url]);
  return (
    <Button
      title="Add to cart"
      variant="contained"
      color="primary"
      onClick={handleDRSBundle}
      disabled={!props.access_url}
    >
      <Box title="Add to cart" component="span" sx={{ marginLeft: { md: props.responsive ? '0px' : undefined, xs: '-4px' }, marginRight: { md: props.responsive ? '0px' : undefined, xs: '4px' } }}>
        <ShoppingCartIcon />
      </Box>
      <Box component="span" sx={{ display: { md: props.responsive ? 'none' : 'block', xs: 'block' } }}>
        Add to Cart
      </Box>
    </Button>
  );
};
