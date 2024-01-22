'use server'

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CodeAsset, DccAsset, FileAsset } from '@prisma/client'


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
        const approved = await prisma.dccAsset.update({
            where: {
                link: file.link,
            },
            data: {
                drcapproved: !(file.drcapproved),
            },
        })
        revalidatePath('/data/contribute/uploaded')
        return "updated"

    } else if (file.dcc_drc === 'dcc') {
        const approved = await prisma.dccAsset.update({
            where: {
                link: file.link,
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

    const approved = await prisma.dccAsset.update({
        where: {
            link: file.link,
        },
        data: {
            current: !(file.current)
        },
    })
    revalidatePath('/data/contribute/uploaded')
    return "updated"
}

export async function deleteAsset(file: DccAsset){
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/contribute/uploaded")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")

    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(user.role === 'DRC_APPROVER' || user.role === 'DCC_APPROVER' || user.role === 'ADMIN' || user.role === 'UPLOADER')) throw new Error('user not allowed to delete file')

    const deleted = await prisma.dccAsset.update({
        where: {
            link: file.link,
        },
        data: {
            deleted: true
        },
    })
    revalidatePath('/data/contribute/uploaded')
    return "deleted"
}