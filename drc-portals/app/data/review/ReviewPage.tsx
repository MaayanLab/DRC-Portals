// ReviewPage.jsx
import { useEffect, useState } from 'react';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import ReviewDisplay from './ReviewDisplay';

export default function ReviewPage({ selectedSchema, selectedTable }) {
    const [result, setResult] = useState([]);

    useEffect(() => {
        if (selectedSchema && selectedTable) {
            const fetchData = async () => {
                const query = Prisma.sql`SELECT * FROM ${Prisma.join([Prisma.sql`${Prisma.raw(selectedSchema + '.' + selectedTable)}`])} LIMIT 10;`;
                try {
                    const result = await prisma.$queryRaw(query);
                    setResult(result);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setResult([]);
                }
            };

            fetchData();
        }
    }, [selectedSchema, selectedTable]);

    return (
        <>
            <ReviewDisplay result={result} />
        </>
    );
}
