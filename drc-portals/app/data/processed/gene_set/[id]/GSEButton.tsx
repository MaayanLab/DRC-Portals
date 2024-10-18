'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import GSEIcon from '@/public/img/icons/CFDE-GSE.png'
import CardButton from "@/app/data/processed/CardButton"
import * as React from 'react';

export default function GSEButton(props: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode,
    body: {
        term: string,
        genes?: string[],
        description: string,
    }
}>) {
    return <CardButton
        icon={<Image src={GSEIcon} alt="CFDE-GSE" height={64} />}
        title={props.title}
        description={props.description}
    >
        <Button
            color="secondary"
            size="small"
            disabled={!props.body.genes}
            onClick={async () => {
                if (!props.body.genes) return
                const formData = new FormData()
                formData.append('list', props.body.genes.join('\n'))
                formData.append('description', `DRC Portal ${props.body.term}`)
                const req = await fetch('https://maayanlab.cloud/Enrichr/addList', {
                  headers: {
                    'Accept': 'application/json',
                  },
                  method: 'POST',
                  body: formData,
                })
                const res = await req.json()
                if (!res.shortId) {
                    console.error('Failed to Register Gene Set')
                    return
                }
                const searchParams = new URLSearchParams()
                searchParams.append('q', JSON.stringify({
                  "userListId": res.userListId.toString(),
                  "min_lib": 1,
                  "libraries":[
                    {"name":"LINCS_L1000_Chem_Pert_Consensus_Sigs","limit":5},
                    {"name":"HuBMAP_ASCTplusB_augmented_2022","limit":5},
                    {"name":"MoTrPAC_2023","limit":5},
                    {"name":"Metabolomics_Workbench_Metabolites_2022","limit":5},
                    {"name":"LINCS_L1000_CRISPR_KO_Consensus_Sigs","limit":5},
                    {"name":"GTEx_Tissues_V8_2023","limit":5},
                    {"name":"GlyGen_Glycosylated_Proteins_2022","limit":5},
                    {"name":"IDG_Drug_Targets_2022","limit":5},
                    {"name":"KOMP2_Mouse_Phenotypes_2022","limit":5},
                    {"name":"GTEx_Aging_Signatures_2021","limit":5}
                  ],
                  "gene_limit":200,
                  "search":true,
                }))
                window.open(`https://gse.cfde.cloud/?${searchParams.toString()}`, '_blank')
            }}
        >Submit</Button>
    </CardButton>
}