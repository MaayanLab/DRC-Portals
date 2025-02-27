import React from "react";

export function LinkRenderer(props: any) {
  if (props.href.startsWith("/img")) {
    return (
      <a 
        className="link text-blue-500 hover:cursor-pointer" 
        href={props.href} target="_blank">
        {props.children}
      </a>
    )
  } else if (props.href.startsWith("#") || props.href.startsWith("./") ) {
    return (
      <a
        className="link text-blue-500 hover:cursor-pointer"  
        href={props.href}>
        {props.children}
      </a>
    );
  } else {
    return (
      <a
        className="link text-blue-500 hover:cursor-pointer"  
        href={props.href} target="_blank">
        {props.children}
      </a>
    )
  }
}

export function H2Renderer(props: any) {
  const slug = props.children.toLowerCase().replace(/\W/g, '-')
  const link = `#${slug}`
  return (
    <h2 className="prose font-semibold text-2xl my-6" id={slug}>
      {props.children}
    </h2>
  )
}

export function H3Renderer(props: any) {
  const slug = props.children.toLowerCase().replace(/\W/g, '-')
  const link = `#${slug}`
  return (
    <h3 className="prose font-semibold text-xl my-4" id={slug}>
      {props.children}
    </h3>
  )
}

export function TableRenderer(props: any) {
  return (
    <div className="overflow-auto">
      <table className="table table-auto" style={props.style}>
        {props.children}
      </table>
    </div>
  )
}

export function ThRenderer(props: any) {
  return (
    <th className="whitespace-nowrap" style={props.style}>
      {props.children}
    </th>
  )
}
