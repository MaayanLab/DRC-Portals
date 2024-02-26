import React from "react";

export function LinkRenderer(props: any) {
  if (props.href.startsWith("#") || props.href.startsWith("/")) {
    return (
      <a href={props.href}>
        {props.children}
      </a>
    );
  } else {
    return (
      <a href={props.href} target="_blank">
        {props.children}
      </a>
    )
  }
}

function flatten(text: string, child: any) : string {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
};

export function HeadingRenderer(props: any) {
  const children = React.Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase().replace(/\W/g, '-')
  return React.createElement(props.node.tagName, {id: slug}, props.children)
}