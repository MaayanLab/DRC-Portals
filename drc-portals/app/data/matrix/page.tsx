import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell} from '@mui/material'
import { Typography, Container } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch';
import Link from 'next/link';

const cfde_data = [
  { 
    dcc: '4DN', hasfiles: true, img: '/img/4DN.png',
    c2m2: true, xmt: false, kg: true, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'A2CPS', hasfiles: false, img: '/img/A2CPS.png',
    c2m2: false, xmt: false, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'Bridge2AI', hasfiles: false, img: '/img/Bridge2AI.png',
    c2m2: false, xmt: false, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'ERCC', hasfiles: true, img: '/img/exRNA.png',
    c2m2: true, xmt: false, kg: true, att: false, kc: false, 
    etl: true, api: true, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'GlyGen', hasfiles: true, img: '/img/Glycoscience.jpg',
    c2m2: true, xmt: true, kg: true, att: true, kc: false, 
    etl: false, api: false, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'GTEx', hasfiles: true, img: '/img/GTEx.png',
    c2m2: true, xmt: true, kg: true, att: true, kc: false, 
    etl: false, api: true, ent: true, pwb: true, chat: false 
  },
  {
    dcc: 'H3Africa', hasfile: false, img: '/img/h3africa.jpg',
    c2m2: false, xmt: false, kg: false, att: false, kc: false,
    etl: false, api: false, ent: false, pwb: false, chat: false
  },
  { 
    dcc: 'HMP', hasfiles: true, img: '/img/HMP.gif',
    c2m2: true, xmt: false, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'HuBMAP', hasfiles: true, img: '/img/HuBMAP.png',
    c2m2: true, xmt: false, kg: true, att: false, kc: false, 
    etl: false, api: true, ent: false, pwb: false, chat: false 
  },
  {
    dcc: 'iHMP', hasfile: false, img: '/img/iHmp.png',
    c2m2: false, xmt: false, kg: false, att: false, kc: false,
    etl: false, api: false, ent: false, pwb: false, chat: false
  },
  { 
    dcc: 'IDG', hasfiles: true, img: '/img/IDG.png',
    c2m2: true, xmt: true, kg: true, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'KidsFirst', hasfiles: true, img: '/img/Kids First.png',
    c2m2: true, xmt: false, kg: true, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'KOMP2', hasfiles: true, img: '/img/KOMP2.png',
    c2m2: false, xmt: true, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'LINCS', hasfiles: true, img: '/img/LINCS.gif',
    c2m2: true, xmt: true, kg: true, att: true, kc: false, 
    etl: true, api: true, ent: true, pwb: true, chat: true 
  },
  { 
    dcc: 'Metabolomics', hasfiles: true, img: '/img/Metabolomics.jpg',
    c2m2: true, xmt: true, kg: true, att: true, kc: false, 
    etl: false, api: true, ent: false, pwb: true, chat: false 
  },
  { 
    dcc: 'MoTrPAC', hasfiles: true, img: '/img/MoTrPAC.png',
    c2m2: true, xmt: true, kg: true, att: true, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'SenNet', hasfiles: false, img: '/img/SenNet.png',
    c2m2: false, xmt: false, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'SPARC', hasfiles: true, img: '/img/SPARC.svg',
    c2m2: true, xmt: false, kg: true, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
  { 
    dcc: 'UDN', hasfiles: true, img: '/img/UDN.png',
    c2m2: false, xmt: false, kg: false, att: false, kc: false, 
    etl: false, api: false, ent: false, pwb: false, chat: false 
  },
]

const columns = [
  'C2M2', 'XMT', 'KG Assertions', 'Attribute Tables', 'KC Assertions',
  'ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs'
]

export default function DataMatrix() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h2" color="secondary.dark" sx={{mt:2}} gutterBottom>PROCESSED DATA</Typography>
      <TableContainer sx={{ mb: 5, maxHeight: 680 }}>
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
            <TableCell sx={{ border: 0, backgroundColor: "#b8c4e1"}}></TableCell>
            <TableCell sx={{ border: 0, backgroundColor: "#c8d2e9"}} align="center" colSpan={5}>
              <Typography variant="subtitle1" color="secondary.dark">Datasets and Metadata</Typography>
            </TableCell>
            <TableCell sx={{ border:0, backgroundColor: "#dbe0f0" }} align="center" colSpan={5}>
              <Typography variant="subtitle1" color="secondary.dark">Code</Typography>
            </TableCell>
          </TableRow>
          <TableRow >
            <TableCell sx={{ border: 0, backgroundColor: "#b8c4e1" }} align="center">
              <Typography variant="subtitle1" color="secondary.dark">DCC</Typography>
            </TableCell>
            {columns.map((item, idx) => {
              const code_assets = ['ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs']
              const bgColor = (code_assets.includes(item)) ? '#dbe0f0' : '#c8d2e9'
              return (
                <TableCell key={idx} align="center" 
                sx={{ border:0, backgroundColor: bgColor }}>
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
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#KCAssertions')}>
                      {item.kc ? (<LaunchIcon sx={{color:"#7187C3"}} />) : (<span />)}
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
      </TableContainer>
    </Container>
  );
}