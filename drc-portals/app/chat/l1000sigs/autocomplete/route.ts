import { NextRequest } from "next/server";
import singleton from "@/lib/singleton";
import { tsvector_search_index, tsvector_search_index_search } from "@/utils/tsvector";

const geneSearchDB = singleton('geneSearchDBCache', async () => {
  const req = await fetch('https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/info/')
  const res = await req.json()
  const genes = Object.keys(res)
  return tsvector_search_index(genes)
})

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get('q') ?? ''
    if (!search) return Response.json([])
    const searchDb = await geneSearchDB
    return Response.json(tsvector_search_index_search(searchDb, search).slice(0, 10))
}
