
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams } from "@/app/data/review/utils"
import { Prisma } from '@prisma/client';
import ReviewDisplay from './ReviewDisplay';
import QueryForm from './QueryForm';

type PageProps = { searchParams: Record<string, string>, tab?: boolean }

export async function ReviewQueryComponent(props: PageProps) {
    const searchParams = useSanitizedSearchParams(props);

    console.log("In ReviewQueryComponent");

  try {
    const results = await fetchReviewQueryResults(searchParams);
    return results;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return undefined;
  }
}

async function fetchReviewQueryResults(searchParams: any) {
    const schema_name = searchParams.schema_name;
    const table_name = searchParams.table_name;

    console.log("Schema name = "+schema_name);
    console.log("Table name = "+ table_name);

    const query = Prisma.sql`SELECT * FROM ${Prisma.join([Prisma.sql`${Prisma.raw(schema_name + '.' + table_name)}`])} ;`;
    const result = await prisma.$queryRaw(query);

    return(
        <>
            <QueryForm />
            <ReviewDisplay
                result={result}
            />
        </>
        
    );
}