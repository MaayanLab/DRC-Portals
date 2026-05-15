import React from 'react'
import Select from 'react-select';
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import GlycanTouCanIds from '../utils/GlyTouCanIds.json'


// import glycan components
import GlyGenbyGlyTouCan from '../Glycan/GlyGenbyGlyTouCan'


let processMapper: Record<string, any> = {
    'GlyGenbyGlyTouCan': GlyGenbyGlyTouCan
}



export default function GlycanInput(args: any) {
    const props:any = Object.values(args)[0] || {}
    const glycan = props.glycan || ''
    const processName = props.process
    const Component = processMapper[processName || '']

    return (
        <>{React.createElement(Component, { ...props, glycan })}</>
    )
}