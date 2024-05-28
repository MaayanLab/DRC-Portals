// CountDisplay.tsx
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";
//import { getDCCIcon, capitalizeFirstLetter, isURL, generateMD5Hash} from "@/app/data/c2m2/utils";
import { schemaToDCC, tableToName} from "@/app/data/c2m2/utils";
import SQL from '@/lib/prisma/raw';
import { FancyTab } from '@/components/misc/FancyTabs';

type PageProps = { searchParams: Record<string, string>, tab?: boolean }

export async function CountDisplay(props: PageProps, schemaname: string) {
    const searchParams = useSanitizedSearchParams(props);
    //const schemaname = 'metabolomics';

    const valid_schemanames: string[] = schemaToDCC.map(row => row['schema']);
    const valid_tablenames: string[] = tableToName.map(row => row['table']);

    try {
        // To measure time taken by different parts
        const t0: number = performance.now();

        var countstrs: string[] = [];
        var tables_counts: {tablename: string, count: number}[] = [];
        var cnt = 0;
        for (const tablename of valid_tablenames) {            
        //const tablename = "project";
        //console.log("In Review2: point 0: tablename: ", tablename);

        const [results] = await prisma.$queryRaw<Array<{
            count: number,
          }>>(SQL.template`
          SELECT count(*) FROM "${SQL.assert_in(schemaname, valid_schemanames)}"."${SQL.assert_in(tablename, valid_tablenames)}"
          `.toPrismaSql());
        
          const t1: number = performance.now();

          //console.log("In Review2: point 1")
          console.log(results)
          //console.log("In Review2: point 2")

          countstrs.push(`<Typography>Count of rows in table: ${tablename}: ${results?.count}.</Typography>`); // This matches with #records in the table on the right (without limit)
          tables_counts.push({"tablename": tablename, "count": Number(results?.count)})
          cnt = cnt + 1;
        }// ending for
        //return(countstrs);        
        return(tables_counts);
    } catch (error) {
        console.error('Error fetching counts:', error);
        const body = <>
        <div className="mb-10">Error fetching query results.</div>
        <Link href="/data/review2">
          <Button
            sx={{ textTransform: "uppercase" }}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO REVIEW2
          </Button>
        </Link>
        </>
    }

    
}
