import { z } from "zod";
import { fetch_playbook, get_playbook_description } from "./utils.js";

const ARCHS4GeneExpression = [
  "ARCHS4GeneExpression",
  {
    title: "ARCHS4GeneExpression",
    description: "Runs a client side function that returns z-scored gene expression across tissues from ARCHS4. Takes a single gene as an input",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "input": z.string().optional().nullable().describe("Gene symbol"),
        "methods": z.array(z.string()).describe("Methods describing the workflow"),
        "id": z.string(),
        "output": z.array(z.looseObject({
                    id: z.string(),
                  })).describe("Analysis returned by the Playbook Workflow Builder"),
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    const body = {
        workflow: [
        { id: '1', type: 'Input[Gene]', data: { type: 'Term[Gene]', value: geneSymbol } },
        { id: '2', type: 'ARCHS4TissueExpression', inputs: { gene: { id: '1' } } },
        { id: '3', type: 'BarplotFrom[Scored[Tissue]]', inputs: { terms: { id: '2' } } },
        ],
        metadata: {
        title: 'ARCHS4 Median Tissue Expression',
        },
    }
    const {id, methods, output} = await fetch_playbook(body)
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "ARCHS4GeneExpression",
              inputType: "GeneInput",
              methods: methods.usability_domain || [],
              id,
              output,
              geneSymbol
          })
        }
      ],
      structuredContent: {
          function: "ARCHS4GeneExpression",
          inputType: "GeneInput",
          methods: methods.usability_domain || [],
          geneSymbol,
          id,
          output
      }
    }
  }
]


export default ARCHS4GeneExpression;