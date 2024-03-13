import { PrismaClient } from '@prisma/client';

export type dccAsset = {
  dcc_id: string
  filetype: string;
  filename: string;
  link: string;
  size?: string;
  lastmodified: string;
  creator: string | null;
  dccapproved: boolean;
  drcapproved: boolean;
  entitypage?: string | null;
  openapi?: boolean | null;
  smartapi?: boolean | null;
  smartapiurl?: string | null
}

export type dccAssetObj = {
  isCode: boolean,
  current: dccAsset[],
  archived: dccAsset[]
}

export type dccAssetRecord = Record<string, dccAssetObj>

function convertBytes(b: bigint | null) {
  if(b) {
    let sizes = ['B', 'Kb', 'Mb', 'Gb', 'Tb']
    let e = Math.floor(Math.log(Number(b)) / Math.log(1024));
    return (
      (Number(b) / Math.pow(1024, e)).toFixed(1) + ' ' + sizes[e]
    )
  } 
}

async function getFile(
  prisma: PrismaClient, dccId: string, dccName: string,
  ft: string, isCurr: boolean
): Promise<dccAsset[]> {
  const data = (
    await prisma.dccAsset.findMany({
      where: {
        deleted: false,
        dcc_id: dccId, 
        fileAsset: {
          filetype: ft,
        },
        current: isCurr
      },
      include: {
        fileAsset: {
          select: {
            filename: true,
            size: true
          }
        }
      }
    })
  )
    .filter((item): item is typeof item & { fileAsset: Exclude<typeof item['fileAsset'], null> } => !!item.fileAsset)
    .map(item => ({
      dcc_id: dccName,
      filetype: ft,
      filename: (item.fileAsset.filename),
      link: item.link,
      size: convertBytes(item.fileAsset.size),
      lastmodified: item.lastmodified.toLocaleDateString("en-US"),
      creator: item.creator,
      dccapproved: item.dccapproved,
      drcapproved: item.drcapproved
    }))
  return data
}

async function getCode(
  prisma: PrismaClient, dccId: string, dccName: string,
  ft: string, isCurr: boolean
) {
  const data = (
    await prisma.dccAsset.findMany({
      where: {
        deleted: false,
        dcc_id: dccId, 
        codeAsset: {
          type: ft
        },
        current: isCurr
      },
      include: {
        codeAsset: {
          select: {
            name: true,
            entityPageExample: true,
            openAPISpec: true,
            smartAPIURL: true,
            smartAPISpec: true
          }
        }
      }
    })
  )
    .filter((item): item is typeof item & { codeAsset: Exclude<typeof item['codeAsset'], null> } => !!item.codeAsset)
    .map(item => ({
      dcc_id: dccName,
      filetype: ft,
      filename: item.codeAsset.name,
      link: item.link,
      lastmodified: item.lastmodified.toLocaleDateString("en-US"),
      creator: item.creator,
      dccapproved: item.dccapproved,
      drcapproved: item.drcapproved,
      entitypage: item.codeAsset.entityPageExample,
      openapi: item.codeAsset.openAPISpec,
      smartapi: item.codeAsset.smartAPISpec,
      smartapiurl: item.codeAsset.smartAPIURL
    }))
  return data
}

async function getData(
  prisma: PrismaClient, dccId: string, dccName: string, 
  ft: string, isCurr: boolean, isCode: boolean
) {
  const data = isCode ? await getCode(
      prisma, dccId, dccName, ft, isCurr
    ) : await getFile(
      prisma, dccId, dccName, ft, isCurr
    )
  return data
}

async function getDataObj(
  prisma: PrismaClient, dccId: string, dccName: string, ft: string
) {
  const codetypes = ['ETL', 'API', 'Entity Page Template', 'PWB Metanodes', 'Chatbot Specs']
  const is_code = codetypes.includes(ft)
  return Object.fromEntries(await Promise.all([
    getData(prisma, dccId, dccName, ft, true, is_code).then(data => ['current', data]),
    getData(prisma, dccId, dccName, ft, false, is_code).then(data => ['archived', data]),
    Promise.resolve(['isCode', is_code])
  ]))
}

export async function getDccDataObj(
  prisma: PrismaClient, dccId: string, dccName: string
) {
  return Object.fromEntries(await Promise.all([
    getDataObj(prisma, dccId, dccName, 'C2M2').then(data => ['C2M2', data]),
    getDataObj(prisma, dccId, dccName, 'XMT').then(data => ['XMT', data]),
    getDataObj(prisma, dccId, dccName, 'Attribute Tables').then(data => ['AttributeTables', data]),
    getDataObj(prisma, dccId, dccName, 'KG Assertions').then(data => ['KGAssertions', data]),
    getDataObj(prisma, dccId, dccName, 'ETL').then(data => ['ETL', data]),
    getDataObj(prisma, dccId, dccName, 'API').then(data => ['API', data]),
    getDataObj(prisma, dccId, dccName, 'Entity Page Template').then(data => ['EntityPages', data]),
    getDataObj(prisma, dccId, dccName, 'PWB Metanodes').then(data => ['PWBMetanodes', data]),
    getDataObj(prisma, dccId, dccName, 'Chatbot Specs').then(data => ['ChatbotSpecs', data]),
  ]))
}
