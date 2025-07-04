'use client'
import React, {useLayoutEffect} from 'react';
import { Container, Typography, Stack } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { DCCFileTable } from './DCCFileTable';
import { dccAsset, dccAssetObj, dccAssetRecord } from '@/utils/dcc-assets';
import { useWidth } from './Carousel/helper';

const Wrapper = ({children}: {children: React.ReactNode}) => {
  const width = useWidth()
  if (['xs'].indexOf(width) > -1) {
    return(
      <Stack spacing={1}>
        {children}
      </Stack>
    )
  } else return children
}
function AccordionHeader(
  props: {assetInfo: {current: dccAsset[], archived: dccAsset[]}, label: string, exp: boolean}
) {
  const label_map = {
    C2M2: 'C2M2',
    XMT: 'XMT',
    AttributeTables: 'Attribute Tables',
    KGAssertions: 'Knowledge Graph Assertions',
    ETL: 'ETL Scripts',
    API: 'API Specifications',
    EntityPages: 'Entity Pages',
    PWBMetanodes: 'PWB Metanodes',
    Models: 'Models',
    AppsURL: 'Apps URLs'
  }
  const label = label_map[props.label as keyof typeof label_map]
  if (props.assetInfo.current.length + props.assetInfo.archived.length < 1) {
    return (
      <AccordionSummary sx={{ backgroundColor: "tertiary.light"}}>
        <Wrapper>
          <Typography sx={{ color: '#ffffff', width: '32%', fontSize: '12pt'}}><b>{label}</b></Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '12pt' }}>0 Available Files</Typography>
        </Wrapper>
      </AccordionSummary>
    )
  } else {
    var dates = props.assetInfo.current.map((item) => { return new Date(item.lastmodified) })
    dates = dates.concat(props.assetInfo.archived.map((item) => {return new Date(item.lastmodified)}))
    const maxDate = new Date(Math.max(...dates.map(Number)))
      .toLocaleDateString('en-us', { month:'numeric', day:'numeric', year:'numeric' })
    return (
      <AccordionSummary
        sx={{ backgroundColor: "tertiary.main" }}
        expandIcon={<ExpandMore sx={{color: "#FFF"}}/>}
        aria-controls="panel1bh-content"
      >
        <Wrapper>
          <Typography sx={{ color: '#ffffff', width: {xs: "100%", sm: "100%", md: "33%", lg: "33%", xl: "33%"}, fontSize: '12pt' }}><b>{label}</b></Typography>
          <Typography sx={{ color: '#ffffff',  display: {xs: "none", sm: "block", md: "block", lg: "block", xl: "block"},  width: {xs: "100%", sm: "100%", md: "45%", lg: "45%", xl: "45%"}, fontSize: '12pt'}}>
            {props.assetInfo.current.length} Current File(s) | {props.assetInfo.archived.length} Archived File(s)
          </Typography>
          <Typography sx={{ color: '#ffffff',  display: {xs: "block", sm: "none", md: "none", lg: "none", xl: "none"},  width: {xs: "100%", sm: "100%", md: "45%", lg: "45%", xl: "45%"}, fontSize: '12pt'}}>
            {props.assetInfo.current.length} Current File(s)
          </Typography>
          <Typography sx={{ color: '#ffffff',  display: {xs: "block", sm: "none", md: "none", lg: "none", xl: "none"},  width: {xs: "100%", sm: "100%", md: "45%", lg: "45%", xl: "45%"}, fontSize: '12pt'}}>
            {props.assetInfo.archived.length} Archived File(s)
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '12pt' }}>Modified {maxDate}</Typography>
        </Wrapper>
      </AccordionSummary>
    )
  }
}

function AccordionItem(
  props: {label: string, assetInfo: {current: dccAsset[], archived: dccAsset[]}, isCode: boolean}
) {
  return (
    <AccordionDetails sx={{overflow: "auto"}}>
      <Typography sx={{ml:2}} variant="subtitle2" fontSize='16pt' color="secondary.dark">Current</Typography>
      <DCCFileTable fileInfo={props.assetInfo.current} isCode={props.isCode}/>
      <Typography sx={{ml:2}} variant="subtitle2" fontSize='16pt' color="secondary.dark">Archived</Typography>
      <DCCFileTable fileInfo={props.assetInfo.archived} isCode={props.isCode}/>
    </AccordionDetails>
  )
}

function FileAccordion(
  props: {label: string, dccInfo: dccAssetObj, isCode: boolean}
) {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  useLayoutEffect(() => {
    const anchor = window.location.hash.split("#")[1];
    if (anchor) {
      const anchorEl = document.getElementById(anchor);
      if (anchorEl) {
        setExpanded(anchor);
      }
    }
  }, []);
  const handleChange = 
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  return (
    <Accordion 
      square={false}
      expanded={expanded === props.label} 
      onChange={handleChange(props.label)}
      sx={{ mb:2 }}
    >
      <AccordionHeader assetInfo={props.dccInfo} label={props.label} exp={expanded === props.label}/>
      <AccordionItem label={props.label} assetInfo={props.dccInfo} isCode={props.isCode} />
    </Accordion>
  )
}

export function DCCAccordion(
  props: {dcc: string, fulldata: dccAssetRecord}
) {
  const data = {} as dccAssetRecord
  const code = {} as dccAssetRecord
  for (const [k,v] of Object.entries(props.fulldata)) {
    v.isCode ? (
      code[k] = v
    ) : (
      data[k] = v
    )
  }
  return (
    <Container>
      <Typography variant="h3" color="secondary.dark" gutterBottom>Metadata and Processed Data Files</Typography>
      {Object.keys(data).map((key: keyof dccAssetRecord) => (
          <div key={key} id={key}>
            <FileAccordion 
              label={key}
              isCode={data[key].isCode} 
              dccInfo={data[key]} 
            />
          </div>
      ))}
      <Typography sx={{mt:2}} variant="h3" color="secondary.dark" gutterBottom>Interoperability Assets</Typography>
      {Object.keys(code).map((key: keyof dccAssetRecord) => (
          <div key={key} id={key}>
            <FileAccordion 
              label={key}
              isCode={code[key].isCode} 
              dccInfo={code[key]} 
            />
          </div>
      ))}
    </Container>
  )
}
