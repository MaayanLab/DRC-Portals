import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ type: string, slug: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  redirect(`/data/processed2/${params.type}/${params.slug}`)
}
