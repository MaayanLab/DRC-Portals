import useSWR from 'swr';
import Link from '@/utils/link';
import Image from '@/utils/image';
import { Button } from '@mui/material';

const METADATA_API = "https://maayanlab.cloud/sigcom-lincs/metadata-api/"

const fetchSigComLincsId = async (geneset: string[], genesetDown: string[], useUpDown: boolean) => {
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
    const geneset = props.genes
    const useUpDown = props.upDownGeneset
    const genesetDown = props.genesDown
    const { data, error, isLoading } = useSWR([geneset, genesetDown, useUpDown], () => fetchSigComLincsId(geneset, genesetDown, useUpDown));

    if (error) {
        return <div>An error when submitting your gene set.</div>;

    } else if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='text-center'>
            <Link href={data || ''} target='_blank'>
                <Button>
                    <div className='text-slate-100 flex-row'>Open in<Image className='rounded-md m-0' alt='SigCom Lincs' width={50} height={50} src='/img/SigComLincs.png' /></div> 
                </Button>
            </Link>
        </div>
    );
};
