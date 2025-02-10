import { getBiosamples } from "./query";

export async function GET() {
  return await getBiosamples()
}