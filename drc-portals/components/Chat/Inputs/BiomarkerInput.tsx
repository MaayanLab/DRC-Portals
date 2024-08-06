
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
import Select from 'react-select';
import classNames from 'classnames';

// import gene components

import GlyGenBiomarker from '../Biomarker/GlyGenBiomarker'


let processMapper: Record<string, any> = {
    'GlyGenBiomarker': GlyGenBiomarker,
}


export default function BiomarkerInput(props: any) {
    console.log(props)
    const [term, setTerm] = React.useState(props.term||'')//working value
    const [submitted, setSubmitted] = React.useState(false)//exit statement
    const [ready, setReady] = React.useState(props.term)//ready submit button

    const processName = props.process
    const Component = processMapper[processName || '']

    React.useEffect(() => {
        setReady(term.trim().length > 0);
    }, [term]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTerm(event.target.value);
    };
    return (
        <>
            {submitted ? (
                <>{React.createElement(Component, { ...props, term: term})}</>
            ) : (
                <>
                    {
                        // Add the appropriate JSX or return value here for typeSelected being true
                        
                        <div className="w-1/2" style={{ width: '230px' }}>

                            <p style={{ margin: 0 , userSelect: 'none'}}>Enter term:</p>
                            <input
                                type='text'
                                style={{
                                    borderRadius: 0,
                                    backgroundColor: '#5f6e85',
                                    color: 'white',
                                    width: '100%'
                                    
                                }}
                                className="focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full px-2.5 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={term}
                                placeholder={"ex: AA4686-1, Colorectal Cancer"}

                                onChange={handleInputChange}
                            />
                            <div className='text-center m-2 space-x-2'>
                                <button className = {classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': ready })} style={{ userSelect: 'none' }} onClick={() => setSubmitted(true)} disabled={!ready}>Submit</button>
                            </div>
                        </div>
                    }
                </>
            )}
        </>
    );
}