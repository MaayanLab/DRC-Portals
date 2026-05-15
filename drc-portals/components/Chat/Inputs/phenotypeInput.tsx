import React from 'react'
import Select from 'react-select';
import useSWRImmutable from 'swr/immutable'
import CreatableSelect from 'react-select/creatable';


// import phenotype components
import PhenotypeSmallMolecules from '../Phenotype/phenotypeSmallMolecules';


let processMapper: Record<string, any> = {
    'PhenotypeSmallMolecules': PhenotypeSmallMolecules
}



export default function PhenotypeInput(args: any) {
    const props:any = Object.values(args)[0] || {}
    const phenotype = props.phenotype || ''
    const processName = props.process
    const Component = processMapper[processName || '']

    
    return (
        <>{React.createElement(Component, { ...props, phenotype: phenotype })}</>
    )
}