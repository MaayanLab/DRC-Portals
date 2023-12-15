import { Box, Container } from "@mui/material"
import React from "react"

export default function Layout(props: {
  children: React.ReactNode,
  assertions: React.ReactNode,
  gene_sets: React.ReactNode,
}) {
  return (
    <div className="flex flex-col gap-4">
      {props.children}
      {props.gene_sets}
      {props.assertions}
    </div>
  )
}
