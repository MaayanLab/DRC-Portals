'use client'
import React from 'react'
import jsSHA256 from 'jssha/sha256'
import { createPresignedUrl } from './UploadFunc'

// async function uploadAndComputeSha256_1(file: File, presignedUrl: string) {
//   const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
//   const awsReq = await fetch(presignedUrl, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/octet-stream',
//       'x-amz-sdk-checksum-algorithm': 'SHA256',
//     },
//     body: file.stream()
//       .pipeThrough(new TransformStream({
//         transform(chunk, controller) {
//           hash.update(chunk)
//           controller.enqueue(chunk)
//         },
//       })),
//     // @ts-ignore
//     duplex: 'half',
//   })
//   if (!awsReq.ok) throw new Error(await awsReq.text())
//   const clientSha256 = hash.getHash('HEX')
//   // const serverSha256 = awsReq.headers.get('x-amz-checksum-sha256')
//   // if (clientSha256 !== serverSha256) throw new Error(`Checksum mismatch ${clientSha256} != ${serverSha256}`)
//   // else console.log(`${clientSha256} == ${serverSha256}`)
//   return clientSha256
// }

async function uploadAndComputeSha256_2(file: File) {
  const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
 
  const computeHash = file.stream()
    .pipeTo(new WritableStream({
      write(chunk) {
        console.log(1)
        hash.update(chunk)
      },
    }))
    
    await computeHash
    const checksumHash  = hash.getHash('B64')
    console.log(checksumHash)
  const presignedurl2 = await createPresignedUrl(file.name, checksumHash)
  console.log(presignedurl2)
  const awsPost = fetch(presignedurl2, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-amz-checksum-sha256': checksumHash
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

// async function getPresignedUrl(metadata: { name: string }) {
//     const url = await createPresignedUrl({})
//     return await req.json()
//   }

async function parseFile(file: File,) {
  var chunkSize = 64 * 1024; // bytes
  let hash = new jsSHA256("SHA-256", "UINT8ARRAY")
  for (let start = 0; start < file.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, file.size)
    let chunk = file.slice(start, end)
    hash.update(new Uint8Array(await chunk.arrayBuffer()))
  }
  const checksumHash = hash.getHash('B64')  
  return checksumHash
}

export default function TestUpload() {
  const [status, setStatus_] = React.useState('')
//   const presignedPutObjectMutation = trpc.presignedPutObject.useMutation()
  const setStatus = React.useCallback((newStatus: string) => setStatus_(oldStatus => [oldStatus, newStatus].join('\n')), [setStatus_])
  return (
    <form onSubmit={async (evt) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const file = formData.get('file') as File
      const checksumHash = await parseFile(file)
      setStatus(`Registering hash (${checksumHash})`)

      // setStatus('Getting presignedUrl')
      // let digest
      // try {
        // setStatus('Attempting method 1')
        // digest = await uploadAndComputeSha256_1(file)
      // } catch (e) {
        // console.warn(e)
        // setStatus('Attempting method 2')
        // digest = await uploadAndComputeSha256_2(file)
      // }
      // setStatus(`Registering hash (${digest})`)
      // const finalizeReq = await fetch(`/test-upload/register-hash`, {
      //   method: 'POST',
      //   body: JSON.stringify({ digest }),
      // })
      // await finalizeReq.text()
      // setStatus('Done')
    }}>
      <input name="file" type="file" />
      <input type="submit" />
      <div className="whitespace-pre-line">{status}</div>
    </form>
  )
}