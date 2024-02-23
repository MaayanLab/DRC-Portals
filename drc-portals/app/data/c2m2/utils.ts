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
dccIconTable["IDG"] = "/img/IDG.png";
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
    // Check if data has only one row
    if (data.length === 1) {
        const columnNames = Object.keys(data[0]);
        return { prunedData: data, columnNames };
    }

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
                console.log("Added " + columnName);
            }
        }

        prunedData.push(prunedRow);
    });

    // Sort column names based on the number of unique values in each column -- pairwise sorting
    const sortedColumnNames = Array.from(columnNames).sort((a, b) => {
        const uniqueValuesA = new Set(prunedData.map(row => row[a]));
        const uniqueValuesB = new Set(prunedData.map(row => row[b]));
        return uniqueValuesB.size - uniqueValuesA.size;
    });

    return { prunedData, columnNames: sortedColumnNames };
}

export function getDistinctColumnsWithData(prunedData) {
    return Object.keys(prunedData[0]).filter(column => {
      const uniqueValues = new Set(prunedData.map(row => row[column]));
      return uniqueValues.size > 1;
    }).sort((a, b) => {
      const uniqueValuesA = new Set(prunedData.map(row => row[a]));
      const uniqueValuesB = new Set(prunedData.map(row => row[b]));
      return uniqueValuesB.size - uniqueValuesA.size;
    });
  }
  
// FUnction to get columns whose values do not change from a table and return them as a map. You can also specify which columns to ignore


// Function to find static columns, excluding specified columns
interface RecordInfo {
    [key: string]: string; // Define all properties as strings
}

// Function to find static columns, excluding specified columns, with strict types
export const findStaticColumns = (
    data: RecordInfo[],
    columnsToIgnore: string[] = []
): { [key: string]: string } => {
    // Check if data is empty
    if (!data || data.length === 0) return {};

    // Initialize an object to hold the static columns
    const staticColumns: { [key: string]: string } = {};

    // Get the first row's keys to iterate over, excluding ignored columns
    const columns = Object.keys(data[0]).filter(column => !columnsToIgnore.includes(column));

    // Iterate over each column to check its uniqueness
    columns.forEach(column => {
        // Extract all values of the column across rows
        const values = data.map(row => row[column]);

        // Create a Set to automatically filter out duplicate values
        const uniqueValues = new Set(values);

        // If the Set size is 1, all values in the column are identical
        if (uniqueValues.size === 1) {
            // Add the column and its unique value to the staticColumns object
            staticColumns[column] = values[0]; // All values are the same, so we can take the first
        }
    });

    return staticColumns;
};





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

const dccAbbrTable: { [key: string]: string } = {
    "4D NUCLEOME DATA COORDINATION AND INTEGRATION CENTER": "4DN",
    "The Extracellular Communication Consortium Data Coordination Center": "ERCC",
    "Genotype-Tissue Expression Project": "GTEx",
    "GlyGen": "GlyGen",
    "The Human Microbiome Project": "HMP",
    "HuBMAP": "HuBMAP",
    "Illuminating the Druggable Genome": "IDG",
    "The Gabriella Miller Kids First Pediatric Research Program": "KFDRC",
    "Library of Integrated Network-based Cellular Signatures": "LINCS",
    "UCSD Metabolomics Workbench": "MW",
    "MoTrPAC Molecular Transducers of Physical Activity Consortium": "MoTrPAC",
    "Stimulating Peripheral Activity to Relieve Conditions": "SPARC"
};

export function getDCCAbbr(iconKey: string): string {
    return dccAbbrTable[iconKey] || "";
}
interface FilterParam {
    type: string;
    entity_type: string | null;
}

export function getFilterVals(filtParams: FilterParam[] | undefined): string {
    if (filtParams !== undefined) {
        const entityTypes = filtParams.map(param => {
            if (param.type === "dcc" && param.entity_type !== null) {
                return getDCCAbbr(param.entity_type);
            } else {
                return param.entity_type || "";
            }
        });
        const entityTypesString = entityTypes.join(', ');
        return entityTypesString;
    } else {
        return "";
    }
}
