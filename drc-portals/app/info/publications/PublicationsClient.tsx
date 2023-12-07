'use client'
import { useRouter, usePathname } from "next/navigation"
import TablePagination from '@mui/material/TablePagination';
import Grid from "@mui/material/Grid"
import { queryJson } from "./PublicationsServer"


export default function PublicationsClient({
    children,
    count=10,
    q,
  }: 
  {
    children: React.ReactNode,
    count: number,
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
            <Grid item xs={12}>
                {children}
            </Grid>
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
        </Grid>
    )
}