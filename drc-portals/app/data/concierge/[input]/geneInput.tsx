'use client'
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
// import Select from 'react-select';
import Icon from '@mdi/react';
import Link from '@/utils/link';

// import gene components
import ReverseSearchL1000 from '@/components/Chat/Gene/reverseSearchL1000'
import ImpcPhenotypes from '@/components/Chat/Gene/impcPhenotypes'
import ScoredGTExTissue from '@/components/Chat/Gene/scoredGTExTissue'
import ScoredARCHS4Tissue from '@/components/Chat/Gene/scoredARCHS4Tissue'
import RegElementSetInfo from '@/components/Chat/Gene/RegElementSetInfo'
import KidsFirstTumorExpr from '@/components/Chat/Gene/KidsFirstTumorExpr'
import DeepDiveGeneSummary from '@/components/Chat/Gene/DeepDiveGeneSummary';
import { Grid, Typography, Stack, Autocomplete, TextField, Button, Card, CardHeader, CardContent, IconButton, Collapse, CircularProgress } from '@mui/material';
import { mdiPagePrevious } from '@mdi/js';

import { submit } from './submit';
import { ChatResponse } from './submit';

import ReactMarkdown from 'react-markdown'
import {  PRenderer } from '@/components/misc/ReactMarkdownRenderers'
import remarkGfm from 'remark-gfm';
import { Loading } from './loadingComponent';

let processMapper: Record<string, any> = {
    'GtexGeneExpression': ScoredGTExTissue,
    'ARCHS4GeneExpression': ScoredARCHS4Tissue,
    'ReverseSearchL1000': ReverseSearchL1000,
    'ImpcPhenotypes': ImpcPhenotypes,
    'RegElementSetInfo': RegElementSetInfo,
    'KidsFirstTumorExpr': KidsFirstTumorExpr,
    "DeepDiveGeneSummary": DeepDiveGeneSummary
}
const templates = [
    {
        query: "Overview",
        text: "Gene Overview",
        template: (gene: string) => `Give me information on ${gene} based on all of your available tools.`
    },
    {
        query: "TissueExpression",
        text: "Tissue Expression",
        template: (gene: string) => `Which tissues highly expresses ${gene}?`
    },
    {
        query: "DrugPerturbation",
        text: "Drug Regulation",
        template: (gene: string) => `Which drugs significanty up or down regulate ${gene}?`
    },
    {
        query: "Mouse Phenotype",
        text: "Associated Mouse Phenotypes",
        template: (gene: string) => `What mouse phenotypes are associated with ${gene}?`
    },
    {
        query: "Pediatric Tumors",
        text: "Pediatric Tumor Expression",
        template: (gene: string) => `In which pediatric tumor is ${gene} expressed?`
    },
    {
        query: "Regulatory Elements",
        text: "Regulatory Elements",
        template: (gene: string) => `Which regulatory elements is associated with ${gene}?`
    },
    {
        query: "Literature Summary",
        text: "Literature Summary",
        template: (gene: string) => `Give me an overview of ${gene} based on PubMed articles.`
    },
]

const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

export default function GeneInput({input}: {input: {
    inputType: string,
    text: string,
    icon: string
}}) {
    const [geneTerm, setGeneTerm] = React.useState('')
    const [inputTerm, setInputTerm] = React.useState('')
    const [submitted, setSubmitted] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [prevResponseId, setPrevResponseId] = React.useState<string | null>(null)
    const [response, setResponse] = React.useState<null | ChatResponse>(null)
    const { data, error, isLoading } = useSWRImmutable<string[]>(() => {
        if (inputTerm.length < 2) return null
        // if (processName === 'ReverseSearchL1000') return `/chat/l1000sigs/autocomplete?q=${encodeURIComponent(geneTerm)}`
        return `https://maayanlab.cloud/Harmonizome/api/1.0/suggest?t=gene&q=${encodeURIComponent(inputTerm)}`
    }, fetcher)
    const items = React.useMemo(() => data ? levenSort(data, inputTerm).slice(0, 10).map((elt: string) => { return { value: elt, label: elt } }) : [], [data, inputTerm])

    const submit_query = async (content: string) => {
        setSubmitted(true)
        setLoading(true)
        const response:ChatResponse = await (submit({
            content,
            prevResponseId,
            inputType: 'GeneInput'
        }))
        setLoading(false)
        setPrevResponseId(response.id)
        setResponse(response)
    }

    return (
        <Card elevation={0} sx={{borderWidth: 1, borderColor: "secondary.main", background: "transparent"}}>
            <CardHeader
                sx={{color: 'secondary.main', '.MuiCardHeader-action': {alignSelf: "center"}}}
                avatar={
                    <Icon path={input.icon} size={3}/>
                }
                title={<Typography variant="h4">{input.text}</Typography>}
                subheader={
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                        <Typography variant="body1">
                            Ok, tell me the name of the gene:
                        </Typography>
                        <Autocomplete
                            sx={{width: 300}}
                            className='w-auto'
                            options={items}
                            value={geneTerm}
                            color='secondary'
                            // onInputChange={handleInputChange}
                            loading={isLoading}
                            // filterOption={null}
                            noOptionsText={inputTerm.length ? 'No matching genes': 'Enter Gene Name'}
                            // placeholder={'Enter gene symbol...'}
                            onChange={(e: any, newValue: any) => {
                                    if (newValue) setGeneTerm(newValue.value)
                                    else setGeneTerm('')
                                    setResponse(null)
                                    setSubmitted(false)
                                }
                            }
                            inputValue={inputTerm}
                            onInputChange={(event, newInputValue) => {
                                setInputTerm(newInputValue);
                            }}
                            renderInput={(params) => <TextField placeholder='Enter gene name' {...params} label="Gene" />}
                        />
                    </Stack>
                }
                action={
                    <Link href="/data/concierge"><IconButton color="secondary"><Icon path={mdiPagePrevious} size={1}/></IconButton></Link>
                }
                
            />
            <CardContent>
                <Collapse in={geneTerm !== '' && !submitted}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography variant="body1">Ok what do you want to know about {geneTerm}?</Typography>
                        </Grid>
                        {templates.map(template=>(
                            <Grid item xs={12} md={3} key={template.query}>
                                <Button variant="outlined" color="secondary"
                                    sx={{width: "100%"}}
                                    onClick={()=>{
                                        submit_query(template.template(geneTerm))
                                        // submit({
                                        // role: "user",
                                        // content: template.template(geneTerm),
                                        // output: null,
                                        // options: null,
                                        // args: null,
                                        // })
                                    }}
                                ><Typography variant={"body1"}>{template.text}</Typography></Button>
                            </Grid>
                        ))}
                    </Grid>
                </Collapse>
                {loading &&  <Loading/>}
                <Collapse in={!loading && response!==null}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant='h3'>{geneTerm}</Typography>
                                <ReactMarkdown 
                                    skipHtml
                                    remarkPlugins={[remarkGfm]}
                                    components={{ 
                                        p: PRenderer,
                                    }}
                                    >
                                        {response?.content}
                                </ReactMarkdown>
                            </Grid>
                            {response?.args &&
                                Object.entries(response?.args).map(([key, {process, methods, ...args}])=>(
                                    <Grid item xs={12} key={process}>
                                        {React.createElement(processMapper[process], args)}
                                    </Grid>
                                ))
                            }
                            {}
                        </Grid>
                </Collapse>
            </CardContent>
        </Card>
    )
}