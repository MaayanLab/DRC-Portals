'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { z } from 'zod'
import minio from "@/lib/minio";

export async function parseFileType(filename: string, filetype: string) {
    let parsedFileType = ''
    if (filename.includes('.gmt') || filename.includes('.dmt')) {
        parsedFileType = 'XMT'
    } else if (filetype === 'text/csv') {
        parsedFileType = 'KG Assertions'
    } else if (filetype === 'text/plain') {
        parsedFileType = 'Attribute Table'
    } else if ((filetype === 'zip') || (filetype === 'application/zip') || (filetype === 'application/x-zip') || (filetype === "application/x-zip-compressed")) {
        parsedFileType = 'C2M2'
    }
    return parsedFileType
}

export async function upload(formData: FormData) {
    const formObjects = z.object({
        dcc: z.string(),
    }).parse({
        dcc: formData.get('dcc'),
    })
    const files = formData.getAll('files[]') as File[]

    files.forEach(async (file) => {
        // get user session
        const session = await getServerSession(authOptions)
        if (!session) throw new Error('Unauthorized')

        const user = await prisma.user.findUniqueOrThrow({
            where: { id: session.user.id }
        })
        if (!user.email) throw new Error('User email missing')
        let dcc = await prisma.dCC.findFirst({
            where: {
                short_label: formObjects.dcc,
            },
        });

        let filetype = await parseFileType(file.name, file.type);
        if (filetype != '') {
        // upload presigned url
        const searchParams = {
            name: file.name,
            dcc: formObjects.dcc,
            filetype: filetype,
            date: new Date().toJSON().slice(0, 10),
        }
        if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured')
        const url = await minio.presignedPutObject(process.env.S3_BUCKET, searchParams.dcc + '/' + searchParams.filetype + '/' + searchParams.date + '/' + searchParams.name)
        // upload to s3
        const s3_upload_res = await fetch(url, {
            method: 'PUT',
            body: file
        })
        if (!s3_upload_res.ok) throw new Error(await s3_upload_res.text())
        const fileEtag = s3_upload_res.headers.get('etag')

        // put metadata in database
        // in development when dccs are not in database
        if (process.env.NODE_ENV === 'development' && dcc === null) {
            dcc = await prisma.dCC.create({
                data: {
                    label: formObjects.dcc, // TODO: change to long label
                    short_label: formObjects.dcc,
                    homepage: 'https://lincsproject.org'
                }
            });
        }
        if (dcc === null) throw new Error('Failed to find DCC')
        const savedUpload = await prisma.dccAsset.upsert({
            where: {
                link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${filetype}/${new Date().toJSON().slice(0, 10)}/${file.name}`,
            },
            update: {
                filetype: filetype,
                filename: file.name,
                creator: user.email,
                annotation: {},
                size: file.size,
                dcc_id: dcc.id,
                etag: fileEtag
            },
            create: {
                link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${filetype}/${new Date().toJSON().slice(0, 10)}/${file.name}`,
                filetype: filetype,
                filename: file.name,
                creator: user.email,
                annotation: {},
                size: file.size,
                dcc_id: dcc.id,
                etag: fileEtag
            }
        });
        }
    })
}


