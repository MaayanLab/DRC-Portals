import prisma from "@/lib/prisma/slow"
import { cache } from "react";

export const getItem = cache((slug: string) => prisma.entityNode.findUnique({
  where: { node: { slug } },
  select: {
    type: true,
    node: {
      select: {
        label: true,
        description: true,
      }
    },
    gene: {
      select: {
        entrez: true,
        ensembl: true,
      },
    },
  }
}))
