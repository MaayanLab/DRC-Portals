'use client'
import React, { useState, useEffect, useRef } from 'react';

 
import '@xyflow/react/dist/style.css';
// import './xy-theme.css'
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Card, CardHeader, Grid, IconButton,  Typography } from '@mui/material';
import { mdiFileDocument, mdiHeadQuestionOutline, mdiHumanMaleBoard, mdiOpenInApp, mdiRobotOutline, mdiTextBoxCheckOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Loading } from '../concierge/[input]/loadingComponent';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import Link from 'next/link';
import { ExpandMore } from '@mui/icons-material';


const Markdown = (props: {children: string | null | undefined}) =>
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: (props: {[key:string]: any}) => <Typography sx={{mt: 2, mb: 2}} variant="h1">{props.children}</Typography>,
      h2: (props: {[key:string]: any}) => props.id === 'footnote-label' ? <Typography sx={{mt: 2, mb: 2}} variant="h3">References</Typography> : <h2 {...props} />,
      ol: (props: {[key:string]: any}) => <ol style={{listStyle: 'decimal'}}>{props.children}</ol>,
      ul: (props: {[key:string]: any}) => <ul style={{listStyle: 'square'}}>{props.children}</ul>,
      a: (props: {[key:string]: any}) => props.className === 'data-footnote-backref' ? null: <Link href={props.href} {...props}>{props.children} </Link>,
      p: (props: {[key:string]: any}) => <Typography variant="body1" mb={2} mt={2}>{props.children}</Typography>,
    }}
  >{props.children}</ReactMarkdown>

const methods: {[key: string]: {label: string, icon: string}} = {
  DeepDive: {
    label: "DeepDive Summary",
    icon: mdiTextBoxCheckOutline
  },
  DeepDiveAgent: {
    label: "DeepDive with RAG Agent",
    icon: mdiRobotOutline
  },
  DeepDiveWithReviewer: {
    label: "Summarize with Review Process",
    icon: mdiHumanMaleBoard
  },
  DeepDiveHypothesis: {
    label: "Hypothesize Disease Connections",
    icon: mdiHeadQuestionOutline
  },
}
interface RunnableType  {
  result: {[key: string]: any}
}

