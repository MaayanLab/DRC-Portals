import prisma from "@/lib/prisma"
import { Container, Typography } from "@mui/material"
import Link from "next/link"
import Image from "next/image"
import { format_description } from "@/app/data/processed/utils";

export default async function Page(props: { params: { id: string } }) {
  const item = await prisma.c2M2File.findUniqueOrThrow({
    where: { id: props.params.id },
    select: {
      persistent_id: true,
      size_in_bytes: true,
      file_format: true,
      assay_type: true,
      data_type: true,
      identity: {
        select: {
          label: true,
          description: true,
        }
      },
      datapackage: {
        select: {
          dcc_asset: {
            select: {
              dcc: {
                select: {
                  short_label: true,
                  label: true,
                  icon: true,
                }
              },
            }
          },
        }
      },
    },
  })
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {item.datapackage.dcc_asset.dcc?.icon ?
            <Link href={`/data/matrix/${item.datapackage.dcc_asset.dcc.short_label}`}>
              <Image src={item.datapackage.dcc_asset.dcc.icon} alt={item.datapackage.dcc_asset.dcc.label} width={240} height={240} />
            </Link>
            : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{item.identity.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {format_description(item.identity.description)}</Typography></Container>
          {item.datapackage.dcc_asset.dcc?.label ? <Container><Typography variant="caption">Project: <Link href={`/data/matrix/${item.datapackage.dcc_asset.dcc.short_label}`}>{item.datapackage.dcc_asset.dcc.label}</Link></Typography></Container> : null}
          <Container><Typography variant="caption">Persistent ID: {item.persistent_id}</Typography></Container>
          <Container><Typography variant="caption">Size in Bytes: {item.size_in_bytes?.toString() ?? 'unknown'}</Typography></Container>
          <Container><Typography variant="caption">File Format: {item.file_format}</Typography></Container>
          <Container><Typography variant="caption">Assay Type: {item.assay_type}</Typography></Container>
          <Container><Typography variant="caption">Data Type: {item.data_type}</Typography></Container>
        </Container>
      </div>
    </Container>
  )
}
