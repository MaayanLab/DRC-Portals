'use server'
import prisma from '@/lib/prisma/gsc';
import cache from './cache';
import axios from 'axios';

export type PairsData = {
    id: number,
    geneset1: string,
    geneset2: string,
    overlappingGenes: string[],
    pvalue: string
    jIndex: string
}


const libMap: { [key: string]: string } = {
    'LINCS L1000 CMAP Chemical Pertubation Consensus Signatures': 'LINCS_L1000_Chem_Pert_Consensus_Sigs',
    'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures': 'LINCS_L1000_CRISPR_KO_Consensus_Sigs',
    'GTEx Tissue Gene Expression Profiles': 'GTEx_Tissues',
    'GTEx Tissue-Specific Aging Signatures': 'GTEx_Aging_Sigs',
    'Metabolomics Gene-Metabolite Associations': 'Metabolomics_Workbench_Metabolites',
    'IDG Drug Targets': 'IDG_Drug_Targets',
    'Glygen Glycosylated Proteins': 'GlyGen_Glycosylated_Proteins',
    'KOMP2 Mouse Phenotypes': 'KOMP2_Mouse_Phenotypes',
    'Human BioMolecular Atlas Program Azimuth': 'HubMAP_Azimuth_2023_Augmented',
    'MoTrPAC Rat Endurance Exercise Training': 'MoTrPAC'
}


export async function fetchCrossPairs(lib1: string, lib2: string) {
    const rows = await prisma.cFDECrossPair.findMany({
        where: {
            lib_1: libMap[lib1],
            lib_2: libMap[lib2]
        }
    });
    if (rows.length === 0) {
        const rows = await prisma.cFDECrossPair.findMany({
            where: {
                lib_1: libMap[lib2],
                lib_2: libMap[lib1]
            }
        })
        return rows
    }
    return rows
}

export async function fetchGenes(term: string) {
    const result = await prisma.cfdegeneset.findFirst({
        where: {
            term: term
        },
        select: {
            GeneTocfdegeneset: {
                include: {
                    genes: true
                }
            }
        },
    })

    if (result) {
        const genesStringList = result.GeneTocfdegeneset.map((g2gs) => g2gs.genes.gene_symbol)
        return genesStringList
    } else {
        return []
    }

}

export async function getEnrichmentTerms(overlapGenes: string[]) {
    const ENRICHR_URL = 'https://maayanlab.cloud/Enrichr/addList'
    const genesString = overlapGenes.toString().split(',').join('\n').replaceAll("'", '')
    const { data } = await axios.post(ENRICHR_URL, {
        'list': genesString,
        'description': ''
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    )
    const userListId = data.userListId
    const libraries = ['WikiPathway_2023_Human', 'GWAS_Catalog_2023', 'GO_Biological_Process_2023', 'MGI_Mammalian_Phenotype_Level_4_2021',]
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let enrichedTerms: string[] = []
    let topEnrichmentResults: { [key: string]: any[] } = {}
    for (let lib of libraries) {
        const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
        if (response.status === 200) {
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 5)
            for (let termInd in topResults) {
                const termResults = topResults[termInd]
                const term = topResults[termInd][1]
                topEnrichmentResults[term] = [...termResults, lib]
                enrichedTerms.push(term)
            }
        } else {
            await sleep(10)
            const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 5)
            for (let termInd in topResults) {
                const termResults = topResults[termInd]
                const term = topResults[termInd][1]
                topEnrichmentResults[term] = [...termResults, lib]
                enrichedTerms.push(term)
            }
        }
    }
    return { enrichedTerms: enrichedTerms, topEnrichmentResults: topEnrichmentResults }
}

export async function getSpecifiedAbstracts(term1: string, term2: string, abstract1: string, abstract2: string) {
    const input = `
    There are two gene sets that highly overlap. Use each term provided for each gene set template to create a 
    specified abstract for that gene set based on its given abstract template. 
    Term for gene set 1: ${term1}
    Term for gene set 1: ${term2}
    Abstract template for gene set 1: ${abstract1}
    Abstract template for gene set 2: ${abstract2}
    Ignore the word GTEx if it appears in the term of a gene set. 
    The response should only include the specified abstracts for both gene sets in the form ["abstract1", "abstract2"] 
    where each abstract is a string containing the specified abstracts with no extra words/characters.
    `
    try {
        const cachedAbstracts = cache.get(term1 + term2 + abstract1 + abstract2);
        if (cachedAbstracts === undefined) {
            const openaiKey = process.env.OPENAI_API_KEY
            if (!openaiKey) throw new Error('no OPENAI_API_KEY')
            const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { "role": "system", "content": "You are a biologist who attempts parse a term and create a specified abstract based on an abstract template" },
                        { "role": "user", "content": input }
                    ],
                    // max_tokens: 20,
                    temperature: 0
                })
            })
            const tagLineParsed = await tagLine.json()
            const abstracts: string = tagLineParsed.choices[0].message.content
            const success = cache.set(term1 + term2 + abstract1 + abstract2, abstracts, 600000)
            return {
                response: abstracts,
                status: 200,
            }
        } else {
            return {
                response: cachedAbstracts ? cachedAbstracts as string : '',
                status: 200,
            }
        }


    } catch (error) {
        console.log("Issue with OpenAI call", error)
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
        }
    }
}


