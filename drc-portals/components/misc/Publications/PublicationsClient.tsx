'use client'
import { useRouter, usePathname } from "next/navigation"
import TablePagination from '@mui/material/TablePagination';
import Grid from "@mui/material/Grid"
import { Prisma } from "@prisma/client"
import { join_query } from "@/utils/routing";

export default function PublicationsClient({
    children,
    searchParams,
    count=10,
    all,
  }: 
  {
    children: React.ReactNode,
    count: number,
    all: boolean,
    searchParams?: {
        order?: {
            field: Prisma.PublicationScalarFieldEnum, 
            ordering: 'asc'|'desc'
        },
        where?: Prisma.PublicationWhereInput,
        take?:string,
        skip?: string,
    }
  }) {
    const router = useRouter()
    const pathname = usePathname()
    const {skip="0", take="10"} = searchParams || {}
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        v: number) => {
        const query = {
            ...searchParams,
            skip: v*parseInt(take)
        }
        
        router.push(`${pathname}?${join_query(query)}`);
    }
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const query = {
            ...searchParams,
            take: event.target.value
        }
        router.push(`${pathname}?${join_query(query)}`);
      };
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                {children}
            </Grid>
            { all &&
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={count}
                        page={parseInt(skip)/parseInt(take)}
                        onPageChange={handleChangePage}
                        rowsPerPage={parseInt(take)}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            }
        </Grid>
    )
}