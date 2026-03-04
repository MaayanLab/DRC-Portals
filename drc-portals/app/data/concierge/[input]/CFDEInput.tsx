
import React, { useEffect, useState } from 'react'
// import Select from 'react-select';


// import gene components
import { Grid, Typography, Stack, Autocomplete, TextField, Button, Card, CardHeader, CardContent, IconButton, Collapse, CircularProgress } from '@mui/material';
import Icon from '@mdi/react';
import Link from '@/utils/link';
import { mdiPagePrevious } from '@mdi/js';
import { ChatResponse, submit } from './submit';
import { Loading } from './loadingComponent';
import ReactMarkdown from 'react-markdown'
import {  PRenderer, LinkRenderer } from '@/components/misc/ReactMarkdownRenderers'
import remarkGfm from 'remark-gfm';


const Other = ({submit, back}: {submit: Function, back:Function}) => {
    const questions = [
        {
            query: "Overview",
            text: "CFDE Overview",
            template: () => `What is the CFDE?`
        },
        {
            query: "Publications",
            text: "CFDE Publications",
            template: () => "What are the latest CFDE publications?"
        },
        {
            query: "Outreach Activities",
            text: "CFDE Training and Outreach",
            template: () => "What are the upcoming outreach activities?"
        }
    ]
    return (
            <Grid sx={{marginLeft:-5}} container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="body1">Ok, tell me what you want to know</Typography>
                </Grid>
                {questions.map(q=>(
                    <Grid item xs={12} md={4} key={q.query}>
                        <Button sx={{width: "100%"}} variant="outlined" color="secondary" onClick={()=>submit(q.template())}>
                            <Typography variant="body1">
                                {q.text}
                            </Typography>
                        </Button>
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <Button sx={{width: "100%"}} variant="outlined" color="secondary" onClick={()=>back()}>
                        <Typography variant="body1">Go Back</Typography>
                    </Button>
                </Grid>
            </Grid>
    )
}

const Centers = ({submit, back}: {submit: Function, back:Function}) => {
    const [term, setTerm] = useState('')
    const [inputTerm, setInputTerm] = useState('')
    const [items, setItems] = useState([])
    useEffect(()=>{
            const resolve = async () => {
                const res = await fetch('/chat/centerInfo')
                const items = await res.json()
                setItems(items.centers.map((i:any)=>i.label).filter((i:string)=>i!=="centers"))
            }
            resolve()
        }, [])
    return (
        <Stack direction="row" alignItems={"center"} spacing={1}>
            <Typography variant="body1">Ok, tell me which CFDE center:</Typography>
            <Autocomplete
                sx={{width: 300}}
                className='w-auto'
                options={items}
                value={term}
                color='secondary'
                noOptionsText={inputTerm.length ? 'No matching centers': 'Enter Center Name'}
                // placeholder={'Enter glycan symbol...'}
                onChange={(e: any, newValue: any) => {
                        setTerm(newValue)
                        if (newValue) {
                            submit(`Can you provide information about the ${newValue}?`)
                        }
                    }
                }
                inputValue={inputTerm}
                onInputChange={(event, newInputValue) => {
                    setInputTerm(newInputValue);
                }}
                renderInput={(params) => <TextField placeholder='Enter center name' {...params} label="Center" />}
            />
            <Button sx={{width: "100%"}} variant="outlined" color="secondary" onClick={()=>back()}>
                <Typography variant="body1">Go Back</Typography>
            </Button>
        </Stack>
    )
}

const DCCs = ({submit, back}: {submit: Function, back:Function}) => {
    const [selected, setSelected] = useState<string[]>([])
    const [items, setItems] = useState([])
    const templates = [
        {
            query: "DCC Information",
            template: `Tell me about ${selected.join(", ")}`
        },
        {
            query: "Publication",
            template: `Give me all publications of ${selected.join(", ")}`
        },
        {
            query: "Training and Outreach",
            template: `Give me traing and outreach activities of ${selected.join(", ")}`
        }
    ]
    useEffect(()=>{
            const resolve = async () => {
                const res = await fetch('/chat/dccInfo')
                const items = await res.json()
                setItems(items.dccs.map((i:any)=>i.short_label))
            }
            resolve()
        }, [])
    return (
        <Grid container spacing={1} alignItems={"center"}>
            <Grid item xs={12}>
                <Typography variant="body1">Ok, tell me which DCC you are interested in, if you want to know about how to integrate data from different DCCs, please select more than one DCC</Typography>
            </Grid>
            {items.map(dcc=>(
                <Grid item xs={12} md={3} key={dcc}>
                    <Button variant={selected.indexOf(dcc)>-1 ? "contained": "outlined"} color="secondary"
                        sx={{width: "100%"}}
                        onClick={()=>{
                            if (selected.indexOf(dcc)>-1) setSelected(selected.filter(i=>i!==dcc))
                            else setSelected([...selected, dcc])
                        }}
                    ><Typography variant={"body1"}>{dcc}</Typography></Button>
                </Grid>
            ))}
            {selected.length > 0 && templates.map(template=>(
                <Grid item xs={12} md={4} key={template.query}>
                    <Button sx={{width: "100%"}} variant='outlined' color='secondary' onClick={()=>submit(template.template)}>
                        <Typography variant={"body1"}>{template.query}</Typography>
                    </Button>
                </Grid>
            ))}
            {selected.length > 1 &&
                <Grid item xs={12}>
                    <Button sx={{width: "100%"}} variant='outlined' color='secondary' onClick={()=>submit(`How do you integrate datasets from ${selected.join(", ")}`)}>
                        <Typography variant={"body1"}>Data Integration</Typography>
                    </Button>
                </Grid>
            }
            <Grid item xs={12}>
                <Button sx={{width: "100%"}} variant="outlined" color="secondary" onClick={()=>back()}>
                    <Typography variant="body1">Go Back</Typography>
                </Button>
            </Grid>
        </Grid>
    )
}

const query_templates: {[key:string]: Function} = {
    "DCCs": (props:any)=><DCCs {...props}/>, 
    "Centers": (props:any)=><Centers {...props}/>, 
    "Other CFDE Information": (props:any)=><Other {...props}/>,
}
export default function CFDEInput({input}: {input: {
    inputType: string,
    text: string,
    icon: string
}}) {
    const [query, setQuery] = useState<string>('')
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
                    <Typography variant="body1">
                        Ok, what do you want to know about the CFDE?
                    </Typography>
                }
                action={
                    <Link href="/data/concierge"><IconButton color="secondary"><Icon path={mdiPagePrevious} size={1}/></IconButton></Link>
                }
                
            />
            <CardContent>
                <Collapse in={query === ''}>
                    <Grid container spacing={1}>
                        {Object.keys(query_templates).map(template_name=>(
                            <Grid item xs={12} md={3} key={template_name}>
                                <Button variant="outlined" color="secondary"
                                    sx={{width: "100%"}}
                                    onClick={()=>{
                                        setQuery(template_name)
                                        // submit({
                                        // role: "user",
                                        // content: template.template(geneTerm),
                                        // output: null,
                                        // options: null,
                                        // args: null,
                                        // })
                                    }}
                                ><Typography variant={"body1"}>{template_name}</Typography></Button>
                            </Grid>
                        ))}
                    </Grid>
                </Collapse>
                {(query !== '' && !loading && response === null) && 
                <Stack spacing={2}>
                    {query_templates[query]({submit: submit_query, back: ()=>setQuery('')})}
                </Stack>
                }
                {loading &&  <Loading/>}
                <Collapse in={!loading && response !== null}>
                    <Stack spacing={2}>
                        <ReactMarkdown 
                            skipHtml
                            remarkPlugins={[remarkGfm]}
                            components={{ 
                                p: PRenderer,
                                a: LinkRenderer,
                            }}
                            >
                                {response?.content}
                        </ReactMarkdown>
                        <Button variant='outlined' color="secondary" onClick={()=>setResponse(null)}>
                            Go Back
                        </Button> 
                    </Stack>
                </Collapse>
            </CardContent>
        </Card>
    )
}