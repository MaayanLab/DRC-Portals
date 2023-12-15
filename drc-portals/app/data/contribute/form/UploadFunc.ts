'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { z } from 'zod'
import minio from "@/lib/minio";

export async function uploadServer(formData: FormData) {
    const JsZip = require("jszip")
    // Initialize the zip file
    const zip = new JsZip();
    const formObjects = z.object({
        dcc: z.string(),
    }).parse({
        dcc: formData.get('dcc'),
    })
    const file = formData.get('file') as File
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const zipBlob = await zip.loadAsync(buffer);
    const manifestFile = zipBlob.file(file.name.split('.zip')[0] + '/' + 'manifest.json')
    if (!manifestFile) throw new Error('Manifest not found')
    const manifestContent = await manifestFile.async('text')
    const fileSchema = z.object({
        filename: z.string(),
        filetype: z.string(),
        annotation: z.record(z.string()),
    });
    const manifestSchema = z.array(fileSchema);
    const manifestJSON = manifestSchema.parse(JSON.parse(manifestContent))
    for (let fileObj of manifestJSON) {
        const otherFile = zipBlob.file(file.name.split('.zip')[0] + '/' + `${fileObj.filename}`)
        if (!otherFile) throw new Error(`${fileObj.filename} not found in zip`)
        const content = await otherFile.async('blob')
        const data = {
            filetype: fileObj.filetype,
            filename: fileObj.filename,
            size: content.size,
            annotation: fileObj.annotation,
            dcc_string: formObjects.dcc,
        }

        // get user session
        const session = await getServerSession(authOptions)
        if (!session) throw new Error('Unauthorized')

        // put metadata in database
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: session.user.id }
        })
        if (!user.email) throw new Error('User email missing')
        let dcc = await prisma.dCC.findFirst({
            where: {
                short_label: data.dcc_string,
            },
        });
        // in development when dccs are not in database
        if (process.env.NODE_ENV === 'development' && dcc === null) {
            dcc = await prisma.dCC.create({
                data: {
                    label: data.dcc_string,
                    short_label: data.dcc_string,
                    homepage: 'https://lincsproject.org'
                }
            });
        }
        if (dcc === null) throw new Error('Failed to find DCC')
        const savedUpload = await prisma.dccAsset.create({
            data: {
                link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${data.filetype}/${new Date().toJSON().slice(0, 10)}/${data.filename}`,
                filetype: data.filetype,
                filename: data.filename,
                creator: user.email,
                annotation: data.annotation,
                size: data.size,
                dcc_id: dcc.id,
            }
        });

        // upload presigned url
        const searchParams = {
          name: fileObj.filename,
          dcc: formObjects.dcc,
          filetype: fileObj.filetype,
          date: new Date().toJSON().slice(0, 10),
        }
        if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured')
        const url = await minio.presignedPutObject(process.env.S3_BUCKET, searchParams.dcc + '/' + searchParams.filetype + '/'+  searchParams.date + '/' + searchParams.name)
        
        // upload to s3
        const s3_upload_res = await fetch(url, {
        method: 'PUT',
        body: content
        })
        if (!s3_upload_res.ok) throw new Error(await s3_upload_res.text())
    }
}


