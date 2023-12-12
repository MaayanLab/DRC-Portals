'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { PutObjectCommand, S3Client, S3ClientConfig, GetObjectAttributesCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from 'next/navigation';
import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import { revalidatePath } from 'next/cache';

async function verifyUser() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (!(user.role === 'ADMIN' || user.role === 'UPLOADER' || user.role === 'DRC_APPROVER')) throw new Error('not authorized')
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
    return getSignedUrl(s3, command, { unhoistableHeaders: new Set(['x-amz-sdk-checksum-algorithm', 'x-amz-checksum-sha256']) })
};


export const saveChecksumDb = async (checksumHash: string, filename: string, filesize: number, filetype: string, formDcc: string) => {
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
                label: formDcc, // TODO: change to long label
                short_label: formDcc,
                homepage: 'https://lincsproject.org'
            }
        });
    }
    if (dcc === null) throw new Error('Failed to find DCC')
    const savedUpload = await prisma.dccAsset.upsert({
        where: {
            link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${filetype}/${new Date().toJSON().slice(0, 10)}/${filename}`,
        },
        update: {
            filetype: filetype,
            filename: filename,
            lastmodified: new Date(),
            creator: user.email,
            annotation: {},
            size: filesize,
            dcc_id: dcc.id,
            sha256checksum: checksumHash
        },
        create: {
            link: `https://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${dcc.short_label}/${filetype}/${new Date().toJSON().slice(0, 10)}/${filename}`,
            filetype: filetype,
            filename: filename,
            creator: user.email,
            current: false,
            annotation: {},
            size: filesize,
            dcc_id: dcc.id,
            sha256checksum: checksumHash
        }
    });
    revalidatePath('/data/contribute/uploaded')
}