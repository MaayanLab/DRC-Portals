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
      id: true,
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
  return {
    "id": object.id,
    "name": object.dcc_asset.fileAsset.filename,
    "self_uri": `${base_drs}/${object.id}`,
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
  }
}

export async function GET(request: Request, { params }: { params: { object_id: string } }) {
  let object
  object = await getDccAsset(params.object_id)
  if (object !== null) return Response.json(object)
  return Response.json({ msg: 'Not Found', status_code: 404 }, { status: 404 })
}
