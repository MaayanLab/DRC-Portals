import React from 'react'

// import phenotype components
import PhenotypeSmallMolecules from '@/components/Chat/Phenotype/phenotypeSmallMolecules';
import { Grid, Typography, Stack, TextField, Button, Card, CardHeader, CardContent, IconButton, Collapse, CircularProgress } from '@mui/material';
import { mdiPagePrevious, mdiTimerSand } from '@mdi/js';

import { submit } from './submit';
import { ChatResponse } from './submit';

import ReactMarkdown from 'react-markdown'
import {  PRenderer } from '@/components/misc/ReactMarkdownRenderers'
import remarkGfm from 'remark-gfm';
import Icon from '@mdi/react';
import Link from '@/utils/link';
import { Loading } from './loadingComponent';


let processMapper: Record<string, any> = {
    'PhenotypeSmallMolecules': PhenotypeSmallMolecules
}

const templates = [
    {
        query: "DrugInduction",
        text: "Induction with Small Molecules",
        template: (phenotype: string) => `Which small molecules induces ${phenotype}?`
    },
]

export default function PhenotypeInput({input}: {input: {
    inputType: string,
    text: string,
    icon: string
}}) {
    const [phenotypeTerm, setPhenotypeTerm] = React.useState('')
    const [inputTerm, setInputTerm] = React.useState('')
    const [submitted, setSubmitted] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [prevResponseId, setPrevResponseId] = React.useState<string | null>(null)
    const [response, setResponse] = React.useState<null | ChatResponse>(null)

    const submit_query = async (content: string) => {
        setSubmitted(true)
        setLoading(true)
        const response:ChatResponse = await (submit({
            content,
            prevResponseId,
            inputType: 'PhenotypeInput'
        }))
        setLoading(false)
        setPrevResponseId(response.id)
        setResponse(response)
        console.log(response)
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
                            Ok, tell me the phenotype:
                        </Typography>
                        <TextField value={inputTerm} placeholder='Enter a term (e.g. autophagy)' onChange={(e)=>setInputTerm(e.currentTarget.value)}/>
                        <Button variant="contained" color="secondary" onClick={()=>{
                            setPhenotypeTerm(inputTerm)
                        }}>Submit</Button>
                    </Stack>
                }
                action={
                    <Link href="/data/concierge"><IconButton color="secondary"><Icon path={mdiPagePrevious} size={1}/></IconButton></Link>
                }
                
            />
            <CardContent>
                <Collapse in={phenotypeTerm !== '' && !submitted}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography variant="body1">Ok what do you want to know about {phenotypeTerm}?</Typography>
                        </Grid>
                        {templates.map(template=>(
                            <Grid item xs={12} md={3} key={template.query}>
                                <Button variant="outlined" color="secondary"
                                    onClick={()=>{
                                        submit_query(template.template(phenotypeTerm))
                                    }}
                                ><Typography variant={"body1"}>{template.text}</Typography></Button>
                            </Grid>
                        ))}
                    </Grid>
                </Collapse>
                
                {loading && <Loading/>}
                <Collapse in={!loading && response!==null}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant='h3'>{phenotypeTerm}</Typography>
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