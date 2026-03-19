import { z } from "zod";
import { estypes } from "@elastic/elasticsearch";
import { groupby } from "./utils.js";
import elasticsearch from "./elasticsearch.js";

const limit = 100

type WithPrefix<Prefix extends string, T> = {
  [K in keyof T as `${Prefix}${string & K}`]: T[K];
};


export type EntityType = {
  id: string,
  type: string,
  slug: string,
  pagerank: string,
  a_label: string,
  a_description: string,
} & WithPrefix<'a_', Record<string, string>>


export type EntityExpandedType = {
  id: string,
  type: string,
  slug: string,
  pagerank: string,
  a_label: string,
  a_description: string,
} & WithPrefix<'a_', Record<string, string>> & WithPrefix<'m2o_', Record<string, EntityType>>/* & WithPrefix<'m2m_', Record<string, string>>*/

export type TermAggType<K extends string> = Record<K, {
  buckets: { key: string, doc_count: number }[]
}>

const WorkbenchFacetTool = [
	"workbench facet",
	{
		title: "Workbench Facet",
		description: "Provide aggregations for CFDE Workbench database",
		inputSchema: {
			input: z.object({
				search: z.string().optional().describe("the search term"),
    			facet: z.string().array().optional().describe("the cfde entity"),
			})
		},
	},
	async (props: {input: {
		search?: string, 
		facet?: string[],
	}}) => {
		try {
			const filter: estypes.QueryDslQueryContainer[] = []
			if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2o_*.a_*'], default_operator: 'AND' } })
			if (props.input.facet?.length) filter.push({
			query_string: {
				query: Object.entries(groupby(
				props.input.facet, f => f.substring(0, f.indexOf(':'))
				)).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
			}
			})
			let facets: string[] = []
			facets.push(
			'type',
			'm2o_disease.id', 'm2o_species.id', 'm2o_anatomy.id', 'm2o_gene.id', 'm2o_protein.id', 'm2o_compound.id', 'm2o_data_type.id', 'm2o_assay_type.id',
			'm2o_file_format.id', 'm2o_ptm_type.id', 'm2o_ptm_subtype.id', 'm2o_ptm_site_type.id',
			'm2o_project.id', 'm2o_dcc.id',
			'm2o_source.id', 'm2o_relation.id', 'm2o_target.id',
			)
			const searchRes = await elasticsearch.search<EntityExpandedType, TermAggType<typeof facets[0]>>({
			index: 'entity_expanded',
			query: {
				bool: {
				filter,
				},
			},
			aggs: Object.fromEntries(facets.map(facet => [facet, { terms: { field: facet as string, size: 20 } }])),
			size: 0,
			rest_total_hits_as_int: true,
			})
			const entityLookupRes = await elasticsearch.search<EntityExpandedType>({
			index: 'entity_expanded',
			query: {
				ids: {
				values: Array.from(new Set([
					...facets.flatMap(facet => {
					if (facet === 'm2o_dcc.id') return []
					const agg = searchRes.aggregations
					if (!agg) return []
					return agg[facet].buckets.map(filter => filter.key)
					}),
				]))
				}
			},
			size: 200,
			})
			const entityLookup: Record<string, EntityExpandedType> = Object.fromEntries([
				...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityExpandedType} => !!hit._source).map((hit) => [hit._id, hit._source]),
			])
			return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									total: searchRes.hits.total,
									aggregations: searchRes.aggregations,
									entityLookup,
								})
							}
						],
					}
		} catch (error) {
			console.log(error)	
			return {
						content: [
							{
								type: "text",
								text: JSON.stringify(error)
							}
						],
					}
		}
  	}
]


export default WorkbenchFacetTool;