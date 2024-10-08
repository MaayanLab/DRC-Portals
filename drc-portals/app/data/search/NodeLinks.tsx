import prisma from "@/lib/prisma/slow"
import { safeAsync } from "@/utils/safe"
import { NodeType } from "@prisma/client"

async function KGRelationNodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  const { data: relation_dcc_counts } = await safeAsync(() => prisma.$queryRaw<{
    dcc_id: string,
    count: string,
  }[]>`
    select dcc_id, count(*) as count
    from kg_assertion
    where relation_id = ${props.item.id}::uuid
    group by dcc_id
    order by count desc;
  `)
  if (relation_dcc_counts) return <>{relation_dcc_counts.toString()}</>
}

async function EntityNodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  const { data: relation_dcc_counts } = await safeAsync(() => prisma.$queryRaw<{
    dcc: { id: string, label: string },
    count: string,
  }[]>`
    select
      (select json_build_object('id', dccs.id, 'label', dccs.short_label)
       from dccs
       where dccs.id = dcc_id) as dcc,
      count(*) as count
    from kg_assertion
    where source_id = ${props.item.id}::uuid or target_id = ${props.item.id}::uuid
    group by dcc_id
    order by count desc;
  `)
  if (relation_dcc_counts?.length) return <>Knowledge Graph Assertions from <ul className="list-disc ml-6">{relation_dcc_counts.map((item) => <li key={item.dcc.id} className="list-item">{item.dcc.label} ({BigInt(item.count).toLocaleString()})</li>)}</ul></>
}

async function GeneSetLibraryNodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  const gene_set = await prisma.geneSetLibraryNode.findUnique({
    where: { id: props.item.id },
    select: {
      _count: {
        select: {
          gene_sets: true,
        },
      },
    }
  })
  if (gene_set) return <>{BigInt(gene_set?._count.gene_sets).toLocaleString()} gene sets</>
}

async function GeneSetNodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  const gene_set = await prisma.geneSetNode.findUnique({
    where: { id: props.item.id },
    select: {
      _count: {
        select: {
          genes: true,
        },
      },
    }
  })
  if (gene_set) return <>{BigInt(gene_set._count.genes).toLocaleString()} genes</>
}

async function GeneNodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  const { data: relation_dcc_counts, error } = await safeAsync(() => prisma.$queryRaw<{
    dcc: { id: string, label: string },
    count: string,
  }[]>`
    select
      (select json_build_object('id', dccs.id, 'label', dccs.short_label)
       from dccs
       where dccs.id = gs_node.dcc_id) as dcc,
      count(*) as count
    from "_GeneEntityToGeneSetNode"
    inner join node gs_node on gs_node.id = "_GeneEntityToGeneSetNode"."B"
    where "_GeneEntityToGeneSetNode"."A" = ${props.item.id}::uuid
    group by gs_node.dcc_id
    order by count desc;
  `)
  if (relation_dcc_counts?.length) return <>Gene sets from <ul className="list-disc ml-6">{relation_dcc_counts.map((item) => <li key={item.dcc.id} className="list-item">{item.dcc.label} ({BigInt(item.count).toLocaleString()})</li>)}</ul></>
}

export default async function NodeLinks(props: {item: { id: string, type: NodeType, entity_type: string | null }}) {
  return <>
    {props.item.type === 'kg_relation' && <KGRelationNodeLinks item={props.item} />}
    {props.item.type === 'entity' && props.item.entity_type === 'gene' && <GeneNodeLinks item={props.item} />}
    {props.item.type === 'entity' && <EntityNodeLinks item={props.item} />}
    {props.item.type === 'gene_set_library' && <GeneSetLibraryNodeLinks item={props.item} />}
    {props.item.type === 'gene_set' && <GeneSetNodeLinks item={props.item} />}
  </>
}
