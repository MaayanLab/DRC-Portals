import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import ReviewDisplay from './ReviewDisplay';
import {CountDisplay} from './CountDisplay';
import QueryForm from './QueryForm';
import { Typography } from '@mui/material';
import { useSanitizedSearchParams } from "@/app/data/processed/utils";

type PageProps = { searchParams: Record<string, string>, tab?: boolean }

export default async function ReviewPage(props: PageProps) {

    // Set the schemaname in q for now for this page
    const searchParams = useSanitizedSearchParams(props);

    const mySchema = 'gtex';
    const myTable = 'file';
    const query = Prisma.sql`SELECT * FROM ${Prisma.join([Prisma.sql`${Prisma.raw(mySchema + '.' + myTable)}`])} LIMIT 10;`;
    const result = await prisma.$queryRaw(query);

    // Mano: for counts for tables:
    const schemaname = searchParams.q ?? 'c2m2';
    //const countstrs: string[] |undefined = await CountDisplay(props);
    //const countstrs_with_br = countstrs?.join("<br>")
    //console.log("countstr:", countstrs);
    //console.log("countstr:", countstrs_with_br);
    const tables_counts = await CountDisplay(props, schemaname);
    console.log("tables_counts:", tables_counts);
    return (
        <>
        {/*<QueryForm />*/}
        <ReviewDisplay result={result}/>
        <ReviewDisplay result={tables_counts}/>
        {/*countstrs_with_br*/}
        {/*countstrs.map((countstr, index) => (countstr)) */}
        </>
    );
}