import React from 'react'
import { categoryLabel, create_url, EntityType, humanBytesSize, itemDescription, itemLabel, linkify, titleCapitalize } from "@/app/data/processed/utils"
import { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { notFound } from 'next/navigation';
import LandingPageLayout from '@/app/data/processed/LandingPageLayout';
import ListingPageLayoutClientSideFacets from '@/app/data/processed/ListingPageLayoutClientSideFacets';
import EntityPageAnalyze from '@/app/data/processed/EntityPageAnalyze';
import { esDCCs, getEsDCC } from '@/app/data/processed/dccs';
import { getEntity } from '@/app/data/processed/getEntity';
import { DRSCartButton } from './cart/DRSCartButton';
import { Metadata, ResolvingMetadata } from 'next';

type PageProps = { params: Promise<{ type: string, slug: string } & Record<string, string>> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  for (const k in props.params) params[k] = decodeURIComponent(params[k])
  const item = await getEntity(params)
  if (!item) return {}
  const dcc = await getEsDCC(item.m2o_dcc?.id)
  const parentMetadata = await parent
  return {
    title: [
      parentMetadata.title?.absolute,
      categoryLabel(params.type),
      itemLabel(item),
    ].filter(title => !!title).join(' | '),
    keywords: [
      parentMetadata.keywords,
      categoryLabel(params.type),
      itemLabel(item),
      dcc?.a_label,
    ].filter(item => !!item).join(', '),
    description: [
      parentMetadata.description,
      itemDescription(item),
      dcc?.a_description,
    ].filter(item => !!item).join('. ')
  }
}

export default async function Page(props: React.PropsWithChildren<PageProps>) {
  const params = await props.params
  for (const k in props.params) params[k] = decodeURIComponent(params[k])
  const item = await getEntity(params)
  if (!item) notFound()
    
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item.id, item],
    ...Object.entries(item).flatMap(([key, value]) => {
      if (key.startsWith('m2o_')) {
        return [[(value as EntityType).id, value as EntityType]]
      } else {
        return []
      }
    }),
    ...Object.entries(await esDCCs),
  ])
  return (
    <LandingPageLayout
      title={itemLabel(item)}
      subtitle={categoryLabel(item.type)}
      metadata={[
        ...Object.keys(item).toSorted().toReversed().flatMap(predicate => {
          const m = /^(a|m2o)_(.+)$/.exec(predicate)
          if (m === null) return []
          if (m[1] == 'a') {
            if (item[predicate as `a_${string}`] == 'null') return []
            let value: string | React.ReactNode = item[predicate as `a_${string}`]
            if (!value) return []
            if (`m2o_${m[2]}` in item) return []
            if (/_?(id_namespace|local_id)$/.exec(m[2]) != null) return []
            if (m[2] === 'label') return []
            if (m[2] === 'entrez') value = <a className="text-blue-600 cursor:pointer underline" href={`https://www.ncbi.nlm.nih.gov/gene/${item[predicate as `a_${string}`]}`} target="_blank" rel="noopener noreferrer">{item[predicate as `a_${string}`]}</a>
            else if (m[2] === 'ensembl') value = <a className="text-blue-600 cursor:pointer underline" href={`https://www.ensembl.org/id/${item[predicate as `a_${string}`]}`} target="_blank" rel="noopener noreferrer">{item[predicate as `a_${string}`]}</a>
            else if (m[2] === 'synonyms') value = (JSON.parse(value as string) as string[]).join(', ')
            else if (/_in_bytes/.exec(m[2]) !== null) value = humanBytesSize(Number(item[predicate as `a_${string}`]))
            else if (/_time$/.exec(m[2]) !== null) value = JSON.parse(value as string) as string
            else if (m[2] == 'icon') value = <img className="max-w-28 max-h-48 align-top m-0 mb-2" src={value as string} />
            else if (m[2] == 'access_url') value = <div className="flex flex-col place-items-start">
              {linkify(value as string)}
              <DRSCartButton access_url={value as string} />
            </div>
            else value = linkify(item[predicate as `a_${string}`])
            return [{
              label: titleCapitalize(m[2].replaceAll('_', ' ')),
              value
            }]
          } else if (m[1] === 'm2o') {
            if (typeof item[predicate as `m2o_${string}`] !== 'object' || item[predicate as `m2o_${string}`] === null) return []
            const neighbor = item[predicate as `m2o_${string}`].id in entityLookup ? entityLookup[item[predicate as `m2o_${string}`].id] : undefined
            return [{
              label: titleCapitalize(m[2].replaceAll('_', ' ')),
              value: neighbor?.type ? <LinkedTypedNode href={create_url({ type: neighbor.type, slug: neighbor.slug })} type={neighbor.type} label={itemLabel(neighbor)} /> : item[predicate as `m2o_${string}`].a_label,
            }]
          }
          return []
        })
      ]}
    >
      <EntityPageAnalyze item={item} />
      <ListingPageLayoutClientSideFacets
        entityLookup={entityLookup}
        source_id={item.id}
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
      </ListingPageLayoutClientSideFacets>
    </LandingPageLayout>
  )
}
