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
        drcapproved: z.boolean(),
        dcc_drc: z.string()
    }).parse(await req.json());



    if (file.dcc_drc ==='drc') {
        const approved = await prisma.dccAsset.updateMany({
            where: {
              dcc_id : file.dcc_id,
              filetype :file.filetype,
              link: file.link,
              lastmodified: new Date(file.lastmodified),
              creator: file.creator,
              approved: file.approved,
              drcapproved: file.drcapproved
    
            },
            data: {
              drcapproved: true,
            },
          })
    
         return Response.json({message: "Success"});

    } else if  (file.dcc_drc ==='dcc') {
        const approved = await prisma.dccAsset.updateMany({
            where: {
              dcc_id : file.dcc_id,
              filetype :file.filetype,
              link: file.link,
              lastmodified: new Date(file.lastmodified),
              creator: file.creator,
              approved: file.approved,
              drcapproved: file.drcapproved
    
            },
            data: {
                approved: true,
            },
          })
    
         return Response.json({message: "Success"});
    } else {
        throw new Error('not dcc or drc update')
    }

  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Something went wrong' });
  }
};
