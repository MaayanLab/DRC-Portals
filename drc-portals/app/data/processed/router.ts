import prisma from "@/lib/prisma";
import { procedure, router } from "@/lib/trpc";
import { NodeType, Prisma } from "@prisma/client";
import { cache } from 'react'
import { z } from 'zod'

export default router({
  autocomplete: procedure
    .input(z.object({
      q: z.string(),
      type: z.string().optional(),
      entity_type: z.string().optional(),
    }))
    .query(cache(async (props) => {
      if (props.input.q.length < 3) return []
      const results = await prisma.$queryRaw<Array<{
        id: string,
        type: NodeType,
        entity_type: string | null,
        label: string,
      }>>`
        select node.id, node.type, entity_node.type as entity_type, node.label
        from node
        left join entity_node on entity_node.id = node.id
        ${props.input.type ? Prisma.sql`
        where node.type = ${props.input.type}::"NodeType"
        ${props.input.entity_type ? Prisma.sql`
        and entity_node.type = ${props.input.entity_type}
        ` : Prisma.empty}
        ` : Prisma.empty}
        order by node.label <-> ${props.input.q}
        limit 10
      `
      return results
    }))
})
