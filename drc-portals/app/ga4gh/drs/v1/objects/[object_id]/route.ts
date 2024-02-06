import prisma from "@/lib/prisma"

const base_drs = process.env.PUBLIC_URL?.replace(/^https?/g, 'drs')
if (!base_drs) throw new Error('Missing env.PUBLIC_URL')

// TODO: c2m2 files
// TODO: bundles

async function getDccAsset(object_id: string) {
  const object = await prisma.dCCAssetNode.findUnique({
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
          lastmodified: true,
        },
      },
    },
  })
  if (!object?.dcc_asset.fileAsset) return null
  return Response.json({
    "id": object_id,
    "name": object.dcc_asset.fileAsset.filename,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.dcc_asset.fileAsset.size),
    // TODO
    "created_time": object.dcc_asset.lastmodified.toISOString(),
    "updated_time": object.dcc_asset.lastmodified.toISOString(),
    "checksums": object.dcc_asset.fileAsset.sha256checksum ? [
      {"type": "sha-256", "checksum": Buffer.from(object.dcc_asset.fileAsset.sha256checksum, 'base64').toString('hex')},
    ] : [],
    // TODO
    // "mime_type":
    "access_methods": [
      {'type': 'https', 'access_id': 'primary'},
    ],
  })
}

async function getC2M2File(object_id: string) {
  const object = await prisma.c2M2FileNode.findUnique({
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
  })
  if (!object?.node.label || !object.access_url) return null
  if (object.access_url.startsWith('drs://')) {
    // We'll just proxy to the upstream DRS server, hopefully the client doesn't mind this. Redirects don't seem to work
    const upstreamDRS = object.access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, 'https://$1/ga4gh/drs/v1/objects/$2')
    const req = await fetch(upstreamDRS)
    if (req.ok) return Response.json(await req.json(), { status: req.status })
    else if (req.status === 404) return null
    else return req
  }
  return Response.json({
    "id": object_id,
    "name": object.node.label,
    "self_uri": `${base_drs}/${object_id}`,
    // TODO: worry about overflow (?)
    "size": Number(object.size_in_bytes),
    "created_time": object.creation_time ? object.creation_time.toISOString() : undefined,
    // TODO
    // "updated_time": object.dcc_asset.lastmodified.toISOString(),
    "checksums": [
      object.sha256 ? {"type": "sha-256", "checksum": object.sha256} : null,
      object.md5 ? {"type": "md5", "checksum": object.md5} : null,
    ].filter(c => c !== null),
    "mime_type": object.mime_type,
    "access_methods": [
      {'type': 'https', 'access_id': 'primary'},
    ],
  })
}

export async function GET(request: Request, { params }: { params: { object_id: string } }) {
  let object
  object = await getDccAsset(params.object_id)
  if (object !== null) return object
  object = await getC2M2File(params.object_id)
  if (object !== null) return object
  return Response.json({ msg: 'Not Found', status_code: 404 }, { status: 404 })
}
