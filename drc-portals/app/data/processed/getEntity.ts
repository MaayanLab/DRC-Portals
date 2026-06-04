import React from 'react';
import trpc from '@/lib/trpc/server'

export const getEntity = React.cache(async (params: { type: string, slug: string }) => trpc.entity(params))
