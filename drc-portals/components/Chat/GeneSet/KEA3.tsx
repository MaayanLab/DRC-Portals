import useSWR from 'swr';
import TableView from '../vis/tableView';
import TableViewCol from '../vis/tableViewCol';
import PlaybookButton from '../playbookButton';

const getPlaybookKEA3Data = async (body: any) => {

    const options: any = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)

    }
    const res = await fetch(`/chat/fetchPlaybook`, options)
    const data = await res.json()
    return data
};

const getKEA3Data = async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchKEA3`, options)
  const data = await res.json()
  return data
};

export default function KEA3(props: any) {
  const geneset = props.genes
  
  var body = {
    "data": {
      "60e507db-c00d-d5eb-d014-6498e81aed4f": {
        "type": "Input[Set[Gene]]",
        "value": {
          "description": "Example gene set",
          "set": geneset
        }
      }
    },
    "workflow": [
      {
        "id": "df5b091e-7c80-f268-9967-dbaffc68d89c",
        "type": "Input[Set[Gene]]",
        "data": { "id": "60e507db-c00d-d5eb-d014-6498e81aed4f" }
      },
      {
        "id": "7ea82ab8-b56d-7ca5-6342-71b99b8e4e6b",
        "type": "KEA3KinaseEnrichmentAnalysis",
        "inputs": { "gene_set": { "id": "df5b091e-7c80-f268-9967-dbaffc68d89c" } }
      }
    ]
  }
  
  var payload ={
    "query_name": "myQuery",
    "gene_set": geneset
  }
  const { data: playbookData, isLoading: isPlaybookLoading, error: playbookError } = useSWR(['playbookKEA3Data', body], () => getPlaybookKEA3Data(body));
  const { data: keaData, isLoading: newLoading, error: newError } = useSWR(['KEA3Data', payload], () => getKEA3Data(payload));


  
  if (playbookError || newError) {
    return <>{playbookError?.message}</>;
  }

  if (isPlaybookLoading||newLoading) {
    return <>Loading...</>;
  }

  const columns = ["Rank", "Kinase", "Mean Rank"];
  const rename = {
    "Kinase": "TF",
    "Mean Rank": "Score"
  }
  
  console.log(keaData);
  return (
    <>
      <div className='col'>
        <TableViewCol rowData={keaData.data["Integrated--meanRank"]} columns={columns} rename={rename}/>
        <PlaybookButton id={playbookData.id}></PlaybookButton>
      </div>
    </>)
}
  