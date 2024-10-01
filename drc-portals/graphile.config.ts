import type {} from "graphile-config";
import type {} from "graphile-worker";

const preset: GraphileConfig.Preset = {
  worker: {
    connectionString: process.env.DATABASE_URL,
    concurrentJobs: 5,
    fileExtensions: [".js", ".cjs", ".mjs", ".ts"],
  },
};

export default preset;
