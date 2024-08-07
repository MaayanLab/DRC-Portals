import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';

//fetch HuBMAP data
const getHuBMAPData= async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchHuBMAP`, options)
  const data = await res.json()
  return data
};

export default function HuBMAPSearch(props: any) {
  const mustClauses = []; //Store search clauses
  let size = 50 //Default search result length
  //Adjust number of returned results based on props. Adjustment because of an inconsistent error.
  if(!props.group_name && (props.organ || props.dataset_type)){
    size = 50
  }
  if(props.organ){
    mustClauses.push(          
      {
        "match_phrase": {
          "title": props.organ
        }
      }
    );
  }
  //Add clauses for props
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
        "match_phrase": {
          "display_subtype": props.dataset_type
        }
      }
    );
  }


  const payload = {
    "size": size,
    "query": {
      "bool": {
        "must": mustClauses,
        "filter": [
          {
            "term": {
              "entity_type.keyword": "Dataset"
            }
          }
        ]
      }
    }
  };

  const { data, isLoading, error } = useSWR(payload, getHuBMAPData);
  
  if (error) {
    return <>{error?.message}</>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }
  console.log(data)
  //Handle results
  const workdata = data?.data?.hits?.hits;

  if (Array.isArray(workdata) && workdata.length > 0) {
    const feeddata = new Array(workdata.length);
    //Reformat results
    for (let i = 0; i < workdata.length; i++) {
      if(workdata[i]._source.doi_url){
        feeddata[i] = {
          "Title": workdata[i]._source.title,
          "HuBMAP ID": workdata[i]._source.hubmap_id,
          "DOI URL": workdata[i]._source.doi_url,
          "Group Name": workdata[i]._source.group_name
        };
      }
      else{
        feeddata[i] = {
          "Title": workdata[i]._source.title,
          "HuBMAP ID": workdata[i]._source.hubmap_id,
          "Group Name": workdata[i]._source.group_name,
          "uuid": workdata[i]._source.uuid
        };
      }

    }
    //
    const columns = ["HuBMAP ID", "Title"];
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
  //Return statement if no data
  return (
    <>
      <div className='col'>
        <p>No entries for your query</p>
      </div>
    </>)
  

}
  