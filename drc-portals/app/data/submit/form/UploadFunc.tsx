'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { redirect } from 'next/navigation';
import {
    getSignedUrl
} from "@aws-sdk/s3-request-presigner";
import type { FileAsset, User, } from '@prisma/client'
import { render } from '@react-email/render';
import { AssetSubmitReceiptEmail, DCCApproverUploadEmail } from '../Email';

import nodemailer from 'nodemailer'



async function verifyUser() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit//form")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!(user.role === 'ADMIN' || user.role === 'UPLOADER' || user.role === 'DRC_APPROVER' || user.role === 'DCC_APPROVER')) throw new Error('not authorized')
}


export const createPresignedUrl = async (filepath: string, checksumHash: string) => {
    if (!process.env.S3_ACCESS_KEY) throw new Error('s3 access key not defined')
    if (!process.env.S3_SECRET_KEY) throw new Error('s3 access key not defined')
    if (!process.env.S3_REGION) throw new Error('S3 region not configured')
    if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured')

    await verifyUser();

    const s3Configuration: S3ClientConfig = {
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION,
    };
    const s3 = new S3Client(s3Configuration);
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: filepath,
        ChecksumSHA256: checksumHash
    });
    return getSignedUrl(s3, command, { expiresIn: 3600, unhoistableHeaders: new Set(['x-amz-sdk-checksum-algorithm', 'x-amz-checksum-sha256']) })
};


export const findFileAsset = async(filetype: string, formDcc: string, filename: string) => {
    await verifyUser();
    let dcc = await prisma.dCC.findFirst({
        where: {
            short_label: formDcc,
        },
    });
    
    if (process.env.NODE_ENV === 'development' && dcc === null) {
        const dccMapping : {[key: string]: string} = {
            'LINCS': 'Library of Integrated Network-based Cellular Signatures',
            '4DN': '4D Nucleome',
            'Bridge2AI': 'Bridge to Artificial Intelligence',
            'A2CPS': 'Acute to Chronic Pain Signatures',
            'ExRNA': 'Extracellular RNA Communication',
            'GTEx': 'Genotype Tissue Expression',
            'HMP': 'The Human Microbiome Project',
            'HuBMAP': 'Human BioMolecular Atlas Program',
            'IDG': 'Illuminating the Druggable Genome',
            'Kids First': 'Gabriella Miller Kids First Pediatric Research',
            'MoTrPAC': 'Molecular Transducers of Physical Activity Consortium',
            'Metabolomics': 'Metabolomics',
            'SenNet': 'The Cellular Senescence Network',
            'Glycoscience': 'Glycoscience', 
            'KOMP2': 'Knockout Mouse Phenotyping Program',
            'H3Africa': 'Human Heredity & Health in Africa', 
            'UDN': 'Undiagnosed Diseases Network',
            'SPARC': 'Stimulating Peripheral Activity to Relieve Conditions',
            'iHMP': 'NIH Integrative Human Microbiome Project'
        }
        dcc = await prisma.dCC.create({
            data: {
                label: dccMapping[formDcc],
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')

    const S3Link = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${dcc.short_label?.replaceAll(' ', '')}/${filetype}/${new Date().toJSON().slice(0, 10)}/${filename}`
    const fileAsset = await prisma.dccAsset.findMany({
        where: {
          link: S3Link,
        },
        include:{
            fileAsset: true,
            codeAsset: true,
            dcc: {
                select:{
                    short_label: true
                }
            }
        }
      })
    return fileAsset
}

export const saveChecksumDb = async (checksumHash: string, filename: string, filesize: number, filetype: string, formDcc: string) => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit//form")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!((user.role === 'UPLOADER') || (user.role === 'ADMIN') || (user.role === 'DRC_APPROVER') || (user.role === 'DCC_APPROVER'))) throw new Error('not an admin')
    if (!user.email) throw new Error('User email missing')
    let dcc = await prisma.dCC.findFirst({
        where: {
            short_label: formDcc,
        },
    });
    // in  development, if dcc not ingested into database
    if (process.env.NODE_ENV === 'development' && dcc === null) {
        const dccMapping : {[key: string]: string} = {
            'LINCS': 'Library of Integrated Network-based Cellular Signatures',
            '4DN': '4D Nucleome',
            'Bridge2AI': 'Bridge to Artificial Intelligence',
            'A2CPS': 'Acute to Chronic Pain Signatures',
            'ExRNA': 'Extracellular RNA Communication',
            'GTEx': 'Genotype Tissue Expression',
            'HMP': 'The Human Microbiome Project',
            'HuBMAP': 'Human BioMolecular Atlas Program',
            'IDG': 'Illuminating the Druggable Genome',
            'Kids First': 'Gabriella Miller Kids First Pediatric Research',
            'MoTrPAC': 'Molecular Transducers of Physical Activity Consortium',
            'Metabolomics': 'Metabolomics',
            'SenNet': 'The Cellular Senescence Network',
            'Glycoscience': 'Glycoscience', 
            'KOMP2': 'Knockout Mouse Phenotyping Program',
            'H3Africa': 'Human Heredity & Health in Africa', 
            'UDN': 'Undiagnosed Diseases Network',
            'SPARC': 'Stimulating Peripheral Activity to Relieve Conditions',
            'iHMP': 'NIH Integrative Human Microbiome Project'
        }
        dcc = await prisma.dCC.create({
            data: {
                label: dccMapping[formDcc],
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')

    const savedUpload = await prisma.dccAsset.create({
        data: {
            link: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${dcc.short_label?.replaceAll(' ', '')}/${filetype}/${new Date().toJSON().slice(0, 10)}/${filename}`,
            creator: user.email,
            current: true,
            dcc_id: dcc.id,
            fileAsset: {
                create: {
                    size: BigInt(filesize),
                    sha256checksum: checksumHash,
                    filetype: filetype,
                    filename: filename,
                },
            }
        },
        include: {
            fileAsset: true,
        },
    })

    const receipt = await sendUploadReceipt(user, savedUpload);
    const dccApproverAlert = await sendDCCApproverEmail(user, formDcc, savedUpload)
    // const drcApproverAlert = await sendDRCApproverEmail(user, formDcc, savedUpload);
    return savedUpload
}

export async function sendUploadReceipt(user: User, assetInfo: { fileAsset: FileAsset | null }) {
    if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
    const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
    const transporter = nodemailer.createTransport(server)

    if (assetInfo.fileAsset) {
        const emailHtml = render(<AssetSubmitReceiptEmail userFirstname={user.name ? user.name : ''} fileAsset={assetInfo.fileAsset} />);
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

export async function sendDCCApproverEmail(user: User, dcc: string, assetInfo: { fileAsset: FileAsset | null }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
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
            const emailHtml = render(<DCCApproverUploadEmail uploaderName={user.email ? user.email : ''} approverName={approver.name ? approver.name : ''} assetName={assetInfo.fileAsset ? assetInfo.fileAsset?.filename : ''}/>);
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