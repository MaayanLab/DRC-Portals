// import * as fs from 'fs';
// import * as sqlite3 from 'sqlite3';
// import { TSVIngestor } from './tsv-ingestor';
// import * as path from 'path';

// class SchemaTableCreator {
//   private schemaFilePath: string;
//   private db: sqlite3.Database;

//   constructor(schemaFilePath: string, databaseFilePath: string) {
//     this.schemaFilePath = schemaFilePath;
//     this.db = new sqlite3.Database(databaseFilePath);
//   }

//   private readSchemaFile(): any {
//     const schemaTop = JSON.parse(fs.readFileSync(this.schemaFilePath, 'utf8'));
//     return schemaTop.resources;
//   }

//   private createTableFields(fields: any[]): string {
//     let fieldStr = '';
//     fields.forEach((field: any) => {
//       const fieldName = field.name;
//       const fieldType = field.type;
//       const fieldDescription = field.description;
//       fieldStr = fieldStr + `${fieldName} ${fieldType},\n`;
//     });
//     return fieldStr.slice(0, -2);
//   }

//   private createTableSQL(tableName: string, fields: any[]): string {
//     const fieldStr = this.createTableFields(fields);
//     return `CREATE TABLE ${tableName} (${fieldStr});`;
//   }

//   private createTables(): void {
//     const schemaResources = this.readSchemaFile();
//     console.log("Done reading schema");
//     schemaResources.forEach((table: any) => {
//       const tableName = table.name;
//       const fields = table.schema.fields;
//       console.log("Creating "+ tableName);
//       const sql = this.createTableSQL(tableName, fields);
//       console.log("Done creating"+tableName)
//       this.db.run(sql);
//     });
//   }

//   public runTableCreation(): void {
//     this.createTables();
//     console.log("Done creating tables");
//     //this.db.close();
//   }


  

//   public ingestFiles(baseDirectory: string): void {
//     const directories = fs.readdirSync(baseDirectory, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => dirent.name);

//     directories.forEach(directory => {
//       const directoryPath = path.join(baseDirectory, directory);
//       const tsvFilePath = path.join(directoryPath, 'data');
    
//       // Check if the 'data' subdirectory exists
//       if (fs.existsSync(tsvFilePath) && fs.statSync(tsvFilePath).isDirectory()) {
        
    
//         // Ingest TSV files in the 'data' subdirectory
//         fs.readdirSync(tsvFilePath)
//           .filter(file => file.endsWith('.tsv'))
//           .forEach(file => {
//             const filePath = path.join(tsvFilePath, file);
//             console.log(filePath);
//             const tablename = path.basename(filePath, path.extname(filePath));
//             console.log(tablename);
//             this.importTSVToSQLite(tablename, filePath);




//         });
//       }
//     });
//   }

//   private importTSVToSQLite(tableName: string, fileName: string): void {
//     const CHUNK_SIZE = 2048 * 2048; // 4 MB chunk size (adjust as needed)
//     //const MAX_MEMORY_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB
//     const MAX_MEMORY_SIZE = 500 * 1024 * 1024; // 500 MB 
    
  
//     try {
//       const stats = fs.statSync(fileName);
//       const fileSize = stats.size;
  
//       // Read the header to get its size
//       const fileDescriptor = fs.openSync(fileName, 'r');
//       const headerBuffer = Buffer.alloc(CHUNK_SIZE);
//       fs.readSync(fileDescriptor, headerBuffer, 0, CHUNK_SIZE, 0);
//       const headerSize = headerBuffer.indexOf('\n') + 1; // Adding 1 to include the newline character
  
//       // Check if the file is not empty
//       if (fileSize > headerSize) {
//         if (fileSize > MAX_MEMORY_SIZE) {
//           // Proceed with import in chunks
//           console.log(`Importing data from ${fileName} to ${tableName} in chunks`);
  
//           let offset = headerSize;
//           let chunkNumber = 1;
  
//           while (offset < fileSize) {
//             const chunkBuffer = Buffer.alloc(CHUNK_SIZE);
//             fs.readSync(fileDescriptor, chunkBuffer, 0, CHUNK_SIZE, offset);
  
//             // Process the chunk (add your SQLite import logic here)
//             const chunkData = chunkBuffer.toString('utf-8');
//             this.importChunk(this.db, tableName, chunkData);
  
