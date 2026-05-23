import prisma from "@/lib/prisma"
import { safeAsync } from "@/utils/safe"
import http from 'http'

export async function GET(request: Request, { params }: { params: { object_id: string, access_id: string } }) {
  if (params.access_id !== 'c2m2_file') return null
  const object = await safeAsync(() => prisma.c2M2FileNode.findUnique({
    where: {
      id: params.object_id,
    },
    select: {
      access_url: true,
    },
  }))
  if (!object?.data?.access_url) return null
  if (!object.data.access_url.startsWith('http://')) return null
  const res = await new Promise<http.IncomingMessage>((resolve, reject) => {
    if (!object?.data?.access_url) reject()
    else http.get(object.data.access_url, res => resolve(res))
  })
  const stream = new ReadableStream<any>({
    async start(controller) {
      res.on('data', chunk => controller.enqueue(chunk))
      res.on('end', () => controller.close())
    }
  })
  return new Response(stream, { status: res.statusCode })
}
