'use server'

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CodeAsset, DccAsset, FileAsset } from '@prisma/client'
import { render } from '@react-email/render';
import { ApprovedAlert } from "../Email"

var nodemailer = require('nodemailer');

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
            include: {
                dcc: {
                    select: {
                        label: true,
                        short_label: true
                    }
                },
                codeAsset: true,
                fileAsset: true
            }
        })
        revalidatePath('/data/contribute/uploaded')
        await sendDCCApproverEmail(approved)
        return "updated"

    } else if (file.dcc_drc === 'dcc') {
        const approved = await prisma.dccAsset.update({
            where: {
                link: file.link,
            },
            data: {
                dccapproved: !(file.dccapproved),
            },
            include: {
                dcc: {
                    select: {
                        label: true,
                        short_label: true
                    }
                },
                codeAsset: true,
                fileAsset: true
            }
        })
        revalidatePath('/data/contribute/uploaded')
        await sendDCCApproverEmail(approved)
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

export async function deleteAsset(file: DccAsset) {
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

export async function sendDCCApproverEmail(asset: {
    dcc: {
        label: string;
        short_label: string | null;
    } | null; 
    fileAsset: FileAsset | null, 
    codeAsset: CodeAsset | null
} & DccAsset | null) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    if (asset) {
        const uploader = await prisma.user.findMany({
            where: {
                email: asset.creator
            }
        });
        const DCCApprovers = await prisma.user.findMany({
            where: {
                dcc: asset.dcc?.short_label, 
                role: 'DCC_APPROVER'
            }
        });
        const DRCApprovers = await prisma.user.findMany({
            where: {
                role: 'DRC_APPROVER'
            }
        });
    
        const userArray = uploader.concat(DCCApprovers, DRCApprovers);
        const emailRecipients = userArray.map((user) => user.email).join(',');
        let assetName : string;
        asset.codeAsset ? assetName=asset.codeAsset.name : assetName= asset.fileAsset ? asset.fileAsset?.filename : ''
        const emailHtml = render(<ApprovedAlert assetName={assetName} />);
        if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
        const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
        const transporter = nodemailer.createTransport(server)
        transporter.sendMail({
            from: from,
            to: emailRecipients,
            subject: 'DRC Portal: Asset Approval Confirmation',
            html: emailHtml,
        })
    }
}