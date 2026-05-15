import React from 'react'
import levenSort from '@/components/Chat/utils/leven-sort'
import GlycanTouCanIds from '@/components/Chat/utils/GlyTouCanIds.json'
import Message from '@/components/Chat/message';
// import glycan components
import GlyGenbyGlyTouCan from '@/components/Chat/Glycan/GlyGenbyGlyTouCan'
import { Grid, Stack, Autocomplete, TextField, Button, Card, CardHeader, CardContent, IconButton, Collapse, CircularProgress, Typography } from '@mui/material';
import { ChatResponse } from './submit';
import { submit } from './submit';
import Icon from '@mdi/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'
import {  PRenderer } from '@/components/misc/ReactMarkdownRenderers'
import remarkGfm from 'remark-gfm';
import { mdiPagePrevious } from '@mdi/js';
import { Loading } from './loadingComponent';

let processMapper: Record<string, any> = {
    'GlyGenbyGlyTouCan': GlyGenbyGlyTouCan
}

const templates = [
    {
        query: "GlycanInfo",
        text: "Glycan Information",
        template: (glycan: string) => `Can you provide information about the glycan ${glycan}?`
    },
]

export default function GlycanInput({input}: {input: {
    inputType: string,
    text: string,
    icon: string
}}) {
    const [glycanTerm, setGlycanTerm] = React.useState('')
    const [inputTerm, setInputTerm] = React.useState('')
    const [submitted, setSubmitted] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [prevResponseId, setPrevResponseId] = React.useState<string | null>(null)
    const [response, setResponse] = React.useState<null | ChatResponse>(null)
    const items = React.useMemo(() => GlycanTouCanIds ? levenSort(GlycanTouCanIds, glycanTerm).slice(0, 10).map((elt: string) => { return { value: elt, label: elt } }) : [], [glycanTerm])
    const submit_query = async (content: string) => {
        setSubmitted(true)
        setLoading(true)
        const response:ChatResponse = await (submit({
            content,
            prevResponseId,
            inputType: 'GlycanInput'
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
                                Ok, tell me the name of the glycan:
                            </Typography>
                            <Autocomplete
                                sx={{width: 300}}
                                className='w-auto'
                                options={items}
                                value={glycanTerm}
                                color='secondary'
                                // onInputChange={handleInputChange}
                                // filterOption={null}
                                noOptionsText={inputTerm.length ? 'No matching glycans': 'Enter Glycan Name'}
                                // placeholder={'Enter glycan symbol...'}
                                onChange={(e: any, newValue: any) => {
                                        // setGlycanTerm(newValue?.value || '')
                                        // if (newValue.value) {
                                        //     submit_query(`Can you provide information about the glycan ${newValue.value}?`)
                                        // }
                                        if (newValue) setGlycanTerm(newValue.value)
                                        else setGlycanTerm('')
                                        setResponse(null)
                                        setSubmitted(false)
                                    }
                                }
                                inputValue={inputTerm}
                                onInputChange={(event, newInputValue) => {
                                    setInputTerm(newInputValue);
                                }}
                                renderInput={(params) => <TextField placeholder='Enter glycan name' {...params} label="Glycan" />}
                            />
                        </Stack>
                    }
                    action={
                        <Link href="/data/concierge"><IconButton color="secondary"><Icon path={mdiPagePrevious} size={1}/></IconButton></Link>
                    }
                    
                />
                <CardContent>
                    <Collapse in={glycanTerm !== '' && !submitted}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant="body1">Ok what do you want to know about {glycanTerm}?</Typography>
                            </Grid>
                            {templates.map(template=>(
                                <Grid item xs={12} md={3} key={template.query}>
                                    <Button variant="outlined" color="secondary"
                                        sx={{width: "100%"}}
                                        onClick={()=>{
                                            submit_query(template.template(glycanTerm))
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
                    {loading && <Loading/>}
                    <Collapse in={!loading && response!==null}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant='h3'>{glycanTerm}</Typography>
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