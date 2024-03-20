'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CodeAsset, User } from '@prisma/client';
import { render } from '@react-email/render';
import { AssetSubmitReceiptEmail, DCCApproverUploadEmail } from '../Email';

import nodemailer from 'nodemailer'



// used in development only
const dccMapping: { [key: string]: string } = {
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


export const saveCodeAsset = async (name: string, assetType: string, url: string, formDcc: string, descripton: string, openAPISpecs = false, smartAPISpecs = false, smartAPIURL = '', entityPageExample='') => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!((user.role === 'UPLOADER') || (user.role === 'ADMIN') || (user.role === 'DRC_APPROVER') || (user.role === 'DCC_APPROVER'))) throw new Error('not allowed to create')
    if (!user.email) throw new Error('User email missing')
    let dcc = await prisma.dCC.findFirst({
        where: {
            short_label: formDcc,
        },
    });
    // in  development, if dcc not ingested into database
    if (process.env.NODE_ENV === 'development' && dcc === null) {

        dcc = await prisma.dCC.create({
            data: {
                label: dccMapping[formDcc],
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')
    const savedCode = await prisma.dccAsset.create({
        data: {
            link: url,
            creator: user.email,
            current: true,
            dcc_id: dcc.id,
            codeAsset: {
                create: {
                    type: assetType,
                    name: name,
                    description: descripton,
                    openAPISpec: openAPISpecs,
                    smartAPISpec: smartAPISpecs,
                    smartAPIURL: smartAPIURL === '' ? null : smartAPIURL,
                    entityPageExample: entityPageExample === '' ? null : entityPageExample
                },
            }
        },
        select: {
            codeAsset: true
        }
    })

    const receipt = await sendUploadReceipt(user, savedCode);
    const dccApproverAlert = await sendDCCApproverEmail(user, formDcc, savedCode);
    // const drcApproverAlert = await sendDRCApproverEmail(user, formDcc, savedCode);
}

export const findCodeAsset = async (link: string) => {
    const codeAsset = await prisma.dccAsset.findMany({
        where: {
            link: link,
        },
        include: {
            fileAsset: true,
            codeAsset: true,
            dcc: {
                select: {
                    short_label: true
                }
            }
        }
    })
    return codeAsset
}

export const updateCodeAsset = async (name: string, assetType: string, url: string, formDcc: string, descripton: string, openAPISpecs = false, smartAPISpecs = false, smartAPIURL = '', entityPageExample='') => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!((user.role === 'UPLOADER') || (user.role === 'ADMIN') || (user.role === 'DRC_APPROVER') || (user.role === 'DCC_APPROVER'))) throw new Error('not an allowed to upload')
    if (!user.email) throw new Error('User email missing')
    let dcc = await prisma.dCC.findFirst({
        where: {
            short_label: formDcc,
        },
    });

    // in  development, if dcc not ingested into database
    if (process.env.NODE_ENV === 'development' && dcc === null) {

        dcc = await prisma.dCC.create({
            data: {
                label: dccMapping[formDcc],
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')
    const savedCode = await prisma.dccAsset.update({
        where: {
            link: url,
        },
        data: {
            lastmodified: new Date(),
            creator: user.email,
            dcc_id: dcc.id,
            codeAsset: {
                delete: { link: url },
                create: {
                    type: assetType,
                    name: name,
                    description: descripton,
                    openAPISpec: openAPISpecs,
                    smartAPISpec: smartAPISpecs,
                    smartAPIURL: smartAPIURL === '' ? null : smartAPIURL,
                    entityPageExample: entityPageExample === '' ? null : entityPageExample
                }
            }
        }
    });

    // return {oldCode: false, asset:saveCodeAsset}
}


export async function sendUploadReceipt(user: User, assetInfo: { codeAsset: CodeAsset | null }) {
    if (!process.env.NEXTAUTH_EMAIL) throw new Error('nextauth email config missing')
    const { server, from } = JSON.parse(process.env.NEXTAUTH_EMAIL)
    const transporter = nodemailer.createTransport(server)
    if (assetInfo.codeAsset) {
        const emailHtml = render(<AssetSubmitReceiptEmail userFirstname={user.name ? user.name : ''} codeAsset={assetInfo.codeAsset} />);
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

export async function sendDCCApproverEmail(user: User, dcc: string, assetInfo: { codeAsset: CodeAsset | null }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    const approvers = await prisma.user.findMany({
        where: {
            dcc: dcc,
            role: 'DCC_APPROVER'
        }
    })
    if (approvers.length > 0) {
        for (let approver of approvers) {
            const emailHtml = render(<DCCApproverUploadEmail uploaderName={user.email ? user.email : ''} approverName={approver.name ? approver.name : ''} assetName={assetInfo.codeAsset ? assetInfo.codeAsset?.name : ''}/>);
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

