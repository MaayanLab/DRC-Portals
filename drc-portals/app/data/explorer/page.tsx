'use client'
import React, { useState, useEffect, useCallback, useRef, ReactNode, RefObject } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type BuiltInEdge,
  type OnConnect,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
// import './xy-theme.css'
import CustomNode from './custom';
import { Avatar, Card, CardHeader, Chip, Container, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import Gene from './gene';
import { blue, green, lime, orange, purple, red } from '@mui/material/colors';
import { mdiDna, mdiEye, mdiEyedropper, mdiFileDocument, mdiFlask, mdiHumanMaleHeightVariant, mdiListBox, mdiOpenInApp, mdiPill, mdiTimerSand, mdiVirus } from '@mdi/js';
import Icon from '@mdi/react';
import Phenotype from './phenotype';
import SmallMolecule from './drug';
import Anatomy from './anatomy';
import Assay from './assay';
import GeneSet from './gene_set';
import { methods, Search } from './search';


 
const nodeTypes = {
  gene_set: GeneSet,
  geneNode: Gene,
  phenotype: Phenotype,
  small_molecule: SmallMolecule,
  anatomy: Anatomy,
  assay: Assay
};
 
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const ui_elements: {[key: string]: {color: string, icon: string}} = {
  gene: {
    color: green[100],
    icon: mdiDna
  },
  protein: {
    color: green[100],
    icon: mdiDna
  },
  gene_set: {
    color: purple[100],
    icon: mdiListBox,
  },
  phenotype: {
    color: orange[100],
    icon: mdiHumanMaleHeightVariant,
  },
  anatomy: {
    color: red[100],
    icon: mdiEye,
  },
  assay_type: {
    color: blue[100],
    icon: mdiFlask
  },
  drug: {
    color: lime[100],
    icon: mdiPill
  },
  compound: {
    color: lime[100],
    icon: mdiPill
  },
  metabolite: {
    color: lime[100],
    icon: mdiEyedropper
  },
  "disease or phenotype": {
    color: orange[100],
    icon: mdiHumanMaleHeightVariant,
  },
  disease: {
    color: orange[100],
    icon: mdiVirus,
  }
}

const fetchRunnables = async (search:string[], controller:AbortController) => {
      try {
        const res = await fetch(`/data/explorer/api`, {
              method: 'POST',
              body: JSON.stringify({
                methods: 'getApplicableRunnables,getRunnables,getArticles',
                payload: {
                  batch: 1,
                  input: JSON.stringify({"0":{"search":search.join(" ")},"1":{"search":search.join(" ")},"2":{"search":search.join(" ")}})
                },
                signal: controller.signal
              }),
          })
          if (res.status === 200) {
            return await res.json()
          }
          return []
      } catch (error) {
          console.log(error)
          return []
      }
      
    }

const Explorer = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuiltInEdge>([]);
  const [geneSetPos, setGeneSetPos] = useState(0)
  const [taskId, setTaskId] = useState('')
  const [inputList, setInputList] = useState<{entity: string, label: string, color: string, icon: string, values?: {[key: string]: string[]}}[]>([])
  const [loading, setLoading] = useState(false)
  const [applicables, setApplicables] = useState<{method: string, params: {[key:string]: string}}[]>([])
  const [runnables, setRunnables] = useState<{timestamp: string, method: string, published: boolean, output: {runnable_id: string, value: string}}[]>([])
  const [articles, setArticles] = useState<{timestamp: string, message: {message_id: string, content: string}}[]>([])
  const scrollRef = useRef<null | HTMLDivElement>(null)

  const abortController = useRef(new AbortController());

  const getAbortController = () => {
    const controller = abortController.current;
    if (controller !== undefined) {
      controller.abort("Cancelling request.");
      abortController.current = new AbortController();
    }
    return abortController.current
  };

  useEffect(()=>{
    const get_runnables = async () => {
      setLoading(true)
      setApplicables([])
      const deepDiveOptions = await fetchRunnables(inputList.map(i=>i.label), getAbortController())
      if (deepDiveOptions) {
        const [applicable, runnable, artc ] = deepDiveOptions
        // const runnables = runnable.result.data.items
        setRunnables(runnable.result.data.items)
        if (inputList.length === 1) setApplicables(applicable.result.data)
        else setApplicables(applicable.result.data.filter((i:{method:string})=>i.method !== 'DeepDive'))
        // const articles = artc.result.data.items
      }
      setLoading(false)
    }
    if (inputList.length > 0) get_runnables()
  }, [inputList])

  const update_input = (entity: string, label: string, type:string="add", values:{up?: string[], down?: string[], gene_set?: string[]}={}) => {
    setTaskId('')
    if (type === "add") {
      setInputList(inputList=>{
        const add = inputList.filter(i=>i.entity === entity && i.label === label).length
        if (add === 0) return [...inputList, {entity, label, ...ui_elements[entity], values}]
        else if (label === "user_input") {
          return [...inputList, {entity, label: `${label} ${add}`, ...ui_elements[entity], values}]
        }
        else return inputList
      })
    } else {
      setInputList(inputList=>inputList.filter(i=>(i.entity !== entity || i.label !== label)))
    }
  }
  useEffect(() => {
    setNodes([
      {
        id: 'gene',
        type: 'geneNode',
        data: { label: "Gene/Protein", update_input },
        position: { x: 250, y: 300+geneSetPos },
      },
	    {
        id: 'drug',
        type: 'small_molecule',
        data: { label: "Drugs/Small Molecule", update_input },
        position: { x: -100, y: 0+geneSetPos },
      },
      {
        id: 'gs',
        type: 'gene_set',
        data: { label: "Gene Set/ Pathways/ Modules", update_input, setGeneSetPos },
        position: { x: 600, y: 0 },
      },
      {
        id: 'cell',
        type: 'anatomy',
        data: { label: "Cell/ Tissue/ Organ", update_input },
        position: { x: -200, y: 500+geneSetPos },
      },
      {
        id: 'disease',
        type: 'phenotype',
        data: { label: "Phenotype/ Disease", update_input },
        position: { x: 700, y: 500+geneSetPos },
      },
      {
        id: 'assay',
        type: 'assay',
        data: { label: "Assay", update_input },
        position: { x: 250, y: 700+geneSetPos },
      }
    ]);
 
    setEdges([
      {
        id: 'gene-drug',
        source: 'gene',
        target: 'drug',
        // animated: true,
        sourceHandle: "source-l",
        targetHandle: "target-b",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-gs',
        source: 'gene',
        target: 'gs',
        // animated: true,
        sourceHandle: "source-r",
        targetHandle: "target-b",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-cell',
        source: 'gene',
        target: 'cell',
        // animated: true,
        sourceHandle: "source-l",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-disease',
        source: 'gene',
        target: 'disease',
        // animated: true,
        sourceHandle: "source-r",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-assay',
        source: 'gene',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'drug-gs',
        source: 'drug',
        target: 'gs',
        // animated: true,
        sourceHandle: "source-r",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'drug-cell',
        source: 'drug',
        target: 'cell',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      // {
      //   id: 'drug-disease',
      //   source: 'drug',
      //   target: 'disease',
      //   // animated: true,
      //   sourceHandle: "source-b",
      //   targetHandle: "target-l",
      //   style: { strokeWidth: 10},
      //   type: "default"
      // },
      // {
      //   id: 'gs-cell',
      //   source: 'gs',
      //   target: 'cell',
      //   // animated: true,
      //   sourceHandle: "source-b",
      //   targetHandle: "target-r",
      //   style: { strokeWidth: 10},
      //   type: "default"
      // },
      {
        id: 'gs-disease',
        source: 'gs',
        target: 'disease',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'cell-disease',
        source: 'cell',
        target: 'disease',
        // animated: true,
        sourceHandle: "source-r",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'cell-gs',
        source: 'cell',
        target: 'gs',
        // animated: true,
        sourceHandle: "source-t",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'disease-drug',
        source: 'disease',
        target: 'drug',
        // animated: true,
        sourceHandle: "source-t",
        targetHandle: "target-r",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'cell-assay',
        source: 'cell',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'disease-assay',
        source: 'disease',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-r",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'drug-assay',
        source: 'drug',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gs-assay',
        source: 'gs',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "default"
      },
    ]);
  }, [geneSetPos]);
 
   const onConnect: OnConnect = useCallback(
      (connection) => setEdges((eds) => addEdge(connection, eds)),
      [setEdges],
    );
  
  return (
  <Grid container spacing={1} alignItems='stretch'>
    <Search inputList={inputList} update_input={update_input} applicables={applicables} getAbortController={getAbortController}/>
    {loading && <Grid item><Icon path={mdiTimerSand} style={{animation: "spin 2s linear infinite"}} size={1}/></Grid>}
    {runnables.length > 0 && <Grid item>
      <Chip sx={{borderRadius: 0}} color='secondary' variant="outlined"
        avatar={<Icon style={{backgroundColor: "transparent", color: "#2D5986"}} path={mdiFileDocument} size={1}/>}
        onClick={()=>{
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        label={"View available articles"}
        clickable
      />
    </Grid>}
    <Grid item xs={12}>
      {/* {taskId === '' && 
      <Grid item xs={12}>
          <RenderRunnables search={inputList.map(i=>i.label)} setTaskId={setTaskId} getAbortController={getAbortController}/>
        </Grid>
      } */}
      <Container maxWidth="xl" sx={{height: 700, position: "relative"}}>
        <Stack spacing={1} sx={{width: 150, position: "absolute", top: 0, left: -20, zIndex: 100}}>
            {inputList.map(i=>(
              <Tooltip title={i.label} key={i.label}>
                <Chip avatar={<Avatar sx={{backgroundColor: i.color}}><Icon path={i.icon} size={1}/></Avatar>}
                  label={i.label}
                  sx={{backgroundColor: i.color}}
                  onDelete={()=>update_input(i.entity, i.label, 'remove')}
                />
                </Tooltip>
            ))}
        </Stack>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[20,20]}
          defaultViewport={defaultViewport}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
        />
      </Container>
    </Grid>
    {runnables.length > 0 && <Grid item xs={12} ref={scrollRef}>
      <Typography variant="h5">
        Available Articles
      </Typography>
    </Grid>}
    {runnables.map((i: {[key:string]: any})=>
      <Grid item xs={12} md={6} key={i.method}>
        <Card sx={{height: '100%'}}>
          <CardHeader
            avatar={
              <Avatar>
                <Icon path={mdiFileDocument} size={1}/>
              </Avatar>
            }
            action={
              <IconButton aria-label="submit" href={`/data/explorer/article/${i.output.runnable_id}`}>
                <Icon path={mdiOpenInApp} size={1}/>
              </IconButton>
            }
            title={i.output.value.split("\n\n")[0].replace("# ", "").replace("#", "")}
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
  );
};
 
export default Explorer;
