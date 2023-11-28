'use client'
import { useRouter, usePathname } from "next/navigation"
import TablePagination from '@mui/material/TablePagination';
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { Prisma } from "@prisma/client"
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { queryJson } from "./PublicationsServer"

const DCCName = ({dcc}: {dcc:string}) => (
    <Typography color="secondary" variant="subtitle2">
        {dcc}
    </Typography>
)

export default function PublicationsClient({
    children,
    count=10,
    all,
    q,
    dccs,
  }: 
  {
    children: React.ReactNode,
    count: number,
    all: boolean,
    q?: queryJson,
    dccs?: Array<string>
  }) {
    const router = useRouter()
    const pathname = usePathname()
    const {skip=0, take=10, where} = q || {}
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        v: number) => {
        const query = {
            ...q,
            skip: v*take
        }
        
        router.push(`${pathname}?q=${JSON.stringify(query)}`);
    }
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const query = {
            ...q,
            take: event.target.value
        }
        router.push(`${pathname}?q=${JSON.stringify(query)}`);
      };
    return (
        <Grid container spacing={2}>
            {/* <Grid item xs={12} md={2}>
                <Stack spacing={1}>
                    <Typography variant="subtitle1" color="secondary">
                        Filter by Programs
                    </Typography>
                    <Button size="small" sx={{padding: 1}} color="secondary" variant="outlined">Select all</Button>
                    <Button size="small" sx={{padding: 1}} color="secondary" variant="outlined">Deselect all</Button>
                </Stack>
            </Grid> */}
            {dccs &&
                <Grid item xs={12} md={10}>
                    <Grid container>
                        {dccs.map(dcc=>(
                            <Grid key={dcc} item xs={6} sm={4} md={3}>
                                <FormControlLabel 
                                    control={<Checkbox/>} 
                                    label={<DCCName dcc={dcc}/>}/>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            }
            
            <Grid item xs={12}>
                {children}
            </Grid>
            { all &&
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={count}
                        page={skip/take}
                        onPageChange={handleChangePage}
                        rowsPerPage={take}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            }
        </Grid>
    )
}