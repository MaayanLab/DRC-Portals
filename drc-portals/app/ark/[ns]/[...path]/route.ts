import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ ns: string, path: string[]  }> }) {
  const { ns, path } = await ctx.params
  const id = path.join('/')
  // validate our NAAN
  if (ns !== 'ark:61568') return Response.redirect(`https://n2t.net/${ns}/${id}`)
  if (id === 'servicestatus') {
    return Response.json({ 'status': 'ok' }, { status: 200 })
  }
  // TODO: serve ARK URIs from DB
  return Response.json({ 'error': 'NotFound' }, { status: 404 })
}
