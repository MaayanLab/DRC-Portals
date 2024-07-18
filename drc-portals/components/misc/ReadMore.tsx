'use client'
import React from 'react'
import Link from 'next/link';
import { Typography } from '@mui/material';

export function ReadMore(
  props: {text: string | undefined, link?:string|null}
) {
  const [isExpanded, setExpanded] = React.useState(false);
  const onClick = () => {
    setExpanded(!isExpanded);
  };
  if (props.text) {
    const text = <span>
      {props.text} (Retrieved from the <Link href={props.link || 'https://commonfund.nih.gov/'} style={{color:"#3470e5"}}>NIH Common Fund site</Link>).
    </span>
    return (
      <Typography color="#666666" fontSize="12pt" sx={{mt:2, ml:3, mb:2}}>
        {isExpanded ? text : props.text.slice(0, 280) + '...'}
        <span onClick={onClick} white-space='nowrap' style={{display: "block", color:"#3470e5"}}>
          {isExpanded ? " show less" : "read more"}
        </span>
      </Typography>
    )
  } else {
    return (<p></p>)
  }
}