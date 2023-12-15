import * as Minio from 'minio'
import singleton from "@/lib/singleton";

const minio = singleton('minio', () => {
  if (
    !process.env.S3_ENDPOINT
    || !process.env.S3_ACCESS_KEY
    || !process.env.S3_SECRET_KEY)
    throw new Error('missing S3 config')
  return new Minio.Client({
    endPoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
  })
})

export default minio
