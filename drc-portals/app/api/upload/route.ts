import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod'

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id }
    })
    if (!user.email) throw new Error('User email missing')

    const data = z.object({
      filetype: z.string(),
      filename: z.string(),
      size: z.number(),
      annotation: z.record(z.string()),
      dcc_string: z.string(),
    }).parse(await req.json());

    let dcc = await prisma.dCC.findFirst({
      where: {
        short_label: data.dcc_string,
      },
    });

    if (process.env.NODE_ENV === 'development' && dcc === null) {
      dcc = await prisma.dCC.create({data: {
        label: data.dcc_string,
        short_label: data.dcc_string,
        homepage: 'https://lincsproject.org'
      }});
    }
    if (dcc === null) throw new Error('Failed to find DCC')

    const savedUpload = await prisma.dccAsset.create({ 
      data: {
        link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${data.filetype}/${new Date().toJSON().slice(0, 10)}/${data.filename}`,
        filetype: data.filetype,
        filename: data.filename,
        creator: user.email,
        annotation: data.annotation,
        size: data.size,
        dcc_id: dcc.id,
      }
    });
     return Response.json({message: "Success"});
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Something went wrong' });
  }
};
