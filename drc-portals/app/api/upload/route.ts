import type { NextApiResponse } from 'next';

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma'


export async function POST(req: Request, res: NextApiResponse) {
  try {
    const data = await req.json();

    const dccString = await prisma.dCC.findFirst({
      where: {
        label: data.dcc_string,
      },
    });


    if (dccString === null) {
      await prisma.dCC.create({data: {
        label: "LINCS",
        homepage: 'https://lincsproject.org'
      }});
    }

    data['dcc'] = dccString;
    let dcc_id = data['dcc']['id']
    let dcc_info = {
      connect: {   // must specify `create`, `connect`, or `connectOrCreate`
        id: dcc_id
      }
    }   
    delete data['dcc']
    delete data['dcc_string']
    delete data['dcc_id']
    data['dcc'] = dcc_info
    const savedUpload = await prisma.dccAsset.create({ 
      data: data
    });
     return Response.json({message: "test"});
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Something went wrong' });
  }
};

