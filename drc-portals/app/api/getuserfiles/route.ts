import type {NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma'

export async function GET(req: Request, res: NextApiResponse) {
    const session = await getServerSession(authOptions)
    if (req.method != 'GET') {
        res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                id: session?.user.id,
            },
        })
        if (typeof user?.name === 'string') {
            const userFiles = await prisma.dccAsset.findMany({
                where: {
                    creator: user?.name,
                },
            })
            return Response.json({ message: JSON.stringify(userFiles) });
        }
        return Response.json({ message: JSON.stringify('no files') });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Something went wrong' });
    }
};