'use server'
import prisma from '@/lib/prisma';
import type { FileAsset, } from '@prisma/client'
import { render } from '@react-email/render';
import { AssetSubmitReceiptEmail, DCCSubmitterErrorEmail, DCCApproverUploadEmail } from '../Email';

import nodemailer from 'nodemailer'

export async function sendUploadReceipt(user: { name?: string | null, email?: string | null }, assetInfo: { fileAsset: FileAsset | null }) {
    if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
    const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
    const transporter = nodemailer.createTransport(server)

    if (assetInfo.fileAsset) {
        const emailHtml = await render(<AssetSubmitReceiptEmail userFirstname={user.name ? user.name : ''} fileAsset={assetInfo.fileAsset} />);
        if (user.email) {
            transporter.sendMail({
                from: from,
                to: user.email,
                subject: "CFDE WORKBENCH Asset Submission Confirmation",
                html: emailHtml
            });
        }

    }
}

export async function sendDCCSubmitterErrorEmail(submitter: { email: string }, dcc: string, assetInfo: { fileAsset: FileAsset | null, log: string }) {
    const emailHtml = await render(<DCCSubmitterErrorEmail uploaderName={submitter.email} assetName={assetInfo.fileAsset ? assetInfo.fileAsset?.filename : ''} />);
    if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
    const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
    const transporter = nodemailer.createTransport(server)
    transporter.sendMail({
        from: from,
        to: submitter.email,
        subject: 'CFDE WORKBENCH Portal Submitted Asset Failed Validation',
        html: emailHtml,
        attachments: [
            {
                filename: 'assessment-log.txt',
                content: assetInfo.log,
            }
        ],
    })
}

export async function sendDCCApproverEmail(submitter: { email: string | null }, dcc: string, assetInfo: { fileAsset: FileAsset | null }) {
    const DCCApproversList = await prisma.dCC.findFirst({
        where: {
            short_label: dcc
        }, 
        select: {
            Users : {
                where : {
                    role: 'DCC_APPROVER'
                }
            }
        }
    })
    const approvers = DCCApproversList ? DCCApproversList.Users : []
    if (approvers.length > 0) {
        for (let approver of approvers) {
            const emailHtml = await render(<DCCApproverUploadEmail uploaderName={submitter.email ? submitter.email : ''} approverName={approver.name ? approver.name : ''} assetName={assetInfo.fileAsset ? assetInfo.fileAsset?.filename : ''}/>);
            if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
            const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
            const transporter = nodemailer.createTransport(server)
            if (approver.email) {
                transporter.sendMail({
                    from: from,
                    to: approver.email,
                    subject: 'CFDE WORKBENCH Portal Submitted Asset Needs Your Approval',
                    html: emailHtml,
                })
            }
        }
    }
}
