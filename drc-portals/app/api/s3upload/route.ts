import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from 'zod'
import minio from "@/lib/minio";

export async function GET(req: NextRequest, res: NextApiResponse) {
  try {
    if (!process.env.S3_BUCKET) throw new Error('Misconfiguration')
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')
    const rawSearchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
    const searchParams = z.object({
      name: z.string(),
      // TODO: this should come directly from the user's db profile
      //       otherwise users may upload on behalf of other dccs
      dcc: z.string(),
      filetype: z.string(),
      date: z.string(),
    }).parse(rawSearchParams)
    const url = await minio.presignedPutObject(process.env.S3_BUCKET, searchParams.dcc + '/' + searchParams.filetype + '/'+  searchParams.date + '/' + searchParams.name)
    return Response.json({ message: url });
  } catch (err: any) {
    console.log(err.message)
    res.status(400).json({ message: 'Something went wrong' });
  } 
};

export const dynamic = "force-dynamic";
