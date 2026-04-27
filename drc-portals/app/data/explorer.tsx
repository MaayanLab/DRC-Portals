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
import { Avatar, Button, Card, CardHeader, Chip, Container, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { blue, green, lime, orange, purple, red } from '@mui/material/colors';
import { mdiDna, mdiEye, mdiEyedropper, mdiFlask, mdiHumanMaleHeightVariant, mdiListBox, mdiPill, mdiVirus } from '@mdi/js';
import Icon from '@mdi/react';

import GeneSet from './gene_set';
import { Search } from './search_page';
import ExplorerNode from './node';

 
const nodeTypes = {
  gene_set: GeneSet,

  node: ExplorerNode
};
 
const defaultViewport = { x: 150, y: 10, zoom: 0.7 };

const ui_elements: {[key: string]: {color: string, icon: string}} = {
  gene: {
    color: green[100],
    icon: mdiDna
  },
  variant: {
    color: green[200],
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
    icon: mdiVirus,
  },
  disease: {
    color: orange[100],
    icon: mdiVirus,
  }
}

const gdlpa = (newValue:string, type: string) => ({
    "resource": "gdlpa",
    "link": `https://cfde-gene-pages.cloud/{type}/${newValue}?CF=false&PS=true`,
    description: newValue
  })

const gsfm = (newValue:string) => ({
    "resource": "gsfm",
    "link": `https://gsfm.maayanlab.cloud/gene/${newValue}`,
    description: newValue
  })

const Explorer = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuiltInEdge>([]);
  const [geneSetPos, setGeneSetPos] = useState(0)
  const [taskId, setTaskId] = useState('')
  const [inputList, setInputList] = useState<{entity: string, label: string, color: string, icon: string, values?: {[key: string]: string[]}, links?: {resource: string, description: string, link: string}[]}[]>([])
  const [loading, setLoading] = useState(false)
  const [applicables, setApplicables] = useState<{method: string, params: {[key:string]: string}}[]>([])
  const [runnables, setRunnables] = useState<{timestamp: string, method: string, published: boolean, output: {runnable_id: string, value: string}}[]>([])
  const [articles, setArticles] = useState<{timestamp: string, message: {message_id: string, content: string}}[]>([])
  const scrollRef = useRef<null | HTMLDivElement>(null)
	const [submit, setSubmit] = useState(false)
  const update_input = (entity: string, label: string, type:string="add", values:{up?: string[], down?: string[], gene_set?: string[]}={}, links:{resource: string, description: string, link: string}[]=[]) => {
    setTaskId('')
    if (type === "add") {
      setInputList(inputList=>{
        const add = inputList.filter(i=>i.entity === entity && i.label === label).length
        if (add === 0) return [...inputList, {entity, label, ...ui_elements[entity], values, links}]
        else if (label === "user_input") {
          return [...inputList, {entity, label: `${label} ${add}`, ...ui_elements[entity], values, links}]
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
        type: 'node',
        data: { label: "Genes, Proteins, and Variants", update_input, facet: 'gene', icon: mdiDna, get_links: (newValue:string)=>([
          gdlpa(newValue, 'gene'),
          gsfm(newValue),
        ]) },
        position: { x: 150, y: 185+geneSetPos },
      },
	    {
        id: 'drug',
        type: 'node',
        data: { label: "Small Molecules, Drugs, and Metabolites", update_input, facet: 'drug', icon: mdiPill, get_links: (newValue:string)=>([
          gdlpa(newValue, 'drug'),
        ]) },
        position: { x: -100, y: 0+geneSetPos/2 },
      },
      {
        id: 'gs',
        type: 'gene_set',
        data: { label: "Gene Set/ Pathways/ Modules", update_input, setGeneSetPos },
        position: { x: 400, y: 0 },
      },
      {
        id: 'cell',
        type: 'node',
        data: { label: "Cell types, Tissues, and Organ", update_input, facet: 'anatomy', icon: mdiEye, },
        position: { x: -180, y: 350+geneSetPos },
      },
      {
        id: 'disease',
        type: 'node',
        data: { label: "Phenotypes, and Diseases", update_input, facet: "disease", icon: mdiVirus  },
        position: { x: 480, y: 355+geneSetPos },
      },
      {
        id: 'assay',
        type: 'node',
        data: { label: "Assay", update_input, facet: "assay", icon: mdiFlask },
        position: { x: 150, y: 530+geneSetPos },
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
  const query: {[key:string]: any} = {}
    for (const i of inputList) {
      if (i.entity === 'gene_set') {
        if (query[i.entity] === undefined) query[i.entity] = {}
        const {description:d, ...res} = i.values || {}
        query[i.entity][i.label] = res
      } else {
        if (query[i.entity] === undefined) query[i.entity] = []
        query[i.entity].push(i.label)
      }
  }
  return (
  <Grid container spacing={1} alignItems='stretch'>
    <Grid item xs={12} md={3}>
      <Stack spacing={3} sx={{marginTop: {xs: 1, md: 1}}}>
        <Typography variant="h1" color={'#2D5986'}><b>Discover, Analyze, and Integrate NIH Common Fund Data</b></Typography>
        <Typography variant="subtitle1" color={'secondary'}>
          The Common Fund Data Ecosystem (CFDE) aims to enable broad use of data generated by Common Fund Programs to accelerate hypothesis generation and discovery.
        </Typography>
        <Button 
          sx={{width: "100%", height: 80, textAlign: "center"}} 
          variant="contained" 
          color="secondary" 
          // startIcon={<Icon path={mdiFileDocument} size={1}/>}
          // onClick={()=>{
          //   if (inputList.length > 0) setSubmit(true)
          // }}
          href={`/data?q=${JSON.stringify(query)}`}
          disabled={inputList.length === 0}
        >
          <Typography variant="h5">{inputList.length === 0 ? "Enter a biomedical entity to get started": "Explore CFDE Workbench"}</Typography>
      </Button>
        
      </Stack>
      
    </Grid>
    <Grid item xs={12} md={9}>
      <Container maxWidth="xl" sx={{height: 500 + geneSetPos, width: "100%", position: "relative"}}>
        <ReactFlow
          // height={500}
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
          proOptions={{hideAttribution: true}}
        />
      </Container>
      <Grid container spacing={1} justifyContent={'center'}>
          {inputList.map(i=>(
            <Grid item key={i.label}>
              <Tooltip title={i.label} key={i.label}>
              <Chip avatar={<Avatar sx={{backgroundColor: i.color}}><Icon path={i.icon} size={1}/></Avatar>}
                label={i.label}
                sx={{backgroundColor: i.color}}
                onDelete={()=>update_input(i.entity, i.label, 'remove')}
              />
              </Tooltip>
            </Grid>
          ))}
      </Grid>
    </Grid>
    
  </Grid>
  );

// else {
//   return(
//     <Grid container spacing={1}>
//       <Grid item xs={12}>
//         <Search inputList={inputList}/>
//       </Grid>
//       <Grid item xs={12}>
//         <Button 
//             sx={{width: "100%"}} 
//             variant="outlined" 
//             color="secondary" 
//             // startIcon={<Icon path={mdiFileDocument} size={1}/>}
//             onClick={()=>setSubmit(false)}
//           >
//             Go Back 
//         </Button>
//       </Grid>
//     </Grid>
//   ) 
// }
};
 
export default Explorer;
