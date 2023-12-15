'use client'
import React from 'react'
import { Typography } from '@mui/material';

export function ReadMore(
  props: {text: string | undefined}
) {
  const [isExpanded, setExpanded] = React.useState(false);
  const onClick = () => {
    setExpanded(!isExpanded);
  };
  if (props.text) {
    const text = <span>
      {props.text} (Retrieved from the <a style={{color:"#3470e5"}} target="_blank" href="https://commonfund.nih.gov">NIH Common Fund site</a>).
    </span>
    return (
      <Typography color="#666666" fontSize="12pt" sx={{mt:2, ml:3, mb:2}}>
        {isExpanded ? text : props.text.slice(0, 290) + '...'}
        <span onClick={onClick} white-space='nowrap' style={{display: "block", color:"#3470e5"}}>
          {isExpanded ? " show less" : "read more"}
        </span>
      </Typography>
    )
  } else {
    return (<p></p>)
  }
}