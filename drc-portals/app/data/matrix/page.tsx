import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell} from '@mui/material'
import { Typography, Container, Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch';

const cfde_data = [
  { 
    dcc: '4DN', hasfiles: true, img: '/img/4DN.png',
    c2m2: true, xmt: false, kg: true, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'A2CPS', hasfiles: false, img: '/img/A2CPS.png',
    c2m2: false, xmt: false, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'Bridge2AI', hasfiles: false, img: '/img/Bridge2AI.png',
    c2m2: false, xmt: false, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'ERCC', hasfiles: true, img: '/img/exRNA.png',
    c2m2: true, xmt: false, kg: true, att: false, 
    etl: true, api: true, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'GlyGen', hasfiles: true, img: '/img/Glycoscience.jpg',
    c2m2: true, xmt: true, kg: true, att: true, 
    etl: false, api: false, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'GTEx', hasfiles: true, img: '/img/GTEx.png',
    c2m2: true, xmt: true, kg: true, att: true, 
    etl: false, api: true, ent: true, pwb: true, chat: false 
  },
  {
    dcc: 'H3Africa', hasfile: false, img: '/img/h3africa.jpg',
    c2m2: false, xmt: false, kg: false, att: false,
    etl: false, api: false, ent: false, pwb: false, chat: false
  },
  { 
    dcc: 'HMP', hasfiles: true, img: '/img/HMP.gif',
    c2m2: true, xmt: false, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'HuBMAP', hasfiles: true, img: '/img/HuBMAP.png',
    c2m2: true, xmt: false, kg: true, att: false, 
    etl: false, api: true, ent: false, pwb: false, chat: false 
  },
  {
    dcc: 'iHMP', hasfile: false, img: '/img/ihmp.png',
    c2m2: false, xmt: false, kg: false, att: false,
    etl: false, api: false, ent: false, pwb: false, chat: false
  },
  { 
    dcc: 'IDG', hasfiles: true, img: '/img/IDG.png',
    c2m2: true, xmt: true, kg: true, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'KidsFirst', hasfiles: true, img: '/img/Kids First.png',
    c2m2: true, xmt: false, kg: true, att: false, 
    etl: false, api: false, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'KOMP2', hasfiles: true, img: '/img/KOMP2.png',
    c2m2: false, xmt: true, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'LINCS', hasfiles: true, img: '/img/LINCS.gif',
    c2m2: true, xmt: true, kg: true, att: true, 
    etl: true, api: true, ent: true, pwb: true, chat: true 
  },
  { 
    dcc: 'Metabolomics', hasfiles: true, img: '/img/Metabolomics.jpg',
    c2m2: true, xmt: true, kg: true, att: true, 
    etl: false, api: true, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'MoTrPAC', hasfiles: true, img: '/img/MoTrPAC.png',
    c2m2: true, xmt: true, kg: true, att: true, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'SenNet', hasfiles: false, img: '/img/SenNet.png',
    c2m2: false, xmt: false, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'SPARC', hasfiles: true, img: '/img/SPARC.svg',
    c2m2: true, xmt: false, kg: true, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'UDN', hasfiles: true, img: '/img/UDN.png',
    c2m2: false, xmt: false, kg: false, att: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
]

const columns = [
  'C2M2', 'XMT', 'KG Assertions', 'Attribute Tables', 
  'ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs'
]

export default function DataMatrix() {
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
            {cfde_data.map((item, idx) => {
              const row_color = (idx % 2 == 0) ? 'white' : '#edf0f8'
              return (
                <TableRow key={idx} sx={{backgroundColor: row_color}}>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    {item.hasfiles ? (
                      <Link href={"/data/matrix/".concat(item.dcc)}>
                        <img className="object-scale-down h-14 self-center mx-auto" src={item.img} alt={item.dcc.concat(" Logo")} />
                      </Link>
                    ) : (
                      <img className="object-scale-down h-14 self-center mx-auto" src={item.img} alt={item.dcc.concat(" Logo")} />
                    )}
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#C2M2')}>
                      {item.c2m2 ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#XMT')}>
                      {item.xmt ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#KGAssertions')}>
                      {item.kg ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#AttributeTables')}>
                      {item.att ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#ETL')}>
                      {item.etl ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#API')}>
                      {item.api ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#EntityPages')}>
                      {item.ent ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#PWBMetanodes')}>
                      {item.pwb ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border:0, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#ChatbotSpecs')}>
                      {item.chat ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
    </Container>
  );
}