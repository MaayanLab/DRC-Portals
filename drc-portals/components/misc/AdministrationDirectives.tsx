import React from "react"

export default function AdministrationDirectives({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style} className="sticky bottom-0 bg-[rgb(165,180,219)] z-50 p-2 prose w-full text-center">
      This repository is under review for potential modification in compliance with Administration directives.
    </div>
  )
}
