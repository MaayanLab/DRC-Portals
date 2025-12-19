import React from 'react';
import elasticsearch from '@/lib/elasticsearch'
import { EntityType } from './utils';

export const getEntity = React.cache(async (params: { type: string, slug: string }) => {
  const itemRes = await elasticsearch.search<EntityType>({
    index: 'entity',
      query: {
        bool: {
          must: [
            { term: { 'type': params.type } },
            { term: { 'slug': params.slug } },
          ]
        },
      },
  })
  const item = itemRes.hits.hits[0]
  return item?._source
})
