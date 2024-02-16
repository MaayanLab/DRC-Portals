interface HashTable {
    [key: string]: string;
}
const dccIconTable: HashTable = {};
dccIconTable["4DN"] = "/img/4DN.png";
dccIconTable["ERCC"] = "/img/exRNA.png";
dccIconTable["GTEx"] = "/img/GTEx.png";
dccIconTable["GlyGen"] = "/img/glygen-2023-workshop.png";
dccIconTable["HMP"] = "/img/HMP.png";
dccIconTable["HuBMAP"] = "/img/HuBMAP.png";
dccIconTable["IDG"] = "/img/IDG.png ";
dccIconTable["KFDRC"] = "/img/KOMP2.png";
dccIconTable["LINCS"] = "/img/LINCS.gif";
dccIconTable["MW"] = "/img/Metabolomics.png";
dccIconTable["MoTrPAC"] = "/img/MoTrPAC.png";
dccIconTable["SPARC"] = "/img/SPARC.svg";

export function getDCCIcon(iconKey: string): string {
    if (iconKey && dccIconTable.hasOwnProperty(iconKey)) {
        return dccIconTable[iconKey];
    } else {
        return "";
    }
}

// Function to prune and get column names
export function pruneAndRetrieveColumnNames(data) {
    const prunedData = [];
    const columnNames = new Set();

    // Iterate through each row
    data.forEach(row => {
        const prunedRow = {};

        // Iterate through each property in the row
        for (const [columnName, value] of Object.entries(row)) {
            // Check if the value is non-null
            if (value !== null && value !== undefined) {
                prunedRow[columnName] = value;
                columnNames.add(columnName);
            }
        }

        prunedData.push(prunedRow);
    });

    return { prunedData, columnNames: Array.from(columnNames) };
}

// Mano: Not sure if use of this function is sql-injection safe
// This is different from search/Page.tsx because it has specifics for this page.
//export function generateFilterQueryString(searchParams: Record<string, string>, tablename: string) {
export function generateFilterQueryString(searchParams: any, schemaname: string, tablename: string) {
    const filters: string[] = [];

    //const tablename = "allres";
    if (searchParams.t) {
        const typeFilters: { [key: string]: string[] } = {};

        searchParams.t.forEach(t => {
            if (!typeFilters[t.type]) {
                typeFilters[t.type] = [];
            }
            if (t.entity_type) {

                //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
                if (t.entity_type !== "Unspecified") { // was using "null"
                    //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type}'`);
                    typeFilters[t.type].push(`"${schemaname}"."${tablename}"."${t.type}" = '${t.entity_type.replace(/'/g, "''")}'`);
                } else {
                    typeFilters[t.type].push(`"${schemaname}"."${tablename}"."${t.type}" is null`);
                    //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = 'Unspecified'`);
                }
            }
        });

        for (const type in typeFilters) {
            if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
                filters.push(`(${typeFilters[type].join(' OR ')})`);
            }
        }
    }
    //const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const filterConditionStr = filters.length ? `${filters.join(' AND ')}` : '';
    console.log("FILTERS LENGTH =");
    console.log(filters.length)
    return filterConditionStr;
}