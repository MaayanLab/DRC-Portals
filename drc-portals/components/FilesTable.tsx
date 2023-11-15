import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function FilesTable(props: { rows: any[]; }) {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date Uploaded</TableCell>
              <TableCell align="center">Uploaded By</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">DCC</TableCell>
              <TableCell align="center">File Type</TableCell>
              <TableCell align="center">Uploaded File</TableCell>
              <TableCell align="center">Additional Info</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.rows.map((row) => (
              <TableRow
                key={row.date}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.date}
                </TableCell>
                <TableCell align="right">{row.uploadedBy}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">{row.dcc}</TableCell>
                <TableCell align="right">{row.fileType}</TableCell>
                <TableCell align="right">{row.uploadedFile}</TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }