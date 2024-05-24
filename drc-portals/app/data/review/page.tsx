import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import ReviewDisplay from './ReviewDisplay';
import QueryForm from './QueryForm';


export default async function ReviewPage() {

    const mySchema = 'gtex';
    const myTable = 'file';
    const query = Prisma.sql`SELECT * FROM ${Prisma.join([Prisma.sql`${Prisma.raw(mySchema + '.' + myTable)}`])} LIMIT 10;`;
    const result = await prisma.$queryRaw(query);

    return (
        <>
        <QueryForm />
            <ReviewDisplay result={result}/>        
        </>
    );
}