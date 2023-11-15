import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell} from '@mui/material'
import { Typography, Container } from '@mui/material'
import Link from 'next/link';

const cfde_data = [
  { 
    dcc: '4DN', hasfiles: true, img: '/img/4DN.png',
    c2m2: 'X', xmt: '', kg: 'X', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'A2CPS', hasfiles: false, img: '/img/A2CPS.png',
    c2m2: '', xmt: '', kg: '', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'Bridge2AI', hasfiles: false, img: '/img/Bridge2AI.png',
    c2m2: '', xmt: '', kg: '', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'ERCC', hasfiles: true, img: '/img/exRNA.png',
    c2m2: 'X', xmt: '', kg: 'X', att: '', kc: '', 
    etl: 'X', api: 'X', ent: '', pwb: 'X', chat: '' 
  },
  { 
    dcc: 'GlyGen', hasfiles: true, img: '/img/Glycoscience.jpg',
    c2m2: 'X', xmt: 'X', kg: 'X', att: 'X', kc: '', 
    etl: '', api: '', ent: '', pwb: 'X', chat: '' 
  },
  { 
    dcc: 'GTEx', hasfiles: true, img: '/img/GTEx.png',
    c2m2: 'X', xmt: 'X', kg: 'X', att: 'X', kc: '', 
    etl: '', api: 'X', ent: 'X', pwb: 'X', chat: '' 
  },
  { 
    dcc: 'HMP', hasfiles: true, img: '/img/HMP.gif',
    c2m2: 'X', xmt: '', kg: '', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'HuBMAP', hasfiles: true, img: '/img/HuBMAP.png',
    c2m2: 'X', xmt: '', kg: 'X', att: '', kc: '', 
    etl: '', api: 'X', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'IDG', hasfiles: true, img: '/img/IDG.png',
    c2m2: 'X', xmt: 'X', kg: 'X', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'KidsFirst', hasfiles: true, img: '/img/Kids First.png',
    c2m2: 'X', xmt: '', kg: 'X', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: 'X', chat: '' 
  },
  { 
    dcc: 'LINCS', hasfiles: true, img: '/img/LINCS.gif',
    c2m2: 'X', xmt: 'X', kg: 'X', att: 'X', kc: '', 
    etl: 'X', api: 'X', ent: 'X', pwb: 'X', chat: 'X' 
  },
  { 
    dcc: 'Metabolomics', hasfiles: true, img: '/img/Metabolomics.jpg',
    c2m2: 'X', xmt: 'X', kg: 'X', att: 'X', kc: '', 
    etl: '', api: 'X', ent: '', pwb: 'X', chat: '' 
  },
  { 
    dcc: 'MoTrPAC', hasfiles: true, img: '/img/MoTrPAC.png',
    c2m2: 'X', xmt: 'X', kg: 'X', att: 'X', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'SenNet', hasfiles: false, img: '/img/SenNet.png',
    c2m2: '', xmt: '', kg: '', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
  { 
    dcc: 'SPARC', hasfiles: true, img: '/img/SPARC.svg',
    c2m2: 'X', xmt: '', kg: 'X', att: '', kc: '', 
    etl: '', api: '', ent: '', pwb: '', chat: '' 
  },
]

const columns = [
  'C2M2', 'XMT', 'KG Assertions', 'Attribute Tables', 'KC Assertions',
  'ETL', 'API', 'Entity Pages', 'PWB Metanodes', 'Chatbot Specs'
]

export default function DataMatrix() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h2" color="primary" sx={{mt:2}} gutterBottom>Available DCC Files</Typography>
      <TableContainer>
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
          <TableRow >
            <TableCell sx={{ border: 1, borderBottom: "none", borderColor: "#e0e0e0" }}></TableCell>
            <TableCell sx={{ border: 1, borderColor: "#e0e0e0" }} align="center" colSpan={5}>
              <Typography variant="h6">Datasets and Metadata</Typography>
            </TableCell>
            <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center" colSpan={5}>
              <Typography variant="h6">Code</Typography>
            </TableCell>
          </TableRow>
          <TableRow >
            <TableCell sx={{ border:1, borderTop: "none", borderColor: "#e0e0e0" }} align="center">
              <Typography variant="h6">DCC</Typography>
            </TableCell>
            {columns.map((item, idx) => {
              return (
                <TableCell key={idx} sx={{ border:1, borderColor: "#e0e0e0" }} align="center">{item}</TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
            {cfde_data.map((item, idx) => {
              return (
                <TableRow hover key={idx}>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    {item.hasfiles ? (
                      <Link href={"/data/matrix/".concat(item.dcc)}>
                        <img className="object-scale-down h-14 self-center mx-auto" src={item.img} alt={item.dcc.concat(" Logo")} />
                      </Link>
                    ) : (
                      <img className="object-scale-down h-14 self-center mx-auto" src={item.img} alt={item.dcc.concat(" Logo")} />
                    )}
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#C2M2')}>{item.c2m2}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#XMT')}>{item.xmt}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#KGAssertions')}>{item.kg}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#AttributeTables')}>{item.att}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#KCAssertions')}>{item.kc}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#ETL')}>{item.etl}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#API')}>{item.api}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#EntityPages')}>{item.ent}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#PWBMetanodes')}>{item.pwb}</Link>
                  </TableCell>
                  <TableCell sx={{ border:1, borderColor: "#e0e0e0" }} align="center">
                    <Link href={"/data/matrix/".concat(item.dcc).concat('#ChatbotSpecs')}>{item.chat}</Link>
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