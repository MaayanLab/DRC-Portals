import React from 'react'


// import gene components
import HuBMAPSearch from '../DataSet/HuBMAPSearch'
import SenNetSearch from '../DataSet/SenNetSearch'

let processMapper: Record<string, any> = {
    'HuBMAPSearch': HuBMAPSearch,
    'SenNetSearch': SenNetSearch,
}


export default function SearchInputs(props: any) {
    const processName = props.process
    const Component = processMapper[processName || '']


    return (
        <>{React.createElement(Component, { ...props})}</>  
    )
}