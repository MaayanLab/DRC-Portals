
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
import Select from 'react-select';


// import gene components
import FourDN from '../ExperimentSet/FourDN'
import classNames from 'classnames';

let processMapper: Record<string, any> = {
    'FourDN': FourDN,
}


export default function ExperimentSetInput(props: any) {
    const [submitted, setSubmitted] = React.useState(false)
    
    console.log(props)
    const processName = props.process
    const Component = processMapper[processName || '']
    //Organism
    const[organism, setOrganism] = React.useState("")
    const [organismSubmit, setOrganismSubmit] = React.useState(props.organism? (Array.isArray(props.organism)? props.organism: ([props.organism])):["Human"]);
    // const [organismSubmit, setOrganismSubmit] = React.useState(["Human"]);

    const organismHandleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setOrganism(inputText)
        }
    }
    const organismItems = ["All", "Human", "Mouse", "Fruit Fly", "Chicken", "Hamster", "Zebrafish", "Green Monkey"]
    const organismFilteredItems = React.useMemo(()=>{return organismItems.filter((item) => item.toLowerCase().includes(organism.toLowerCase())).map((elt: string) => ({ value: elt, label: elt }))}, [organism])
    
    //Experiment Type
    const[experiment, setExperiment] = React.useState("")
    const [experimentSubmit, setExperimentSubmit] = React.useState(props.experiment?( Array.isArray(props.experiment)? props.experiment: ([props.experiment])):["All"]);
    // const [experimentSubmit, setExperimentSubmit] = React.useState(["Human"]);
    const experimentHandleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setExperiment(inputText)
        }
    }
    const experimentItems = ["All","in situ Hi-C (Hi-C)", "Dilution Hi-C (Hi-C)", "Micro-C (Hi-C)", "DNase Hi-C (Hi-C)", "TCC (Hi-C)", "DNA FISH (FISH)", "multiplexed FISH (FISH)", "RNA FISH (FISH)", "ChIP-seq (DNA binding)", "CUT&RUN (DNA binding)", "ChIP-exo (DNA binding)", "CUT&Tag (DNA binding)", "TSA-seq (Proximity-seq)", "pA-DamID (Proximity-seq)", "DamID-seq (Proximity-seq)", "NAD-seq (Proximity-seq)", "Immunofluorescence (Immunofluorescence)", "2-stage Repli-seq (Replication timing)", "Multi-stage Repli-seq (Replication timing)", "RNA-seq (Transcription)", "sci-RNA-seq (Transcription)", "single cell RNA-seq (Transcription)", "Bru-seq (Transcription)", "SPT (SPT)", "sci-Hi-C (Hi-C single cell)", "sn-Hi-C (Hi-C single cell)", "single cell Hi-C (Hi-C single cell)", "PLAC-seq (IP-based 3C)", "in situ ChIA-PET (IP-based 3C)", "HiChIP (IP-based 3C)", "ChIA-PET (IP-based 3C)", "Capture Hi-C (Enrichment Hi-C)", "4C-seq (Enrichment Hi-C)", "ATAC-seq (Open Chromatin)", "RE-seq (Open Chromatin)", "sci-ATAC-seq (Open Chromatin)", "GAM (Ligation-free 3C)", "DNA SPRITE (Ligation-free 3C)", "ChIA-Drop (Ligation-free 3C)", "RNA-DNA SPRITE (Ligation-free 3C)", "OptoDroplet (OptoDroplet)", "TRIP (Reporter Expression)", "MARGI (RNA-DNA Hi-C)", "BLISS (DNA damage detection)", "Electron Tomography (TEM)"]
    const experimentFilteredItems = React.useMemo(()=>{return experimentItems.filter((item) => item.toLowerCase().includes(experiment.toLowerCase())).map((elt: string) => ({ value: elt, label: elt }))}, [experiment])

    return (
        <>
            {submitted ? 
            <>{React.createElement(Component, { ...props, organism: organismSubmit, experiment: experimentSubmit})}</> : 
            <div className=' w-1/2' style={{ width: '230px' }}>
                <p style={{ margin: 0 , userSelect: 'none'}}>Organism</p>
                <Select
                    isMulti
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            neutral10: '#9fa8b5',
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
                    options={organismFilteredItems}
                    value={organismSubmit.map((value: any)=> ({value: value, label: value}))}
                    onInputChange={organismHandleInputChange}
                    filterOption={null}
                    onChange={(selectedOptions: any, actions: any) => {
                        let newSelection = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                        if (newSelection.includes("All")&&!organismSubmit.includes("All") && newSelection.length > 1) {
                            newSelection = ["All"];
                        }
                        else if (newSelection.includes("All")&& newSelection.length > 1) {
                            newSelection = newSelection.filter((value: string) => value !== "All");
                        }
                        if (newSelection.length < 1) {
                            newSelection = ["All"];
                        }
                        setOrganismSubmit(newSelection);
                    }}
                />
                <p style={{ margin: '10px 0 0 0' , userSelect: 'none'}}>Experiment Type</p>
                <Select
                    isMulti
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            neutral10: '#9fa8b5',
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
                    options={experimentFilteredItems}
                    value={experimentSubmit.map((value: any)=> ({value: value, label: value}))}
                    onInputChange={experimentHandleInputChange}
                    filterOption={null}
                    onChange={(selectedOptions: any, actions: any) => {
                        let newSelection = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                        if (newSelection.includes("All")&&!experimentSubmit.includes("All") && newSelection.length > 1) {
                            newSelection = ["All"];
                        }
                        else if (newSelection.includes("All")&& newSelection.length > 1) {
                            newSelection = newSelection.filter((value: string) => value !== "All");
                        }
                        if (newSelection.length < 1) {
                            newSelection = ["All"];
                        }
                        setExperimentSubmit(newSelection);
                    }}
                />
                <div className='text-center m-2 space-x-2'>
                    <button className = {classNames('px-2 btn-sm border rounded', 'font-extrabold opacity-100 border-2')} style={{ userSelect: 'none' }} onClick={() => setSubmitted(true)}>Submit</button>
                </div>
            </div>}
        </>
    )
}