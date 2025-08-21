'use client'
import { Box, Button, LinearProgress, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { CFDELibraryOptions, GMTSelect } from "./GMTSelect";
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { fetchCrossPairs, generateHypothesis, fetchCrossUserSets } from "./GMTCrossFunctions";
import CircularIndeterminate from "./misc/Loading";
import { copyToClipboard } from "./misc/helper";
import { CFDECrossPair } from ".prisma/client/gsc";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RenderGeneSet1, RenderGeneSet2, RenderOverlapButton } from "./TableButtons";
import { CrossingTable } from "./CrossingTable";
import { DCCIcons } from "./misc/DCCIconBtn";
import { GeneSetSelect } from "./misc/GenesetSelect"
import {Gene, GeneSet} from '.prisma/client/gsc'


type hypothesisDisplay = {
    geneset1: string,
    geneset2: string,
    library1: string,
    library2: string,
    hypothesis: string,
    abstract1: string,
    abstract2: string,
    enrichedTerms: string[]
    topEnrichmentResults: { [key: string]: any[] } | null
}



const download = (filename: string, text: string) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


const CFDELibHeaders: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS Chemical Pertubations",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": "LINCS Genetic Pertubations",
    "GTEx_Tissues": 'GTEX Tissues',
    "GTEx_Aging_Sigs": 'GTEX Aging Signatures',
    "Metabolomics_Workbench_Metabolites": 'Metabolites',
    "IDG_Drug_Targets": 'IDG Drugs',
    "GlyGen_Glycosylated_Proteins": 'Glycans',
    "KOMP2_Mouse_Phenotypes": 'Phenotypes',
    "MoTrPAC": 'MoTrPAC Gene Sets',
    "HubMAP_Azimuth_2023_Augmented": 'Cells'
}

const CFDE_Lib_Full: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS L1000 Chemical Pertubations Consensus Signatures",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": "LINCS L1000 CRISPR Knockout Consensus Signatures",
    "GTEx_Tissues": 'GTEx Tissue Gene Expression Profiles',
    "GTEx_Aging_Sigs": 'GTEx Aging Signatures',
    "Metabolomics_Workbench_Metabolites": 'Metabolomics Workbench Metabolites',
    "IDG_Drug_Targets": 'IDG Drug Targets',
    "GlyGen_Glycosylated_Proteins": 'GlyGen Glycosylated Proteins',
    "KOMP2_Mouse_Phenotypes": 'KOMP2 Mouse Phenotypes',
    "MoTrPAC": 'MoTrPAC Rat Endurance Exercise Training',
    "HubMAP_Azimuth_2023_Augmented": 'Human BioMolecular Atlas Program Azimuth'
}

const sortDict = (dict: { [key: string]: number[][] }) => {
    let items: any[] = []
    for (let term of Object.keys(dict)) {
        const termValues = dict[term]
        for (let termOccurence of termValues) {
            items.push([term, termOccurence])
        }
    }
    // Sort the array based on the first number in the value (starting index) element
    items.sort(
        (first: any, second: any) => { return first[1][1] - second[1][1] }
    );
    return items
}


export const generateHypothesisTooltip = (hypothesisString: string, substringIndices: { [key: string]: number[][] }, topEnrichmentResults: { [key: string]: any[] }) => {
    let prevStart = 0;
    const splittedStrings = [];
    for (let term of sortDict(substringIndices)) {
        let termWords = term[0]
        let termStart = term[1][0]
        let termEnd = term[1][1]
        splittedStrings.push(<Typography display="inline">{hypothesisString.substring(prevStart, termStart)}</Typography>);
        splittedStrings.push(
            <>
                <Tooltip title={
                    <React.Fragment>
                        <Typography color="inherit"> Enrichment Analysis</Typography>
                        Library: {topEnrichmentResults[termWords][9]}
                        <br></br>
                        Rank: {topEnrichmentResults[termWords][0]}
                        <br></br>
                        P-value: {topEnrichmentResults[termWords][2].toExponential(2)}
                        <br></br>
                        Odds Ratio: {topEnrichmentResults[termWords][3].toFixed(4)}
                    </React.Fragment>
                } placement="right" >
                    <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                        {hypothesisString.substring(termStart, termEnd)}
                    </Typography>
                </Tooltip>
                {" "}
                <Typography color='black' display="inline">
                    ({topEnrichmentResults[termWords][9]}, p = {topEnrichmentResults[termWords][2].toExponential(2)} )
                </Typography>
            </>
        )
        prevStart = termEnd
    }
    splittedStrings.push(<Typography display="inline">{hypothesisString.substring(prevStart)}</Typography>);
    return <React.Fragment>
        {splittedStrings}
    </React.Fragment>
}


