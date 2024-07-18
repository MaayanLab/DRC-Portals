'use server'

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CodeAsset, DccAsset, FileAsset } from '@prisma/client'
import { render } from '@react-email/render';
import { DCCApprover_DCCApprovedEmail, DCCApprover_DRCApprovedEmail, DRCApprover_DCCApprovedEmail, DRCApprover_DRCApprovedEmail, Uploader_DCCApprovedEmail, Uploader_DRCApprovedEmail } from "../Email"

import nodemailer from 'nodemailer'

export async function updateAssetApproval(file: {
    dcc: {
        label: string;
    } | null;
} & DccAsset & {
    dcc_drc: string
}) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/submit/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(session.user.role === 'DRC_APPROVER' || session.user.role === 'DCC_APPROVER' || session.user.role === 'ADMIN')) throw new Error('user not allowed to update status')
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
        if (file.drcapproved === false) {
            await sendDRCApprovedEmails(approved)
        }
        revalidatePath('/data/submit/uploaded')
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
        revalidatePath('/data/submit//uploaded')
        if (file.dccapproved === false) {
            await sendDCCApprovedEmails(approved)
        }
        return "updated"
    }
}

export async function updateAssetCurrent(file: DccAsset) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/submit/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(session.user.role === 'DRC_APPROVER' || session.user.role === 'DCC_APPROVER' || session.user.role === 'ADMIN')) throw new Error('user not allowed to update status')
    const approved = await prisma.dccAsset.update({
        where: {
            link: file.link,
        },
        data: {
            current: !(file.current)
        },
    })
    revalidatePath('/data/submit/uploaded')
    return "updated"
}


export async function deleteAsset(file: DccAsset) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/submit/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this function 
    if (!(session.user.role === 'DRC_APPROVER' || session.user.role === 'DCC_APPROVER' || session.user.role === 'ADMIN' || session.user.role === 'UPLOADER')) throw new Error('user not allowed to delete file')
    const deleted = await prisma.dccAsset.update({
        where: {
            link: file.link,
        },
        data: {
            deleted: true
        },
    })
    revalidatePath('/data/submit/uploaded')
    return "deleted"
}


export async function sendDCCApprovedEmails(asset: {
    dcc: {
        label: string;
        short_label: string | null;
    } | null;
    fileAsset: FileAsset | null,
    codeAsset: CodeAsset | null
} & DccAsset | null) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
    // user here is a DCC approver
    if (session.user.role === 'DCC_APPROVER') {
        if (asset) {
            const uploader = await prisma.user.findFirst({
                where: {
                    email: asset.creator
                }
            });
            const DCCApproversList = await prisma.dCC.findFirst({
                where: {
                    short_label: asset.dcc?.short_label
                }, 
                select: {
                    Users : {
                        where : {
                            role: 'DCC_APPROVER'
                        }
                    }
                }
            })
            const DCCApprovers = DCCApproversList ? DCCApproversList.Users : []
            const DRCApprovers = await prisma.user.findMany({
                where: {
                    role: 'DRC_APPROVER'
                }
            });
            if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
            const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
            // email uploader 
            if (uploader) {
                const emailHtml = render(<Uploader_DCCApprovedEmail uploaderName={uploader.name}
                    approverName={session.user.name ? session.user.name : 'Unknown'} asset={asset} />);
                const transporter = nodemailer.createTransport(server)
                if (uploader.email) {
                    transporter.sendMail({
                        from: from,
                        to: uploader.email,
                        subject: 'CFDE WORKBENCH Asset Approval Confirmation',
                        html: emailHtml,
                    })
                }

            }
            // email dcc approvers
            DCCApprovers.forEach((approver => {
                const emailHtml = render(<DCCApprover_DCCApprovedEmail approverName={approver.name ? approver.name : ''} asset={asset} />);
                const transporter = nodemailer.createTransport(server)
                if (approver.email) {
                    transporter.sendMail({
                        from: from,
                        to: approver.email,
                        subject: 'CFDE WORKBENCH Asset Approval Confirmation',
                        html: emailHtml,
                    })
                }

            }))
            // email drc approvers
            DRCApprovers.forEach((approver => {
                const emailHtml = render(<DRCApprover_DCCApprovedEmail reviewerName={approver.name ? approver.name : 'Unknown'}
                    uploaderName={uploader ? uploader.name : 'Unknown'} approverName={session.user.name ? session.user.name : 'Unknown'}
                    dcc={asset.dcc ? asset.dcc?.short_label : 'Unknown'} />);
                const transporter = nodemailer.createTransport(server)
                if (approver.email) {
                    transporter.sendMail({
                        from: from,
                        to: approver.email,
                        subject: 'CFDE WORKBENCH Portal Submitted Asset Needs Your Approval',
                        html: emailHtml,
                    })
                }
            }))
        }
    }
}


export async function sendDRCApprovedEmails(asset: {
    dcc: {
        label: string;
        short_label: string | null;
    } | null;
    fileAsset: FileAsset | null,
    codeAsset: CodeAsset | null
} & DccAsset | null) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
    // user here is a DRC approver
    if (session.user.role === 'DRC_APPROVER') {
        if (asset) {
            const uploader = await prisma.user.findFirst({
                where: {
                    email: asset.creator
                }
            });
            const DCCApproversList = await prisma.dCC.findFirst({
                where: {
                    short_label: asset.dcc?.short_label
                }, 
                select: {
                    Users : {
                        where : {
                            role: 'DCC_APPROVER'
                        }
                    }
                }
            })
            const DCCApprovers = DCCApproversList ? DCCApproversList.Users : []
            const DRCApprovers = await prisma.user.findMany({
                where: {
                    role: 'DRC_APPROVER'
                }
            });
            if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
            const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
            // email uploader 
            if (uploader) {
                const emailHtml = render(<Uploader_DRCApprovedEmail uploaderName={uploader.name}
                    reviewerName={session.user.name ? session.user.name : ''} asset={asset} />);
                const transporter = nodemailer.createTransport(server)
                if (uploader.email) {
                    transporter.sendMail({
                        from: from,
                        to: uploader?.email,
                        subject: 'CFDE WORKBENCH Asset Approval Confirmation',
                        html: emailHtml,
                    })
                }
            }
            // email dcc approvers
            DCCApprovers.forEach((approver => {
                const emailHtml = render(<DCCApprover_DRCApprovedEmail approverName={approver.name}
                    reviewerName={session.user.name ? session.user.name : ''} asset={asset} />);
                const transporter = nodemailer.createTransport(server)
                if (approver.email) {
                    transporter.sendMail({
                        from: from,
                        to: approver.email,
                        subject: 'CFDE WORKBENCH Asset Approval Confirmation',
                        html: emailHtml,
                    })
                }

            }))
            // email drc approvers
            DRCApprovers.forEach((approver => {
                const emailHtml = render(<DRCApprover_DRCApprovedEmail reviewerName={session.user.name ? session.user.name : ''} asset={asset} />);
                const transporter = nodemailer.createTransport(server)
                if (approver.email) {
                    transporter.sendMail({
                        from: from,
                        to: approver.email,
                        subject: 'CFDE WORKBENCH Asset Approval Confirmation',
                        html: emailHtml,
                    })
                }
            }))
        }
    }
}

