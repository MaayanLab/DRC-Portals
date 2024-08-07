//------------------------------------ THIS IS IMPORTANT FOR DEBUGGING OF database connection: Please do not delete --------------------
import dotenv from 'dotenv';
import path from 'path';

const debug = 0;
if(debug > 2){
  // Specify the custom path to the .env file
  console.log(`__dirname: ${__dirname}`);
  const rootDir = process.cwd();
  // Log the root directory path
  console.log(`Project root directory: ${rootDir}`);

  const envPath = path.resolve(rootDir, './.env');
  // Load environment variables from the specified .env file
  const dotenv_config = dotenv.config({ path: envPath });
  if (dotenv_config.error) {
    throw dotenv_config.error;
  }

  // Access the environment variables
  const databaseUrl = process.env.DATABASE_URL;
  console.log(`Database URL: ${databaseUrl}`);
}
//----------------------------------------------------------------------------------------------------------------------------------------
