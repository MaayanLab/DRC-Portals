
'use client'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'

import {
  Grid,
  Toolbar,
  Stack,
  Typography,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Popper,
  ClickAwayListener,
  ListItemIcon
} from '@mui/material';

import SearchParamSearchField from '@/app/data/processed/SearchParamSearchField'
import { Logo } from '../styled/Logo'
import { DRCDrawer } from './drawer';

import Link from "@/utils/link"
import UserComponent from "../misc/LoginComponents/UserComponent"
import { authOptions } from '@/lib/auth'
import { TextNav } from "./client"
import { Session, getServerSession } from "next-auth"
import NavBreadcrumbs from './breadcrumbs';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { ListItemButton } from '@mui/material';
import { mdiAccountGroup, mdiAccountSwitch, mdiBook, mdiCalendar, mdiCompass, mdiDataMatrix, mdiFileDocument, mdiFormatListGroup, mdiGesture, mdiGraphOutline, mdiHammer, mdiHome, mdiHomeGroup, mdiInformation, mdiLaptop, mdiMagnify, mdiRobotOutline, mdiSend, mdiSetCenter } from '@mdi/js';
import Icon from '@mdi/react';
import usePathname from '@/utils/pathname';
export const TopNav = ({ session }: {session: Session | null }) => {
  
  return (
    <>
    {/* <Link href={"/info"}>
      <Typography variant={isInfo ? "nav_highlighted": "nav"}><b>Info</b></Typography>
    </Link> */}
    <Link href={"/"}>
    <Typography variant={"nav_highlighted"}><b>Data</b></Typography>
    </Link>
    <Link href={"https://cfdeknowledge.org/r/kc_landing"}  target="_blank" rel="noopener noreferrer">
      <Typography variant="nav"><b>Knowledge</b></Typography>
    </Link>
    <Link href={"https://cfdeworkspace.org/"} target="_blank" rel="noopener noreferrer">
      <Typography variant="nav"><b>Cloud</b></Typography>
    </Link>
    <Link href={"https://orau.org/cfde-trainingcenter/"}  target="_blank" rel="noopener noreferrer">
      <Typography variant="nav"><b>training</b></Typography>
    </Link>
    <Link href={"https://cfdeconnect.org/"}  target="_blank" rel="noopener noreferrer">
      <Typography variant="nav"><b>coordination</b></Typography>
    </Link>
    <UserComponent session={session} />
    </>
  )
}

// export const BottomNav = ({ nav, path }: { path: '/info' | '/data', nav: Array<{ href: string, title: string }> }) => {
//   return nav.map(({ title, href }) => (
//     <Grid item key={title}>
//       {href.indexOf('http') > -1 ?
//         <Link href={href} target="_blank" rel="noopener noreferrer">
//           <Typography variant="nav">{title}</Typography>
//         </Link> :
//         <Link href={`${href}`}>
//           <TextNav title={title} path={href.replace(path, '')} />
//         </Link>
//       }
//     </Grid>
//   ))
// }

const info_nav = [
  { title: "Home", href: "/info" },
  { title: "CF Programs", href: "/info/dcc" },
  { title: "CFDE Centers", href: "/info/centers" },
  { title: "Partnerships", href: "/info/partnerships" },
  { title: "Training & Outreach", href: "/info/training_and_outreach" },
  { title: "Publications", href: "/info/publications" },
  { title: "Webinars", href: "/info/training_and_outreach/cfde-webinar-series" },
  //   {title: "What's New?", href: "/info/news"},
  { title: "About", href: "/info/about" },
]

const data_nav = [
  { title: "Search", href: "/data" },
  { title: "Graph", href: "/data/graph" },
  { title: "Enrichment", href: "/data/enrichment" },
  { title: "Cross", href: "/data/cross" },
  { title: "Assistant", href: "/data/chat" },
  { title: "Data Matrix", href: "/data/matrix" },
  { title: "Use Cases", href: "/data/usecases" },
  { title: "Tools & Workflows", href: "/data/tools_and_workflows" },
  { title: "Submit", href: "/data/submit" },
  { title: "Documentation", href: "/data/documentation" }
]

