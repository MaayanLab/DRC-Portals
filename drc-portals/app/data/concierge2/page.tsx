'use client'
import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Position,
  type Node,
  type Edge,
  type BuiltInEdge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
// import './xy-theme.css'
import CustomNode from './custom';
import { Container } from '@mui/material';
import Gene from './gene';


const initBgColor = 'transparent';
 
const snapGrid = [20, 20];
const nodeTypes = {
  inputNode: CustomNode,
  geneNode: Gene
};
 
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
 
const Concierge = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuiltInEdge>([]);
  const [bgColor, setBgColor] = useState(initBgColor);
 
  useEffect(() => {
    const onChange = (event:any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== '2') {
            return node;
          }
 
          const color = event.target.value;
 
          setBgColor(color);
 
          return {
            ...node,
            data: {
              ...node.data,
              color,
            },
          };
        }),
      );
    };
 
    setNodes([
      {
        id: 'gene',
        type: 'geneNode',
        data: { label: "Gene/Protein" },
        position: { x: 300, y: 300 },
      },
	    {
        id: 'drug',
        type: 'inputNode',
        data: { label: "Drugs/Small Molecule" },
        position: { x: 0, y: 0 },
      },
      {
        id: 'gs',
        type: 'inputNode',
        data: { label: "Gene Set/ Pathways/ Modules" },
        position: { x: 600, y: 0 },
      },
      {
        id: 'cell',
        type: 'inputNode',
        data: { label: "Cell/ Tissue/ Organ" },
        position: { x: 0, y: 600 },
      },
      {
        id: 'assay',
        type: 'inputNode',
        data: { label: "Assay" },
        position: { x: 600, y: 600 },
      }
    ]);
 
    setEdges([
      {
        id: 'gene-drug',
        source: 'gene',
        target: 'drug',
        // animated: true,
        sourceHandle: "source-t",
        targetHandle: "target-b",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-gs',
        source: 'gene',
        target: 'gs',
        // animated: true,
        sourceHandle: "source-t",
        targetHandle: "target-b",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gene-cell',
        source: 'gene',
        target: 'cell',
        // animated: true,
        sourceHandle: "source-b",
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
        sourceHandle: "source-t",
        targetHandle: "target-t",
        style: { strokeWidth: 10},
        type: "smoothstep"
      },
      {
        id: 'drug-cell',
        source: 'drug',
        target: 'cell',
        // animated: true,
        sourceHandle: "source-l",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "smoothstep"
      },
      {
        id: 'drug-assay',
        source: 'drug',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-l",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gs-cell',
        source: 'gs',
        target: 'cell',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-r",
        style: { strokeWidth: 10},
        type: "default"
      },
      {
        id: 'gs-assay',
        source: 'gs',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-r",
        targetHandle: "target-r",
        style: { strokeWidth: 10},
        type: "smoothstep"
      },
      {
        id: 'cell-assay',
        source: 'cell',
        target: 'assay',
        // animated: true,
        sourceHandle: "source-b",
        targetHandle: "target-b",
        style: { strokeWidth: 10},
        type: "smoothstep"
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
        id: 'assay-drug',
        source: 'assay',
        target: 'drug',
        // animated: true,
        sourceHandle: "source-t",
        targetHandle: "target-r",
        style: { strokeWidth: 10},
        type: "default"
      }
    ]);
  }, []);
 
   const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
	<Container maxWidth="xl" sx={{height: 500}}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ background: bgColor }}
      nodeTypes={nodeTypes}
      snapToGrid={true}
      snapGrid={[20,20]}
      defaultViewport={defaultViewport}
      fitView
      attributionPosition="bottom-left"
    />
	</Container>
  );
};
 
export default Concierge;
