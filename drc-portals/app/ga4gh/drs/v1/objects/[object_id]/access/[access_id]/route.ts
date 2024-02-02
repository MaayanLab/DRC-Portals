import prisma from "@/lib/prisma"

async function getDccAssetUrl(object_id: string) {
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

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  if (params.access_id !== 'primary') return Response.json({ msg: 'Access ID Not Found', status_code: 404 }, { status: 404 })
  let access_url
  access_url = await getDccAssetUrl(params.object_id)
  if (access_url) return Response.json(access_url)
  return Response.json({ 'error': 'Not Found' }, { status: 404 })
}
