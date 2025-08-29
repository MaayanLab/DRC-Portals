import type { JobHelpers } from "graphile-worker";
import path from 'path'
import prisma from "@/lib/prisma";
import python from "@/utils/python";
import graphile from "@/lib/graphile";

export type FAIRShakeTaskPayload = {
  link: string
}

const __rootdir = path.resolve(__dirname, '..', '..')

export async function queue_fairshake(payload: FAIRShakeTaskPayload) {
  const workerUtils = await graphile
  await workerUtils.addJob('fairshake', payload)
}

export default async function process_fairshake(payload: FAIRShakeTaskPayload, helpers: JobHelpers) {
  const { codeAsset, fileAsset, fairAssessments, ...asset } = await prisma.dccAsset.findUniqueOrThrow({
    where: {
      link: payload.link,
    },
    include: {
      codeAsset: true,
      fileAsset: true,
      fairAssessments: {
        select: {
          id: true,
        }
      },
    },
  })
  helpers.abortSignal?.throwIfAborted()
  if (fairAssessments.length > 0) {
    helpers.logger.warn('FAIR assessment already performed')
  }
  if (asset.deleted) {
    helpers.logger.warn('Will not assess deleted asset')
    return
  }
  helpers.logger.info(`Performing FAIR assessment on ${payload.link}...`)
  process.env.PYTHONPATH = path.resolve(__rootdir, 'database', 'fair_assessment')
  let log: string = ''
  const assessment: {
    id: string,
    dcc_id: string,
    type: string,
    link: string,
    rubric: Record<string, number>,
    timestamp: string, // isoformat
  } = await python('assess_fair.assess_dcc_asset', {
    kargs: [
      {
        ...{...asset, created: asset.created.toISOString(), lastmodified: asset.lastmodified.toISOString()},
        ...(fileAsset ? {...fileAsset, size: fileAsset.size?.toString()} : codeAsset ?? {})
      },
    ],
    kwargs: {
      directory: null,
    },
  }, msg => {
    log += msg
    helpers.logger.info(msg)
  })
  helpers.abortSignal?.throwIfAborted()
  helpers.logger.info(`Registering FAIR assessment for ${payload.link}...`)
  await prisma.fairAssessment.create({
    data: {
      id: assessment.id,
      dcc_id: assessment.dcc_id,
      type: assessment.type,
      link: assessment.link,
      rubric: assessment.rubric,
      timestamp: new Date(assessment.timestamp),
      log,
    },
  })
}
