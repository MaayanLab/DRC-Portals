import EntitySearchTabLayout, { generateMetadata } from '@/app/data/processed2/EntitySearchTabLayout'
import EntitySearch from '@/app/data/processed2/EntitySearch'

export { generateMetadata }
export default async function Page(props: { params: Promise<{ search: string, type?: string } & Record<string, string>> }) {
  return <EntitySearchTabLayout {...props}><EntitySearch {...props} /></EntitySearchTabLayout>
}
