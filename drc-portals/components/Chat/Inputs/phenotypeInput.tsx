import React from 'react'
import Select from 'react-select';
import useSWRImmutable from 'swr/immutable'
import CreatableSelect from 'react-select/creatable';


// import phenotype components
import PhenotypeSmallMolecules from '../Phenotype/phenotypeSmallMolecules';


let processMapper: Record<string, any> = {
    'PhenotypeSmallMolecules': PhenotypeSmallMolecules
}



export default function PhenotypeInput(props: any) {
    const phenotype = props.phenotype || ''
    const [phenotypeTerm, setPhenotypeTerm] = React.useState(phenotype)
    const [submitted, setSubmitted] = React.useState(false)
    const processName = props.process
    const Component = processMapper[processName || '']

    const handleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setPhenotypeTerm(inputText)
        }
    }

    return (
        <>
            {submitted ? 
            <>{React.createElement(Component, { ...props, phenotype: phenotype })}</> : 
            <div className=' w-1/2' style={{ width: '200px' }}>
                <CreatableSelect
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
                    defaultValue={{ value: phenotypeTerm, label: phenotype }}
                    options={[{ value: phenotypeTerm, label: phenotype }]}
                    onInputChange={handleInputChange}
                    filterOption={null}
                    placeholder={'Enter phenotype ...'}
                    onCreateOption={(value: any) => {
                        setPhenotypeTerm(value.value)
                        setSubmitted(true)
                        }
                    }
                    onChange={(value: any, actions: any) => {
                        if (actions.action == 'select-option') {
                            setPhenotypeTerm(value.value)
                            setSubmitted(true)
                        }
                    }}
                /></div>}
        </>
    )
}