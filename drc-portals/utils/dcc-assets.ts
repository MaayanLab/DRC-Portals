import { PrismaClient } from '@prisma/client';

export type dccAsset = {
  dcc_id: string
  filetype: string;
  filename: string;
  link: string;
  size?: string;
  lastmodified: string;
  creator: string;
  approved: boolean
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

async function getData(
  prisma: PrismaClient, dccId: string, dccName: string, ft: string, isCurr: boolean
) {
  const res = await prisma.dccAsset.findMany({
    where: {
      dcc_id: dccId, 
      filetype: ft,
      current: isCurr
    }
  })
  const data = [] as dccAsset[];
  res.map(item => {
    data.push({
      dcc_id: dccName,
      filetype: ft,
      filename: item.filename,
      link: item.link,
      size: convertBytes(item.size),
      lastmodified: item.lastmodified.toLocaleDateString("en-US"),
      creator: item.creator,
      approved: item.approved
    })
  })
  return data
}

async function getDataObj(
  prisma: PrismaClient, dccId: string, dccName: string, ft: string
) {
  const codetypes = ['ETL', 'API', 'EntityPages', 'PWBMetanodes', 'ChatbotSpecs']
  const is_code = codetypes.includes(ft)
  return (
    {
      current: await getData(prisma, dccId, dccName, ft, true),
      archived: await getData(prisma, dccId, dccName, ft, false),
      isCode: is_code
    }
  )
}

export async function getDccDataObj(
  prisma: PrismaClient, dccId: string, dccName: string
) {
  return ({
    C2M2: await getDataObj(prisma, dccId, dccName, 'C2M2'),
    XMT: await getDataObj(prisma, dccId, dccName, 'XMT'),
    AttributeTables: await getDataObj(prisma, dccId, dccName, 'AttributeTables'),
    KGAssertions: await getDataObj(prisma, dccId, dccName, 'KGAssertions'),
    KCAssertions: await getDataObj(prisma, dccId, dccName, 'KCAssertions'),
    ETL: await getDataObj(prisma, dccId, dccName, 'ETL'),
    API: await getDataObj(prisma, dccId, dccName, 'API'),
    EntityPages: await getDataObj(prisma, dccId, dccName, 'EntityPages'),
    PWBMetanodes: await getDataObj(prisma, dccId, dccName, 'PWBMetanodes'),
    ChatbotSpecs: await getDataObj(prisma, dccId, dccName, 'ChatbotSpecs'),
  })
}