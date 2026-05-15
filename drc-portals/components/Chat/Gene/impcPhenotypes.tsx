import useSWR from 'swr';
import TableViewCol from '@/components/Chat/vis/tableViewCol';
import { Typography, Container } from '@mui/material';

const fetchImpcPhenotype = async (geneId: string) => {
    const firstLetter = geneId[0].toUpperCase();
    const restOfTheString = geneId.slice(1).toLowerCase();
    const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
    const data = await res.json();
  return data['response']['docs'];
};

const columns = [
  'marker_accession_id',
  'mp_term_id',
  'mp_term_name',
  'assertion_type',
  'p_value',
  'percentage_change',
  'statistical_method',
]


export default function ImpcPhenotypes(props: any) {
  const geneSymbol = props.geneSymbol
  if (props.output === undefined) {
        return <>Error</>
    }
  const data = props.output
  if (data.length === 0) return <Typography variant={"h3"}>No Mouse Phenotypes Found For {geneSymbol}</Typography>
  return (
    <Container maxWidth="lg">
          <Typography variant={"h3"}>Mouse Phenotypes Associated With {geneSymbol}</Typography>
          <TableViewCol rowData={data} columns={columns} />
    </Container>
  );
};
