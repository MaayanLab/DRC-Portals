import prisma from "@/lib/prisma"

async function getDccAssetUrl(object_id: string, access_id: string) {
  if (access_id !== 'primary') return null
  const object = await prisma.dCCAssetNode.findUnique({
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
  })
  if (!object?.dcc_asset.fileAsset?.link) return null
  return { url: object.dcc_asset.fileAsset.link }
}

async function getC2M2FileUrl(object_id: string, access_id: string) {
  const object = await prisma.c2M2FileNode.findUnique({
    where: {
      id: object_id,
    },
    select: {
      access_url: true,
    },
  })
  if (!object?.access_url) return null
  if (object.access_url.startsWith('drs://')) {
    // redirect request to the DRS
    return Response.redirect(object.access_url.replace(/^drs:\/\/([^/]+)\/(.+)$/g, `https://$1/ga4gh/drs/v1/objects/$2/access/${access_id}`), 307)
  }
  return { url: object.access_url }
}

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  let access_url
  access_url = await getDccAssetUrl(params.object_id, params.access_id)
  if (access_url) return Response.json(access_url)
  access_url = await getC2M2FileUrl(params.object_id, params.access_id)
  if (access_url) return Response.json(access_url)
  return Response.json({ 'error': 'Not Found' }, { status: 404 })
}
