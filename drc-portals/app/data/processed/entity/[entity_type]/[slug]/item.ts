import prisma from "@/lib/prisma/slow"
import { cache } from "react";

export const getItem = cache(({ entity_type, slug, }: { entity_type: string, slug: string }) => prisma.entityNode.findUnique({
  where: { node: { type: 'entity', entity_type, slug } },
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
