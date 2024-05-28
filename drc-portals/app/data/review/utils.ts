import { z } from 'zod';

export const schemaToDCC = [
  { schema: '_4dn', label: '4DN' },
  { schema: 'ercc', label: 'ERCC' },
  { schema: 'glygen', label: 'GlyGen' },
  { schema: 'gtex', label: 'GTex' },
  { schema: 'hmp', label: 'HMP' },
  { schema: 'hubmap', label: 'HuBMAP' },
  { schema: 'idg', label: 'IDG' },
  { schema: 'kidsfirst', label: 'KidsFirst' },
  { schema: 'lincs', label: 'LINCS' },
  { schema: 'metabolomics', label: 'Metabolomics Workbench' },
  { schema: 'motrpac', label: 'MoTrPAC' },
  { schema: 'sparc', label: 'SPARC' }
];

export const tableToName = [
  { table: 'analysis_type', label: 'Analysis Type' },
  { table: 'anatomy', label: 'Anatomy' },
  { table: 'assay_type', label: 'Assay Type' },
  { table: 'biosample', label: 'Biosample' },
  { table: 'biosample_disease', label: 'Biosample - Disease' },
  { table: 'biosample_from_subject', label: 'Biosample from Subject' },
  { table: 'biosample_gene', label: 'Biosample - Gene' },
  { table: 'biosample_in_collection', label: 'Biosample in Collection' },
  { table: 'biosample_substance', label: 'Biosample - Substance' },
  { table: 'collection', label: 'Collection' },
  { table: 'collection_anatomy', label: 'Collection - Anatomy' },
  { table: 'collection_compound', label: 'Collection - Compound' },
  { table: 'collection_defined_by_project', label: 'Collection defined by Project' },
  { table: 'collection_disease', label: 'Collection - Disease' },
  { table: 'collection_gene', label: 'Collection - Gene' },
  { table: 'collection_in_collection', label: 'Collection in Collection' },
  { table: 'collection_phenotype', label: 'Collection - Phenotype' },
  { table: 'collection_protein', label: 'Collection - Protein' },
  { table: 'collection_substance', label: 'Collection - Substance' },
  { table: 'collection_taxonomy', label: 'Collection - Taxonomy' },
  { table: 'compound', label: 'Compound' },
  { table: 'data_type', label: 'Data Type' },
  { table: 'dcc', label: 'DCC' },
  { table: 'disease', label: 'Disease' },
  { table: 'file', label: 'File' },
  { table: 'file_describes_biosample', label: 'File describes Biosample' },
  { table: 'file_describes_collection', label: 'File describes Collection' },
  { table: 'file_describes_subject', label: 'File describes Subject' },
  { table: 'file_format', label: 'File Format' },
  { table: 'file_in_collection', label: 'File in Collection' },
  { table: 'gene', label: 'Gene' },
  { table: 'id_namespace', label: 'ID Namespace' },
  { table: 'ncbi_taxonomy', label: 'NCBI Taxonomy' },
  { table: 'phenotype', label: 'Phenotype' },
  { table: 'phenotype_disease', label: 'Phenotype - Disease' },
  { table: 'phenotype_gene', label: 'Phenotype - Gene' },
  { table: 'project', label: 'Project' },
  { table: 'project_in_project', label: 'Project in Project' },
  { table: 'protein', label: 'Protein' },
  { table: 'protein_gene', label: 'Protein - Gene' },
  { table: 'sample_prep_method', label: 'Sample Prep Method' },
  { table: 'subject', label: 'Subject' },
  { table: 'subject_disease', label: 'Subject - Disease' },
  { table: 'subject_in_collection', label: 'Subject in Collection' },
  { table: 'subject_phenotype', label: 'Subject - Phenotype' },
  { table: 'subject_race', label: 'Subject - Race' },
  { table: 'subject_role_taxonomy', label: 'Subject Role Taxonomy' },
  { table: 'subject_substance', label: 'Subject - Substance' },
  { table: 'substance', label: 'Substance' }
];


export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
    // Define the schema for known parameters
    const schema = z.object({
      q: z.union([
        z.array(z.string()).transform(qs => qs.join(' ')),
        z.string(),
        z.undefined(),
      ]),
      s: z.union([
        z.array(z.string()).transform(ss => ss[ss.length - 1]),
        z.string(),
        z.undefined(),
      ]).transform(ss => {
        if (!ss) return undefined;
        const [type, entity_type] = ss.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }),
      p: z.union([
        z.array(z.string()).transform(ps => +ps[ps.length - 1]),
        z.string().transform(p => +p),
        z.undefined().transform(() => 1),
      ]),
      r: z.union([
        z.array(z.string()).transform(ps => +ps[ps.length - 1]),
        z.string().transform(p => +p),
        z.undefined().transform(() => 10),
      ]).transform(r => ({ 10: 10, 20: 20, 50: 50 }[r] ?? 10)),
      t: z.union([
        z.array(z.string()),
        z.string().transform(ts => ts ? ts.split('|') : undefined),
        z.undefined(),
      ]).transform(ts => ts ? ts.map(t => {
        const [type, entity_type] = t.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }) : undefined),
      et: z.union([
        z.array(z.string()),
        z.string().transform(ts => ts ? ts.split('|') : undefined),
        z.undefined(),
      ]).transform(ts => ts ? ts.map(t => {
        const [type, entity_type] = t.split(':');
        return { type, entity_type: entity_type ? entity_type : null };
      }) : undefined),
    }).passthrough();
  
    // Parse and return the parameters
    return schema.parse(props.searchParams);
  }