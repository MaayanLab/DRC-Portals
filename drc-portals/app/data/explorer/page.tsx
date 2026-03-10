'use client'
import React, { useState, useEffect, useCallback } from 'react';
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
import { Avatar, Button, Chip, Container, Grid, Paper, Tooltip, Typography } from '@mui/material';
import Gene from './gene';
import { blue, green, lime, orange, purple, red } from '@mui/material/colors';
import { mdiDna, mdiEye, mdiFileChart, mdiFlask, mdiHumanMaleHeightVariant, mdiListBox, mdiPill } from '@mdi/js';
import Icon from '@mdi/react';
import { Stack } from '@mui/system';
import Phenotype from './phenotype';
import SmallMolecule from './drug';
import Anatomy from './anatomy';
import Assay from './assay';
import GeneSet from './gene_set';
import { string } from 'zod';


const initBgColor = 'transparent';
 
const snapGrid = [20, 20];
const nodeTypes = {
  gene_set: GeneSet,
  geneNode: Gene,
  phenotype: Phenotype,
  small_molecule: SmallMolecule,
  anatomy: Anatomy,
  assay: Assay
};
 
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

interface InputType {
  gene?: Array<string>,
  drug?: Array<string>,
  gene_set?: {[key:string]:{up?: string[], down?: string[], gene_set?: string[]}},
  phenotype?: Array<string>,
  anatomy?: Array<string>,
  assay?: Array<string>,
}

const ui_elements: {[key: string]: {color: string, icon: string}} = {
  gene: {
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
  assay: {
    color: blue[100],
    icon: mdiFlask
  },
  drug: {
    color: lime[100],
    icon: mdiPill
  },
}

const Concierge = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuiltInEdge>([]);
  const [geneSetPos, setGeneSetPos] = useState(0)
  const [inputList, setInputList] = useState<{entity: string, label: string, color: string, icon: string, values?: {[key: string]: string[]}}[]>([])
  
  const update_input = (entity: string, label: string, type:string="add", values:{up?: string[], down?: string[], gene_set?: string[]}={}) => {
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
  const input_chips: any = []
  // for (const [k,v] of Object.keys(inputs)) {
  //   console.log(k,v )
  //   const {icon, color} = ui_elements[k]
  //   const terms = k!== "gene_set" ? v: Object.keys(v)
  //   for (const term of terms) {
  //     input_chips.push(
  //       <Tooltip title={term} key={term}>
  //     <Chip avatar={<Avatar sx={{backgroundColor: color}}><Icon path={icon} size={1}/></Avatar>}
  //       label={term}
  //       sx={{backgroundColor: color}}
  //       onDelete={()=>update_input(k, term, 'remove')}
  //     />
  //     </Tooltip>)
  //   }
  // }
  return (
  <Grid container spacing={1} justifyContent={"center"}>
    <Grid item xs={12}>
      <Container maxWidth="xl" sx={{height: 700, position: "relative"}}>
        <Stack spacing={1} sx={{width: 150, position: "absolute", top: 0, left: 0, zIndex: 100}}>
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
        />
      </Container>
    </Grid>
    {input_chips.length > 0 ?
    <Grid item>
      <Button sx={{textAlign: "center"}} variant="contained" color="secondary" startIcon={<Icon path={mdiFileChart} size={1}/>}>
      <Typography variant={"body1"}>Create Report</Typography>
      </Button>
    </Grid>: null
    }
  </Grid>
  );
};
 
export default Concierge;
