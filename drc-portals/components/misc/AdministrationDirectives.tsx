'use client'

import React from "react"
import classNames from "classnames"

export default function AdministrationDirectives() {
  const [visible, setVisible] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    setVisible(window.localStorage.getItem('dismissAdministrationDirective') !== 'true')
  }, [])
  const dismissAdministrationDirective = React.useCallback(() => {
    window.localStorage.setItem('dismissAdministrationDirective', 'true')
    setVisible(null)
    setTimeout(() => {setVisible(false)}, 300)
  }, [])
  return (
    <div className={classNames("sticky left-0 top-0 mx-auto bg-[rgb(165,180,219)] z-50 p-2 flex place-content-center transition-opacity opacity-100 ease-in-out duration-300", { 'hidden': visible === false, 'opacity-0': !visible })}>
      <div className="inline-block prose prose-xl max-w-full text-justify">
        This repository is under review for potential modification in compliance with Administration directives.<br />
        This site remains fully operational throughout this review process. <button className="border px-2 bg-gray-200 border-[rgb(45,89,134)] text-center" onClick={dismissAdministrationDirective}>OK</button>
      </div>
    </div>
  )
}