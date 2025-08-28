import prisma from "@/lib/prisma"
import prismaPDP from "@/lib/prisma/slow"
import prismaC2M2 from "@/lib/prisma/c2m2"
import { safeAsync } from "@/utils/safe"

const base_drs = process.env.PUBLIC_URL?.replace(/^https?/g, 'drs')
if (!base_drs) throw new Error('Missing env.PUBLIC_URL')

// TODO: c2m2 files
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

async function getDccAssetNode(object_id: string) {
  const object = await safeAsync(() => prisma.dCCAssetNode.findUnique({
    where: {
      id: object_id,
    },
    select: {
      dcc_asset: {
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
      },
    },
  }))
  if (!object?.data?.dcc_asset.fileAsset) return null
  return Response.json({
    "id": object_id,
    "name": object.data.dcc_asset.fileAsset.filename,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.data.dcc_asset.fileAsset.size),
    // TODO
    "created_time": object.data.dcc_asset.created.toISOString(),
    "updated_time": object.data.dcc_asset.lastmodified.toISOString(),
    "checksums": object.data.dcc_asset.fileAsset.sha256checksum ? [
      {"type": "sha-256", "checksum": Buffer.from(object.data.dcc_asset.fileAsset.sha256checksum, 'base64').toString('hex')},
    ] : [],
    // TODO
    // "mime_type":
    "access_methods": [
      {'type': 'https', 'access_id': 'asset_node'},
    ],
  })
}

async function getPDPFile(object_id: string) {
  const object = await safeAsync(() => prismaPDP.c2M2FileNode.findUnique({
    where: {
      id: object_id,
    },
    select: {
      access_url: true,
      mime_type: true,
      md5: true,
      sha256: true,
      size_in_bytes: true,
      persistent_id: true,
      creation_time: true,
      node: {
        select: {
          label: true,
        },
      },
    },
  }))
  if (!object?.data?.node.label || !object.data?.access_url) return null
  if (object.data.access_url.startsWith('drs://')) {
    // We'll just proxy to the upstream DRS server, hopefully the client doesn't mind this. Redirects don't seem to work
    const upstreamDRS = object.data.access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, 'https://$1/ga4gh/drs/v1/objects/$2')
    const req = await fetch(upstreamDRS)
    if (req.ok) return Response.json(await req.json(), { status: req.status })
    else if (req.status === 404) return null
    else return req
  }
  return Response.json({
    "id": object_id,
    "name": object.data.node.label,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.data.size_in_bytes),
    "created_time": object.data.creation_time ? object.data.creation_time.toISOString() : undefined,
    // TODO
    // "updated_time": object.dcc_asset.lastmodified.toISOString(),
    "checksums": [
      object.data.sha256 ? {"type": "sha-256", "checksum": object.data.sha256} : null,
      object.data.md5 ? {"type": "md5", "checksum": object.data.md5} : null,
    ].filter(c => c !== null),
    "mime_type": object.data.mime_type,
    "access_methods": [
      {'type': 'https', 'access_id': 'pdp_file'},
    ],
  })
}

async function getC2M2File(object_id: string) {
  // TODO: any other way to get a unique opaque id?
  const object = await safeAsync(() => prismaC2M2.file.findFirstOrThrow({
    where: {
      sha256: object_id,
    },
    select: {
      access_url: true,
      mime_type: true,
      md5: true,
      sha256: true,
      size_in_bytes: true,
      persistent_id: true,
      creation_time: true,
      filename: true,
    },
  }))
  if (!object?.data?.filename || !object.data?.access_url) return null
  if (object.data.access_url.startsWith('drs://')) {
    // We'll just proxy to the upstream DRS server, hopefully the client doesn't mind this. Redirects don't seem to work
    const upstreamDRS = object.data.access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, 'https://$1/ga4gh/drs/v1/objects/$2')
    const req = await fetch(upstreamDRS)
    if (req.ok) return Response.json(await req.json(), { status: req.status })
    else if (req.status === 404) return null
    else return req
  }
  return Response.json({
    "id": object_id,
    "name": object.data.filename,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.data.size_in_bytes),
    "created_time": object.data.creation_time ? object.data.creation_time : undefined,
    // TODO
    // "updated_time": object.dcc_asset.lastmodified.toISOString(),
    "checksums": [
      object.data.sha256 ? {"type": "sha-256", "checksum": object.data.sha256} : null,
      object.data.md5 ? {"type": "md5", "checksum": object.data.md5} : null,
    ].filter(c => c !== null),
    "mime_type": object.data.mime_type,
    "access_methods": [
      {'type': 'https', 'access_id': 'c2m2_file'},
    ],
  })
}

export async function GET(request: Request, { params }: { params: { object_id: string } }) {
  let object
  object = await getDccAsset(params.object_id)
  if (object !== null) return object
  object = await getDccAssetNode(params.object_id)
  if (object !== null) return object
  object = await getPDPFile(params.object_id)
  if (object !== null) return object
  object = await getC2M2File(params.object_id)
  if (object !== null) return object
  return Response.json({ msg: 'Not Found', status_code: 404 }, { status: 404 })
}
