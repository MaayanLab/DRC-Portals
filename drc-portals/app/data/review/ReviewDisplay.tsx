import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function ReviewDisplay({ result }) {
    return (
        <>
            {result.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6">Preview</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {Object.keys(result[0]).map((key) => (
                                        <TableCell key={key}>{key}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Object.values(row).map((value, cellIndex) => (
                                            <TableCell key={cellIndex}>{value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            )}
        </>
    );
}