const options = [
  {
    title: "Explore the Ecosystem",
    links: [
      {
        title: "Homepage",
        href: "/",
        description: "Go to the CFDE Workbench Homepage",
        icon: mdiHome
      },{
        title: "Common Fund Programs",
        href: "/info/dcc",
        description: "Learn more about the CFDE participating Common Fund Programs",
        icon: mdiAccountGroup
      },
      {
        title: "Data Matrix",
        href: '/data/matrix',
        description: 'Explore a table that lists different datasets and other digital assets contributed by the CFDE participating Common Fund programs',
        icon: mdiDataMatrix
      },
      {
        title: "Centers",
        href: "/info/centers",
        description: "Explore the five CFDE centers working towards facilitating improved discovery, reuse, integration of Common Fund datasets",
        icon: mdiHomeGroup
      },
      {
        title: "Partnerships",
        href: "/info/partnerships",
        description: "Learn more about the CFDE partnerships performing integrative analysis across multiple Common Fund programs",
        icon: mdiAccountSwitch
      },
      {
        title: "Publications",
        href: "/info/publications",
        description: "View a listing of CFDE associated publications and landmark papers of the various Common Fund programs",
        icon: mdiBook
      }
    ]
  },
  {
    title: "Search",
    links: [
      {
        title: "CFDE Data Explorer",
        href: '/explorer',
        description: "Query the CFDE databases and tools to find knowledge about genes, drugs, phenotypes, cells, gene sets, and assays",
        icon: mdiCompass
      },
      {
        title: "Search Common Fund Data",
        href: '/data',
        description: "Query the CFDE Workbench Data Portal database to find files and other assets from participating Common Fund programs",
        icon: mdiMagnify
      },
      {
        title: "C2M2 Interactive Graph Search",
        href: "/data/graph",
        description: "Explore the CFDE Workbench Cross Cut Metaata Model (C2M2) using an interactive graph-based interface to build queries",
        icon: mdiGraphOutline
      },
      {
        title: "CFDE AI Chatbot Assistant",
        href: "/data/chat",
        description: "Interact with an AI-powered chatbot to explore knowledge about the CFDE, the CFDE Workbench, and Common Fund programs",
        icon: mdiRobotOutline
      }
    ]
  },
  {
    title: "Analyze",
    links: [
      {
        title: "Gene Set Enrichment",
        href: "/data/enrichment",
        description: "Perform enrichment analysis using gene set libraries generated from Common Fund programs datasets",
        icon: mdiFormatListGroup
      },
      {
        title: "Gene Set Crossing",
        href: "/data/cross",
        description: "Generate hypotheses by crossing and comparing gene sets created from data produced by different Common Fund programs",
        icon: mdiSetCenter
      },
      {
        title: "Tools and Workflows",
        href: "/data/tools_and_workflows",
        description: "Explore a collection of tools created by the CFDE Data Resource Center (DRC) and other members of the consortium",
        icon: mdiHammer
      },
      {
        title: "Use Cases",
        href: "/data/usecases",
        description: "Explore a collection of CFDE generated use cases that integrate datasets from multiple Common Fund programs",
        icon: mdiGesture
      }
    ]
  },
  {
    title: "Engage",
    links: [
      {
        title: "Training & Outreach",
        href: "/info/training_and_outreach",
        description: "Learn about the CFDE in-person and virtual outreach and training activities",
        icon: mdiCalendar
      },
      {
        title: "Webinars",
        href: "/info/training_and_outreach/cfde-webinar-series",
        description: "Join the CFDE monthly webinars organized the the CFDE Knowledge Center",
        icon: mdiLaptop
      }
    ]
  },
  {
    title: "Submit",
    links: [
      {
        title: "Submit Assets",
        href: "/data/submit",
        description: "Access the CFDE metadata and data submission system (only for authorized users)",
        icon: mdiSend
      }
    ]
  },
{
  title: "Documentation",
  links: [
    {
      title: "Documentation",
      href: "/data/documentation",
      description: "Explore protocols, standards, and guidelines related to the CFDE",
      icon: mdiFileDocument
    }
  ]
},
{
  title: "About",
  links: [
    {
      title: "About",
      href: "/info/about",
      description: "Learn more about the CFDE and the Data Resource Center",
      icon: mdiInformation
    }
  ]
}
]


