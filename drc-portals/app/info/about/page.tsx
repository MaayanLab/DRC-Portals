import { Grid, Typography, Link, Container, List, ListItem, ListItemIcon, Button } from "@mui/material"
import InteractiveNavComponent from "@/components/InteractiveNav/interactive"
import prisma from "@/lib/prisma"
import CircleIcon from '@mui/icons-material/Circle';
import Image from "next/image";
export default async function About() {
    const dccs = await prisma.dCC.findMany({
      where: {
        cfde_partner: true,
        active: true
      }
    })
    const additional = [
      {
        label: "Somatic Mosaicism across Human Tissues",
        short_label: "SMaHT",
        icon: "/img/interactive/smath.png",
        homepage: "https://commonfund.nih.gov/somatic-mosaicism-across-human-tissues-smaht"
      },
      {
        short_label: "NPH",
        label: "Nutrition for Precision Health",
        icon: "/img/interactive/nph.png",
        homepage: "https://commonfund.nih.gov/nutritionforprecisionhealth"
      }
    ]
    const additional_label = ['NPH', 'SMaHT']
    const ordering = [ "Kids First", "A2CPS", "HuBMAP", "4DN", "LINCS", "IDG", "NPH", 
      "GlyGen", "Bridge2AI", "MoTrPAC", "Metabolomics", "SPARC", "SMaHT", "HMP", "GTEx", "SenNet", "ExRNA",].sort()
    const all_dccs: {[key:string]: any} = [...dccs, ...additional].reduce((acc, i)=>({...acc, [`${i.short_label}`]: i}), {})
	
    return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant={'h3'}>
          The Common Fund Data Ecosystem (CFDE) Program Snapshot
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'body1'} sx={{textAlign: "justify"}}>
          The Common Fund generates a diverse array of valuable data sets and 
          knowledge resources intended for the research community. However, 
          these resources are dispersed across multiple locations, making it 
          challenging to navigate and utilize them efficiently. To address 
          this, the <b>Common Fund Data Ecosystem (CFDE)</b> was established 
          to facilitate the broad use of Common Fund data to drive discovery. 
          The CFDE has developed the <Link color="secondary" href="https://cfde.cloud"><b>CFDE Portal</b></Link>—an 
          online discovery platform designed to make Common Fund data more 
          findable, accessible, interoperable, and reusable (FAIR). This 
          portal enables researchers to search and analyze multiple 
          Common Fund datasets from a single access point, enhancing 
          usability and scientific inquiry.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'h4'}>
          CFDE Centers and Initiatives
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'body1'} sx={{textAlign: "justify"}}>
          The CFDE is structured around <Link color="secondary" href="https://info.cfde.cloud/centers"><b>five centers</b></Link> that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease. Additionally, the CFDE supports pilot projects that engage a wide range of end-users, gather feedback on Common Fund data resources, and foster the exploration of cross-disciplinary biological questions.
        </Typography>
      </Grid>
      <Grid item xs={12} sx={{height: 700,  position: "relative"}}>
        <Container sx={{position: "absolute", top: -80}}>
          <InteractiveNavComponent dccs={dccs}/>
        </Container>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'h5'}>
          Key Components of CFDE:
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <List>
          <ListItem><Typography variant={'body1'} sx={{textAlign: "justify"}}>1. <b>CFDE Centers</b>-The CFDE five centers include: the data resource center, the knowledge center, the training center, the coordination and integration center, and the cloud workspace center. These CFDE centers serve as the central hub for CFDE activities, engaging with Common Fund programs, user communities, and training initiatives. They are building a computational infrastructure that aims to convert data and metadata into knowledge. These centers work closely with relevant programs to ensure seamless integration and coordination.</Typography></ListItem>
          <ListItem><Typography variant={'body1'} sx={{textAlign: "justify"}}>2. <b>Participating Common Fund Data Coordinating Centers (<Link color="secondary" href="https://info.cfde.cloud/dcc">DCCs</Link>)</b>-These centers collaborate with the CFDE to ensure that the data and tools that their program produces can be integrated and combined with other datasets for knowledge discovery and sustainability. The CFDE promotes establishing best practices, sharing of tools and workflows, developing cross-data use cases, and providing training.</Typography></ListItem>
          <ListItem><Typography variant={'body1'} sx={{textAlign: "justify"}}>3. <b>Enhancing the Utility of Common Fund Data Sets (Pilot Projects)</b>-The CFDE also funds pilot projects and partnerships aimed at developing new tools, refining existing data sets, and integrating multiple data sources to answer complex biological questions. These projects broaden the CFDE’s reach by engaging new users, improving portal functionality, and facilitating interdisciplinary research. For more information, visit the <Link color="secondary" href="https://commonfund.nih.gov/dataecosystem/FundedResearch"><b>Funded Research</b></Link> page.</Typography></ListItem>
        </List>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'h5'}>
          Engaged Common Fund Programs
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'body1'}>
          Currently, 18 Common Fund programs participate in the CFDE, each offering unique perspectives to improve data integration and accessibility:
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <List>
          {ordering.map((dcc_name, i)=>{
            const dcc = all_dccs[dcc_name as string]
            return(
              <ListItem key={dcc_name}>
                <ListItemIcon>
                <Button 
								// disableElevation
								sx={{
									background: "#fff", 
									borderRadius: 1000, 
									width: 70, 
									height: 70,
                  marginRight: 2
									// position: "absolute",
									// transform: `translate(${x}px, ${y}px)`,
								}}
							>
								{ additional_label.indexOf(dcc.short_label || '') > -1 ?
                  <Link href={dcc.homepage} target="_blank" rel="noopener noreferrer">
                    <Image src={dcc.icon || ''} alt={dcc.short_label || ''} width={50} height={50}/>
                  </Link>:
                  <Link href={`/info/dcc/${dcc.short_label}`}>
                    <Image src={dcc.icon || ''} alt={dcc.short_label || ''} width={50} height={50}/>
                  </Link>
                  }
                </Button>
                </ListItemIcon>
                <Typography variant="body1"><b>{dcc.label} (
								<Link color="secondary" href={additional_label.indexOf(dcc.short_label) === -1 ? `/info/dcc/${dcc.short_label}`: dcc.homepage}>
									{dcc.short_label}
								</Link>
								)</b></Typography>
              </ListItem>
            )
          })}
        </List>
      </Grid>
      <Grid item xs={12}>
        <Typography variant={'body1'}>
        These programs produce data and other resources for the most cutting-edge grand challenges in biomedical research. Moving forward, the CFDE is expected to continue to expand, incorporating future Common Fund programs to further enrich the research community’s access to high-quality, cutting edge, large-scale, and interoperable data and metadata.
        </Typography>
      </Grid>
    </Grid>
    )
  }