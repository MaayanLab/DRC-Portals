import React from 'react';
import elasticsearch from '@/lib/elasticsearch'
import { EntityExpandedType } from './utils';

export const getEntity = React.cache(async (params: { type: string, slug: string }) => {
  const itemRes = await elasticsearch.search<EntityExpandedType>({
    index: 'entity_expanded',
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
