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



export default function GlycanInput(props: any) {
    const glycan = props.glycan || ''
    const [glycanTerm, setglycanTerm] = React.useState(glycan)
    const [submitted, setSubmitted] = React.useState(false)
    const processName = props.process
    const Component = processMapper[processName || '']

    const items = React.useMemo(() => GlycanTouCanIds ? levenSort(GlycanTouCanIds, glycanTerm).slice(0, 10).map((elt: string) => { return { value: elt, label: elt } }) : [], [glycanTerm])


    const noOptionsMessage = (obj: { inputValue: string }) => {
        if (obj.inputValue.trim().length === 0) {
            return null
        }
        return 'No matching glycans'
    }

    const handleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setglycanTerm(inputText)
        }
    }

    return (
        <>
            {submitted ? 
            <>{React.createElement(Component, { ...props, glycan: glycanTerm })}</> : 
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
                    defaultValue={{ value: glycan, label: glycan }}
                    onInputChange={handleInputChange}
                    filterOption={null}
                    noOptionsMessage={noOptionsMessage}
                    placeholder={'Enter glycan ...'}
                    onChange={(value: any, actions: any) => {
                        if (actions.action == 'select-option') {
                            setglycanTerm(value.value)
                            setSubmitted(true)
                        }
                    }
                    }
                /></div>}
        </>
    )
}