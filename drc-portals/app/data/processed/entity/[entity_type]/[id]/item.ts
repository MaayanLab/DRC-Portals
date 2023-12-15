import prisma from "@/lib/prisma"
import { cache } from "react";

export  const getItem = cache((id: string) => prisma.entityNode.findUniqueOrThrow({
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