export default function Header({ session }: {session: Session | null }) {
  const [open, setOpen] = useState(false)
  const [subLinks, setSubLinks] = useState<{title: string, links: Array<{title: string, href: string, description: string, icon:string}>} | null>(null)
  const path:'/info' | '/data' = "/info"
  const ref = useRef<HTMLElement>(null);

  const nav = path === "/info" ? info_nav : data_nav
  const handleClick = (data: {title: string, links: Array<{title: string, href: string, description: string, icon: string}>}) => {
    if (subLinks === null) setSubLinks(data)
    else if (data.title === subLinks.title) {
      setSubLinks(null)
    } else {
      setSubLinks(data)
    }
    // setTimeout(() => {
    //     setSubLinks(null)
    // }, 5000);
  }
  return (
    <ClickAwayListener onClickAway={()=>setSubLinks(null)}>
    <div>
    <Container maxWidth="lg">
      <AppBar ref={ref} position="static" sx={{ color: "#2D5986", paddingTop: 2, display: { xs: "none", sm: "none", md: "block" } }}>
        <Toolbar>
          <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
            <Grid item>
              <Logo title="CFDE Workbench" size='large' color="inherit" />
            </Grid>
            <Grid item>
              <Stack direction={"row"} alignItems={"center"}>
                <TopNav session={session} />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems={"center"}>
                {options.map(({ title, links }) => (
                  <Grid item key={title}>
                    <Button sx={{paddingLeft: 1, paddingRight: 1}}className="navButton" color="secondary" onClick={()=>handleClick({title, links})}>
                      <TextNav paths={links.map(i=>i.href)} clicked={subLinks?.title === title} title={title}/>
                    </Button>
                  </Grid>
                ))}
                {/* <BottomNav nav={nav} path={path} /> */}
              </Grid>
            </Grid>
            {/* <Grid item xs={12} className='flex items-center'>
              <div className='flex flex-grow'><NavBreadcrumbs /></div>
              {path === "/data" && <SearchParamSearchField />}
            </Grid> */}
          </Grid>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none", xl: "none" } }}>
        <Stack spacing={1}>
          <DRCDrawer path={path} options={options} session={session} />
          {/* {(path === "/data") && <SearchParamSearchField />} */}
        </Stack>
      </Box>
    </Container>
    <Popper sx={{bgcolor: "#A5B4DB", width:"100%", zIndex: 100}} placement={'bottom-start'} open={subLinks!==null} anchorEl={ref.current}>
      <Container maxWidth="lg">
        <List sx={{width: "100%"}}>
          {(subLinks?.links || []).map(i=>(
            <ListItemButton onClick={()=>setSubLinks(null)}href={i.href} component={Link} key={i.title}>
              <ListItemIcon>
                <Icon path={i.icon} size={1} />
              </ListItemIcon>
              <ListItemText primary={i.title} secondary={i.description}/>
            </ListItemButton>
          ))}
        </List>
      </Container>
    </Popper>      
    {/* <Container maxWidth="lg">
      <Box sx={{marginLeft: 3}}>
        <NavBreadcrumbs />
      </Box>
    </Container> */}
    </div>
    </ClickAwayListener>
  )
}
