/**
 * 
 * Based on:
 *  https://genome.ucsc.edu/goldenPath/help/hgTracksHelp.html#UseOneFile
 * 
 * This page essentially defines a hub.txt file for any file in the c2m2
 *  but it will only work for files that:
 * 
 * 1. have file_format of VCF, bigBED, or bigWig
 * 2. have a subject attached with the taxonomy 9606 (human)
 * 3. have a publicly accessible ~access_url~ persistent_id with the actual data
 * 
 * We use the genome: hg19  but this may not be accurate,
 *  it's unclear how we'd determine the correct one at this stage.
 * 
 * A hub can thus be assembled by pointing to the url at:
 *  https://cfde.cloud/data/c2m2/file/{id_namespace}/{local_id}/genome-browser/hub.txt
 * 
 */
import c2m2 from "@/lib/prisma/c2m2"

export async function GET(
  request: Request,
  props: { params: Promise<{ id_namespace: string, local_id: string }> }
) {
  const params = await props.params
  const file = await c2m2.file.findUnique({
    where: {
      id_namespace_local_id: { id_namespace: params.id_namespace, local_id: params.local_id }
    },
    select: {
      filename: true,
      local_id: true,
      file_format: true,
      // access_url: true,
      persistent_id: true,
      project: {
        select: {
          name: true,
        },
      },
      file_describes_subject: {
        select: {
          subject: {
            select: {
              subject_role_taxonomy: {
                select: {
                  taxonomy_id: true,
                },
              },
            },
          },
        },
        take: 1,
      }
    },
  })
  if (!file) return new Response(`File not found`, {status: 404})
  let response = `
hub CFDEDataPortalHub
shortLabel CFDE Data Portal Hub
longLabel Genome Browser for data in the Common Fund Data Ecosystem
useOneFile on
email help@cfde.cloud
`
  if (file.file_describes_subject[0].subject.subject_role_taxonomy[0].taxonomy_id === '9606') {
    response += `
genome hg19
`
  } else {
    return new Response(`Unsure which genome to use`, {status: 400})
  }
  if (file.file_format === 'format:3016') { // VCF
    response += `
track vcf
type vcfTabix
shortLabel ${file.local_id}
longLabel ${file.filename} from ${file.project.name}
bigDataUrl ${/*file.access_url*/file.persistent_id}
visibility pack
maxWindowToDraw 200000
`
  // } else if (file.file_format === 'format:3003') { // BED
  } else if (file.file_format === 'format:3004') { // bigBED
    response += `
track bigBed
type bigBed
shortLabel ${file.local_id}
longLabel ${file.filename} from ${file.project.name}
bigDataUrl ${/*file.access_url*/file.persistent_id}
`
  } else if (file.file_format === 'format:3006') { // bigWig
    response += `
track bigWig
type bigWig
shortLabel ${file.local_id}
longLabel ${file.filename} from ${file.project.name}
bigDataUrl ${/*file.access_url*/file.persistent_id}
`
  } else {
    return new Response(`Compatible file format found`, {status: 400})
  }
  return new Response(response, { headers: { 'Content-Type': 'text/plain' } })
}
