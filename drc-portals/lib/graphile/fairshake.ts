import graphile from "@/lib/graphile";

export type FAIRShakeTaskPayload = {
  link: string
}

export async function queue_fairshake(payload: FAIRShakeTaskPayload) {
  const workerUtils = await graphile
  await workerUtils.addJob('fairshake', payload)
}