interface RunnableResult  {
  result: {
    data?: {
      output?: {
        output?: {
          value: string
        },
        error?: {
          value: string
        }
      }
    }
  }
}
export const RenderRunnables = (props: {search: string[], setTaskId: Function, getAbortController: Function}) => {
  const [deepDiveOptions, setDeepDiveOptions] = useState<RunnableType[]>([])
  const [loading, setLoading] = useState(false)
  const [openOptions, setOpenOptions] = useState(true)
  const [openRunnable, setOpenRunnable] = useState(true)
  const [openArticles, setOpenArticles] = useState(true)

  const deepdive_simple = props.search.length === 1

  useEffect(()=>{
    const fetchRunnables = async () => {
      setLoading(true)
      try {
        const controller = props.getAbortController()
        const res = await fetch(`/data/explorer/api`, {
              method: 'POST',
              body: JSON.stringify({
                methods: 'getRunnables,getArticles,getApplicableRunnables',
                payload: {
                  batch: 1,
                  input: JSON.stringify({"0":{"search":props.search.join(" ")},"1":{"search":props.search.join(" ")},"2":{"search":props.search.join(" ")}})
                },
                signal: controller.signal
              }),
          })
          if (res.status === 200) {
            setDeepDiveOptions(await res.json())
          }
          setLoading(false)
      } catch (error) {
          console.log(error)
      }
      
    }
    setDeepDiveOptions([])
    console.log(props.search)
    if (props.search.length > 0) fetchRunnables()

  }, [props.search])

  const runTask = async (method:string, input: string) => {
    const payload = {
      '0': {
        method,
        input: {input}
      }
    }
    const controller = props.getAbortController()
    const res = await fetch(`/data/explorer/api`, {
          method: 'POST',
          body: JSON.stringify({
            methods: 'runRunnable',
            payload: payload,
            signal: controller.signal
          }),
      })
    if (res.status === 200) {
      const results = await res.json()
      const taskIds = results.map((i:{result: {data: string}})=>i['result']['data'])
      props.setTaskId(taskIds[0])
    }
  }

  if (deepDiveOptions.length === 0 && !loading) return null
  if (loading) {
    return <Loading />
  }
  const [r, art, a] = deepDiveOptions
  const applicableRunnables = deepdive_simple ? a.result.data: a.result.data.filter((i: {[key:string]: any})=>i.method !== "DeepDive" && i.method !== 'DeepDiveHypothesis')
  const runnables = r.result.data.items.filter((i: {[key:string]: any})=>i.output!==null)
  const articles = art.result.data.items.filter((i: {[key:string]: any})=>i.message!==null)
  return (
    <Grid container spacing={1} justifyContent={"center"}>
      {/* <Grid item xs={12} sx={{marginBottom: 2}}>
        <Typography variant={"h4"}>Summarize {props.search}</Typography>
      </Grid> */}
      {applicableRunnables.length > 0 &&
        <Accordion elevation={0} sx={{ backgroundColor: "transparent", width: "100%", }} expanded={openOptions} onChange={()=>setOpenOptions(!openOptions)}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component="span" variant='h4'>
              Get Report for {props.search.join(" & ")} using autoRix
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {applicableRunnables.map((i: {[key:string]: any})=>
                  <Grid item xs={12} md={12/applicableRunnables.length} key={i.method}>
                    <Button 
                      sx={{width: "100%"}} 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<Icon path={methods[i.method].icon} size={1}/>}
                      onClick={()=>{
                        runTask(i.method, props.search.join(" "))
                      }}
                      >
                      {methods[i.method].label}
                    </Button>
                  </Grid>
                )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      }
      {/* {(articles.length > 0) &&
        <Accordion elevation={0} sx={{ backgroundColor: "transparent", width: "100%", }} expanded={openArticles} onChange={()=>setOpenArticles(!openArticles)}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component="span" variant='h4'>
              Available Articles for {props.search.join(" & ")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {articles.map((i: {[key:string]: any})=>
                  <Grid item xs={12} md={4} key={i.method}>
                    <Button 
                      sx={{width: "100%"}} 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<Icon path={mdiFileDocument} size={1}/>}
                      onClick={()=>props.setTaskId(i.output.runnable_id)}
                    >
                      {i.message.content.split("\n\n")[0].replace("# ", "")}
                    </Button>
                  </Grid>
                )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      } */}
      {(runnables.length > 0) &&
        <Accordion elevation={0} sx={{ backgroundColor: "transparent", width: "100%", }} expanded={openRunnable} onChange={()=>setOpenRunnable(!openRunnable)}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component="span" variant='h4'>
              Articles for {props.search.join(' and ')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {runnables.map((i: {[key:string]: any})=>
                  <Grid item xs={12} md={6} key={i.method}>
                    <Card>
                      <CardHeader
                        avatar={
                          <Avatar>
                            <Icon path={mdiFileDocument} size={1}/>
                          </Avatar>
                        }
                        action={
                          <IconButton aria-label="submit" onClick={()=>props.setTaskId(i.output.runnable_id)}>
                            <Icon path={mdiOpenInApp} size={1}/>
                          </IconButton>
                        }
                        title={i.output.value.split("\n\n")[0].replace("# ", "")}
                        subheader={`Created: ${i.output.timestamp.toLocaleString()} using ${methods[i.method].label}`}
                      />
                    </Card>
                    {/* <Button 
                      sx={{width: "100%"}} 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<Icon path={mdiFileDocument} size={1}/>}
                      onClick={()=>props.setTaskId(i.output.runnable_id)}
                    >
                      {i.output.value.split("\n\n")[0].replace("# ", "")}
                    </Button> */}
                  </Grid>
                )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      }
    </Grid>
  ) 
}

export const RenderDeepDive = (props: {taskId: string, getAbortController:Function}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const intervalId = useRef<any | null>(null)
  const [deepDiveResults, setDeepDiveResults] = useState<null | RunnableResult[]>(null)
  const runRunnable = async () => {
    const controller = props.getAbortController()
    const res = await fetch(`/data/explorer/api`, {
        method: 'POST',
        body: JSON.stringify({
          methods: 'getRunnable',
          payload: {
            batch: 1,
            input: JSON.stringify({"0": {runnable_id: props.taskId}})
          },
          signal: controller.signal
        }),
    })
    if (res.status === 200) {
        const results = await res.json()
        setDeepDiveResults(results)
    } 
  }
  useEffect(() => {
    setLoading(true)
    intervalId.current = setInterval(runRunnable, 5000);
    return () => clearTimeout(intervalId.current);
  }, [props.taskId]);

  useEffect(() => {
    // if (deepDiveResults !== null) console.log(deepDiveResults[0].result?.data?.output?.output)
    if (deepDiveResults !== null && deepDiveResults[0].result?.data?.output?.output) {
      setLoading(false)
      clearInterval(intervalId.current)
      intervalId.current = null;
    }
    if (deepDiveResults !== null && deepDiveResults[0].result?.data?.output?.error) {
      setLoading(false)
      clearInterval(intervalId.current)
      intervalId.current = null;
      setError(deepDiveResults[0].result?.data?.output?.error.value)
    }
  }, [deepDiveResults])
  if (loading) return <Loading/>
  else if (deepDiveResults === null) return null
  else if (deepDiveResults[0].result?.data?.output?.output) {
    const val = deepDiveResults[0].result.data.output.output.value
    const md = val.startsWith("# ") ? val: "# "+val
    return <Markdown>{md}</Markdown>
    // return <MarkdownStatic markdown={deepDiveResults[0].result.data.output.output.value}
    //   overrides={{
    //         a: {
    //             component:  ({children, ...props}: {children: ReactNode})=><Link href={""} {...props} color="secondary">{children}</Link>
    //         },
    //   }}
    // />
  } else if (error !== '') {
    const md = error
    return <Markdown>{md}</Markdown>
    // return <MarkdownStatic markdown={deepDiveResults[0].result.data.output.output.value}
    //   overrides={{
    //         a: {
    //             component:  ({children, ...props}: {children: ReactNode})=><Link href={""} {...props} color="secondary">{children}</Link>
    //         },
    //   }}
    // />
  }
   else {
    console.log("here")
    return null
  }
  
}