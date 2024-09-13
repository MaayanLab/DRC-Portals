// CountDisplay.tsx
import prisma from '@/lib/prisma/c2m2';



import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "@/utils/link";
//import { getDCCIcon, capitalizeFirstLetter, isURL, generateMD5Hash} from "@/app/data/c2m2/utils";
import { schemaToDCC, tableToName} from "@/app/data/review/utils";
import SQL from '@/lib/prisma/raw';


type PageProps = { searchParams: Record<string, string>, tab?: boolean }

export async function CountDisplay(schemaname: string) {
    const valid_schemanames: string[] = schemaToDCC.map(row => row['schema']);
    const valid_tablenames: string[] = tableToName.map(row => row['table']);

    try {
        const tables_counts: { tablename: string, count: number }[] = [];
        for (const tablename of valid_tablenames) {
            const [results] = await prisma.$queryRaw<Array<{ count: number }>>(SQL.template`
                SELECT count(*) FROM "${SQL.assert_in(schemaname, valid_schemanames)}"."${SQL.assert_in(tablename, valid_tablenames)}"
            `.toPrismaSql());

            if (results?.count > 0) {
                tables_counts.push({ tablename, count: Number(results.count) });
            }
        }
        return tables_counts;
    } catch (error) {
        console.error('Error fetching counts:', error);
        return [];
    }
}
