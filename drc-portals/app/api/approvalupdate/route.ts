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

    const file = z.object({
        dcc_id : z.string(),
        filetype :z.string(),
        link: z.string(),
        lastmodified: z.string(),
        creator: z.string(),
        approved: z.boolean(),
    }).parse(await req.json());

    const dcc = await prisma.dccAsset.findMany({
        where: {
          dcc_id : file.dcc_id,
          filetype :file.filetype,
          link: file.link,
          lastmodified: new Date(file.lastmodified),
          creator: file.creator,
          approved: file.approved

        }
      })
      console.log(dcc)
      console.log(new Date(file.lastmodified))

    const approved = await prisma.dccAsset.updateMany({
        where: {
          dcc_id : file.dcc_id,
          filetype :file.filetype,
          link: file.link,
          lastmodified: new Date(file.lastmodified),
          creator: file.creator,
          approved: file.approved

        },
        data: {
          approved: true,
        },
      })

     return Response.json({message: "Success"});
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Something went wrong' });
  }
};
