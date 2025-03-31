import { search_entity } from "../utils";

export default async function Page(props: { params: { search: string } }) {
  const results = await (await search_entity(decodeURIComponent(props.params.search))).offset(0).limit(10).execute()
  return JSON.stringify(results)
}
