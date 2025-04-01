import { search_entity } from "../utils";

export default async function Page(props: { params: { search: string } }) {
  const { instantEstimatedCount, quickEstimatedCount, items } = await search_entity(decodeURIComponent(props.params.search), 0, 10)
  return <>
    {JSON.stringify({ instantEstimatedCount, quickEstimatedCount})}
    {JSON.stringify(items.map(item => ({ '@id': item.id, '@type': item.type, id_namespace: item.id_namespace, attributes: item.attributes })))}
  </>
}
