import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import Minio from 'minio'

if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY)  throw new Error('missing S3 config');

const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
//   port: 9000,
//   useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
})

export async function GET(req: NextRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        let filename = req.nextUrl.searchParams.get('filename');
        if (!filename) throw new Error('filename not found')
        var size = 0
        minioClient.fGetObject('test-cfde-upload', filename, './downloads/' + filename, function (err: any) {
            if (err) {
            return console.log(err)
            }
            console.log('success')
        })
        return Response.json({ message: 'file downloaded' });
      } catch (err: any) {
        console.log(err.message)
        res.status(400).json({ message: 'Something went wrong' });
        
    } 
};