//             offset += CHUNK_SIZE;
//             console.log(`Processed chunk ${chunkNumber}`);
//             chunkNumber += 1;
//           }
  
//           console.log('Import complete');
//         } else {
//           // Import normally
//           console.log(`Importing data from ${fileName} to ${tableName} normally`);
//           const fileContent = fs.readFileSync(fileName, 'utf-8');
//           this.importChunk(this.db, tableName, fileContent);
//         }
//       } else {
//         console.log('The file is empty. No import performed.');
//       }
  
//       fs.closeSync(fileDescriptor);
//     } catch (err) {
//       console.error(`Error reading file: ${err.message}`);
//     } finally {
//       // Close the SQLite database connection
//       this.db.close();
//     }
//   }
  
//   private importChunk(db: sqlite3.Database, tableName: string, chunkData: string): void {
//     const rows = chunkData.split('\n').filter(Boolean);
  
//     // Assuming the first row contains headers
//     const headers = rows[0].split('\t');
  
//     // Prepare the INSERT statement
//     const insertStatement = db.prepare(
//       `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${headers.map(() => '?').join(', ')})`
//     );
  
//     // Insert each row into the database
//     for (let i = 1; i < rows.length; i++) {
//       const values = rows[i].split('\t');
//       insertStatement.run(...values);
//     }
  
//     // Finalize the prepared statement
//     insertStatement.finalize();
//   }
// }

          

// // Example usage:
// const schemaFilePath = 'C2M2_datapackage.json';
// const databaseFilePath = 'C2M2.db';
// const baseDirectory = "/mnt/share/cfdeworkbench/C2M2/latest/"
// const schemaTableCreator = new SchemaTableCreator(schemaFilePath, databaseFilePath);
// schemaTableCreator.runTableCreation();
// schemaTableCreator.ingestFiles(baseDirectory);




import * as fs from 'fs';
import postgres from 'postgres';

// Read the JSON schema from a file
const schemaFilePath = 'C2M2_datapackage.json';
const schemaTop = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
// console.log(schema.resources[1].schema.foreignKeys)
// Function to create tables based on the schema
console.log(typeof schemaTop)
const createTables = (db: postgres.Database) => {
  schemaTop.resources.forEach((table: any) => {
    
    const tableName = table.name
    const fields = table.schema.fields

    // console.log(tableName,'\n');
    var fieldStr = "";

    // convert to SQL datatype
    function typeMatcher(schemaDataType: string): string | undefined {
      const typeMap = new Map<string, string>([
        ['string', 'varchar(1000)'],
        ['boolean', 'bool'],
        ['datetime', 'datetime'],
        ['binary', 'binary'],
        ['array', 'varchar(5000)'],
        ['integer', 'int'],
        ['number', 'double'],
      ]);
    
      return typeMap.get(schemaDataType);
    }
    

    fields.forEach((field: any) => {
        var fieldName = field.name
        var fieldDescription = field.description
        var fieldType = field.type
        fieldType = typeMatcher(fieldType)
        // console.log(fieldType)
        fieldStr = fieldStr + fieldName + " " + fieldType + ",\n"
    });

    fieldStr = fieldStr.slice(0, -2);
    // console.log(fieldStr)
    
    var primaryKey = table.schema.primaryKey
    var foreignKeys = table.schema.foreignKeys
    // console.log(primaryKey)
    if (foreignKeys === undefined) {
      foreignKeys = '';
    } else {
      var foreignKeyFields = table.schema.foreignKeys
      // if (typeof fKeyFields === 'object') {
      //   for(let i of fKeyFields) {
      //     console.log(i)
      //   }
      // }
      // else (console.log('is string'))
      console.log(tableName,"->>>>", foreignKeyFields)
    }
    // console.log(tableName,"->>>>>>>>>>>>>>",foreignKeys)
    

    //   ${col.primaryKey ? 'primaryKey' : ''}
    // const foreignKeys = table.columns
    //   .filter((col: any) => col.foreignKey)
    //   .map((col: any) => `foreignKeys (${col.name}) REFERENCES ${col.foreignKey}`);

    var sql = `CREATE TABLE ${tableName} (${fieldStr});`;
    sql = sql.replace(/,\n(?=};)/, '\n')
    // console.log(sql);
    // db.run(sql);
  });
};

// Open SQLite database
const db = new sqlite3.Database('C2M2.db');

// Create tables
createTables(db);

// Close the database connection
db.close();