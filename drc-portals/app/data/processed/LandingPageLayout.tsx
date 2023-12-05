import React, { ReactNode } from "react"
import { Box, Container, Typography } from "@mui/material"
import Link from "next/link"
import Image from "next/image"

export default function LandingPageLayout(props: React.PropsWithChildren<{
  label: React.ReactNode,
  description: React.ReactNode,
  metadata?: ({label: React.ReactNode, value: ReactNode} | null)[],
  icon?: { src: string, href: string, alt: string },
}>) {
  return (
    <Container>
      <div className="flex flex-column">
        <Box className="flex-grow">
          <Box><Typography variant="h1">{props.label}</Typography></Box>
          {props.metadata?.map((item, i) => item ? <Box key={i}>{item.label}: {item.value}</Box> : null)}
          <Box><Typography variant="body2">Description: {props.description}</Typography></Box>
        </Box>
        {props.icon ? 
          <div className="flex-grow-0 self-center justify-self-center">
            <Link href={props.icon.href}>
              <Image src={props.icon.src} alt={props.icon.alt} width={240} height={240} />
            </Link>
          </div>
          : null}
      </div>
      <div className="my-8">
        {props.children}
      </div>
    </Container>
  )
}
