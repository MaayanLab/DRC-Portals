
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
import Select from 'react-select';


// import gene components
import ReverseSearchL1000 from '../Gene/reverseSearchL1000'
import ImpcPhenotypes from '../Gene/impcPhenotypes'
import ScoredGTExTissue from '../Gene/scoredGTExTissue'
import RegElementSetInfo from '../Gene/RegElementSetInfo'
import KidsFirstTumorExpr from '../Gene/KidsFirstTumorExpr'

let processMapper: Record<string, any> = {
    'GtexGeneExpression': ScoredGTExTissue,
    'ReverseSearchL1000': ReverseSearchL1000,
    'ImpcPhenotypes': ImpcPhenotypes,
    'RegElementSetInfo': RegElementSetInfo,
    'KidsFirstTumorExpr': KidsFirstTumorExpr,
}

const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

export default function GeneInput(props: any) {
    const genesymbol = props.geneSymbol || ''
    const [geneTerm, setGeneTerm] = React.useState(genesymbol)
    const [submitted, setSubmitted] = React.useState(false)
    const processName = props.process
    const Component = processMapper[processName || '']
    const { data, error, isLoading } = useSWRImmutable<string[]>(() => {
        if (geneTerm.length < 2) return null
        if (processName === 'ReverseSearchL1000') return `/chat/l1000sigs/autocomplete?q=${encodeURIComponent(geneTerm)}`
        else return `https://maayanlab.cloud/Harmonizome/api/1.0/suggest?t=gene&q=${encodeURIComponent(geneTerm)}`
    }, fetcher)
    const items = React.useMemo(() => data ? levenSort(data, geneTerm).slice(0, 10).map((elt: string) => { return { value: elt, label: elt } }) : [], [data, geneTerm])


    const noOptionsMessage = (obj: { inputValue: string }) => {
        if (obj.inputValue.trim().length === 0) {
            return null
        }
        return 'No matching genes'
    }

    const handleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setGeneTerm(inputText)
        }
    }

    return (
        <>
            {submitted ? 
            <>{React.createElement(Component, { ...props, genesymbol: geneTerm })}</> : 
            <div className=' w-1/2' style={{ width: '200px' }}>
                <Select
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            neutral0: '#5f6e85',
                            neutral80: 'var(--neutral-80)',
                            neutral40: 'var(--neutral-40)',
                            neutral60: 'white',
                            primary25: 'grey',
                            primary50: 'black',
                            primary75: 'black',
                        },
                    })}
                    className='w-auto'
                    options={items}
                    defaultValue={{ value: genesymbol, label: genesymbol }}
                    onInputChange={handleInputChange}
                    isLoading={isLoading}
                    filterOption={null}
                    noOptionsMessage={noOptionsMessage}
                    placeholder={'Enter gene symbol...'}
                    onChange={(value: any, actions: any) => {
                        if (actions.action == 'select-option') {
                            setGeneTerm(value.value)
                            setSubmitted(true)
                        }
                    }
                    }
                /></div>}
        </>
    )
}