'use server'
import prisma from '@/lib/prisma';
import { CodeAsset } from '@prisma/client';
import { render } from '@react-email/render';
import { AssetSubmitReceiptEmail, DCCApproverUploadEmail } from '../Email';

import nodemailer from 'nodemailer'

export async function sendUploadReceipt(user: { name?: string | null, email?: string | null }, assetInfo: { codeAsset: CodeAsset | null }) {
    if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
    const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
    const transporter = nodemailer.createTransport(server)
    if (assetInfo.codeAsset) {
        const emailHtml = await render(<AssetSubmitReceiptEmail userFirstname={user.name ? user.name : ''} codeAsset={assetInfo.codeAsset} />);
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

export async function sendDCCApproverEmail(submitter: { email?: string | null }, dcc: string, assetInfo: { codeAsset: CodeAsset | null }) {
    const approversList = await prisma.dCC.findFirst({
        where: {
            short_label: dcc
        },
        select: {
            Users: {
                where: {
                    role: 'DCC_APPROVER'
                }
            }
        }
    })

    const approvers = approversList ? approversList.Users : []
    for (let approver of approvers) {
        const emailHtml = await render(<DCCApproverUploadEmail uploaderName={submitter.email ? submitter.email : ''} approverName={approver.name ? approver.name : ''} assetName={assetInfo.codeAsset ? assetInfo.codeAsset?.name : ''} />);
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
