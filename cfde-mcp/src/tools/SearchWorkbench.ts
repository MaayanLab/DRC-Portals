import { z } from "zod";
import { estypes } from "@elastic/elasticsearch";
import { groupby } from "./utils.js";
import elasticsearch from "./elasticsearch.js";

const limit = 10

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

const SearchWorkbenchTool = [
	"search_workbench",
	{
		title: "Search Workbench",
		description: "Query different biomedical entities in the CFDE workbench",
		inputSchema: {
			input: z.object({
				search: z.string().optional().describe("the search term"),
    			facet: z.string().array().optional().describe("the cfde entity"),
				cursor: z.string().optional().describe("search cursor"),
			})
		},
	},
	async (props: {input: {
		search?: string, 
		facet?: string[],
		cursor?: string,
	}}) => {
		try {
			const must: estypes.QueryDslQueryContainer[] = []
			const filter: estypes.QueryDslQueryContainer[] = []
			if (props.input.search) must.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2o_*.a_*'], default_operator: 'AND' } })
			if (props.input.facet?.length) filter.push({
				query_string: {
					query: Object.entries(groupby(
					props.input.facet, f => f.substring(0, f.indexOf(':'))
					)).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
				}
			})
			const searchRes = await elasticsearch.search<EntityExpandedType>({
				index: 'entity_expanded',
				query: {
					function_score: {
					query: {
						bool: {
						must,
						filter,
						},
					},
					functions: [
						{
						field_value_factor: {
							field: 'pagerank',
							missing: 1,
						}
						}
					],
					boost_mode: "sum"
					},
				},
				sort: [
					{'_score': {'order': 'desc'}},
					{'id': {'order': 'asc'} },
				],
				size: limit,
				search_after: props.input.cursor ? JSON.parse(props.input.cursor) : undefined,
				rest_total_hits_as_int: true,
		})
			const next = searchRes.hits.hits.length === limit ? JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort) : undefined
			const items = searchRes.hits.hits.map(hit => hit._source).filter((hit): hit is EntityExpandedType => !!hit)
		console.log(items)
			return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									items,
									total: searchRes.hits.total,
									next,
									filter
								}),
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


export default SearchWorkbenchTool;