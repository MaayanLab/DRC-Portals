import type { PrismaClient } from '.prisma/client'

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

async function getCreatorAff(
  prisma: PrismaClient, c: string | null, ftype: string,
  dcc_approval: boolean, drc_approval: boolean, dccName: string
) {
  if (c) {
  // a creator is attached to the file (aka was submitted)
    const creator = await prisma.user.findFirst({
      where: {
        email: c
      },
      select: {
        role: true
      }
    })
    if (creator) { 
      // if DRC or Admin upload, mark as DRC even if user is DCC-affiliated
      if (creator.role == "ADMIN" || creator.role == "DRC_APPROVER") {
        return "DRC"
      // all other roles (aka just UPLOADER), mark as DCC
      } else {
        return dccName
      }
      // if for some reason foreign key mapped creator entry is null (shouldn't happen)
    } else {
      return ""
    }
  // no creator = the file was included in original ingest by DRC
  } else { 
    // handle C2M2 datapackages transferred from CFDE-CC portal
    if (dcc_approval && drc_approval && (ftype == "C2M2")) {
      return dccName
    // in all other cases with no creator, mark as DRC upload
    } else {
      return "DRC"
    }
  }
}

function getDccShortLabel(
  dcc: {short_label: string | null} | null, dccName: string
) {
  if (dcc) {
    return dcc.short_label ? dcc.short_label : dccName
  } else {
    return dccName
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
      },
      dcc: {
        select: {
          short_label: true
        }
      }
    }
  })
  const filter_res = res.filter((item) => item.fileAsset != null)
  var data : dccAsset[] = await Promise.all(filter_res.map(async item => ({
    dcc_id: dccName,
    filetype: ft,
    filename: item.fileAsset ? item.fileAsset.filename : '',
    link: item.link,
    size: item.fileAsset ? convertBytes(item.fileAsset.size) : undefined,
    lastmodified: item.lastmodified.toLocaleDateString("en-US"),
    creator: await getCreatorAff(
      prisma, item.creator, ft, item.dccapproved, item.drcapproved, getDccShortLabel(item.dcc, dccName)),
    dccapproved: item.dccapproved,
    drcapproved: item.drcapproved
    }
  )))
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
          name: true,
          entityPageExample: true,
          openAPISpec: true,
          smartAPIURL: true,
          smartAPISpec: true
        }
      },
      dcc: {
        select: {
          short_label: true
        }
      }
    }
  })
  const filter_res = res.filter((item) => item.codeAsset != null)
  var data : dccAsset[] = await Promise.all(filter_res.map(async item => ({
    dcc_id: dccName,
    filetype: ft,
    filename: item.codeAsset ? item.codeAsset.name : '',
    link: item.link,
    lastmodified: item.lastmodified.toLocaleDateString("en-US"),
    creator: await getCreatorAff(
      prisma, item.creator, ft, item.dccapproved, item.drcapproved, getDccShortLabel(item.dcc, dccName)),
    dccapproved: item.dccapproved,
    drcapproved: item.drcapproved,
    entitypage: item.codeAsset ? item.codeAsset.entityPageExample : '',
    openapi: item.codeAsset ? item.codeAsset.openAPISpec : false,
    smartapi: item.codeAsset ? item.codeAsset.smartAPISpec : false,
    smartapiurl: item.codeAsset ? item.codeAsset.smartAPIURL : ''
    })))
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
    AttributeTables: await getDataObj(prisma, dccId, dccName, 'Attribute Table'),
    KGAssertions: await getDataObj(prisma, dccId, dccName, 'KG Assertions'),
    ETL: await getDataObj(prisma, dccId, dccName, 'ETL'),
    API: await getDataObj(prisma, dccId, dccName, 'API'),
    EntityPages: await getDataObj(prisma, dccId, dccName, 'Entity Page Template'),
    PWBMetanodes: await getDataObj(prisma, dccId, dccName, 'PWB Metanodes'),
    ChatbotSpecs: await getDataObj(prisma, dccId, dccName, 'Chatbot Specs'),
  })
}
