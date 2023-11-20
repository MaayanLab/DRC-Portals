'use client'
import React from 'react'

export function ReadMore(props: {text: string | undefined, expanded: boolean}) {
  const [isExpanded, setExpanded] = React.useState(false);
  const onClick = () => {
    setExpanded(!isExpanded);
  };
  if (props.text) {
    console.log(props.text)
    return (
      <p style={{color:"#666666", fontSize:"14pt"}}>
        {isExpanded ? props.text : props.text.slice(0, 100)}
        <span onClick={onClick} white-space='nowrap' style={{color:"#81A1C1"}}>
          {isExpanded ? " show less" : "... read more"}
        </span>
      </p>
    )
  } else {
    return (<p></p>)
  }
}