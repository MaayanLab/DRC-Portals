import { Grid, Paper} from "@mui/material"
import Explorer from "./explorer"
import Carousel from '@/components/misc/Carousel/ServerCarousel'
import Image from "@/utils/image"
import Link from "next/link"
import Icon from "@mdi/react"
import { mdiDna, mdiEye, mdiEyedropper, mdiFlask, mdiHumanMaleHeightVariant, mdiListBox, mdiPill, mdiVirus } from "@mdi/js"
import { Search } from "./search_page"
import prisma from "@/lib/prisma"
import { blue, green, lime, orange, teal, purple } from "@mui/material/colors"
import Summary from "@/app/data/processed/SummaryComponent"

const ui_elements: {[key: string]: {color: string, icon_color: string, icon: string}} = {
  gene: {
    color: green[100],
    icon_color: green[900],
    icon: mdiDna
  },
  variant: {
    color: green[200],
    icon_color: green[900],
    icon: mdiDna
  },
  protein: {
    color: green[100],
    icon_color: green[900],
    icon: mdiDna
  },
  gene_set: {
    color: purple[100],
    icon_color: purple[900],
    icon: mdiListBox,
  },
  phenotype: {
    color: orange[100],
    icon_color: orange[900],
    icon: mdiHumanMaleHeightVariant,
  },
  anatomy: {
    color: teal[100],
    icon_color: teal[900],
    icon: mdiEye,
  },
  assay_type: {
    color: blue[100],
    icon_color: blue[900],
    icon: mdiFlask
  },
  assay: {
    color: blue[100],
    icon_color: blue[900],
    icon: mdiFlask
  },
  drug: {
    color: lime[100],
    icon_color: lime[900],
    icon: mdiPill
  },
  compound: {
    color: lime[100],
    icon_color: lime[900],
    icon: mdiPill
  },
  metabolite: {
    color: lime[100],
    icon_color: lime[900],
    icon: mdiEyedropper
  },
  "disease or phenotype": {
    color: orange[100],
    icon_color: orange[900],
    icon: mdiVirus,
  },
  disease: {
    color: orange[100],
    icon_color: orange[900],
    icon: mdiVirus,
  }
}

export default async function Page({searchParams}: {
  searchParams: {q: string, search?: boolean}
}) {
  if (searchParams.q === undefined || searchParams.search === undefined) {
    const publications = await prisma.publication.findMany({
        orderBy: {
          year: "desc"
        },
        take: 9
      })
    const query: {[key:string]: string[] | {[key:string]: {
      up_gene_set_id?: number,
      down_gene_set_id?: number,
      gene_set_id?: number
    }}} = JSON.parse(searchParams.q || '{}')
    return (
      <Grid container spacing={2} alignItems={"flex-start"}>
        <Grid item xs={12}>
            <Explorer input_query={query}/>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{
                  boxShadow: "none", 
                  padding: 5, 
                  background: "#E7F3F5",
                  width: "100vw", 
                  marginLeft: "calc((-100vw + 100%) / 2)", 
                  marginRight: "calc((-100vw + 100%) / 2)",
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hide",
                  marginTop: 5
                }}
              className="flex"
          >
            <Summary include={['file', 'kg_assertion', 'gene', 'gene_set', 'compound']} />
          </Paper>
        </Grid>
      </Grid>
    )
  } else {
    const query: {[key:string]: string[] | {[key:string]: {
      [key:string]: number,
      
    }}} = JSON.parse(searchParams.q || '{}')
    const inputList:{entity: string, label: string, icon_color: string, color: string, icon: string, values?: {[key: string]: number}, links?: {resource: string, description: string, link: string}[]}[] = []
    for (const [entity, v] of Object.entries(query)) {
      const {color, icon, icon_color} = ui_elements[entity]
      if (entity === 'gene_set' && !Array.isArray(v)) {
        for (const [description="user_input", input] of Object.entries(v)) {
          inputList.push({
            entity,
            label: description,
            color,
            icon,
            values: input,
            icon_color
          })
        }

      } else if (Array.isArray(v)) {
        for (const label of v) {
          inputList.push({
            entity,
            label,
            color,
            icon,
            icon_color,
            // links
          })
        }
      }
    }
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
            <Search inputList={inputList} />
        </Grid>
      </Grid>
    )
  }
}