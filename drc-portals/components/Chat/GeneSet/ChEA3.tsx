import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import PlaybookButton from '../playbookButton';

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

  const columns = ["Rank", "TF", "Mean Rank"];
  const rename={
    "Mean Rank": "Score"
  }
  const sample = [
    {
      Library: "ARCHS4 Coexpression,6;Enrichr Queries,8;GTEx Coexpression,6",
      Overlapping_Genes: "NPDC1,CAMK2B,NPRL2,ZBTB16,PILRB,PKD1,SORBS3,HDAC6,DNAJB2,FBXL8,MCF2L,CEP170B,TRIB3,ZNF358",
      Query_Name: "myQuery",
      Rank: "1",
      Score: "6.667",
      TF: "HSF4"
    }
  ]
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
  