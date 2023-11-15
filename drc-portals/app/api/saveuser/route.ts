import type {NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma'


export async function POST(req: Request, res: NextApiResponse) {
    const session = await getServerSession(authOptions)
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data = await req.json();
        // const userId : UserWhereUniqueInput =  session?.user.id;
        const updateUser = await prisma.user.update({
            where: {
                id: session?.user.id,
            },
            data: {
                email: data['email'],

            },
        });
        console.log(updateUser)
        return Response.json({ message: "test" });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Something went wrong' });
    }
};
