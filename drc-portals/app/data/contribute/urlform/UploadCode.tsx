'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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