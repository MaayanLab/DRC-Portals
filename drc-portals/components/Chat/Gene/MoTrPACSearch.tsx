import useSWR from 'swr';
import TableViewColMoTrPAC from '../vis/tableViewColMoTrPAC';

//Fetch MoTrPAC Data
const getMoTrPACData= async (body: any) => {

    const options: any = {
        method: "POST",
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb3RycGFjX2RhdGFfaHViIiwiZXhwIjoxNzIzNzYzMjI0fQ.xkcA3NpHmenchUlFHTZ6_B_iBClSL-uhIdrelOpg0SA',
            'content-type': 'application/json',
            'origin': 'https://motrpac-data.org',
            'priority': 'u=1, i',
            'referer': 'https://motrpac-data.org/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(body)
  
    }
    const res = await fetch(`/chat/fetchMoTrPAC`, options)
    const data = await res.json()
    return data
  };

export default function MoTrPACSearch(props: any) {
    console.log(props)
    var ktype = 'gene' //Default value to Gene
    var key = props.term //Term
    const type = props.type || 'gene' //Set input type
    const selection = props.selection || 'timewise' //Selection for Timewise/Training Data
    const tissue = props.tissue=='All'? []: props.tissue //Filter for Tissue
    const assayKeys: { [key: string]: string }  = {//keys for assay and display assay
        "RNA-seq": "transcript-rna-seq",
        "ATAC-seq": "epigen-atac-seq",
        "RRBS": "epigen-rrbs",
        "Immunoassay": "immunoassay",
        "Targeted Acyl-CoA": "metab-t-acoa",
        "Targeted Amines": "metab-t-amines",
        "Targeted Ethanolamides": "metab-t-etamidpos",
        "Targeted Keto Acids": "metab-t-ka",
        "Targeted Nucleotides": "metab-t-nuc",
        "Targeted Oxylipins": "metab-t-oxylipneg",
        "Targeted Tricarboxylic Acid Cycle": "metab-t-tca",
        "Untargeted HILIC-Positive": "metab-u-hilicpos",
        "Untargeted Ion-Pair Negative": "metab-u-ionpneg",
        "Untargeted Lipidomics Reversed-Phase Negative": "metab-u-lrpneg",
        "Untargeted Lipidomics Reversed-Phase Positive": "metab-u-lrppos",
        "Untargeted Reversed-Phase Negative": "metab-u-rpneg",
        "Untargeted Reversed-Phase Positive": "metab-u-rppos",
        "Global Proteomics": "prot-pr",
        "Phosphoproteomics": "prot-ph",
        "Acetyl Proteomics": "prot-ac",
        "Protein Ubiquitination": "prot-ub",
        "Protein Ubiquitination (Corrected)": "prot-ub-protein-corrected"
      }
    const assay = props.assay=='All'?[]:assayKeys[props.assay]=="Protein Ubiquitination"? ["prot-ub", "prot-ub-protein-corrected"]: assayKeys[props.assay]||[]//Handle case exception
    //Modify key type
    if(type == 'gene'){
        ktype = 'gene'
    }
    if(type == 'protein'){
        ktype = 'protein'
    }
    if(type == 'metabolite'){
        ktype = 'metab'
    }


    const body = {
        'ktype': ktype,
        'keys': key,
        'omics': 'all',
        'analysis': 'all',
        'filters': {
            'tissue': tissue,
            'assay': assay,
            'sex': [],
            'comparison_group': [],
            'adj_p_value': {
                'min': '',
                'max': '',
            },
            'logFC': {
                'min': '',
                'max': '',
            },
            'p_value': {
                'min':'',
                'max': props.pvalueHigh||'', //Filter for p-value
            },
        },
        'fields': [
            'gene_symbol',
            'metabolite',
            'feature_ID',
            'tissue',
            'assay',
            'sex',
            'comparison_group',
            'logFC',
            'p_value',
            'adj_p_value',
            'selection_fdr',
            'p_value_male',
            'p_value_female',
        ],
        'unique_fields': [
            'tissue',
            'assay',
            'sex',
            'comparison_group',
        ],
        'size': 25000,
        'start': 0,
        'save': false,
    }

    const { data, isLoading, error } = useSWR([body], () => getMoTrPACData(body));

    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }
    console.log(data)
    if(!data.data?.uniqs){
        return (
            <>
              <div className='col'>
                <p>No entries for your query</p>
              </div>
            </>)
    }
    var tableData1 = []

    const columnData = ['Gene Symbol', 'Metabolite', 'Feature ID', 'Tissue', 'Assay', 'Sex', 'Timepoint', 'logFC', 'p-value', 'Adj p-value', 'Selection FDR', 'Male p-value', 'Female p-value']
    //Get data based off selection
    if(selection =="timewise"){
        tableData1 = data.data.result.timewise.data
    }
    else if (selection =="training"){
        tableData1 = data.data.result.training.data
    }

    return (
        <>
            {selection == "training"?(
                <TableViewColMoTrPAC rowData={tableData1} columns={columnData} removeIndexes={[1,5,6,7,10]}/>//Training and Timewise data have different nan values. Removes the NA values for each selection.
            ):
            <TableViewColMoTrPAC rowData={tableData1} columns={columnData} removeIndexes={[1,11,12]}/>}
        </>
    )
}