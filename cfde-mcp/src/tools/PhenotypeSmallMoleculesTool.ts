import { z } from "zod";
import { get_playbook_description } from "./utils.js";

const PhenotypeSmallMolecules = [
  "PhenotypeSmallMolecules",
  {
    title: "PhenotypeSmallMolecules",
    description: "Runs a client side function that returns find small molecules that are most likely to induce a given phenotype or biological process",
    inputSchema: {
        "phenotype": z.string().optional().describe("Phenotype to be analyzed.")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.array(z.string()).describe("Methods describing the workflow"),
        "phenotype": z.string().optional().nullable().describe("Phenotype to be analyzed.")
    }
  },
  async ({phenotype}: {phenotype: string}) => {
    const body = {
        "data": {
            "ac647b33-1312-0865-c3b1-0ec30840c28f": {
                "type": "Term[Pathway]",
                "value": phenotype
            }
        },
        "workflow": [
            {
                "id": "7fd69f96-85dc-68cb-61c9-077255221f05",
                "type": "Input[Pathway]",
                "data": {
                    "id": "ac647b33-1312-0865-c3b1-0ec30840c28f"
                }
            },
            {
                "id": "56f988e3-d6be-b2b6-daed-10c8f791a616",
                "type": "EnrichrTermSearch[Pathway]",
                "inputs": {
                    "term": {
                        "id": "7fd69f96-85dc-68cb-61c9-077255221f05"
                    }
                }
            },
            {
                "id": "72148de6-50ab-1ce6-5c8a-5f40b1febfd0",
                "type": "ExtractEnrichrTermSearch[MGI_Mammalian_Phenotype_Level_4_2019]",
                "inputs": {
                    "searchResults": {
                        "id": "56f988e3-d6be-b2b6-daed-10c8f791a616"
                    }
                }
            },
            {
                "id": "0fb63e8e-70bb-c841-b01b-68ce535375c1",
                "type": "EnrichrSetTToGMT[Phenotype]",
                "inputs": {
                    "enrichrset": {
                        "id": "72148de6-50ab-1ce6-5c8a-5f40b1febfd0"
                    }
                }
            },
            {
                "id": "6e708b71-ba56-1382-cef3-e15865e9eb53",
                "type": "GMTUnion",
                "inputs": {
                    "gmt": {
                        "id": "0fb63e8e-70bb-c841-b01b-68ce535375c1"
                    }
                }
            },
            {
                "id": "4915a324-2704-4e78-ee50-b41824943f46",
                "type": "SigComLINCSGeneSetSearch",
                "inputs": {
                    "genes": {
                        "id": "6e708b71-ba56-1382-cef3-e15865e9eb53"
                    }
                }
            },
            {
                "id": "85df101b-fe48-5145-0b60-76c0e4afe7cd",
                "type": "ExtractSigComLINCSGeneSetSearch[LINCS L1000 Chemical Perturbagens]",
                "inputs": {
                    "searchResults": {
                        "id": "4915a324-2704-4e78-ee50-b41824943f46"
                    }
                }
            },
            {
                "id": "17e0f3c8-778b-e4b6-08ac-3f8db370b87e",
                "type": "ExtractEnrichrTermSearch[KEGG_2021_Human]",
                "inputs": {
                    "searchResults": {
                        "id": "56f988e3-d6be-b2b6-daed-10c8f791a616"
                    }
                }
            },
            {
                "id": "86789631-1c23-0fd5-b991-abde941d5fcc",
                "type": "EnrichrSetTToGMT[Pathway]",
                "inputs": {
                    "enrichrset": {
                        "id": "17e0f3c8-778b-e4b6-08ac-3f8db370b87e"
                    }
                }
            },
            {
                "id": "62ccf69a-3194-da10-7f2e-76ab3848f731",
                "type": "GMTUnion",
                "inputs": {
                    "gmt": {
                        "id": "86789631-1c23-0fd5-b991-abde941d5fcc"
                    }
                }
            },
            {
                "id": "112be381-243e-bdee-28d1-5e69fd71e553",
                "type": "SigComLINCSGeneSetSearch",
                "inputs": {
                    "genes": {
                        "id": "62ccf69a-3194-da10-7f2e-76ab3848f731"
                    }
                }
            },
            {
                "id": "bae2fe50-250e-f712-c33e-a331faaf7a8d",
                "type": "ExtractEnrichrTermSearch[GO_Biological_Process_2021]",
                "inputs": {
                    "searchResults": {
                        "id": "56f988e3-d6be-b2b6-daed-10c8f791a616"
                    }
                }
            },
            {
                "id": "7d70271f-ee6d-4d90-5003-f680455308c2",
                "type": "EnrichrSetTToGMT[Pathway]",
                "inputs": {
                    "enrichrset": {
                        "id": "bae2fe50-250e-f712-c33e-a331faaf7a8d"
                    }
                }
            },
            {
                "id": "7cb48105-948a-af24-452f-76abd3f60205",
                "type": "GMTUnion",
                "inputs": {
                    "gmt": {
                        "id": "7d70271f-ee6d-4d90-5003-f680455308c2"
                    }
                }
            },
            {
                "id": "c3229ad6-880f-c66a-b493-2ff41622c7da",
                "type": "SigComLINCSGeneSetSearch",
                "inputs": {
                    "genes": {
                        "id": "7cb48105-948a-af24-452f-76abd3f60205"
                    }
                }
            },
            {
                "id": "4e5f6cf3-8175-4800-dc9d-fd021a7a9cf4",
                "type": "ExtractSigComLINCSGeneSetSearch[LINCS L1000 Chemical Perturbagens]",
                "inputs": {
                    "searchResults": {
                        "id": "112be381-243e-bdee-28d1-5e69fd71e553"
                    }
                }
            },
            {
                "id": "d7bc7f03-c05d-6d7d-56b5-37bce6a18d6f",
                "type": "ExtractSigComLINCSGeneSetSearch[LINCS L1000 Chemical Perturbagens]",
                "inputs": {
                    "searchResults": {
                        "id": "c3229ad6-880f-c66a-b493-2ff41622c7da"
                    }
                }
            },
            {
                "id": "023f83a8-a124-e755-f7c4-18273fea5271",
                "type": "MeanScoredT[Drug]",
                "inputs": {
                    "scored:0": {
                        "id": "85df101b-fe48-5145-0b60-76c0e4afe7cd"
                    },
                    "scored:1": {
                        "id": "4e5f6cf3-8175-4800-dc9d-fd021a7a9cf4"
                    },
                    "scored:2": {
                        "id": "d7bc7f03-c05d-6d7d-56b5-37bce6a18d6f"
                    }
                }
            },
            {
                "id": "f0bd5771-7533-5e3a-61ce-28f259b09186",
                "type": "FilterFDAApprovedDrugs[Scored[Drug]]",
                "inputs": {
                    "drugs": {
                        "id": "023f83a8-a124-e755-f7c4-18273fea5271"
                    }
                }
            }
        ],
        "metadata": {
            "id": "492efde0-c90e-14a8-7859-e3d618f6f261",
            "title": "Use Case 5: Small Molecules to Induce a Biological Process",
            "description": "We identify genes associated with a biological process from human, mouse phenotypes, KEGG pathways and GO gene set libraries. We then find Consensus LINCS compounds which upregulate these genes resulting in a ranked listing of drug candidates for inducing the biological process.",
            "summary": "auto",
            "gpt_summary": ""
        }
    }
    const methods = await get_playbook_description(body)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "PhenotypeSmallMolecules",
              inputType: "PhenotypeInput",
              methods: methods.usability_domain || [],
              phenotype
          })
        }
      ],
      structuredContent: {
          function: "PhenotypeSmallMolecules",
          inputType: "PhenotypeInput",
          methods: methods.usability_domain || [],
          phenotype
      }
    }
  }
]


export default PhenotypeSmallMolecules;