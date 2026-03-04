
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
import Select from 'react-select';


// import gene components
import ReverseSearchL1000 from '../Gene/reverseSearchL1000'
import ImpcPhenotypes from '../Gene/impcPhenotypes'
import ScoredGTExTissue from '../Gene/scoredGTExTissue'
import ScoredARCHS4Tissue from '../Gene/scoredARCHS4Tissue'
import RegElementSetInfo from '../Gene/RegElementSetInfo'
import KidsFirstTumorExpr from '../Gene/KidsFirstTumorExpr'
import DeepDiveGeneSummary from '../Gene/DeepDiveGeneSummary';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';

let processMapper: Record<string, any> = {
    'GtexGeneExpression': ScoredGTExTissue,
    'ARCHS4GeneExpression': ScoredARCHS4Tissue,
    'ReverseSearchL1000': ReverseSearchL1000,
    'ImpcPhenotypes': ImpcPhenotypes,
    'RegElementSetInfo': RegElementSetInfo,
    'KidsFirstTumorExpr': KidsFirstTumorExpr,
    "DeepDiveGeneSummary": DeepDiveGeneSummary
}

const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

export default function GeneInput(props: any[]) {
    let genesymbol = ''
    const components = []
    for (const arg of Object.values(props)) {
        const processName = arg.process
        genesymbol = arg.geneSymbol
        const component = processMapper[processName || '']
        components.push({...arg, component})
    }
    return (
        <>
            <Stack>
                <Typography variant={"h2"} color="white">{genesymbol}</Typography>
                {components.map(({component, ...args})=>React.createElement(component, { ...args, geneSymbol: genesymbol }))}
            </Stack>
        </>
    )
}