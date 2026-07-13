import { notFound } from "next/navigation"
import React from "react"
import { z } from 'zod'
import { filesize } from 'filesize'
import { safeAsync } from "@/utils/safe"

// https://ga4gh.github.io/data-repository-service-schemas/preview/release/drs-1.4.0/docs/#tag/AccessMethodModel
const AccessURL = z.object({
  url: z.string(),
  headers: z.union([
    z.string().transform(headers => [headers]),
    z.string().array(),
    z.record(z.string(), z.string()).transform(headers => Object.keys(headers).map(key => `${key}: ${headers[key]}`)),
  ]).optional().transform(headers => headers ? headers : []),
}).passthrough()
const AccessMethod = z.object({
  type: z.union([z.enum(['s3', 'gs', 'ftp', 'gsiftp', 'globus', 'htsget', 'https', 'file']), z.string()]),
  access_url: AccessURL.optional().nullable(),
  access_id: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  authorizations: z.object({}).passthrough().optional().nullable(),
}).passthrough()
const Checksum = z.object({
  checksum: z.string(),
  type: z.string(),
}).passthrough()
const DRSObject = z.object({
  id: z.string(),
  self_uri: z.string(),
  size: z.number().optional().nullable(),
  created_time: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  checksums: Checksum.array().optional().nullable(),
  access_methods: AccessMethod.array().optional().nullable(),
}).passthrough()
const ServiceInfoObject = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  type: z.object({}).passthrough(),
  organization: z.object({
    name: z.string(),
    url: z.string(),
  }).passthrough(),
  contactUrl: z.string().optional().nullable(),
  documentationUrl: z.string().optional().nullable(),
  version: z.string(),
}).passthrough()

function translateErrorStatus(code: number) {
  if (code >= 500) return 'Internal Server Error'
  else if (code === 404) return 'Not Found'
  else if (code === 401) return 'Permission Denied'
  else return 'Unknown Error'
}

function safeFetchParse<T extends z.AnyZodObject>(url: string, schema: T) {
  return safeAsync<z.infer<T>>(async () => {
    const req = await fetch(url)
    if (!req.ok) throw new Error(req.statusText || translateErrorStatus(req.status))
    const res = await req.json()
    return await schema.parseAsync(res)
  })
}

function ViewAccessURL({ name, type, access_url }: { name: string, type: string,  access_url: z.TypeOf<typeof AccessURL> }) {
  return <>
    <div><strong>URL</strong>: {
    (
      (type === 'http'
      || type === 'https'
      ) && access_url.headers.length === 0
    ) ? <a className="link text-blue-600" href={access_url.url} target="_blank">{access_url.url}</a> : access_url.url}</div>
    {access_url.headers.length > 0 && <><div><strong>Headers</strong>:</div>
      {access_url.headers.map(header => <div key={header}>{header}</div>)}
    </>}
    {(type === 'http'
    || type === 'https'
    || type === 'ftp') && <code className="block my-2 bg-gray-200">{[
      'wget',
      ...access_url.headers.map(header => `--header="${header}"`),
      access_url.url,
    ].join(' ')}</code>}
    {(type === 's3') && <code className="block my-2 bg-gray-200">{[
      'aws s3 cp',
      access_url.url,
      name,
    ].join(' ')}</code>}
  </>
}
type Result<T, E = any> = { data: T, error: E }

async function ViewAccessMethod({ name, access_method, access_url }: { name: string, access_method: z.TypeOf<typeof AccessMethod>, access_url: Result<z.TypeOf<typeof AccessURL>> }) {
  return <>
    <div><strong>Type</strong>: {access_method.type}</div>
    {access_method.access_id && <>
      <div><strong>Access ID</strong>: {access_method.access_id}</div>
      <div className="ml-1 pl-1 border-l border-black">
        {access_url.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {access_url.error.message}</div>}
        {access_url.data && <ViewAccessURL name={name} type={access_method.type} access_url={access_url.data} />}
      </div>
    </>}
    {access_method.access_url && <ViewAccessURL name={name} type={access_method.type} access_url={access_method.access_url} />}
  </>
}

