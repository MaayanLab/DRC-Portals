import minio from "@/lib/minio";
import { procedure, router } from "@/lib/trpc";
import { z } from 'zod'

export default router({
  presignedPutObject: procedure.input(z.string()).mutation(async (props) => {
    const presignedUrl = await minio.presignedPutObject(`${process.env.S3_BUCKET}`, props.input)
    return presignedUrl
  })
})
