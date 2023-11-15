import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import Minio from 'minio'

if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY)  throw new Error('missing S3 config');


const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
})


export async function GET(req: NextRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        let filename = req.nextUrl.searchParams.get('name');
        let dcc = req.nextUrl.searchParams.get('dcc');
        let filetype = req.nextUrl.searchParams.get('filetype');
        let date = req.nextUrl.searchParams.get('date');
        if ((filename !=null) && (dcc != null) && (filetype != null) && (date != null)){
            const url = await minioClient.presignedPutObject('test-cfde-upload', '/' + dcc + '/' + filetype + '/'+  date + '/' + filename)
            console.log('Success', url)
            return Response.json({ message: url });
        } else {
            return Response.json({ message: 'missing params' });
        }

      } catch (err: any) {
        console.log(err.message)
        res.status(400).json({ message: 'Something went wrong' });
        
    } 
};

