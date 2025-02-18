'use client'
import { useRouter, usePathname } from "@/utils/navigation";
import TablePagination from '@mui/material/TablePagination';
import Grid from "@mui/material/Grid";
import { queryJson } from "../news/NewsServer";

export default function NewsClient({
    children,
    count = 25,
    q,
}: {
    children: React.ReactNode,
    count: number,
    q?: queryJson,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { skip = 0, take = 25 } = q || {};

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        v: number) => {
        const query = {
            ...q,
            skip: v * take
        };
        router.push(`${pathname}?q=${JSON.stringify(query)}`);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const query = {
            ...q,
            take: parseInt(event.target.value, 10) // Ensure this is a number
        };
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
                    page={skip / take}
                    onPageChange={handleChangePage}
                    rowsPerPage={take}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Grid>
        </Grid>
    );
}
