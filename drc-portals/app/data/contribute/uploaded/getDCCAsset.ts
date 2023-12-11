'use server'

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { DccAsset } from '@prisma/client'

export async function getDCCAsset(file: {
    dcc_id: string
    filetype: string
    filename: string
    link: string
    lastmodified: string,
    creator: string | null,
    dccapproved: boolean,
    drcapproved: boolean,
    dcc_drc: string
}) {
    if (file.dcc_drc === 'drc') {
        let newFile = await prisma.dccAsset.findFirst({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified,
                dccapproved: file.dccapproved,
                drcapproved: !file.drcapproved,
            },
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })
        if (!newFile) throw new Error('no file found')
        return newFile
    }
    if (file.dcc_drc === 'dcc') {
        let newFile = await prisma.dccAsset.findFirst({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified,
                dccapproved: !file.dccapproved,
                drcapproved: file.drcapproved,
            },
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })
        if (!newFile) throw new Error('no file found')
        return newFile
    }

}


export async function updateAssetApproval(file: {
    dcc: {
        label: string;
    } | null;
} & DccAsset & {
    dcc_drc: string
}) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/contribute/uploaded")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")

    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(user.role === 'DRC_APPROVER' || user.role === 'DCC_APPROVER' || user.role === 'ADMIN')) throw new Error('user not allowed to update status')

    if (file.dcc_drc === 'drc') {
        const approved = await prisma.dccAsset.updateMany({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                link: file.link,
                lastmodified: new Date(file.lastmodified),
                dccapproved: file.dccapproved,
                drcapproved: file.drcapproved

            },
            data: {
                drcapproved: !(file.drcapproved),
            },
        })
        revalidatePath('/data/contribute/uploaded')
        return "updated"

    } else if (file.dcc_drc === 'dcc') {
        const approved = await prisma.dccAsset.updateMany({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                link: file.link,
                lastmodified: new Date(file.lastmodified),
                dccapproved: file.dccapproved,
                drcapproved: file.drcapproved

            },
            data: {
                dccapproved: !(file.dccapproved),
            },
        })
        revalidatePath('/data/contribute/uploaded')
        return "updated"
    }
}

export async function updateAssetCurrent(file: DccAsset) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/contribute/uploaded")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")

    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(user.role === 'DRC_APPROVER' || user.role === 'DCC_APPROVER' || user.role === 'ADMIN')) throw new Error('user not allowed to update status')

    const approved = await prisma.dccAsset.updateMany({
        where: {
            dcc_id: file.dcc_id,
            filetype: file.filetype,
            link: file.link,
            lastmodified: new Date(file.lastmodified),
            dccapproved: file.dccapproved,
            drcapproved: file.drcapproved,
            current: file.current

        },
        data: {
            current: !(file.current)
        },
    })
    revalidatePath('/data/contribute/uploaded')
    return "updated"
}