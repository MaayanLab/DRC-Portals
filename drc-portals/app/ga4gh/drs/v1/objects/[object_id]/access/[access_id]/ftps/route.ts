import prisma from "@/lib/prisma"
import { safeAsync } from "@/utils/safe"
import path from 'path'
import { pythonStream } from "@/utils/python";

const __rootdir = path.resolve(__dirname, '..', '..')

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
  if (!object.data.access_url.startsWith('ftps://')) return null
  process.env.PYTHONPATH = path.resolve(__rootdir, 'drc-portals', 'app', 'ga4gh', 'drs', 'v1', 'objects', '[object_id]', 'access', '[access_id]', 'ftps')
  const stdout = pythonStream('ftps.stream', {
    kargs: [
      {
        access_url: object?.data?.access_url,
      },
    ],
  })
  const stream = new ReadableStream<any>({
    async start(controller) {
      stdout.on('data', chunk => controller.enqueue(chunk))
      stdout.on('end', () => controller.close())
    }
  })
  return new Response(stream, { status: 200 })
}
