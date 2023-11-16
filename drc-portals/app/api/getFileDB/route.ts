import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import * as Minio from 'minio'

if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY)  throw new Error('missing S3 config');


var minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
//   port: 9000,
//   useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
})

export async function GET(req: NextRequest, res: NextApiResponse) {
    try {
        const filename = req.nextUrl.searchParams.get('name')
        if (!filename) throw new Error('filename not found')

        const url = await minioClient.presignedPutObject('test-cfde-upload', filename)
        console.log('Success', url)
        return Response.json({ message: url });
      } catch (err: any) {
        console.log(err.message)
        res.status(400).json({ message: 'Something went wrong' });
        
    } 
};

export const dynamic = "force-dynamic";
