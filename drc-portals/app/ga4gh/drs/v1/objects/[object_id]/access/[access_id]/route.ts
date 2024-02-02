import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  if (params.access_id !== 'primary') return Response.json({ 'error': 'Not Found' }, { status: 404 })
  const object = await prisma.dCCAssetNode.findUnique({
    where: {
      id: params.object_id,
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
  if (!object?.dcc_asset.fileAsset?.link) return Response.json({ 'error': 'Not Found' }, { status: 404 })
  return Response.json({
    url: object.dcc_asset.fileAsset.link,
  })
}
