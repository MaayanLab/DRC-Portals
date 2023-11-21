'use client'
import React from 'react'

export function ReadMore(
  props: {text: string | undefined, preamble: string, expanded: boolean}
) {
  const [isExpanded, setExpanded] = React.useState(false);
  const onClick = () => {
    setExpanded(!isExpanded);
  };
  if (props.text) {
    return (
      <p style={{color:"#666666", fontSize:"14pt"}}>
        <span style={{color:'#81A1C1'}}><b>{props.preamble}</b></span>
        {isExpanded ? props.text : props.text.slice(0, 220)}
        <span onClick={onClick} white-space='nowrap' style={{color:"#81A1C1"}}>
          <i>{isExpanded ? " show less" : "... read more"}</i>
        </span>
      </p>
    )
  } else {
    return (<p></p>)
  }
}