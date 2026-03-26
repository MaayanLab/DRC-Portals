import { symbol, z } from "zod";
import { get_playbook_description } from "./utils.js";

const DeepDiveGeneSummary = [
  "DeepDiveGeneSummary",
  {
    title: "DeepDiveGeneSummary",
    description: "Takes a single gene as an input it then extracts the top 50 most cited articles co-mentioning the gene in PubMed and creates a summary article of the gene based on those articles.",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol"),
        "methods": z.array(z.string()).describe("Methods describing the workflow"),
        "output": z.object({
                    result: z.object({
                      data: z.object({
                        symbol: z.string().describe("Gene name"),
                        name: z.string().describe("Gene long name"),
                        description: z.string().describe("NCBI Gene Description"),
                        deepdive_gpt4o_description: z.string().describe("GPT4 Summary"),
                        deepdive_gemini_description: z.string().describe("Gemini Summary"),
                      })
                    })
                  }).describe("Summaries returned by Deepdive"),
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    const body = {
        workflow: [
        { id: '1', type: 'Input[Gene]', data: { type: 'Term[Gene]', value: geneSymbol } },
        { id: '2', type: 'GeneDeepDive', inputs: { gene: { id: '1' } } },
        ],
        metadata: {
          title: 'Gene Deep Dive Summary',
        },
    }
    const methods = await get_playbook_description(body)
    const res = await fetch(`https://gsfm.maayanlab.cloud/api/trpc/gene_info?input="${geneSymbol}"`)
    const output = await res.json()
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "DeepDiveGeneSummary",
              inputType: "GeneInput",
              methods: methods.usability_domain || [],
              geneSymbol,
              output
          })
        }
      ],
      structuredContent: {
          function: "DeepDiveGeneSummary",
          inputType: "GeneInput",
          methods: methods.usability_domain || [],
          geneSymbol,
          output
      }
    }
  }
]


export default DeepDiveGeneSummary;