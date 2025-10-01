'use client'

import { notFound, useSearchParams } from "next/navigation"
import React from "react"
import { z } from 'zod'
import { filesize } from 'filesize'

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

function useFetch(url?: string) {
  const [loading, setLoading] = React.useState<Record<string, boolean>>({})
  const [data, setData] = React.useState<Record<string, unknown>>({})
  const [error, setError] = React.useState<Record<string, Error | undefined>>({})
  React.useEffect(() => {
    if (url) {
      setLoading((loading) => ({ ...loading, [url]: true }))
      setData((data) => ({ ...data, [url]: undefined }))
      setError((error) => ({ ...error, [url]: undefined }))
      fetch(url)
        .then((req) => {
          if (!req.ok) return Promise.reject(new Error(`${req.statusText || translateErrorStatus(req.status)} ${req.status}`))
          else return req.json()
        })
        .then(res => setData((data) => ({ ...data, [url]: res })))
        .catch(err => setError((error) => ({ ...error, [url]: new Error(`${err.message} from ${url}`) })))
        .finally(() => setLoading((loading) => ({ ...loading, [url]: false })))
    }
  }, [url])
  if (!url) return
  return { data: data[url], error: error[url], loading: loading[url] }
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

function ViewAccessMethod({ drs, name, access_method }: { drs: { origin: string, object_id: string }, name: string, access_method: z.TypeOf<typeof AccessMethod> }) {
  const drsAccessURLReq = useFetch(access_method.access_id ? `https://${drs.origin}/ga4gh/drs/v1/objects/${drs.object_id}/access/${access_method.access_id}` : undefined)
  const drsAccessURLRes = React.useMemo(() => drsAccessURLReq?.data ? AccessURL.safeParse(drsAccessURLReq.data) : undefined, [drsAccessURLReq])
  return <>
    <div><strong>Type</strong>: {access_method.type}</div>
    {access_method.access_id && <>
      <div><strong>Access ID</strong>: {access_method.access_id}</div>
      <div className="ml-1 pl-1 border-l border-black">
        {drsAccessURLReq?.loading && <>Loading...</>}
        {drsAccessURLReq?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {drsAccessURLReq.error.message}</div>}
        {drsAccessURLRes?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {drsAccessURLRes.error.message}</div>}
        {drsAccessURLRes?.data && <ViewAccessURL name={name} type={access_method.type} access_url={drsAccessURLRes.data} />}
      </div>
    </>}
    {access_method.access_url && <ViewAccessURL name={name} type={access_method.type} access_url={access_method.access_url} />}
  </>
}

function ViewDRS({ drs }: { drs: { origin: string, object_id: string } }) {
  const serviceInfoReq = useFetch(drs ? `https://${drs.origin}/ga4gh/drs/v1/service-info` : undefined)
  const serviceInfoRes = React.useMemo(() => serviceInfoReq?.data ? ServiceInfoObject.safeParse(serviceInfoReq.data) : undefined, [serviceInfoReq])
  const drsReq = useFetch(drs ? `https://${drs.origin}/ga4gh/drs/v1/objects/${drs.object_id}` : undefined)
  const drsRes = React.useMemo(() => drsReq?.data ? DRSObject.safeParse(drsReq.data) : undefined, [drsReq])
  return <div className="flex flex-col">
    {drsReq?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {drsReq.error.message}</div>}
    {drsRes?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {drsRes.error.message}</div>}
    {drsRes?.data && <>
      <div><strong>URI</strong>: {drsRes.data.self_uri}</div>
      <div className="ml-1 pl-1 border-l border-black">
        <div><strong>Name</strong>: {drsRes.data.name}</div>
        {drsRes.data.size && <div><strong>Size</strong>: {filesize(drsRes.data.size)}</div>}
        {drsRes.data.access_methods && <>
          <div><strong>Access Methods</strong>:</div>
          <div className="ml-1 pl-1 border-l border-black">
            {drsRes.data.access_methods.map((access_method, i) => <ViewAccessMethod key={i} drs={drs} name={drsRes.data.name ?? drsRes.data.id} access_method={access_method} />)}
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
    {serviceInfoReq?.loading && <>Loading...</>}
    {serviceInfoReq?.error && <div className="border-l border-red pl-1"><strong className="text-red-500">Error</strong>: {serviceInfoReq.error.message}</div>}
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

export default function Page() {
  const searchParams = useSearchParams()
  const drs = React.useMemo(() => {
    const q = searchParams.get('q')
    if (typeof q !== 'string') return
    const m = /^drs:\/\/([^\/]+)\/(.+)$/.exec(q)
    if (m) return { origin: m[1], object_id: m[2] }
  }, [searchParams])
  if (!drs) notFound()
  return <ViewDRS drs={drs} />
}
