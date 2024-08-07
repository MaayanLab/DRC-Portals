import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import PlaybookButton from '../playbookButton';

//Fetch Playbook Data. Used to obtain a PWB ID for the Playbook button
const getPlaybookChEA3Data = async (body: any) => {

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

//Fetch ChEA3 Data. Used for the table.
const getChEA3Data = async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchChEA3`, options)
  const data = await res.json()
  return data
};

export default function ChEA3(props: any) {
  const geneset = props.genes
  
  var body = {
    "data": {
      "60e507db-c00d-d5eb-d014-6498e81aed4f": {
        "type": "Input[Set[Gene]]",
        "value": {
          "description": "Gene set",
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
        "id": "175f0155-c13d-1871-7557-01ede4219bf0",
        "type": "ChEA3TFEnrichmentAnalysis",
        "inputs": { "gene_set": { "id": "df5b091e-7c80-f268-9967-dbaffc68d89c" } }
      }
    ]
  }  
  var payload ={
    "query_name": "myQuery",
    "gene_set": geneset
  }
  const { data: playbookData, isLoading: isPlaybookLoading, error: playbookError } = useSWR(['playbookChEA3Data', body], ()=>getPlaybookChEA3Data(body));
  const { data: cheaData, isLoading: newLoading, error: newError } = useSWR(['ChEA3Data', payload], ()=>getChEA3Data(payload));

  
  if (playbookError || newError) {
    return <>{playbookError?.message}</>;
  }

  if (isPlaybookLoading||newLoading) {
    return <>Loading...</>;
  }

  //Reformatting results
  const columns = ["Rank", "TF", "Mean Rank"];
  const rename={
    "Mean Rank": "Score"
  }
  //Dispaly results
  const cheaDisplayData = cheaData.data["Integrated--meanRank"]
  console.log(cheaData);
  return (
    <>
      <div className='col'>
        <TableViewCol rowData={cheaDisplayData} columns={columns} rename={rename}/>
        <PlaybookButton id={playbookData.id}></PlaybookButton>
      </div>
    </>)
}
  