export function GMTCrossLayout({ sessionInfo }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
}) {
    // get query parameters
    const searchParams = useSearchParams()
    const library1 = searchParams.get('lib1')
    const library2 = searchParams.get('lib2')

    const [rows, setRows] = React.useState<CFDECrossPair[]>([])
    const [selectedLibs, setSelectedLibs] = React.useState<string[]>(['', ''])
    const [selectedDCCs, setSelectedDCCs] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)
    const [hypLoading, setHypLoading] = React.useState(false)
    const [hypothesis, setHypothesis] = React.useState<hypothesisDisplay | null>(null)
    const [headers, setHeaders] = React.useState<string[] | null>(null)
    const [crossUserSets, setCrossUserSets] = React.useState(false)
    const [checked, setChecked] = React.useState<number[]>([]);

    const selectedSets = React.useMemo(() => {
        const typedSets = sessionInfo ? sessionInfo.gene_sets : []
        const checkedSets = typedSets.filter((set, index) => checked.includes(index))
        return checkedSets
    }, [checked, sessionInfo?.gene_sets])


    const params = useParams<{ id: string }>()
    const sessionId = params.id
    const router = useRouter();

    const createQueryString = React.useCallback((name: string, value: string) => {
        const params = new URLSearchParams();
        params.set(name, value);
        return params.toString();
    }, []);


    React.useEffect(() => {
        if ((library1 !== null) && (library2 !== null)) {
            setSelectedLibs([library1, library2])
            if (library1 == 'user_sets' && sessionInfo != null) {
                setCrossUserSets(true)
            }
            setSelectedDCCs([CFDELibraryOptions[library1], CFDELibraryOptions[library2]])
            setHypothesis(null)
            if (library1 != 'user_sets') {
                setLoading(true)
                fetchCrossPairs(library1, library2).then((result) => {
                    setLoading(false);
                    if (result != null) {
                        setRows(result);
                        setHeaders([CFDELibHeaders[result[0].lib_1], CFDELibHeaders[result[0].lib_2]])
                    }
                }).catch((err) => setLoading(false))
            }
        }
    }, [])

    const getCrossData = React.useCallback(() => {
        router.push("/data/gmt_crossing/" + "?" + createQueryString("lib1", selectedLibs[0]) + "&" + createQueryString("lib2", selectedLibs[1]));
        setHypothesis(null)
        setLoading(true)
        if (selectedLibs.length === 2 && selectedLibs[0] == 'user_sets' && selectedLibs[1] != '' && sessionInfo != null) {       
            const setsDict: Record<string, Array<string>> = {}
            selectedSets.map(set => {
                if (set.genes.length > 0) {
                    const geneArray = set.genes.map(g => g.gene_symbol)
                    setsDict[set.name] = geneArray
                }
            })
            if (Object.entries(setsDict).length === 0) return
            fetchCrossUserSets(setsDict, selectedLibs[1]).then((result) => {
                setLoading(false)
                setRows(result)
                setHeaders(["Selected Sets", CFDELibHeaders[selectedLibs[1]]])
            })

        } else if (selectedLibs.length === 2 && selectedLibs[0] !== '' && selectedLibs[1] !== '' && selectedLibs[0] != 'user_sets') {
            fetchCrossPairs(selectedLibs[0], selectedLibs[1]).then((result) => {
                setLoading(false);
                setRows(result);
                setHeaders([CFDELibHeaders[result[0].lib_1], CFDELibHeaders[result[0].lib_2]])
            }).catch((err) => setLoading(false))
        }
    }, [selectedLibs, checked, sessionInfo, selectedSets])

    const RenderHypothesisButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        return (
            <React.Fragment>
                <Button
                    color="tertiary"
                    size="small"
                    variant="contained"
                    sx={{ margin: 2 }}
                    onClick={(evt) => {
                        setHypothesis(null)
                        setHypLoading(true)
                        generateHypothesis(params.row).then((response) => {
                            setHypLoading(false);
                            if (response.status === 200) {
                                const hypothesisDisplayObject = {
                                    geneset1: params.row.geneset_1,
                                    geneset2: params.row.geneset_2,
                                    library1: CFDE_Lib_Full[params.row.lib_1],
                                    library2: CFDE_Lib_Full[params.row.lib_2],
                                    hypothesis: response.response.hypothesis,
                                    abstract1: response.response.abstract1,
                                    abstract2: response.response.abstract2,
                                    enrichedTerms: response.response.enrichedTerms,
                                    topEnrichmentResults: response.response.topEnrichmentResults
                                }
                                setHypothesis(hypothesisDisplayObject)
                            }
                        }).catch((err) => { setHypLoading(false); })
                    }}
                >
                    <Typography sx={{ fontSize: 10, textWrap: 'wrap' }}>
                        GPT-4o Hypothesis
                    </Typography>
                </Button>
            </React.Fragment>
        )
    }

    const columns: GridColDef[] = [
        {
            field: 'geneset_1',
            headerName: headers ? headers[0] : 'Geneset 1',
            flex: 1,
            minWidth: 120,
            headerClassName: 'theme--header',
            renderCell: params => {
                return <RenderGeneSet1 params={params} sessionId={sessionId} />
            },
            headerAlign: 'center',
        },
        {
            field: 'geneset_2',
            headerName: headers ? headers[1] : 'Geneset 2',
            flex: 1,
            minWidth: 120,
            renderCell: params => {
                return <RenderGeneSet2 params={params} sessionId={sessionId} />
            },
            headerAlign: 'center',
        },
        {
            field: 'pvalue',
            headerName: 'P-Value',
            flex: 0.5,
            minWidth: 100,
            renderCell: (params) => {
                return (params.value.toExponential(2));
            },
            headerAlign: 'center',
        },
        {
            field: 'odds_ratio',
            headerName: 'Odds',
            flex: 0.5,
            minWidth: 100,
            renderCell: (params) => {
                if (params.value === 999999999999999.99) {
                    return 'inf'
                } else {
                    return (params.value.toFixed(4));
                }
            },
            headerAlign: 'center',
        },
        {
            field: 'overlap',
            headerName: 'Overlap',
            flex: 0.3,
            minWidth: 100,
            renderCell: params => {
                return <RenderOverlapButton params={params} sessionId={sessionId} />
            },
            headerAlign: 'center',
            type: 'number',
            sortComparator: (v1, v2) => parseInt(v1.length) - parseInt(v2.length)
        },
        {
            field: 'hypothesis',
            headerName: 'Form Hypothesis with GPT-4o',
            flex: 0.5,
            minWidth: 100,
            renderCell: RenderHypothesisButton,
            sortable: false,
            editable: false,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
        },
    ];

    const enrichedTermsIndices = React.useMemo(() => {
        if (hypothesis) {
            let indices: { [key: string]: number[][] } = {}
            for (let term of hypothesis.enrichedTerms) {
                let startIndex = 0
                while ((hypothesis.hypothesis.indexOf(term, startIndex)) > -1) {
                    let index = hypothesis.hypothesis.indexOf(term, startIndex)
                    let oldTermValues: number[][];
                    (term in indices) ? oldTermValues = indices[term] : oldTermValues = []
                    indices[term] = [...oldTermValues, [index, index + term.length]];
                    startIndex = index + term.length;
                }
            }
            return indices
        }
        return null
    }, [hypothesis])

    return (
        <Stack direction="column" spacing={3} sx={{ marginBottom: 3, justifyContent: 'center', textAlign: 'center' }}>
            {/* <div className="flex justify-center">
            <Button className="mx-auto justify-center" variant="contained" sx={{width: "170px"}} disabled={sessionInfo == null} 
            onClick={() => {
                
                if (crossUserSets) {
                    setSelectedLibs(['', selectedLibs[1]])
                    setSelectedDCCs(['', selectedDCCs[1]])
                } else {
                    setSelectedLibs(['user_sets', selectedLibs[1]])
                    setSelectedDCCs(['user', selectedLibs[1]])
                }
                
                setCrossUserSets(!crossUserSets)
                }}>{crossUserSets ? "Cross CFDE GMTs" : "Cross Session Sets"}
            </Button>
            </div> */}
            <DCCIcons selected={selectedDCCs} setSelected={setSelectedDCCs} selectedLibs={selectedLibs} setSelectedLibs={setSelectedLibs} />
            <Stack direction='row' spacing={2}>
                <div className="w-1/2 items-center">
                { (crossUserSets && sessionInfo !== null) ? 
                    <>
                    <GeneSetSelect sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} selectedSets={selectedSets} />
                    </> 
                    : 
                    <GMTSelect selectedLibs={selectedLibs} setSelectedLibs={setSelectedLibs} index={0} selectedDCCs={selectedDCCs} setSelectedDCCs={setSelectedDCCs} />
                }
                </div>
                <div className="flex w-1/2 items-center">
                <GMTSelect selectedLibs={selectedLibs} setSelectedLibs={setSelectedLibs} index={1} selectedDCCs={selectedDCCs} setSelectedDCCs={setSelectedDCCs} />
                </div>
            </Stack>
            <div className="flex justify-center">
                <Button variant="contained" color="secondary" onClick={getCrossData}>
                    <ShuffleIcon sx={{ fontsize: 100 }} />
                </Button>
                {loading && <CircularIndeterminate />}
            </div>
            {hypothesis !== null &&
                <Paper elevation={1} sx={{
                    width: '100%',
                    minHeight: '100px',
                    textAlign: "left"
                }}>
                    <Stack direction='column' sx={{ padding: 2 }}>
                        <Box justifyContent={'flex-end'}>
                            <Button color="secondary" onClick={(evt) => copyToClipboard(
                                `geneset 1: ${hypothesis.geneset1} \n
                                geneset 2: ${hypothesis.geneset2} \n
                                library 1: ${hypothesis.library1}\n
                                library 2: ${hypothesis.library2}\n
                                hypothesis:${hypothesis.hypothesis} 
                                `
                            )}><ContentPasteIcon /></Button>
                            <Button color="secondary" onClick={(evt) => {
                                download('gpt-hypothesis',
                                    `Geneset 1: ${hypothesis.geneset1}\n
                                Geneset 2: ${hypothesis.geneset2}\n
                                Library 1: ${hypothesis.library1}\n
                                Library 2: ${hypothesis.library2}\n
                                Hypothesis:${hypothesis.hypothesis} 
                            `)
                            }}><DownloadIcon /></Button>
                        </Box>
                        <Box>
                            <Typography>
                                <strong>GENE SET 1: </strong>
                                <Tooltip title={
                                    <React.Fragment>
                                        <Typography color="inherit"> Abstract for {hypothesis.geneset1}</Typography>
                                        {hypothesis.abstract1}
                                    </React.Fragment>
                                } placement="right">
                                    <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                                        {hypothesis.geneset1}
                                    </Typography>
                                </Tooltip>
                            </Typography>
                        </Box>
                        <Box>
                            <Typography>
                                <strong>GENE SET 2: </strong>
                                <Tooltip title={
                                    <React.Fragment>
                                        <Typography color="inherit"> Abstract for {hypothesis.geneset2}</Typography>
                                        {hypothesis.abstract2}
                                    </React.Fragment>
                                } placement="right">
                                    <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                                        {hypothesis.geneset2}
                                    </Typography>
                                </Tooltip>
                            </Typography>
                        </Box>
                        <Box><Typography><strong>LIBRARY 1:</strong> {hypothesis.library1}</Typography></Box>
                        <Box><Typography><strong>LIBRARY 2:</strong> {hypothesis.library2}</Typography></Box>
                        <Box>
                            <Typography>
                                <strong>HYPOTHESIS: </strong>
                            </Typography>
                            {enrichedTermsIndices && hypothesis.topEnrichmentResults && generateHypothesisTooltip(hypothesis.hypothesis, enrichedTermsIndices, hypothesis.topEnrichmentResults)}
                        </Box>
                    </Stack>
                </Paper>}
            {hypLoading && <Box sx={{ width: '100%' }}>
                <LinearProgress color="secondary" />
            </Box>}
            {(rows.length > 0) && <Box style={{ width: '100%' }} >
                <CrossingTable rows={rows} columns={columns} />
            </Box>}
        </Stack>
    )
}