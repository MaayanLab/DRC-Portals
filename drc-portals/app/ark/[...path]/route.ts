import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[]  }> }) {
  const { path } = await ctx.params
  // validate our NAAN
  const m = /^ark:\/?61568\/(.+)$/.exec(path.join('/'))
  if (m === null) return Response.redirect(`https://n2t.net/${path.join('/')}`)
  const id = m[1]
  if (id === 'servicestatus') {
    return Response.json({ 'status': 'ok' }, { status: 200 })
  }
  // TODO: serve ARK URIs from DB
  return Response.json({ 'error': 'NotFound' }, { status: 404 })
}
