import React from 'react'

/**
 * Usage:
 *   <ReactJoin sep={<>, </>}>
 *     {items.map(item => <div key={item.key}>{item.value}</div>)}
 *   </ReactJoin>
 */
export default function ReactJoin(props: { children: React.ReactNode[], sep: React.ReactNode }) {
  return <>{props.children.flatMap((item, i) => i === 0 ? [item] : [<React.Fragment key={`__sep_${i}`}>{props.sep}</React.Fragment>, item])}</>
}
