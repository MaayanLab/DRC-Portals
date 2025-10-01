import prisma from "@/lib/prisma/slow"
import { cache } from "react";

export const getItem = cache(({ entity_type, slug, }: { entity_type: string, slug: string }) => prisma.node.findUnique({
  where: { type_entity_type_slug: { type: 'entity', entity_type: decodeURIComponent(entity_type), slug: decodeURIComponent(slug) } },
  select: {
    id: true,
    label: true,
    description: true,
    entity: {
      select: {
        type: true,
        gene: {
          select: {
            entrez: true,
            ensembl: true,
          },
        },
      },
    },
  }
}))
