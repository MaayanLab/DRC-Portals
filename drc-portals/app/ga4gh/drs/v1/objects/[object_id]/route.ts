import prisma from "@/lib/prisma"
import elasticsearch from "@/lib/elasticsearch"
import { safeAsync } from "@/utils/safe"
import { EntityExpandedType } from "@/app/data/processed/utils"

const base_drs = process.env.PUBLIC_URL?.replace(/^https?/g, 'drs')
if (!base_drs) throw new Error('Missing env.PUBLIC_URL')

// TODO: bundles

async function getDccAsset(object_id: string) {
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
      fileAsset: {
        select: {
          filename: true,
          size: true,
          sha256checksum: true,
        },
      },
      created: true,
      lastmodified: true,
    },
  }))
  if (!object?.data?.fileAsset) return null
  return Response.json({
    "id": object_id,
    "name": object.data.fileAsset.filename,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.data.fileAsset.size),
    // TODO
    "created_time": object.data.created.toISOString(),
    "updated_time": object.data.lastmodified.toISOString(),
    "checksums": object.data.fileAsset.sha256checksum ? [
      {"type": "sha-256", "checksum": Buffer.from(object.data.fileAsset.sha256checksum, 'base64').toString('hex')},
    ] : [],
    // TODO
    // "mime_type":
    "access_methods": [
      {'type': 'https', 'access_id': 'asset'},
    ],
  })
}

async function getPDPObject(object_id: string) {
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
  if (object.data.type === 'dcc_asset' && object.data.a_access_url) {
    const dccAsset = await safeAsync(() => prisma.dccAsset.findFirst({
      where: {
        fileAsset: {
          link: object.data?.a_access_url,
        },
      },
      select: {
        fileAsset: {
          select: {
            filename: true,
            size: true,
            sha256checksum: true,
          },
        },
        created: true,
        lastmodified: true,
      },
    }))
    if (!dccAsset.data?.fileAsset) return null
    return Response.json({
      "id": object_id,
      "name": dccAsset.data.fileAsset.filename,
      "self_uri": `${base_drs}/${object_id}`,
      // TODO: worry about overflow (?)
      "size": Number(dccAsset.data.fileAsset.size),
      // TODO
      "created_time": dccAsset.data.created.toISOString(),
      "updated_time": dccAsset.data.lastmodified.toISOString(),
      "checksums": dccAsset.data.fileAsset.sha256checksum ? [
        {"type": "sha-256", "checksum": Buffer.from(dccAsset.data.fileAsset.sha256checksum, 'base64').toString('hex')},
      ] : [],
      // TODO
      // "mime_type":
      "access_methods": [
        {'type': 'https', 'access_id': 'pdp_asset'},
      ],
    })
  } else if (object.data.type === 'file' && object.data.a_access_url) {
    if (object.data.a_access_url.startsWith('drs://')) {
      // We'll just proxy to the upstream DRS server, hopefully the client doesn't mind this. Redirects don't seem to work
      const upstreamDRS = object.data.a_access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, 'https://$1/ga4gh/drs/v1/objects/$2')
      const req = await fetch(upstreamDRS)
      return Response.json(await req.json(), { status: req.status })
    } else {
      return Response.json({
        "id": object_id,
        "name": object.data.a_label,
        "self_uri": `${base_drs}/${object_id}`,
        // TODO: worry about overflow (?)
        "size": Number(object.data.a_size_in_bytes),
        "created_time": object.data.a_creation_time,
        // TODO
        "checksums": [
          object.data.a_sha256 ? {"type": "sha-256", "checksum": object.data.a_sha256} : null,
          object.data.a_md5 ? {"type": "md5", "checksum": object.data.a_md5} : null,
        ].filter(c => c !== null),
        "mime_type": object.data.a_mime_type,
        "access_methods": [
          {'type': 'https', 'access_id': 'pdp_file'},
        ],
      })
    }
  } else {
    return null
  }
}

export async function GET(request: Request, { params }: { params: { object_id: string } }) {
  let response
  response = await getDccAsset(params.object_id)
  if (response !== null) return response
  response = await getPDPObject(params.object_id)
  if (response !== null) return response
  return Response.json({ msg: 'Not Found', status_code: 404 }, { status: 404 })
}
