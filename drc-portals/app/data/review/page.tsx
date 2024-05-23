import prisma from '@/lib/prisma';
import ReviewDisplay from './ReviewDisplay';

export default async function ReviewPage() {

    const result = await prisma.$queryRaw`SELECT * FROM sparc.biosample LIMIT 10`;

    return (
        <>
            <ReviewDisplay result={result}/>        
        </>
    );
}
