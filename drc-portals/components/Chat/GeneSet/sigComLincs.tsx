import useSWR from 'swr';
import Link from '@/utils/link';
import Image from '@/utils/image';
import { Button, Grid, Typography } from '@mui/material';
import TableViewCol from '../vis/tableViewCol';
import BarChartComponent from '../vis/barChart';
import { blue, red } from '@mui/material/colors';

const METADATA_API = "https://maayanlab.cloud/sigcom-lincs/metadata-api/"

export const fetchSigComLincsId = async (geneset: string[], genesetDown: string[], useUpDown: boolean) => {
    const url = METADATA_API + "entities/find"

    if (useUpDown) {
        const input_gene_set = {
            "up_genes": geneset,
            "down_genes": genesetDown
        }
    
        const allGenes = input_gene_set["up_genes"].concat(input_gene_set["down_genes"])
    
        const payload = {
            filter: {
                where: {
                    "meta.symbol": {
                        inq: allGenes
                    }
                },
                fields: ["id", "meta.symbol"]
            }
        }
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
    
        const entities: any = await res.json()
    
        const upEntities: string[] = []
        const downEntities: string[] = []
        const forEnrichment = {
            "up_entities": upEntities,
            "down_entities": downEntities
        }
    
        entities.forEach((e: any) => {
            const symbol = e["meta"]["symbol"]
            if (geneset.includes(symbol))
                forEnrichment.up_entities.push(e["id"])
            else if (genesetDown.includes(symbol))
                forEnrichment.down_entities.push(e["id"])
        })

        const payload2 = {
            "meta": {
                "$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
                ...forEnrichment
            },
            "type": "signature"
        }
    
        const res2 = await fetch(METADATA_API + "user_input", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload2),
        })
    
        const persistentId = await res2.json()
    
        return (`https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Rank/${persistentId.id}`)
    } else {
        const input_gene_set = {
            "genes": geneset,
        }

        const allGenes = input_gene_set["genes"]

        const payload = {
            filter: {
                where: {
                    "meta.symbol": {
                        inq: allGenes
                    }
                },
                fields: ["id", "meta.symbol"]
            }
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const entities = await res.json()

        const entitiyList : string[] = [];

        const forEnrichment = {
            "entities": entitiyList,
            "signatures": [],
            "offset": 0,
            "limit": 0
        }

        entities.forEach((e: any) => forEnrichment.entities.push(e.id))
        const payload2 = {
            "meta": {
                "$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
                ...forEnrichment
            },
            "type": "signature"
        }
    
        const res2 = await fetch(METADATA_API + "user_input", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload2),
        })
    
        const persistentId = await res2.json()
    
        return (`https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Set/${persistentId.id}`)
    }
}


export default function SigComLincs(props: any) {
    if (props.output === undefined) {
        return <>Error</>
    }
    const tables: {[key:string]: {[key:string]: Array<{[key:string]: string|number}>}} = {}
    const meta_cols = ["local_id", "pert_name", "cell_line", "pert_time", "pert_dose"]
    const score_cols = ["zscore", "z-sum", "p-value", "p-up", "p-down", "type", "rank"]
    if (props.output.CRISPR_KO_signatures) {
        tables["CRISPR KO"] = {}
        for (const i of props.output.CRISPR_KO_signatures) {
            const val:{[key:string]: string|number} = {}
            for (const col of meta_cols) {
                if (i.meta[col]) val[col] = i.meta[col]
            }
            for (const col of score_cols) {
                if (i.scores[col]) val[col] = i.scores[col]
            }
            const dir = i.scores["type"]
            if (tables['CRISPR KO'][dir] === undefined) tables['CRISPR KO'][dir] = []
            tables['CRISPR KO'][dir].push(val)
        }
    }

    if (props.output.Chemical_Perturbation_signatures) {
        tables["Chemical Perturbations"] = {
        }
        for (const i of props.output.Chemical_Perturbation_signatures) {
            const val:{[key:string]: string|number} = {}
            for (const col of meta_cols) {
                if (i.meta[col]) val[col] = i.meta[col]
            }
            for (const col of score_cols) {
                if (i.scores[col]) val[col] = i.scores[col]
            }
            const dir = i.scores["type"]
            if (tables['Chemical Perturbations'][dir] === undefined) tables['Chemical Perturbations'][dir] = []
            tables['Chemical Perturbations'][dir].push(val)
        }
    }

    console.log(tables)
    return (
        <Grid container spacing={2} sx={{marginLeft: 2, marginRight: 2}}>
            {Object.entries(tables).map(([k,v])=>(
                <Grid item xs={12} key={k}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant={'h5'}>
                                {k} Signatures
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {v.down ? <BarChartComponent data={v.down} color={red[200]} neg={true}/>:
                            <BarChartComponent data={v.reversers} color={red[200]} neg={true}/>}
                        </Grid>
                        <Grid item xs={6}>
                            {v.up ? <BarChartComponent data={v.up} color={blue[200]} neg={false}/>:
                            <BarChartComponent data={v.mimickers} color={blue[200]} neg={false}/>}
                        </Grid>
                        {Object.entries(v).map(([key, val])=>(
                            <Grid item xs={12}>
                                <Typography variant={'h5'}>
                                    {key[0].toUpperCase() + key.slice(1,)}{key.endsWith("s") ? "": "-regulating Signatures"}
                                </Typography>
                                {val[0].rank as number < 50 ? <TableViewCol rowData={val.map(i=>{
                                    const {local_id, rank, ...rest} = i
                                    return rest
                                })}/>:
                                <TableViewCol rowData={val.sort((a,b)=>(b.rank as number-(a.rank as number))).map(i=>{
                                    const {local_id, rank, ...rest} = i
                                    return rest
                                })}/>}
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};
