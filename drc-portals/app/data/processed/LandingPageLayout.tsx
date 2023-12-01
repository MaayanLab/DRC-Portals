import React, { ReactNode } from "react"
import { Container, Typography } from "@mui/material"
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
        {props.icon ? 
          <div className="flex-grow-0 self-center justify-self-center">
            <Link href={props.icon.href}>
              <Image src={props.icon.src} alt={props.icon.alt} width={240} height={240} />
            </Link>
          </div>
          : null}
        <Container className="flex-grow">
          <Container><Typography variant="h1">{props.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {props.description}</Typography></Container>
          {props.metadata?.map((item, i) => item ? <Container key={i}>{item.label}: {item.value}</Container> : null)}
        </Container>
      </div>
      {props.children}
    </Container>
  )
}
