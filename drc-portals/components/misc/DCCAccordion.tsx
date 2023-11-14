'use client'
import React, {useLayoutEffect} from 'react';
import { Container, Typography } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { DCCFileTable } from './DCCFileTable';
import { dccAsset, dccAssetObj, dccAssetRecord } from '@/utils/dcc-assets';

function AccordionHeader(
  props: {assetInfo: {current: dccAsset[], archived: dccAsset[]}, label: string, exp: boolean}
) {
  const bgColor = (props.exp) ? '#372c72' : '#ffffff'
  const textColor = (props.exp) ? '#ffffff' : '#212121'
  const secColor = (props.exp) ? '#ffffff' : 'text.secondary'
  if (props.assetInfo.current.length + props.assetInfo.archived.length < 1) {
    return (
      <AccordionSummary sx={{ backgroundColor: bgColor}}>
        <Typography sx={{ color: textColor, width: '32%' }}>{props.label}</Typography>
        <Typography sx={{ color: secColor }}>0 Available Files</Typography>
      </AccordionSummary>
    )
  } else {
    var dates = props.assetInfo.current.map((item) => { return new Date(item.lastmodified) })
    dates = dates.concat(props.assetInfo.archived.map((item) => {return new Date(item.lastmodified)}))
    const maxDate = new Date(Math.max(...dates.map(Number)))
      .toLocaleDateString('en-us', { month:'numeric', day:'numeric', year:'numeric' })
    return (
      <AccordionSummary
        sx={{ backgroundColor: bgColor }}
        expandIcon={<ExpandMore />}
        aria-controls="panel1bh-content"
      >
        <Typography sx={{ color: textColor, width: '33%' }}>{props.label}</Typography>
        <Typography sx={{ color: secColor, width: '50%' }}>
          {props.assetInfo.current.length} Current File(s) | {props.assetInfo.archived.length} Archived File(s)
        </Typography>
        <Typography sx={{ color: secColor }}>Modified {maxDate}</Typography>
      </AccordionSummary>
    )
  }
}

function AccordionItem(
  props: {label: string, assetInfo: {current: dccAsset[], archived: dccAsset[]}, isCode: boolean}
) {
  return (
    <AccordionDetails>
      <Typography variant="h6" color="primary">Current</Typography>
      <DCCFileTable fileInfo={props.assetInfo.current} isCode={props.isCode}/>
      <Typography variant="h6" color="primary">Archived</Typography>
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
    <Accordion expanded={expanded === props.label} onChange={handleChange(props.label)}>
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
      <Typography variant="h5" gutterBottom>Files</Typography>
      {Object.keys(data).map((key: keyof dccAssetRecord) => (
          <div id={key}>
            <FileAccordion 
              label={key}
              isCode={data[key].isCode} 
              dccInfo={data[key]} 
            />
          </div>
      ))}
      {/* <div id="C2M2">
        <FileAccordion isCode={false} label="C2M2"
          dccInfo={props.fulldata.C2M2} />
      </div>
      <div id="XMT">
        <FileAccordion isCode={false} label="XMT" 
          dccInfo={props.fulldata.XMT} />
      </div>
      <div id="AttributeTables">
        <FileAccordion isCode={false} label="Attribute Tables" 
          dccInfo={props.fulldata.AttributeTables} />
      </div>
      <div id="KGAssertions">
        <FileAccordion isCode={false} label="KG Assertions" 
          dccInfo={props.fulldata.KGAssertions} />
      </div>
      <div id="KCAssertions">
        <FileAccordion isCode={false} label="KC Assertions" 
          dccInfo={props.fulldata.KCAssertions} />
      </div> */}
      
      <Typography sx={{mt:2}} variant="h5" gutterBottom>Code</Typography>
      {Object.keys(code).map((key: keyof dccAssetRecord) => (
          <div id={key}>
            <FileAccordion 
              label={key}
              isCode={code[key].isCode} 
              dccInfo={code[key]} 
            />
          </div>
      ))}

      {/* <FileAccordion isCode label="APIs" dccInfo={{current: props.fulldata.API.current, archived: props.fulldata.API.archived}} />
      <FileAccordion isCode label="ETL Scripts" dccInfo={{current: props.fulldata.ETL.current, archived: props.fulldata.ETL.archived}} />
      <FileAccordion isCode label="Entity Pages" dccInfo={{current: props.fulldata.EntityPages.current, archived: props.fulldata.EntityPages.archived}} />
      <FileAccordion isCode label="PWB Metanodes" dccInfo={{current: props.fulldata.PWBMetanodes.current, archived: props.fulldata.PWBMetanodes.archived}} />
      <FileAccordion isCode label="Chatbot Specs" dccInfo={{current: props.fulldata.ChatbotSpecs.current, archived: props.fulldata.ChatbotSpecs.archived}} /> */}
    </Container>
  )
}
