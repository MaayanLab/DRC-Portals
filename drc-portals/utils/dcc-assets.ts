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
) {
  const res = await prisma.dccAsset.findMany({
    where: {
      deleted: false,
      dcc_id: dccId, 
      fileAsset: {
        filetype: ft
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
  const data = [] as dccAsset[];
  res.map(item => {
    if (item.fileAsset) {
      data.push({
        dcc_id: dccName,
        filetype: ft,
        filename: (item.fileAsset.filename),
        link: item.link,
        size: convertBytes(item.fileAsset.size),
        lastmodified: item.lastmodified.toLocaleDateString("en-US"),
        creator: item.creator,
        dccapproved: item.dccapproved,
        drcapproved: item.drcapproved,
      })
    }
  })
  return data
}

async function getCode(
  prisma: PrismaClient, dccId: string, dccName: string,
  ft: string, isCurr: boolean
) {
  const res = await prisma.dccAsset.findMany({
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
          name: true
        }
      }
    }
  })
  const data = [] as dccAsset[];
  res.map(item => {
    if (item.codeAsset) {
      data.push({
        dcc_id: dccName,
        filetype: ft,
        filename: (item.codeAsset.name),
        link: item.link,
        size: undefined,
        lastmodified: item.lastmodified.toLocaleDateString("en-US"),
        creator: item.creator,
        dccapproved: item.dccapproved,
        drcapproved: item.drcapproved
      })
    }
  })
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
  return (
    {
      current: await getData(prisma, dccId, dccName, ft, true, is_code),
      archived: await getData(prisma, dccId, dccName, ft, false, is_code),
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
    AttributeTables: await getDataObj(prisma, dccId, dccName, 'Attribute Tables'),
    KGAssertions: await getDataObj(prisma, dccId, dccName, 'KG Assertions'),
    ETL: await getDataObj(prisma, dccId, dccName, 'ETL'),
    API: await getDataObj(prisma, dccId, dccName, 'API'),
    EntityPages: await getDataObj(prisma, dccId, dccName, 'Entity Page Template'),
    PWBMetanodes: await getDataObj(prisma, dccId, dccName, 'PWB Metanodes'),
    ChatbotSpecs: await getDataObj(prisma, dccId, dccName, 'Chatbot Specs'),
  })
}