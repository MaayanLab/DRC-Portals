import { Table, TableHead, TableRow, TableBody, TableCell} from '@mui/material'
import { Typography, Container, Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch';
import prisma from '@/lib/prisma';

type dccMatrix = {
  dcc: string, img: string,
  c2m2: boolean, xmt: boolean, kg: boolean, att: boolean,
  etl: boolean, api: boolean, ent: boolean, pwb: boolean, chat: boolean
}

async function getDccNumAssets(dcc_id: string, ft: string, is_code: boolean) {
  const res = is_code ? await prisma.dccAsset.findMany({
    where: {
      deleted: false,
      dcc_id: dcc_id, 
      codeAsset: {
        type: ft
      }
    }
  }) : await prisma.dccAsset.findMany({
    where: {
      deleted: false,
      dcc_id: dcc_id,
      fileAsset: {
        filetype: ft
      }
    }
  })
  return (res.length > 0)
}

const columns = [
  'C2M2', 'XMT', 'KG Assertions', 'Attribute Tables', 
  'ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs'
]

export default async function DataMatrix() {
  const dccs = await prisma.dCC.findMany({
    select: {
      id: true,
      icon: true,
      short_label: true
    },
    where: {
      active: true
    },
    orderBy: {
      short_label: 'asc',
    },
  })
  const cfde_data = await Promise.all(dccs.map( async item => ({
    dcc: item.short_label ? item.short_label : '',
    img: item.icon ? item.icon : '',
    c2m2: await getDccNumAssets(item.id, 'C2M2', false),
    xmt: await getDccNumAssets(item.id, 'XMT', false),
    kg: await getDccNumAssets(item.id, 'KG Assertions', false),
    att: await getDccNumAssets(item.id, 'Attribute Table', false),
    etl: await getDccNumAssets(item.id, 'ETL', true),
    api: await getDccNumAssets(item.id, 'API', true),
    ent: await getDccNumAssets(item.id, 'Entity Page Template', true),
    pwb: await getDccNumAssets(item.id, 'PWB Metanodes', true), 
    chat: await getDccNumAssets(item.id, 'Chatbot Specs', true)
  })))
  // sort by most to least assets
  const ordered_data = cfde_data.map( item => (
    {data: item, numAssets: Object.values(item).reduce((acc, val) => acc + (val === true ? 1 : 0), 0)}
  )).sort((a,b) => b.numAssets - a.numAssets)
  return (
    <Container maxWidth="xl">
      <Typography variant="h2" color="secondary.dark" sx={{mt:2}} gutterBottom>METADATA & PROCESSED DATA MATRIX</Typography>
      <Typography color="#666666" fontSize="11.5pt" sx={{mt:2, mb:2}}>
        The CFDE Metadata and Processed Data Matrix provides access to files and 
        other assets produced by Common Fund (CF) Data Coordination Centers (DCCs) 
        that partner with the CFDE. Click on a DCC logo to navigate to the 
        DCC-specific assets page. Alternatively, click on the icon for a particular 
        file type to navigate to a table that contains these files on the 
        DCC-specific page. 
        <br /> <br />
        Data and metadata files include C2M2 metadata data packages, gene and other 
        entity set libraries (XMTs), knowledge graph (KG) assertions, and attribute 
        tables. The files listed here are <b>not</b> the original data generated 
        by each CF program, but are processed representations of knowledge from the 
        original data. For the original data source, please refer to each CF DCC 
        portal, linked from the assets pages. 
        <br /> <br />
        Interoperability and code assets include links to extract-transform-load 
        (ETL) scripts, API specifications, entity pages, 
        CFDE <Link color="#3470e5" href="https://playbook-workflow-builder.cloud/" target="_blank">
        Playbook Workflow Builder</Link> (PWB) metanode specifications, and chatbot 
        specifications. 
        <br /> <br />
        For more information about any of the asset types, please refer to 
        the <Link href="/info/standards" color="#3470e5">STANDARDS & PROTOCOLS</Link> section
        of the CFDE Workbench <Link href="/info" color="#3470e5">
        Information Portal</Link>.</Typography> 
      
      <Table stickyHeader aria-label="sticky table">
        <colgroup>
            <col style={{width:'19%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
            <col style={{width:'9%'}}/>
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell sx={{ height: '60px', border: 0, backgroundColor: "#b8c4e1"}}></TableCell>
            <TableCell sx={{ height: '60px', border: 0, backgroundColor: "#c8d2e9"}} align="center" colSpan={4}>
              <Typography variant="subtitle1" color="secondary.dark">Datasets and Metadata</Typography>
            </TableCell>
            <TableCell sx={{ height: '60px', border:0, backgroundColor: "#dbe0f0" }} align="center" colSpan={5}>
              <Typography variant="subtitle1" color="secondary.dark">Code</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ top: '60px', border: 0, backgroundColor: "#b8c4e1" }} align="center">
              <Typography variant="subtitle1" color="secondary.dark">DCC</Typography>
            </TableCell>
            {columns.map((item, idx) => {
              const code_assets = ['ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs']
              const bgColor = (code_assets.includes(item)) ? '#dbe0f0' : '#c8d2e9'
              return (
                <TableCell key={idx} align="center" 
                sx={{ top: '60px', border:0, backgroundColor: bgColor }}>
                  <Typography variant="subtitle2" color="secondary.dark">{item}</Typography>
                </TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
            {ordered_data.map((item, idx) => {
              const row_color = (idx % 2 == 0) ? 'white' : '#edf0f8'
              return (
                <TableRow key={idx} sx={{backgroundColor: row_color}}>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/info/dcc/".concat(item.data.dcc)}>
                      <img className="object-scale-down h-14 self-center mx-auto" src={item.data.img} alt={item.data.dcc.concat(" Logo")} />
                    </Link>
                  </TableCell>
                  <TableCell sx={{border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.c2m2 ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#C2M2')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.xmt ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#XMT')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.kg ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#KGAssertions')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.att ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#AttributeTables')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.etl ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#ETL')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.api ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#API')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.ent ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#EntityPages')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0, borderRight:2, borderColor: "#c8d2e9" }} align="center"> {
                    item.data.pwb ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#PWBMetanodes')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                  <TableCell sx={{ border:0 }} align="center"> {
                    item.data.chat ? (
                      <Link href={"/info/dcc/".concat(item.data.dcc).concat('#ChatbotSpecs')}>
                        <LaunchIcon sx={{color:"#7187C3"}} />
                      </Link>) : (<Typography fontSize='11pt' fontStyle='italic' color='#7187C3'>Coming soon</Typography>)
                  } </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
    </Container>
  );
}
