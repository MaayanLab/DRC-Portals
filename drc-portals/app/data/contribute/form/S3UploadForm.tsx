'use client'

import React from 'react'
import JSZip from 'jszip'
import { z } from 'zod'

async function upload(formData: FormData) {
  const formObjects = z.object({
    name: z.string(),
    email: z.string(),
    dcc: z.string(),
  }).parse({
    name: formData.get('name'),
    email: formData.get('email'),
    dcc: formData.get('dcc'),
  })
  const file = formData.get('file')
  console.log(file)
  if (file === null) return
  // TODO: extracting the zip file in memory in browser
  //       will not work well for very large files
  const zip = new JSZip();
  const zipBlob = await zip.loadAsync(file);
  const manifestFile = zipBlob.file('manifest.json')
  if (!manifestFile) throw new Error('Manifest not found')
  const manifestContent = await manifestFile.async('text')
  const manifestJSON = z.object({
    filename: z.string(),
    filetype: z.string(),
    annotation: z.string(),
  }).parse(JSON.parse(manifestContent))
  const otherFile = zipBlob.file(`${manifestJSON.filename}`)
  // TODO: couldn't we send multiple files in the zip?
  if (!otherFile) throw new Error(`${manifestJSON.filename} not found in zip`)
  const content = await otherFile.async('blob')
  const otherFileInfo = new File([content], manifestJSON.filename)
  const data = {
    filetype: manifestJSON.filetype,
    filename: otherFileInfo.name,
    // TODO: this url should be constructed in the database come from the envrionment
    size: otherFileInfo.size,
    annotation: manifestJSON.annotation,
    // TODO: this should come from the user's association in the database, not from here
    dcc_string: formObjects.dcc,
  }
  // put metadata in database
  let metadata_res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!metadata_res.ok) throw new Error(await metadata_res.text())
  // upload presigned url
  let s3_res = await fetch(`/api/s3upload?name=${otherFileInfo.name}&dcc=${formObjects.dcc}&filetype=${manifestJSON.filetype}&date=${new Date().toJSON().slice(0, 10)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (!s3_res.ok) throw new Error(await s3_res.text())
  const s3_res_json = z.object({ message: z.string() }).parse(await s3_res.json())
  // upload to s3
  const s3_upload_res = await fetch(s3_res_json.message, {
    method: 'PUT',
    body: otherFileInfo
  })
  if (!s3_upload_res.ok) throw new Error(await s3_upload_res.text())
}

type S3UploadStatus = {
  success?: boolean,
  loading?: boolean,
  error?: any,
}
const S3UploadStatusContext = React.createContext({} as S3UploadStatus)

/**
 * Any child of <S3UploadForm> can access this hook to
 *  see the status of the upload.
 */
export function useS3UploadStatus() {
  return React.useContext(S3UploadStatusContext)
}

export function S3UploadForm({ children }: React.PropsWithChildren<{}>) {
  const [status, setStatus] = React.useState<S3UploadStatus>({})
  // React.useEffect(() => { console.log(status) }, [status])
  return (
    <form onSubmit={(evt) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      setStatus(() => ({ loading: true }))
      upload(formData)
        .then(() => {setStatus(() => ({ success: true }))})
        .catch(error => {setStatus(() => ({ error }))})
    }}>
      <S3UploadStatusContext.Provider value={status}>
        {children}
      </S3UploadStatusContext.Provider>
    </form>
  )
}
