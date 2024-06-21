import prisma from "@/lib/prisma"
import { safeAsync } from "@/utils/safe"

async function getDccAssetUrl(object_id: string, access_id: string) {
  if (access_id !== 'asset') return null
  const object = await safeAsync(() => prisma.dccAsset.findFirst({
    where: {
      OR: [
        {dccapproved: true},
        {drcapproved: true},
      ],
      fileAsset: {
        sha256checksum: Buffer.from(object_id, 'hex').toString('base64'),
      },
    },
    select: {
      link: true,
    },
  }))
  if (!object?.data?.link) return null
  return { url: object.data.link }
}

async function getDccAssetNodeUrl(object_id: string, access_id: string) {
  if (access_id !== 'asset_node') return null
  const object = await safeAsync(() => prisma.dCCAssetNode.findUnique({
    where: {
      id: object_id,
    },
    select: {
      dcc_asset: {
        select: {
          fileAsset: {
            select: {
              link: true,
            },
          },
        },
      },
    },
  }))
  if (!object?.data?.dcc_asset.fileAsset?.link) return null
  return { url: object.data.dcc_asset.fileAsset.link }
}

async function getC2M2FileUrl(object_id: string, access_id: string) {
  if (access_id !== 'c2m2_file') return null
  const object = await safeAsync(() => prisma.c2M2FileNode.findUnique({
    where: {
      id: object_id,
    },
    select: {
      access_url: true,
    },
  }))
  if (!object?.data?.access_url) return null
  if (object.data.access_url.startsWith('drs://')) {
    // We'll just proxy to the upstream DRS server, hopefully the client doesn't mind this. Redirects don't seem to work
    const upstreamDRS = object.data.access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, `https://$1/ga4gh/drs/v1/objects/$2/access/${access_id}`)
    const req = await fetch(upstreamDRS)
    if (req.ok) return Response.json(await req.json(), { status: req.status })
    else if (req.status === 404) return null
    else return req
  }
  return { url: object.data.access_url }
}

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  let access_url
  access_url = await getDccAssetUrl(params.object_id, params.access_id)
  if (access_url) return Response.json(access_url)
  access_url = await getDccAssetNodeUrl(params.object_id, params.access_id)
  if (access_url) return Response.json(access_url)
  access_url = await getC2M2FileUrl(params.object_id, params.access_id)
  if (access_url) return Response.json(access_url)
  return Response.json({ 'error': 'Not Found' }, { status: 404 })
}
