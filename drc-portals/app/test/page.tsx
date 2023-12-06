'use client'
import React from 'react'
import jsSHA256 from 'jssha/sha256'
import trpc from '@/lib/trpc/client'

async function uploadAndComputeSha256_1(file: File, presignedUrl: string) {
  const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
  const awsReq = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      // 'x-amz-sdk-checksum-algorithm': 'SHA256',
    },
    body: file.stream()
      .pipeThrough(new TransformStream({
        transform(chunk, controller) {
          hash.update(chunk)
          controller.enqueue(chunk)
        },
      })),
    // @ts-ignore
    duplex: 'half',
  })
  if (!awsReq.ok) throw new Error(await awsReq.text())
  const clientSha256 = hash.getHash('HEX')
  // const serverSha256 = awsReq.headers.get('x-amz-checksum-sha256')
  // if (clientSha256 !== serverSha256) throw new Error(`Checksum mismatch ${clientSha256} != ${serverSha256}`)
  // else console.log(`${clientSha256} == ${serverSha256}`)
  return clientSha256
}

async function uploadAndComputeSha256_2(file: File, presignedUrl: string) {
  const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
  const computeHash = file.stream()
    .pipeTo(new WritableStream({
      write(chunk) {
        hash.update(chunk)
      },
    }))
  const awsPost = fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      // 'x-amz-sdk-checksum-algorithm': 'SHA256',
    },
    body: file,
  })
  const [_, awsReq] = await Promise.all([computeHash, awsPost])
  if (!awsReq.ok) throw new Error(await awsReq.text())
  const clientSha256 = hash.getHash('HEX')
  // const serverSha256 = awsReq.headers.get('x-amz-checksum-sha256')
  // if (clientSha256 !== serverSha256) throw new Error(`Checksum mismatch ${clientSha256} != ${serverSha256}`)
  // else console.log(`${clientSha256} == ${serverSha256}`)
  return clientSha256
}

export default function TestUpload() {
  const [status, setStatus_] = React.useState('')
  const presignedPutObjectMutation = trpc.presignedPutObject.useMutation()
  const setStatus = React.useCallback((newStatus: string) => setStatus_(oldStatus => [oldStatus, newStatus].join('\n')), [setStatus_])
  return (
    <form onSubmit={async (evt) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const file = formData.get('file') as File
      setStatus('Getting presignedUrl')
      const presignedUrl =  await presignedPutObjectMutation.mutateAsync(`/test/${file.name}`)

      let digest
      try {
        setStatus('Attempting method 1')
        digest = await uploadAndComputeSha256_1(file, presignedUrl)
      } catch (e) {
        console.warn(e)
        setStatus('Attempting method 2')
        digest = await uploadAndComputeSha256_2(file, presignedUrl)
      }
      setStatus(`Registering hash (${digest})`)
      const finalizeReq = await fetch(`/test-upload/register-hash`, {
        method: 'POST',
        body: JSON.stringify({ digest }),
      })
      await finalizeReq.text()
      setStatus('Done')
    }}>
      <input name="file" type="file" />
      <input type="submit" />
      <div className="whitespace-pre-line">{status}</div>
    </form>
  )
}