function DRS2JSONLD({ serviceInfo, drsRes, drsAccessURLs }: { serviceInfo?: z.infer<typeof ServiceInfoObject>, drsRes: z.infer<typeof DRSObject>, drsAccessURLs: Record<string, Result<z.infer<typeof AccessURL>>> }) {
  return {
    "@context": [
      "https://schema.org",
      // {
      //   "pav": "...",
      //   "prov": "..."
      // }
    ],
    "@type": "Dataset",
    // "prov:wasDerivedFrom": {
    //   "@id": "...",
    //   "@type": "prov:Entity"
    // },
    // "prov:wasGeneratedBy": {
    //   "@type": "prov:Activity"
    // }
    "name": drsRes.name,
    "description": drsRes.description,
    "url": drsRes.self_uri,
    "version": drsRes.version,
    "publication_date": drsRes.created_time,
    // if we had a license this could be added
    // "license": [
    //   "http://spdx.org/licenses/CC0-1.0",
    //   "https://creativecommons.org/publicdomain/zero/1.0"
    // ],
    // if we had a doi this could be added
    // "identifier": {
    //   "@id": "https://doi.org/TODO",
    //   "@type": "PropertyValue",
    //   "propertyID": "https://registry.identifiers.org/registry/doi",
    //   "value": "doi:TODO",
    //   "url": "https://doi.org/TODO"
    // },
    // if we had a citation this could be added
    // "citation": "",
    "includedInDataCatalog": {
      "@id": "https://cfde.cloud",
      "@type": "DataCatalog"
    },
    "distribution": drsRes.access_methods?.flatMap((access_method, i) => {
      if (access_method.type === 'https') {
        if (access_method.access_url) return [{
          "@type": "DataDownload",
          "contentUrl": access_method.access_url,
          "contentSize": drsRes.size,
          // "name":,
          // "conditionsOfAccess": "...",
          // "contentUrl": "...",
          // "description": "...",
          // "encodingFormat": ["..."],
          // "license": "..."
        }]
        else if (access_method.access_id && drsAccessURLs[`${i}`].data) return [{
          "@type": "DataDownload",
          "contentUrl": drsAccessURLs[`${i}`].data.url,
          "contentSize": drsRes.size,
        }]
        else return [{
          "@type": "DataDownload",
          "contentSize": drsRes.size,
        }]
      } else return []
    }),
    "provider": serviceInfo ? {
      "@id": serviceInfo.organization.url,
      "@type": "Organization",
      "name": serviceInfo.organization.name,
      "url": serviceInfo.organization.url,
    } : undefined,
  }
}

async function resolveAccessUrls({ drs, drsRes }: { drs: { origin: string, object_id: string }, drsRes?: z.infer<typeof DRSObject> }) {
  if (!drsRes?.access_methods) return {}
  return Object.fromEntries(
    await Promise.all(
      drsRes.access_methods.map(async (access_method, i) => {
        if (access_method.access_url) {
          return [`${i}`, { data: { url: access_method.access_url } }]
        } else if (access_method.access_id) {
          const access_url = await safeFetchParse(`https://${drs.origin}/ga4gh/drs/v1/objects/${drs.object_id}/access/${access_method.access_id}`, AccessURL)
          return [`${i}`, access_url] as const
        } else {
          return [`${i}`, { error: { message: 'Missing access url or access id' } }]
        }
      }))
  )
}

