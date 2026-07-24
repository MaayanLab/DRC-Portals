import prisma from "@/lib/prisma"
import elasticsearch from "@/lib/elasticsearch"
import { safeAsync } from "@/utils/safe"
import { EntityExpandedType } from "@/app/data/processed/utils"

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
  return Response.json({ url: object.data.link }, { status: 200 })
}

async function getPDPObjectUrl(object_id: string, access_id: string) {
  const object = await safeAsync(async () => {
    const itemRes = await elasticsearch.search<EntityExpandedType>({
      index: 'entity_expanded',
      query: {
        term: { id: object_id }
      },
    })
    return itemRes.hits.hits[0]._source
  })
  if (!object.data) return null
  if (object.data.a_access_url.startsWith('drs://')) {
    const upstreamDRS = object.data.a_access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, `https://$1/ga4gh/drs/v1/objects/$2/access/${access_id}`)
    const req = await fetch(upstreamDRS)
    return Response.json(await req.json(), { status: req.status })
  } else if (access_id === 'pdp_asset' && object.data.type === 'dcc_asset' && object.data.a_access_url) {
    return Response.json({ url: object.data.a_access_url }, { status: 200 })
  } else if (access_id === 'pdp_file' && object.data.type === 'file' && object.data.a_access_url) {
    return Response.json({ url: object.data.a_access_url }, { status: 200 })
  } else {
    return null
  }
}

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  let response
  response = await getDccAssetUrl(params.object_id, params.access_id)
  if (response) return response
  response = await getPDPObjectUrl(params.object_id, params.access_id)
  if (response) return response
  return Response.json({ 'error': 'Not Found' }, { status: 404 })
}
