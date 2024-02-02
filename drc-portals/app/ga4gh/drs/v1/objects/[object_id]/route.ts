import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { object_id: string } }) {
  const public_url = process.env.PUBLIC_URL
  if (!public_url) return Response.json({ 'error': 'Server Misconfiguration' }, { status: 500 })
  // TODO: c2m2 files
  // TODO: bundles
  const object = await prisma.dCCAssetNode.findUnique({
    where: {
      id: params.object_id,
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
  if (!object || !object.dcc_asset.fileAsset) return Response.json({ 'error': 'Not Found' }, { status: 404 })
  return Response.json({
    "id": object.id,
    "name": object.dcc_asset.fileAsset.filename,
    "self_uri": `${public_url.replace(/^https?/g, 'drs')}/${object.id}`,
    "size": object.dcc_asset.fileAsset.size,
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
