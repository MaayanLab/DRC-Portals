import prisma from "@/lib/prisma/slow"
import { cache } from "react";

export const getItem = cache((id: string) => prisma.entityNode.findUnique({
  where: { id },
  select: {
    type: true,
    node: {
      select: {
        label: true,
        description: true,
      }
    }
  }
}))
