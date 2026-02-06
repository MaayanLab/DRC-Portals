import { run } from "graphile-worker";
import preset from "@/graphile.config";
import fairshake from "@/tasks/fairshake";

async function main() {
  const runner = await run({ preset, taskList: {fairshake} });
  await runner.promise;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
})