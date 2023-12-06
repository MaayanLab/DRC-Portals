'use server'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import minio from "@/lib/minio";
import { PutObjectCommand, S3Client, S3ClientConfig, GetObjectAttributesCommand } from "@aws-sdk/client-s3";
import { redirect } from 'next/navigation';


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

// const createPresignedUrlWithClient = ({ client, bucket, key }: { client: S3Client, bucket: string, key: string }) => {
//     const command = new PutObjectCommand({ Bucket: bucket, Key: key, ChecksumAlgorithm: "SHA256", });
//     return getSignedUrl(client, command, { expiresIn: 3600 });
// };


export async function upload(formData: FormData) {
    // if (process.env.NODE_ENV === 'development') {
    //     await devUpload(formData)
    // } else {
    await prodUpload(formData)
    // }
}


async function devUpload(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if ((user.role === 'UPLOADER') || (user.role === 'ADMIN') || (user.role === 'DRC_APPROVER')) throw new Error('not an admin')

    const formDcc = formData.get('dcc')?.toString()
    const files = formData.getAll('files[]') as File[]

    if (!formDcc) throw new Error(' no user dcc from form')
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
                short_label: formDcc,
            },
        });

        let filetype = await parseFileType(file.name, file.type);
        if (filetype != '') {
            // upload presigned url
            const searchParams = {
                name: file.name,
                dcc: formDcc,
                filetype: filetype,
                date: new Date().toJSON().slice(0, 10),
            }
            if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured')

            let url = "";
            url = await minio.presignedPutObject(process.env.S3_BUCKET, searchParams.dcc + '/' + searchParams.filetype + '/' + searchParams.date + '/' + searchParams.name)
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
                        label: formDcc, // TODO: change to long label
                        short_label: formDcc,
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

export async function prodUpload(formData: FormData) {
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

    const formDcc = formData.get('dcc')?.toString()
    // const files = formData.getAll('files[]') as File[]
    const file = formData.get('files[]') as File


    if (!formDcc) throw new Error(' no user dcc from form')
    if (!process.env.S3_ACCESS_KEY) throw new Error('s3 access key not defined')
    if (!process.env.S3_SECRET_KEY) throw new Error('s3 access key not defined')
    if (!process.env.S3_REGION) throw new Error('S3 region not configured')
    if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured')

    const s3Configuration: S3ClientConfig = {
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        region: process.env.S3_REGION,
    };

    const s3 = new S3Client(s3Configuration);

    // files.forEach(async (file) => {
    let filetype = await parseFileType(file.name, file.type);
    if (filetype != '') {
        const searchParams = {
            name: file.name,
            dcc: formDcc,
            filetype: filetype,
            date: new Date().toJSON().slice(0, 10),
        }
        const command = new PutObjectCommand(
            {
                Bucket: process.env.S3_BUCKET,
                Key: searchParams.dcc + '/' + searchParams.filetype + '/' + searchParams.date + '/' + searchParams.name,
                ChecksumAlgorithm: "SHA256",
                Body: await file.text()
            });
        const response = await s3.send(command);
        if (!response.ChecksumSHA256) throw new Error(response.toString())

        const getCommand = new GetObjectAttributesCommand(
            {
                Bucket: process.env.S3_BUCKET,
                Key: searchParams.dcc + '/' + searchParams.filetype + '/' + searchParams.date + '/' + searchParams.name,
                ObjectAttributes: [
                    "Checksum",
                ],
            });
        const getResponse = await s3.send(getCommand);
        const fileEtag = getResponse.Checksum?.ChecksumSHA256

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
    // })
}


