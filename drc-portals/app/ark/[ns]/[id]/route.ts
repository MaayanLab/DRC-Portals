import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ ns: string, id: string  }> }) {
  const { ns, id } = await ctx.params
  // validate OUR ark namespace when we have one
  if (/^ark:.+?$/.exec(ns) === null) {
    return Response.json({ 'error': 'NotFound' }, { status: 404 })
  }
  if (id === 'servicestatus') {
    return Response.json({ 'status': 'ok' }, { status: 200 })
  }
  return Response.json({ 'error': 'NotFound' }, { status: 404 })
}
