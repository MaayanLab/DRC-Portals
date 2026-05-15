'use client'
import { Button, Collapse, Grid, Typography } from '@mui/material'
import React, { useState } from 'react'

type MDComponentProps = {
  'root': { type: 'root', children: MDComponentChildren },
  't': { type: 't', text: string },
  'p': { type: 'p', children: MDComponentChildren },
  'b': { type: 'b', children: MDComponentChildren },
  'i': { type: 'i', children: MDComponentChildren },
  'a': { type: 'a', href: string, children: MDComponentChildren },
  'f': { type: 'f', _ref: string },
  'fg': { type: 'fg', children: MDComponentChildren<'fg_f' | 'fg_fs'> },
  'fg_f': { type: 'fg_f', _ref: string },
  'fg_fs': { type: 'fg_fs', start_ref: string, end_ref: string },
  'rg': { type: 'rg', children: MDComponentChildren<'r'> },
  'r': { type: 'r', _ref: string, children: MDComponentChildren },
}
type MDComponentChildren<T extends keyof MDComponentProps = keyof MDComponentProps> = MDComponentProps[T][]

const MDComponents: {[K in keyof MDComponentProps]: (props: MDComponentProps[K]) => React.ReactNode} = {
  root(props) {
    return <MDRecurse {...props} />
  },
  p(props) {
    return <p><MDRecurse {...props} /></p>
  },
  f(props) {
    return <sup><a href={`#ref-${props._ref}`} className="no-underline">{props._ref}</a></sup>
  },
  fg(props) {
    return <sup>{props.children.map((child, i) => {
      return <React.Fragment key={i}>{i > 0 && ','}<MD {...child} /></React.Fragment>
    })}</sup>
  },
  fg_f(props) {
    return <a href={`#ref-${props._ref}`} className="no-underline">{props._ref}</a>
  },
  fg_fs(props) {
    return <><a href={`#ref-${props.start_ref}`} className="no-underline">{props.start_ref}</a>-<a href={`#ref-${props.end_ref}`} className="no-underline">{props.end_ref}</a></>
  },
  a(props) {
    return <a href={props.href} target="_blank"><MDRecurse {...props} /></a>
  },
  b(props) {
    return <b><MDRecurse {...props} /></b>
  },
  i(props) {
    return <i><MDRecurse {...props} /></i>
  },
  rg(props) {
    const [open, setOpen] = useState(props.children.length < 5)
    return (
      <Grid container justifyContent={'flex-start'}>
        <Grid item xs={12}>
          <Button sx={{color: "black", textAlign: "left", paddingLeft: 0}} onClick={()=>setOpen(!open)}><Typography variant="h5"><strong>References (click to {open ? "collapse": "view"})</strong></Typography></Button>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={open}>
            <MDRecurse {...props} />
          </Collapse>
        </Grid>
      </Grid>
    )
  },
  r(props) {
    return <div><a id={`ref-${props._ref}`} className="no-underline">[{props._ref}]</a> <MDRecurse {...props} /></div>
  },
  t(props) {
    return <>{props.text}</>
  },
}

function MD<T extends MDComponentProps[keyof MDComponentProps]>(props: T) {
  const Component = MDComponents[props.type] as ((props: T) => React.ReactElement) | undefined
  if (!Component) return null
  return <Component {...props} />
}

function MDRecurse(props: { children: MDComponentProps[keyof MDComponentProps][] }) {
  return props.children.map((child, i) => <MD key={i} {...child} />)
}


function renameRefs(props: MDComponentProps):({[key:string]: any} | {[key:string]: any}[]) {
  if (Array.isArray(props)) {
    return props.map((i)=>renameRefs(i))
  }
  return Object.fromEntries(Object.entries(props).map(([key, value]) => key === 'ref' ? ['_ref', value] : [key, value]))
}

export default function MDT(props: { src: string }) {
  // const renamed = renameRefs(JSON.parse(props.src)) as MDComponentProps[keyof MDComponentProps]
  try {
    return <MD {...JSON.parse(props.src.replaceAll('"ref":', '"_ref":'))} />
  } catch (e) {
    console.error(e)
    return props.src
  }
}