import type {} from "graphile-config";
import type {} from "graphile-worker";
import { WorkerPreset } from "graphile-worker";

const preset: GraphileConfig.Preset = {
  extends: [WorkerPreset],
  worker: {
    connectionString: process.env.DATABASE_URL,
    concurrentJobs: 5,
    fileExtensions: [".js", ".cjs", ".mjs", ".ts"],
    taskDirectory: `./tasks`,
  },
};

export default preset;
