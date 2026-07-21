import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ ns: string, path: string[]  }> }) {
  const { ns, path } = await ctx.params
  const id = path.join('/')
  // validate OUR ark namespace when we have one
  if (/^ark:.+?$/.exec(ns) !== null) {
    if (id === 'servicestatus') {
      return Response.json({ 'status': 'ok' }, { status: 200 })
    } else {
      return Response.json({ 'error': 'NotFound' }, { status: 404 })
    }
  } else {
    return Response.redirect(`https://n2t.net/${ns}/${id}`)
  }
}
