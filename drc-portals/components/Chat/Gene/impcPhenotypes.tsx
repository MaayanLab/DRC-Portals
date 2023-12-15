import useSWR from 'swr';
import TableViewIMPC from '@/components/Chat/vis/tableViewIMPC';

const fetchImpcPhenotype = async (geneId: string) => {
    const firstLetter = geneId[0].toUpperCase();
    const restOfTheString = geneId.slice(1).toLowerCase();
    const res = await fetch(`https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_symbol:${firstLetter + restOfTheString}`)
    const data = await res.json();
  return data['response']['docs'];
};


export default function ImpcPhenotypes(props: any) {
  const geneSymbol = props.genesymbol
  const { data, error, isLoading } = useSWR([geneSymbol], () => fetchImpcPhenotype(geneSymbol));

  if (error) {
    return <div>No information for gene with identifier ${geneSymbol} found in GTEx</div>;
  } else if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <> 
          <TableViewIMPC
          rowData={data}>
          </TableViewIMPC>
        </>
    </div>
  );
};
