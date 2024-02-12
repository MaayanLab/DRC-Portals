import { NextRequest } from "next/server";
import singleton from "@/lib/singleton";
import { TSVectorDB } from "@/utils/tsvector";

const geneSearchDB = singleton('geneSearchDBCache', async () => {
  const req = await fetch('https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/info/')
  const res = await req.json()
  const genes = Object.keys(res)
  const searchdb = new TSVectorDB()
  genes.forEach(gene => searchdb.add(gene))
  return searchdb
})

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get('q') ?? ''
    if (!search) return Response.json([])
    const searchDb = await geneSearchDB
    return Response.json(searchDb.search(search).slice(0, 10))
}

