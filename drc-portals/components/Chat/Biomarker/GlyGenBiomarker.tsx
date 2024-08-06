import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import DownloadJSON from '../downloadJSON';
import DownloadCSV from '../downloadCSV';

const getGlyGenBiomarker = async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchGlyGenBiomarker`, options)
  const data = await res.json()
  console.log(data)
  if(data?.data?.list_id!=''){
    const listBody = {
      "id": data?.data?.list_id,
      "offset":1,
      "sort":"hit_score",
      "limit": 20,
      "order": "desc",
      "filters": []
    }
    const listOptions: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(listBody)
    }
    const listRes = await fetch(`/chat/fetchGlyGenBiomarkerList`, listOptions)
    const listData = await listRes.json()
    return listData
  }
  return data
};

export default function GlyGenBiomarker(props: any) {
  console.log(props)
  const term = props.term
  
  const searchBody = {
    "operation":"AND",
    "query_type":"biomarker_search_simple",
    "term": term,
    "term_category":"any"
  }

  
  const { data, isLoading, error} = useSWR(searchBody, getGlyGenBiomarker);
  if (error) {
    return <>{error?.message}</>;
  }
  if (isLoading) {
    return <>Loading...</>;
  }

  console.log(data)
  if(data?.data?.resultcount==0){
    return(
      <>
        <div>
          No entries for your query.
        </div>
      </>
    )
  }

  const columns = ["Biomarker ID", "Biomarker", "Assessed Biomarker Entity","Assessed Biomarker Entity ID", "Hit Score", "Condition"];
  const rename = {
    "Biomarker ID": "biomarker_id",
    "Biomarker": "biomarker",
    "Assessed Biomarker Entity": "assessed_biomarker_entity",
    "Assessed Biomarker Entity ID":"assessed_biomarker_entity_id",
    "Hit Score":"hit_score",
    "Condition":"condition"
  }
  const link = {
    "biomarker_id": "https://www.glygen.org/biomarker/"
  }
  return (
    <>
      <div className='col'>
        <TableViewCol rowData={data?.data?.results} columns={columns} rename={rename} link={link}/>
        <DownloadJSON data ={data?.data?.results}></DownloadJSON>
        <DownloadCSV data ={data?.data?.results}></DownloadCSV>
      </div>

    </>)

}
  