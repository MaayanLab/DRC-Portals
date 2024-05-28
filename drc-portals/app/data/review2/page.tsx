import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import ReviewDisplay from './ReviewDisplay';
import {CountDisplay} from './CountDisplay';
import QueryForm from './QueryForm';
import { Typography } from '@mui/material';
import { useSanitizedSearchParams } from "@/app/data/processed/utils";
import { FaAnglesDown } from 'react-icons/fa6';

type PageProps = { searchParams: Record<string, string>, tab?: boolean }

export default async function ReviewPage(props: PageProps) {

    // Set the schemaname in q for now for this page
    const searchParams = useSanitizedSearchParams(props);

    // Mano: for counts for tables:
    const mySchema = searchParams.q ?? 'c2m2'; // 'gtex'

    const myTable = searchParams.t ?? 'file';
    const showTable = (searchParams.t !== null) ? true : false;
    const query = Prisma.sql`SELECT * FROM ${Prisma.join([Prisma.sql`${Prisma.raw(mySchema + '.' + myTable)}`])} LIMIT 10;`;
    const result = await prisma.$queryRaw(query);

    //const countstrs: string[] |undefined = await CountDisplay(props);
    //const countstrs_with_br = countstrs?.join("<br>")
    //console.log("countstr:", countstrs);
    //console.log("countstr:", countstrs_with_br);
    const tables_counts = await CountDisplay(props, mySchema);
    console.log("tables_counts:", tables_counts);
    return (
        <>
        {/*<QueryForm />*/}
        {/*<ReviewDisplay result={result}/>*/}
        {/* Schema: {mySchema}, Table: {myTable}
        {showTable && <ReviewDisplay result={result}/>} */}
        Count of rows in tables from schema: {mySchema}
        <ReviewDisplay result={tables_counts}/>
        {/*countstrs_with_br*/}
        {/*countstrs.map((countstr, index) => (countstr)) */}
        </>
    );
}