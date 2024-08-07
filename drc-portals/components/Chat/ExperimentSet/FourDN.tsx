import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import LinkButton from '../linkButton';

//Fetch FourDN data
const getFourDNData = async (body: any) => {

  const options: any = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(body)

  }
  const res = await fetch(`/chat/fetchFourDN`, options)
  const data = await res.json()
  return data
};

export default function FourDN(props: any) {
  console.log(props)
  const organism = props.organism
  //Remove the end ()
  const experimentItems = [" (Hi-C)", " (FISH)", " (DNA binding)", " (Proximity-seq)", " (Immunofluorescence)", " (Replication timing)", " (Transcription)", " (SPT)", " (Hi-C single cell)", " (IP-based 3C)", " (Enrichment Hi-C)", " (Open Chromatin)", " (Ligation-free 3C)", " (OptoDroplet)", " (Reporter Expression)", " (RNA-DNA Hi-C)", " (DNA damage detection)", " (TEM)"]
  const experiment = props.experiment.map((val: string)=>{
    experimentItems.map((item: string)=>{
      val = val.replace(item, "")
    })
    return val
  })
  //Creating the payload
  let payload: {[key: string]: any} = {
    "type":"ExperimentSetReplicate",
    "experimentset_type":"replicate"
  }
  //Adds organisms and experiment types
  if(organism!="All"){
    for(const entry in organism){
      if (!payload['experiments_in_set.biosample.biosource.organism.name']){
        payload['experiments_in_set.biosample.biosource.organism.name'] = []
      }
      payload['experiments_in_set.biosample.biosource.organism.name'].push(organism[entry].toLowerCase())
    }
  }
  if(experiment != "All"){
    for(const entry in experiment){
      if (!payload['experiments_in_set.experiment_type.display_title']){
        payload['experiments_in_set.experiment_type.display_title'] = []
      }
      payload['experiments_in_set.experiment_type.display_title'].push(experiment[entry])
    }
  }
  console.log(payload)
  const { data , isLoading, error } = useSWR(payload, getFourDNData);

  
  if (error) {
    return <>{error?.message}</>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  const columns = ["Display Title", "Description"];

  console.log(data);
  //If data doesn't exist
  if(!data?.data){
    return (
      <>
        <div className='col'>
          No entries for your query.
        </div>
      </>)
  }

  //Format results
  const rename = {
  "Display Title": "display_title",
  "Description": "description"
  }
  const link = {
    "display_title": "https://data.4dnucleome.org/experiment-set-replicates/" //Link for hyperlinked values in column
  }
  return (
    <>
      <div className='col'>
        <TableViewCol rowData={data.data["@graph"]} columns={columns} rename = {rename} link = {link}/>
        <LinkButton link={"https://data.4dnucleome.org"+data.data["@id"]} text='See Complete Results in the 4D Nucleome Data Portal'></LinkButton>
      </div>
    </>)
}
  