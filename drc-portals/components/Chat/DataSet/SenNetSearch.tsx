import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';

const getSenNetData= async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchSenNet`, options)
  const data = await res.json()
  return data
};

export default function SenNetSearch(props: any) {
  const mustClauses = [];
  if(props.organ){
    mustClauses.push(          
      {
        "match": {
          "title": props.organ
        }
      }
    );
  }
  if(props.group_name){
    mustClauses.push(          
      {
        "term": {
          "group_name.keyword": props.group_name
        }
      }
    );
  }
  if(props.dataset_type){
    mustClauses.push(          
      {
        "match": {
          "title": props.dataset_type
        }
      }
    );
  }
  const payload = {
    "size":100,
    "query": {
      "bool": {
        "must": mustClauses,
        "filter": [
          {
            "match": {
              "entity_type.keyword": "Dataset"
            }
          }
        ]
      }
    }
  }

  const { data, isLoading, error } = useSWR(payload, getSenNetData);
  
  if (error) {
    return <>{error?.message}</>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }
  console.log(data)
  const workdata = data?.data?.hits?.hits;

  if (Array.isArray(workdata) && workdata.length > 0) {
    const feeddata = new Array(workdata.length);
  
    for (let i = 0; i < workdata.length; i++) {
      if(workdata[i]._source.doi_url){
        feeddata[i] = {
          "Title": workdata[i]._source.title,
          "SenNet ID": workdata[i]._source.sennet_id,
          "DOI URL": workdata[i]._source.doi_url,
          "Group Name": workdata[i]._source.group_name
        };
      }
      else{
        feeddata[i] = {
          "Title": workdata[i]._source.title,
          "SenNet ID": workdata[i]._source.sennet_id,
          "Group Name": workdata[i]._source.group_name,
          "uuid": workdata[i]._source.uuid
        };
      }

    }
  
    const columns = ["SenNet ID", "Title"];
    if(!props.group_name){
      columns.push("Group Name")
    }
  return (
    <>
      <div className='col'>
        <TableViewCol rowData={feeddata} columns={columns}/>
      </div>
    </>)
  } else if (Array.isArray(workdata) && workdata.length === 0) {
    console.warn('workdata is an empty array');
  } else {
    console.error('workdata is null or undefined');
  }
  return (
    <>
      <div className='col'>
        <p>No entries for your query</p>
      </div>
    </>)
  

}
  