export async function generateHypothesis(row: any) {
    const enrichedResults = await getEnrichmentTerms(row.overlap)
    const enrichedTerms = enrichedResults.enrichedTerms
    const topEnrichmentResults = enrichedResults.topEnrichmentResults
    row.lib_1 = (row.lib_1 === "HubMAP_Azimuth_2023_Augmented") ? "HubMAP_Azimuth_2023_Augmented-" + row.geneset_1.substring(0, row.geneset_1.indexOf('-')) : row.lib_1
    row.lib_2 = (row.lib_2 === "HubMAP_Azimuth_2023_Augmented") ? "HubMAP_Azimuth_2023_Augmented-" + row.geneset_2.substring(0, row.geneset_2.indexOf('-')) : row.lib_2
    const abstract1 = await prisma.libAbstracts.findFirst({
        where: {
            lib: row.lib_1
        },
        select: {
            abstract: true
        }
    })

    const abstract2 = await prisma.libAbstracts.findFirst({
        where: {
            lib: row.lib_2
        },
        select: {
            abstract: true
        }
    })

    const term1= row.geneset_1
    const term2 = row.geneset_2
    const overlapGeneSet = row.overlap
    if ((abstract1 === null) || (abstract2 === null) ) throw new Error('templates not found')
    const abstractsResponse = await getSpecifiedAbstracts(term1, term2, abstract1.abstract, abstract2.abstract)
    if (abstractsResponse.status === 1) throw new Error('Could not parse abstracts')
    const abstractsList = JSON.parse(abstractsResponse.response)

    const input = `
    There are two gene sets that highly overlap. Performing enrichment 
    analysis on the overlapping genes shows that many of them are related to 
    the following biological pathways: ${enrichedTerms.toString()}. 
     Hypothesize why a high overlap between the gene sets exists
    based on specified abstracts of each gene set that explains 
    how each gene set was created, the overlapping genes between 
    both gene sets, and the biological pathways that the overlapping 
    genes are related to based on the gene set enrichment analysis results.
    Make sure to incorporate the enrichment analysis results in 
    your response in a meaningful way. For each enrichment term 
    that appears in your response, the term should appear in the 
    exact form it was given to you (do not exclude any words or 
    characters from a term. For example, Complement And Coagulation 
    Cascades WP558 should appear as Complement And Coagulation 
    Cascades WP558, not Complement And Coagulation Cascades).
    Specified Abstracts for gene sets: ${abstractsList}
    The overlapping genes are ${overlapGeneSet.toString().replaceAll("'", '')}
    Do not include 'Hypothesis: ' at the beginning of your response and please
    mesh the enrichment analysis results seamlessly into the explanation in a 
    paragraph like format. Limit your response to about 12 sentences.
    `
    try {
        const cachedHypothesis = cache.get( term1+term2 );
        if ( cachedHypothesis === undefined ){
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('no OPENAI_API_KEY')
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { "role": "system", "content": "You are a biologist who attempts to create a hypothesis about why two gene sets, which are lists of genes, may have a high overlap" },
                    { "role": "user", "content": input }
                ],
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const hypothesis: string = tagLineParsed.choices[0].message.content
        const success = cache.set(term1+term2, hypothesis, 600000 )
        return {
            response: {hypothesis: hypothesis, abstract1: abstractsList[0], abstract2: abstractsList[1], enrichedTerms: enrichedTerms, topEnrichmentResults: topEnrichmentResults},
            status: 200
        }
    } else {
        return {
            response: {hypothesis: cachedHypothesis ? cachedHypothesis as string : '', abstract1: abstractsList[0], abstract2: abstractsList[1],  enrichedTerms: enrichedTerms, topEnrichmentResults: topEnrichmentResults},
            status: 200
        }
    }
    } catch {
        return {
            response: {hypothesis: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes", abstract1: '', abstract2: '',  enrichedTerms: [], topEnrichmentResults: null},
            status: 1
        }
    }
}

export async function fetchCrossUserSets(user_sets: Record<string, Array<string>>, cfde_lib: string) {
    
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 

    const req = await fetch(API_BASE_URL + '/api/cross_user_set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            'user_sets': user_sets,
            'cfde_lib': cfde_lib
         }),
    })
    if (req.ok) {
        const reqJson = await req.json()
        return reqJson['cross_result']
    }
}