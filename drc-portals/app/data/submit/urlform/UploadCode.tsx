'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { queue_fairshake } from '@/lib/graphile/fairshake';
import { sendUploadReceipt } from './Email';



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


export const saveCodeAsset = async (name: string, assetType: string, url: string, formDcc: string, descripton: string, openAPISpecs = false, smartAPISpecs = false, smartAPIURL = '', entityPageExample = '') => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
    if (!((session.user.role === 'UPLOADER') || (session.user.role === 'ADMIN') || (session.user.role === 'DRC_APPROVER') || (session.user.role === 'DCC_APPROVER'))) throw new Error('not allowed to create')
    if (!session.user.email) throw new Error('User email missing')
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
            creator: session.user.email,
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
    await queue_fairshake({ link: url })
    const receipt = await sendUploadReceipt(session.user, savedCode);
    // const dccApproverAlert = await sendDCCApproverEmail(session.user, formDcc, savedCode);
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

export const updateCodeAsset = async (name: string, assetType: string, url: string, formDcc: string, descripton: string, openAPISpecs = false, smartAPISpecs = false, smartAPIURL = '', entityPageExample = '') => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
    if (!((session.user.role === 'UPLOADER') || (session.user.role === 'ADMIN') || (session.user.role === 'DRC_APPROVER') || (session.user.role === 'DCC_APPROVER'))) throw new Error('not an allowed to upload')
    if (!session.user.email) throw new Error('User email missing')
    if (!session.user.dccs.includes(formDcc)) throw new Error('No access to this DCC')
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
            creator: session.user.email,
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
            },
            deleted: false,
        }
    });
    await queue_fairshake({ link: url })
}

