export interface EnrichmentParams {
    libraries?: Array<{
        name: string,
        limit?: number,
        library?: string,
        term_limit?: number, 
    }>,
    userListId?: string,
    term_limit?: number,
    gene_limit?: number,
    min_lib?: number,
    gene_degree?: number,
    term_degree?: number,
    augment?: boolean,
    augment_limit?: number,
    gene_links?: Array<string>,
    search?: boolean,
    expand?: Array<string>,
    remove?: Array<string>,
    additional_link_tags?: Array<string>,
}

export interface NetworkSchema {
    nodes: Array<{
        data: {
            id: string,
            kind: string,
            label: string,
			pval?: number,
            [key: string]: string | number | boolean | undefined,
        }
    }>,
    edges: Array<{
        data: {
            source: string,
            source_label: string,
            target: string,
            target_label: string,
            kind: string,
            label: string,
			relation?: string,
			directed?: string,
            [key: string]: string | number | boolean | undefined,
        }
    }>
}