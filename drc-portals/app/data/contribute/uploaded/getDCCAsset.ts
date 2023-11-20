'use server'

import prisma from "@/lib/prisma"

export async function getDCCAsset(file: {
    dcc_id: string
    filetype: string
    filename: string
    link: string
    lastmodified: string,
    creator: string,
    approved: boolean,
    drcapproved: boolean,
    dcc_drc: string
}){
    if (file.dcc_drc === 'drc') {
        let newFile = await prisma.dccAsset.findFirst({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified,
                creator: file.creator,
                approved: file.approved,
                drcapproved: !file.drcapproved,
            },            
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })
        if (!newFile) throw new Error('no file found')
        return newFile
    } 
    if (file.dcc_drc === 'dcc') {
        let newFile = await prisma.dccAsset.findFirst({
            where: {
                dcc_id: file.dcc_id,
                filetype: file.filetype,
                filename: file.filename,
                link: file.link,
                lastmodified: file.lastmodified,
                creator: file.creator,
                approved: !file.approved,
                drcapproved: file.drcapproved,
            },            
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })
        if (!newFile) throw new Error('no file found')
        return newFile
    } 

}