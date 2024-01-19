'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export const saveCodeAsset = async (name: string, assetType: string, url: string, formDcc: string, descripton: string, openAPISpecs= false, smartAPISpecs= false, smartAPIURL= '') => {
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

    // const savedUpload = await prisma.dccAsset.upsert({
    //     where: {
    //         link: url,
    //     }, // reject if file name is the same
    //     update: {
    //         filetype: filetype,
    //         filename: filename,
    //         lastmodified: new Date(),
    //         creator: user.email,
    //         annotation: {},
    //         dcc_id: dcc.id,
    //     },
    //     create: {
    //         link: url,
    //         filetype: filetype,
    //         filename: filename,
    //         creator: user.email,
    //         current: false,
    //         annotation: {},
    //         dcc_id: dcc.id,
    //     }
    // });
    const oldCode = await prisma.dccAsset.findMany({
        where: {
            link: url,
        },
    });
    if (oldCode.length> 0) return oldCode

    const savedCode = await prisma.dccAsset.upsert({
        where: {
            link: url,
        },
        update: {
            lastmodified: new Date(),
            creator: user.email,
            // Update description
            codeAsset: {
                delete: { link: url }, // Delete existing records first
                create: { // Update by creating new records
                    type: assetType,
                    name: name,
                    description: descripton,
                    openAPISpec: openAPISpecs, 
                    smartAPISpec: smartAPISpecs,
                    smartAPIURL: smartAPIURL=== '' ? null : smartAPIURL
                  }
                }
        },
        create: {
            link: url,
            creator: user.email,
            current: false,
            dcc_id: dcc.id,
            codeAsset: {
                create: {
                    type: assetType,
                    name: name,
                    description: descripton,
                    openAPISpec: openAPISpecs, 
                    smartAPISpec: smartAPISpecs,
                    smartAPIURL: smartAPIURL=== '' ? null : smartAPIURL
                },
            }
        }
    })

    return saveCodeAsset
    // revalidatePath('/data/contribute/uploaded')
}