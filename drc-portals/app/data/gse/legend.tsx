import { Typography, 
    FormControl, 
    Select, 
    MenuItem, 
    Checkbox,
    Grid,
    Box,
    Avatar,
    Button
 } from "@mui/material"
import { NetworkSchema } from './types';
import React from "react";
export const Selector = ({entries, 
    value, 
    onChange, 
    prefix, 
    sx={}, 
    multiple=false,
    ...props 
}: {
    entries: Array<string>,
    value: string | Array<string>, 
    onChange: Function, 
    prefix: string,
    sx?: {[key:string]: string|number},
    multiple?: boolean,
}) => {
    if (entries.length < 2) return null
    else return (
      <FormControl sx={{width: '100%'}}>
        <Select
          labelId={`${prefix}layouts-select`}
          id={`${prefix}-label`}
          value={value}
          onChange={(e,v)=>onChange(e.target.value)}
          variant="outlined"
          fullWidth={true}
          sx={{padding: 0, height: 45, ...sx}}
          {...props}
          >
          {entries.map(val=>(
            <MenuItem key={val} value={val}>{multiple && <Checkbox checked={value.indexOf(val)>-1}/>}{val.replace(/_/g," ")}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  
}

export const Legend = ({
    elements={nodes:[], edges:[]}, 
    search=true, 
    legendSize=0
}: {
    elements: NetworkSchema,
    search?: boolean,
    legendSize: number
}) => {
    const colors: {[key:string]: React.ReactNode} = {  
    }
    const relation_colors: {[key:string]: React.ReactNode} = {  
    }
    const sizes = [15, 20, 30, 40, 50]
    const lineHeight = [2, 3, 4, 5, 6]
    const lineWidth = [20, 25, 30, 35, 40]
    const borders = [2, 2, 4, 6, 8]
    if (search) {
      colors["Search Term"] = <Grid item xs={12} key={"search"}>
      <Grid container alignItems={"center"} spacing={1} key="term">
        <Grid item><Avatar sx={{background: "#ff8a80", width: sizes[legendSize], height: sizes[legendSize]}}> </Avatar></Grid>
        <Grid item><Typography variant="subtitle1">Search Term</Typography></Grid>   
      </Grid></Grid>   
    }
    let not_significant = false
    const color_sum: {[key: string]: string | undefined} = {}
    const relations = []
    for (const i of [...elements.nodes, ...elements.edges]) {
      const {kind, color, borderColor, lineColor, relation, pval, ring_label}: {
        kind?:string,
        color?:string,
        borderColor?: string,
        lineColor?: string,
        relation?: string,
        pval?: number,
        ring_label?: string,
      } = i.data
      if (pval && pval > 0.05) not_significant = true
      if (relation !== undefined && kind === "Relation" && lineColor !== "#e0e0e0" && relation_colors[relation]===undefined) {
        relation_colors[relation] = <Grid item xs={12} key={kind}>
          <Grid container alignItems={"center"} spacing={1}>
            <Grid item><hr style={{color: lineColor, height: lineHeight[legendSize], backgroundColor: lineColor, width: lineWidth[legendSize], borderStyle: i.data.hidden ? 'dotted': 'solid'}}/></Grid>
            <Grid item><Typography variant="subtitle1">{relation}</Typography></Grid>   
          </Grid></Grid>
      }
      if (colors[kind]===undefined && color !== "#ff8a80" && kind !== "Relation") {
        color_sum[kind] = color
        colors[kind] = <Grid item xs={12} key={kind}>
          <Grid container alignItems={"center"} spacing={1}>
            <Grid item><Avatar sx={{background: color, width: sizes[legendSize], height: sizes[legendSize], borderColor, borderStyle: borderColor ? "solid": "none", borderWidth: borders[legendSize]}}> </Avatar></Grid>
            <Grid item><Typography variant="subtitle1">{kind}</Typography></Grid>   
          </Grid></Grid> 
      }
      if (colors[kind]!==undefined && color_sum[kind] === "#bdbdbd" && color !== "#ff8a80" && kind !== "Relation" ) {
        color_sum[kind] = color
        colors[kind] = <Grid item xs={12} key={kind}>
          <Grid container alignItems={"center"} spacing={1}>
            <Grid item><Avatar sx={{background: color, width: sizes[legendSize], height: sizes[legendSize], borderColor, borderWidth: borders[legendSize]}}> </Avatar></Grid>
            <Grid item><Typography variant="subtitle1">{kind}</Typography></Grid>   
          </Grid></Grid> 
      }
      if (ring_label && !colors[ring_label] && borderColor && !not_significant) {
        colors[ring_label] = <Grid item xs={12} key={ring_label}>
        <Grid container alignItems={"center"} spacing={1} key={ring_label}>
          <Grid item>
            <Avatar sx={{background: "#FFF", borderColor: borderColor, borderStyle: "solid", borderWidth: borders[legendSize], width: sizes[legendSize], height: sizes[legendSize]}}> </Avatar>
          </Grid>
          <Grid item><Typography variant="subtitle1">{ring_label}</Typography></Grid>   
        </Grid></Grid>   
      }
    }
    if (!search && not_significant) {
      colors["Not significant"] = <Grid item xs={12} key={"significant"}>
      <Grid container alignItems={"center"} spacing={1} key="significant">
        <Grid item>
          <Avatar sx={{background: "#FFF", borderColor: "#757575", borderStyle: "solid", borderWidth: borders[legendSize], width: sizes[legendSize], height: sizes[legendSize]}}> </Avatar>
        </Grid>
        <Grid item><Typography variant="subtitle1">{`Not significant (pval > 0.05)`}</Typography></Grid>   
      </Grid></Grid>   
    }
    return (
      <Box sx={{
        zIndex: 1,
        position: 'absolute',
        top: 25,
        left: 25,
        pointerEvents: "none"
      }}>
          <Grid container alignItems={"center"} spacing={legendSize > 1 ? 1: 0} sx={{maxHeight: 700, overflow: "hidden"}}>
            <Grid item xs={12}>
              <Typography variant="h6">
                <b>Legend</b>
              </Typography>
            </Grid>
            {Object.values(colors)}
            {Object.values(relation_colors)}
          </Grid>
      </Box>
    )
  }
