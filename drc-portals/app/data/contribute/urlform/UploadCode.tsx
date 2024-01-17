'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export const saveCodeAsset = async (filename: string, filetype: string, url: string, formDcc: string) => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!((user.role === 'UPLOADER') || (user.role === 'ADMIN') || (user.role === 'DRC_APPROVER'))) throw new Error('not an admin')
    if (!user.email) throw new Error('User email missing')
    let dcc = await prisma.dCC.findFirst({
        where: {
            short_label: formDcc,
        },
    });
    // in  development, if dcc not ingested into database
    if (process.env.NODE_ENV === 'development' && dcc === null) {
        const dccInfo = await prisma.dCC.findMany()
        const dccMapping: { [key: string]: string } = {}
        dccInfo.map((dcc) => {
            dcc.short_label ? dccMapping[dcc.short_label] = dcc.label : dccMapping[dcc.label] = dcc.label
            })
        dcc = await prisma.dCC.create({
            data: {
                label: dccMapping[formDcc],
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')

    const savedUpload = await prisma.dccAsset.upsert({
        where: {
            link: url,
        },
        update: {
            filetype: filetype,
            filename: filename,
            lastmodified: new Date(),
            creator: user.email,
            annotation: {},
            dcc_id: dcc.id,
        },
        create: {
            link: url,
            filetype: filetype,
            filename: filename,
            creator: user.email,
            current: false,
            annotation: {},
            dcc_id: dcc.id,
        }
    });
    revalidatePath('/data/contribute/uploaded')
}