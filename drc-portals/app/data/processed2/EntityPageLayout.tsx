import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityType, humanBytesSize, itemLabel, linkify, M2MTargetType, predicateLabel, TermAggType, titleCapitalize } from "@/app/data/processed2/utils"
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { LinkedTypedNode } from "@/app/data/processed2/SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { notFound } from 'next/navigation';
import LandingPageLayout from '@/app/data/processed/LandingPageLayout';
import SearchFilter from '@/app/data/processed2/SearchFilter';
import EntityPageAnalyze from '@/app/data/processed2/EntityPageAnalyze';
import { dccIcons } from '@/app/data/processed2/icons';
import { getEntity } from '@/app/data/processed2/getEntity';

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ type: string, slug: string, search?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in props.params) params[k] = decodeURIComponent(params[k])
  const item = await getEntity(params)
  if (!item) notFound()
  let q = params?.search ?? ''
  q = `${q ? `${q} ` : ''}+source_id:${item.id}`
  const searchRes = await elasticsearch.search<M2MTargetType, TermAggType<'predicates' | 'types' | 'dccs'>>({
    index: 'm2m_target_expanded',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    aggs: {
      predicates: {
        terms: {
          field: 'predicate',
          size: 10,
        },
      },
      types: {
        terms: {
          field: 'target_type',
          size: 1000,
        },
      },
      dccs: {
        terms: {
          field: 'target_r_dcc.keyword',
          size: 1000,
        },
      },
    },
    size: 0,
    rest_total_hits_as_int: true,
  })
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          // all dccs in the dcc filters
          ...searchRes.aggregations ? searchRes.aggregations.dccs.buckets.map((filter) => filter.key) : [],
          ...Object.keys(item).filter(k => k.startsWith('r_')).map(k => item[k]),
        ]))
      }
    },
    size: 100,
  })
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item.id, item],
    ...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityType} => !!hit._source).map((hit) => [hit._id, hit._source]),
  ])
  const dccIconsResolved = await dccIcons
  Object.values<EntityType>(entityLookup).forEach((e) => {
    if (e.type === 'dcc')
      e.a_icon = dccIconsResolved[e.slug]
  })
  return (
    <LandingPageLayout
      title={itemLabel(item)}
      subtitle={categoryLabel(item.type)}
      metadata={[
        ...Object.keys(item).toReversed().flatMap(predicate => {
          if (item[predicate] === 'null') return []
          const m = /^(a|r)_(.+)$/.exec(predicate)
          if (m === null) return []
          if (m[1] == 'a') {
            let value: string | React.ReactNode = item[predicate]
            if (!value) return []
            if (`r_${m[2]}` in item) return []
            if (/_?(id_namespace|local_id)$/.exec(m[2]) != null) return []
            if (m[2] === 'label') return []
            if (m[2] === 'entrez') value = <a className="text-blue-600 cursor:pointer underline" href={`https://www.ncbi.nlm.nih.gov/gene/${item[predicate]}`} target="_blank" rel="noopener noreferrer">{item[predicate]}</a>
            else if (m[2] === 'ensembl') value = <a className="text-blue-600 cursor:pointer underline" href={`https://www.ensembl.org/id/${item[predicate]}`} target="_blank" rel="noopener noreferrer">{item[predicate]}</a>
            else if (m[2] === 'synonyms') value = (JSON.parse(value as string) as string[]).join(', ')
            else if (/_in_bytes/.exec(m[2]) !== null) value = humanBytesSize(Number(item[predicate]))
            else if (/_time$/.exec(m[2]) !== null) value = JSON.parse(value as string) as string
            else value = linkify(item[predicate])
            return [{
              label: titleCapitalize(m[2].replaceAll('_', ' ')),
              value
            }]
          } else if (m[1] === 'r') {
            return [{
              label: titleCapitalize(m[2].replaceAll('_', ' ')),
              value: <div className="m-2">{item[predicate] in entityLookup ? <LinkedTypedNode type={entityLookup[item[predicate]].type} id={entityLookup[item[predicate]].slug} label={itemLabel(entityLookup[item[predicate]])} /> : <>{item[predicate]}</>}</div>,
            }]
          }
          return []
        })
      ]}
    >
      <EntityPageAnalyze item={item} />
      {searchRes.hits.total ? <ListingPageLayout
        count={Number(searchRes.hits.total)}
        filters={
          <>
            {searchRes.aggregations?.predicates && <>
              <div className="font-bold">Predicate</div>
              {searchRes.aggregations.predicates.buckets.map((filter) =>
                <SearchFilter key={filter.key} id={`predicate:"${filter.key}"`} label={predicateLabel(filter.key)} count={Number(filter.doc_count)} />
              )}
              <br />
            </>}
            {searchRes.aggregations?.types && <>
              <div className="font-bold">Type</div>
              {searchRes.aggregations.types.buckets.map((filter) =>
                <SearchFilter key={filter.key} id={`target_type:"${filter.key}"`} label={categoryLabel(filter.key)} count={Number(filter.doc_count)} />
              )}
              <br />
            </>}
            {searchRes.aggregations?.dccs && <>
              <div className="font-bold">DCC</div>
              {searchRes.aggregations.dccs.buckets.map((filter) =>
                <SearchFilter key={filter.key} id={`target_r_dcc:"${filter.key}"`} label={filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} count={Number(filter.doc_count)} />
              )}
            </>}
          </>
        }
        footer={
          <Link href="/data">
            <Button
              sx={{textTransform: "uppercase"}}
              color="primary"
              variant="contained"
              startIcon={<Icon path={mdiArrowLeft} size={1} />}>
                BACK TO SEARCH
            </Button>
          </Link>
        }
      >
        {props.children}
      </ListingPageLayout> : props.children}
    </LandingPageLayout>
  )
}