async function ViewDRS({ drs }: { drs: { origin: string, object_id: string } }) {
  const serviceInfoRes = await safeFetchParse(`https://${drs.origin}/ga4gh/drs/v1/service-info`, ServiceInfoObject)
  const drsRes = await safeFetchParse(`https://${drs.origin}/ga4gh/drs/v1/objects/${drs.object_id}`, DRSObject)
  const drsAccessURLs = await resolveAccessUrls({ drs, drsRes: drsRes?.data })
  return <div className="flex flex-col">
    {drsRes?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {drsRes.error.message}</div>}
    {drsRes?.data && <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(DRS2JSONLD({ serviceInfo: serviceInfoRes.data, drsRes: drsRes.data, drsAccessURLs })).replace(/</g, '\\u003c') 
        }}
      />
      <div><strong>URI</strong>: {drsRes.data.self_uri}</div>
      <div className="ml-1 pl-1 border-l border-black">
        <div><strong>Name</strong>: {drsRes.data.name}</div>
        {drsRes.data.size && <div><strong>Size</strong>: {filesize(drsRes.data.size)}</div>}
        {drsRes.data.access_methods && <>
          <div><strong>Access Methods</strong>:</div>
          <div className="ml-1 pl-1 border-l border-black">
            {drsRes.data.access_methods.map((access_method, i) => <ViewAccessMethod key={i} name={drsRes.data.name ?? drsRes.data.id} access_method={access_method} access_url={drsAccessURLs[`${i}`]} />)}
          </div>
        </>}
        {drsRes.data.checksums && <>
          <div><strong>Checksums</strong>:</div>
          <div className="ml-1 pl-1 border-l border-black">
            {drsRes.data.checksums.map((checksum, i) =>
              <React.Fragment key={i}>
                <div><strong>Type</strong>: {checksum.type}</div>
                <div><strong>Checksum</strong>: {checksum.checksum}</div>
                {checksum.type === 'md5' && <code className="block my-2 bg-gray-200">{[
                  `test "${checksum.checksum}" = "$(md5sum ${drsRes.data.name})"`
                ].join(' ')}</code>}
                {checksum.type === 'sha-256' || checksum.type === 'sha256' && <code className="block my-2 bg-gray-200">{[
                  `test "${checksum.checksum}" = "$(sha256sum ${drsRes.data.name})"`
                ].join(' ')}</code>}
                {checksum.type === 'sha-1' || checksum.type === 'sha1' && <code className="block my-2 bg-gray-200">{[
                  `test "${checksum.checksum}" = "$(sha1sum ${drsRes.data.name})"`
                ].join(' ')}</code>}
              </React.Fragment>
            )}
          </div>
        </>}
        {drs && <code className="block my-2 bg-gray-200">{[
          'drs get -d', `https://${drs.origin}`, drs.object_id
        ].join(' ')}</code>}
      </div>
    </>}
    <br />
    {serviceInfoRes?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {serviceInfoRes.error.message}</div>}
    {serviceInfoRes?.data && <>
      <div><strong>Service Info</strong>: drs://{drs.origin}</div>
      <div className="ml-1 pl-1 border-l border-black">
        <div><strong>Name</strong>: {serviceInfoRes.data.name}</div>
        {serviceInfoRes.data.description && <div><strong>Description</strong>: {serviceInfoRes.data.description}</div>}
        {serviceInfoRes.data.version && <div><strong>Version</strong>: {serviceInfoRes.data.version}</div>}
        {serviceInfoRes.data.contactUrl && <div><strong>Contact URL</strong>: <a className="link text-blue-600" href={serviceInfoRes.data.contactUrl} target="_blank">{serviceInfoRes.data.contactUrl}</a></div>}
        {serviceInfoRes.data.documentationUrl && <div><strong>Documentation URL</strong>: <a className="link text-blue-600" href={serviceInfoRes.data.documentationUrl} target="_blank">{serviceInfoRes.data.documentationUrl}</a></div>}
        {serviceInfoRes.data.organization && <>
          <div><strong>Organization</strong>:</div>
          <div className="ml-1 pl-1 border-l border-black">
            <div><strong>Name</strong>: {serviceInfoRes.data.organization.name}</div>
            <div><strong>URL</strong>: <a className="link text-blue-600" href={serviceInfoRes.data.organization.url} target="_blank">{serviceInfoRes.data.organization.url}</a></div>
          </div>
        </>}
      </div>
    </>}
  </div>
}

export default async function Page(props: { searchParams: Promise<{ q: string }> }) {
  const searchParams = await props.searchParams
  if (typeof searchParams.q !== 'string') notFound()
  const m = /^drs:\/\/([^\/]+)\/(.+)$/.exec(searchParams.q)
  if (!m) notFound()
  const drs = {
    origin: m[1],
    object_id: m[2],
  }
  if (!drs.origin || !drs.object_id) notFound()
  return <ViewDRS drs={drs} />
}
