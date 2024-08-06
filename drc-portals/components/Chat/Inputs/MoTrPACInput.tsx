
import useSWRImmutable from 'swr/immutable'
import levenSort from '@/components/Chat/utils/leven-sort'
import React from 'react'
import Select from 'react-select';
import classNames from 'classnames';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

// import gene components

import MoTrPACSearch from '../Gene/MoTrPACSearch'


let processMapper: Record<string, any> = {
    'MoTrPACSearch': MoTrPACSearch,
}

const fetcher = async (endpoint: string) => {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (endpoint.includes('gene')) {
        return data;
    } else if (endpoint.includes('protein')) {
        // Transform the Metabolomics Workbench data into an array of strings
        if(data?.name)
            return [data?.name];
        return []
    } else if (endpoint.includes('refmet')) {
        // Transform the Metabolomics Workbench data into an array of strings
        if(data?.name)
            return [data?.name];
        return []
    }
    
    return [];
}
export default function MoTrPACInput(props: any) {
    console.log(props)

    const defaultVal = props.geneSymbol||props.protein||props.metabolite || ''
    const [searchTerm, setSearchTerm] = React.useState(defaultVal)

    const [term, setTerm] = React.useState(defaultVal)//working value
    const [submitted, setSubmitted] = React.useState(false)//exit statement
    const [ready, setReady] = React.useState(props.geneSymbol||props.protein||props.metabolite)//submit button

    const [selection, setSelection] = React.useState<string|null>("timewise")//timewise/training

    const [typeReady, setTypeReady] = React.useState(props.type)//for submit button
    const [typeSelected, setTypeSelected] = React.useState(props.type)//exit statement
    const [type, setType] = React.useState<string|null>(props.type||null)//gene protein metabolite
    const processName = props.process
    const Component = processMapper[processName || '']
    const { data, error, isLoading } = useSWRImmutable<string[]>(() => {
        if (term.length < 2) return null
        if (type === 'gene') return `https://maayanlab.cloud/Harmonizome/api/1.0/suggest?t=gene&q=${encodeURIComponent(term)}`
        else if (type === 'protein') return `https://www.metabolomicsworkbench.org/rest/protein/gene_symbol/${encodeURIComponent(term)}/all`
        else if (type === 'metabolite') return `https://www.metabolomicsworkbench.org/rest/refmet/name/${encodeURIComponent(term)}/name`
    }, fetcher)
    const items = React.useMemo(() => {
        let results = data ? levenSort(data, term).slice(0, 10).map((elt: string) => ({ value: elt, label: elt })) : [];
        if (term && results.length === 0) {
            results.push({ value: term, label: term});
        }
        return results;
    }, [data, term])

    const noOptionsMessage = (obj: { inputValue: string }) => {
        if (obj.inputValue.trim().length === 0) {
            return null
        }
        return 'No matching '+type+'s'
    }

    const handleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setTerm(inputText)
        }
    }

    const handlePlaceHolder = ()=>{
        if(type==='gene') return "ex: BRD2"
        if(type==='protein') return "ex: NP_001000006.1"
        if(type==='metabolite') return "ex: 8,9-EpETrE"
    }

    


    const [tissue, setTissue] = props.tissue? React.useState(props.tissue):React.useState("All")
    const [searchTissue, setSearchTissue] = props.tissue? React.useState(props.tissue):React.useState("All")
    const tissueList = [
        "All","Adrenal", "Blood RNA", "Brown Adipose", "Colon", "Cortex", "Gastrocnemius", "Heart", "Hippocampus", "Hypothalamus", "Kidney", "Liver", "Lung", "Ovaries", "Plasma", "Small Intestine", "Spleen", "Testes", "Vastus Lateralis", "Vena Cava", "White Adipose"
    ]
    const tissueItems = React.useMemo(() => {
        let results = tissueList ? levenSort(tissueList, tissue).slice(0, 10).map((elt: string) => ({ value: elt, label: elt })) : [];
        if (tissue && results.length === 0) {
            results.push({ value: tissue, label: tissue});
        }
        return results;
    }, [tissueList, tissue])
    const tissueHandleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setTissue(inputText)
        }
    }

    const tissueNoOptionsMessage = (obj: { inputValue: string }) => {
        if (obj.inputValue.trim().length === 0) {
            return null
        }
        return 'No matching tissues'
    }
    const [assay, setAssay] = props.assay? React.useState(props.assay):React.useState("All")
    const [searchAssay, setSearchAssay] = props.assay? React.useState(props.assay):React.useState("All")
    const assayListGene = [
        "All",
        "RNA-seq",
        "ATAC-seq",
        "RRBS",
        "Immunoassay",
        "Global Proteomics",
        "Phosphoproteomics",
        "Acetyl Proteomics",
        "Protein Ubiquitination",
        "Protein Ubiquitination"
      ]
    const assayItemsGene = React.useMemo(() => {
        let results = assayListGene ? levenSort(assayListGene, assay).slice(0, 10).map((elt: string) => ({ value: elt, label: elt })) : [];
        if (assay && results.length === 0) {
            results.push({ value: assay, label: assay});
        }
        return results;
    }, [assayListGene, assay])
    const assayListProtein = [
        "All",
        "Global Proteomics",
        "Phosphoproteomics",
        "Acetyl Proteomics",
        "Protein Ubiquitination",
      ]
    const assayItemsProtein = React.useMemo(() => {
        let results = assayListProtein ? levenSort(assayListProtein, assay).slice(0, 10).map((elt: string) => ({ value: elt, label: elt })) : [];
        if (assay && results.length === 0) {
            results.push({ value: assay, label: assay});
        }
        return results;
    }, [assayListProtein, assay])
    const assayListMetabolite = [
        "All",
        "Targeted Acyl-CoA",
        "Targeted Amines",
        "Targeted Ethanolamides",
        "Targeted Keto Acids",
        "Targeted Nucleotides",
        "Targeted Oxylipins",
        "Targeted Tricarboxylic Acid Cycle",
        "Untargeted HILIC-Positive",
        "Untargeted Ion-Pair Negative",
        "Untargeted Lipidomics Reversed-Phase Negative",
        "Untargeted Lipidomics Reversed-Phase Positive",
        "Untargeted Reversed-Phase Negative",
        "Untargeted Reversed-Phase Positive"
      ]
    const assayItemsMetabolite = React.useMemo(() => {
        let results = assayListMetabolite ? levenSort(assayListMetabolite, assay).slice(0, 10).map((elt: string) => ({ value: elt, label: elt })) : [];
        if (assay && results.length === 0) {
            results.push({ value: assay, label: assay});
        }
        return results;
    }, [assayListMetabolite, assay])
    const assayHandleInputChange = (inputText: string, meta: any) => {
        if (meta.action !== 'input-blur' && meta.action !== 'menu-close') {
            setAssay(inputText)
        }
    }

    const assayNoOptionsMessage = (obj: { inputValue: string }) => {
        if (obj.inputValue.trim().length === 0) {
            return null
        }
        return 'No matching assays'
    }

    const [pvalueHigh, setPvalueHigh] = React.useState<string>('')
    const pvalueHighHandleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPvalueHigh(event.target.value);
    };
    const [pvalueReady, setPvalueReady] = React.useState(false)
    React.useEffect(() => {
        setPvalueReady((!isNaN(Number(pvalueHigh.trim()))));
    }, [pvalueHigh]);

    return (
        <>
            {submitted ? (
                <>{React.createElement(Component, { ...props, term: searchTerm, selection: selection, type:type , tissue: searchTissue, assay: searchAssay, pvalueHigh:pvalueHigh})}</>
            ) : (
                <>

                    {typeSelected ? (
                        // Add the appropriate JSX or return value here for typeSelected being true
                        
                        <div className="w-1/2" style={{ width: '230px' }}>

                            <div className='text-center m-2 space-x-2'>
                                <div className="relative inline-block group">
                                    <button className={classNames('px-2 btn-sm', {'font-extrabold opacity-100 underline': selection === 'timewise'})} style={{userSelect: 'none'}} onClick={() => setSelection('timewise')}>Timewise</button>
                                    <div className="absolute -translate-x-1/3 bottom-full w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none">
                                        time-point-specific differential analytes
                                    </div>
                                    <QuestionMarkIcon fontSize='inherit' className=" -translate-x-2"/>

                                </div>



                                <div className="relative inline-block group">
                                    <button className={classNames('px-2 btn-sm', { 'font-extrabold opacity-100 underline': selection === 'training'})} style={{ userSelect: 'none' }} onClick={() => setSelection('training')}>Training</button>
                                    <div className="absolute -translate-x-1/3 bottom-full w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none">
                                        overall training differential analytes
                                    </div>


                                    <QuestionMarkIcon fontSize='inherit' className=" -translate-x-2"/>

                                </div>

                            </div>
                            <p style={{ margin: 0 , userSelect: 'none'}}>Enter {type}:</p>
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
                                className="w-auto"
                                options={items}
                                value={searchTerm ? { value: searchTerm, label: searchTerm } : null}
                                onInputChange={handleInputChange}
                                isLoading={isLoading}
                                filterOption={null}
                                noOptionsMessage={noOptionsMessage}
                                placeholder={handlePlaceHolder()}
                                onChange={(value: any, actions: any) => {


                                    if (actions.action == 'select-option') {
                                        setReady(true);
                                        setSearchTerm(value.value);
                                        setTerm(value.value)
                                    }
                                }}
                            />
                            <p style={{ margin: '10px 0 0 0', userSelect: 'none' }}>Filter by tissue:</p>
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
                                className="w-auto"
                                options={tissueItems}
                                value={{value: searchTissue, label: searchTissue}}
                                onInputChange={tissueHandleInputChange}
                                filterOption={null}
                                noOptionsMessage={tissueNoOptionsMessage}
                                placeholder={"All"}
                                onChange={(value: any, actions: any) => {


                                    if (actions.action == 'select-option') {
                                        setSearchTissue(value.value);
                                        setTissue(value.value);
                                    }
                                }}
                            />
                            <p style={{ margin: '10px 0 0 0', userSelect: 'none' }}>Filter by assay:</p>
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
                                className="w-auto"
                                options={type=='gene'? assayItemsGene:type=='protein'? assayItemsProtein:assayItemsMetabolite}
                                value={{value: searchAssay, label: searchAssay}}
                                onInputChange={assayHandleInputChange}
                                filterOption={null}
                                noOptionsMessage={assayNoOptionsMessage}
                                placeholder={"All"}
                                onChange={(value: any, actions: any) => {


                                    if (actions.action == 'select-option') {
                                        setSearchAssay(value.value);
                                        setAssay(value.value);
                                    }
                                }}
                            />
                            <p style={{ margin: '10px 0 0 0' , userSelect: 'none'}}>Filter by p-value:</p>
                            <input
                                type='text'
                                style={{
                                    borderRadius: 0,
                                    backgroundColor: '#5f6e85',
                                    color: 'white',
                                    width: '100%',
                                    border: pvalueReady ? '' : '2px solid red'
                                }}
                                className="focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block w-full px-2.5 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={pvalueHigh}
                                onChange={pvalueHighHandleInputChange}
                            />
                            <div className='text-center m-2 space-x-2'>
                                <button className = {classNames('px-2 btn-sm border rounded')} style={{ userSelect: 'none' }} onClick={() => {setTypeSelected(false); setReady(false); setSearchTerm(false); setTissue('All'); setSearchTissue('All'); setAssay('All'); setSearchAssay('All'); setTerm(null); setPvalueHigh(''); setPvalueReady(true)}} >Back</button>
                                <button className = {classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': ready&&pvalueReady })} style={{ userSelect: 'none' }} onClick={() => setSubmitted(true)} disabled={!ready||!pvalueReady}>Submit</button>
                            </div>
                        </div>
                    ) : (
                        <div >
                            <p style={{ margin: '0 0 0 0' , userSelect: 'none'}}>Select Input Type:</p>

                            <div className='text-center m-2 space-x-2'>
                                <button className = {classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': type=='gene' })} style={{ userSelect: 'none' }} onClick={() => {setType('gene'), setTypeSelected(true)}}>Gene</button>
                                <button className = {classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': type=='protein' })} style={{ userSelect: 'none' }} onClick={() => {setType('protein'), setTypeSelected(true)}}>Protein</button>
                                <button className = {classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': type=='metabolite' })} style={{ userSelect: 'none' }} onClick={() => {setType('metabolite'), setTypeSelected(true)}}>Metabolite</button>
                            </div>
                        </div>
  
                            
                    )}
                </>
            )}
        </>
    );
}